/**
 * Product types + server-side data access.
 *
 * Reads from Supabase using the server client. Use in Server Components only.
 */

import { createServerClient } from '@/lib/supabase/server'

export type ProductCategory = 'living' | 'bedroom' | 'dining' | 'workspace'

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  category: ProductCategory
  price_usd: number
  dimensions: string | null
  material: string | null
  lead_time_weeks: number | null
  in_stock: boolean
  featured: boolean
  image_url: string
  rotating_out: boolean
  created_at: string
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getAllProducts failed: ${error.message}`)
  return (data ?? []) as Product[]
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`getProductBySlug failed: ${error.message}`)
  return (data as Product) ?? null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return []
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(ids.map(id => `id.eq.${id},slug.eq.${id}`).join(','))

  if (error) throw new Error(`getProductsByIds failed: ${error.message}`)
  return (data ?? []) as Product[]
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('in_stock', true)
    .order('featured', { ascending: false })

  if (error) throw new Error(`getProductsByCategory failed: ${error.message}`)
  return (data ?? []) as Product[]
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  dining: 'Dining',
  workspace: 'Workspace',
}
