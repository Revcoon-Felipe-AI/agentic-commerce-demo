/**
 * Product types + server-side data access boundary.
 *
 * This module is the ONLY place in the project that talks to the
 * `products` table on the server. Tools, pages, and route handlers consume
 * these helpers — never `supabase.from('products')` directly. A
 * `no-restricted-imports` ESLint rule enforces that wrap on the import side.
 *
 * Use in Server Components / Route Handlers / Server Actions only.
 * For browser callers see `lib/products.client.ts`.
 */

import 'server-only'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { Product, ProductCategory } from '@/lib/products.types'

// Re-export so server callers keep their existing import path.
export type { Product, ProductCategory } from '@/lib/products.types'
export { CATEGORY_LABELS } from '@/lib/products.types'

/**
 * PostgREST `or()` filter syntax uses commas, parentheses, and dots as
 * separators. Any of these in a user-supplied keyword/slug would let a
 * crafted string inject extra conditions. We strip them defensively before
 * interpolating into the filter expression.
 */
const POSTGREST_FILTER_SAFE_KEYWORD = z
  .string()
  .trim()
  .min(1, 'keyword must be at least 1 character')
  .max(80, 'keyword too long')
  .transform(value => value.replace(/[,()*%:"]/g, ' ').trim())
  .refine(value => value.length > 0, 'keyword reduces to empty after sanitization')

const PRODUCT_ID_OR_SLUG = z
  .string()
  .trim()
  .min(1, 'id or slug must be at least 1 character')
  .max(120, 'id or slug too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'id or slug must be alphanumeric, hyphen, or underscore')

const SEARCH_FILTERS_SCHEMA = z.object({
  category: z.enum(['living', 'bedroom', 'dining', 'workspace']).optional(),
  keywords: POSTGREST_FILTER_SAFE_KEYWORD.optional(),
  minPriceUsd: z.number().positive().optional(),
  maxPriceUsd: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  limit: z.number().int().min(1).max(20).optional(),
})

export type SearchProductsFilters = z.input<typeof SEARCH_FILTERS_SCHEMA>

const PRODUCT_SELECT = '*'

const ROTATING_OUT_DEFAULT_LIMIT = 4

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('in_stock', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getAllProducts failed: ${error.message}`)
  return (data ?? []) as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const safeSlug = PRODUCT_ID_OR_SLUG.parse(slug)
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', safeSlug)
    .maybeSingle()

  if (error) throw new Error(`getProductBySlug failed: ${error.message}`)
  return (data as Product) ?? null
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('category', category)
    .eq('in_stock', true)
    .order('featured', { ascending: false })

  if (error) throw new Error(`getProductsByCategory failed: ${error.message}`)
  return (data ?? []) as Product[]
}

/**
 * Declarative product search. Sanitizes all user-supplied inputs (LLM-driven
 * `keywords` go through a strict schema) so the PostgREST `or()` filter is
 * always safe to interpolate.
 */
export async function searchProducts(filters: SearchProductsFilters): Promise<Product[]> {
  const parsed = SEARCH_FILTERS_SCHEMA.parse(filters)
  const inStock = parsed.inStock ?? true

  const supabase = createServerClient()
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('in_stock', inStock)

  if (parsed.category) query = query.eq('category', parsed.category)
  if (parsed.minPriceUsd !== undefined) query = query.gte('price_usd', parsed.minPriceUsd)
  if (parsed.maxPriceUsd !== undefined) query = query.lte('price_usd', parsed.maxPriceUsd)
  if (parsed.keywords) {
    const safe = parsed.keywords
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }
  if (parsed.limit !== undefined) query = query.limit(parsed.limit)

  const { data, error } = await query
  if (error) throw new Error(`searchProducts failed: ${error.message}`)
  return (data ?? []) as Product[]
}

/**
 * Look up a single product by either UUID or slug. Tools call this when the
 * customer mentioned a piece by name and the LLM passes whichever id form it
 * remembers. Returns `null` when nothing matches (Special Case Pattern — the
 * caller decides how to phrase the absence).
 */
export async function findProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  const safe = PRODUCT_ID_OR_SLUG.parse(idOrSlug)
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .or(`id.eq.${safe},slug.eq.${safe}`)
    .maybeSingle()

  if (error) throw new Error(`findProductByIdOrSlug failed: ${error.message}`)
  return (data as Product) ?? null
}

/**
 * Bulk lookup for the comparison flow. Each entry is sanitized individually;
 * the result preserves only matched rows (no nulls, no placeholders).
 */
export async function compareProducts(idsOrSlugs: readonly string[]): Promise<Product[]> {
  if (idsOrSlugs.length === 0) return []
  const safeIds = idsOrSlugs.map(value => PRODUCT_ID_OR_SLUG.parse(value))

  const supabase = createServerClient()
  const orFilter = safeIds.map(id => `id.eq.${id},slug.eq.${id}`).join(',')

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, price_usd, dimensions, material, lead_time_weeks, image_url, category',
    )
    .or(orFilter)

  if (error) throw new Error(`compareProducts failed: ${error.message}`)
  return (data ?? []) as Product[]
}

/**
 * Pieces flagged "leaving the catalog this month" — Linden does NOT discount,
 * so this is the only thing the `get_promotions` tool can honestly return.
 */
export async function getRotatingOutProducts(limit: number = ROTATING_OUT_DEFAULT_LIMIT): Promise<Product[]> {
  const safeLimit = z.number().int().min(1).max(10).parse(limit)

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, price_usd, image_url, category, lead_time_weeks')
    .eq('in_stock', true)
    .eq('rotating_out', true)
    .limit(safeLimit)

  if (error) throw new Error(`getRotatingOutProducts failed: ${error.message}`)
  return (data ?? []) as Product[]
}

/**
 * Backward-compatible bulk lookup used by older callers that already had a
 * mixed-id-or-slug array. Internally delegates to `compareProducts`.
 */
export async function getProductsByIds(idsOrSlugs: readonly string[]): Promise<Product[]> {
  return compareProducts(idsOrSlugs)
}
