/**
 * AI SDK boundary adapters — coerce `unknown` tool outputs into typed shapes
 * the UI can render safely. Each adapter is pure: same input → same output,
 * no side effects, easy to unit-test in isolation.
 *
 * Owning the boundary here (Cap. 8 — Limites) means swapping the AI SDK
 * later touches one file instead of the chat modal.
 */

import type { UIMessage, UIMessagePart } from 'ai'

import type { CompareTableProduct } from '@/components/CompareTable'
import type { Product, ProductCategory } from '@/lib/products'

export type FaqMatch = {
  title?: string | null
  content?: string | null
  similarity?: number | null
}

export type InlineProductLike = {
  slug: string
  name: string
  price_usd: number
  image_url: string
  category?: ProductCategory
}

const VALID_CATEGORIES: ReadonlySet<ProductCategory> = new Set([
  'living',
  'bedroom',
  'dining',
  'workspace',
])

/** Concatenate every text part of a message into a single trimmed string. */
export function extractText(parts: UIMessage['parts']): string {
  return parts
    .filter(
      (part): part is UIMessagePart<never, never> & { type: 'text'; text: string } =>
        part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
    .trim()
}

/**
 * Pull renderable products out of `search_products` / `get_promotions` /
 * `get_product_details` outputs. Tolerates the three response shapes those
 * tools may return; drops anything missing the four required fields.
 */
export function extractInlineProducts(output: unknown): InlineProductLike[] {
  const candidates = collectProductCandidates(output)
  const result: InlineProductLike[] = []

  for (const item of candidates) {
    const parsed = parseInlineProduct(item)
    if (parsed) result.push(parsed)
  }

  return result
}

/** Pull comparison rows out of a `compare_products` output. */
export function extractCompareProducts(output: unknown): CompareTableProduct[] {
  if (!isObject(output)) return []
  const products = (output as { products?: unknown }).products
  if (!Array.isArray(products)) return []

  const result: CompareTableProduct[] = []
  for (const item of products) {
    const parsed = parseCompareProduct(item)
    if (parsed) result.push(parsed)
  }
  return result
}

/** Pull non-empty FAQ matches out of a `query_faq` output. */
export function extractFaqMatches(output: unknown): FaqMatch[] {
  if (!isObject(output)) return []
  const matches = (output as { matches?: unknown }).matches
  if (!Array.isArray(matches)) return []

  const result: FaqMatch[] = []
  for (const item of matches) {
    const parsed = parseFaqMatch(item)
    if (parsed) result.push(parsed)
  }
  return result
}

/** Stringify any value for a debug `<pre>` tag without throwing on cycles. */
export function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function collectProductCandidates(output: unknown): unknown[] {
  if (!isObject(output)) return []
  const record = output as {
    products?: unknown
    rotating_out?: unknown
    found?: unknown
    product?: unknown
  }

  if (Array.isArray(record.products)) return record.products
  if (Array.isArray(record.rotating_out)) return record.rotating_out
  if (record.found === true && record.product) return [record.product]
  return []
}

function parseInlineProduct(item: unknown): InlineProductLike | null {
  if (!isObject(item)) return null
  const r = item as Partial<Product>
  if (
    typeof r.slug !== 'string' ||
    typeof r.name !== 'string' ||
    typeof r.image_url !== 'string' ||
    typeof r.price_usd !== 'number'
  ) {
    return null
  }

  const entry: InlineProductLike = {
    slug: r.slug,
    name: r.name,
    price_usd: r.price_usd,
    image_url: r.image_url,
  }
  if (r.category && VALID_CATEGORIES.has(r.category)) {
    entry.category = r.category
  }
  return entry
}

function parseCompareProduct(item: unknown): CompareTableProduct | null {
  if (!isObject(item)) return null
  const r = item as Partial<Product>
  if (
    typeof r.slug !== 'string' ||
    typeof r.name !== 'string' ||
    typeof r.image_url !== 'string' ||
    typeof r.price_usd !== 'number'
  ) {
    return null
  }

  return {
    slug: r.slug,
    name: r.name,
    price_usd: r.price_usd,
    image_url: r.image_url,
    dimensions: typeof r.dimensions === 'string' ? r.dimensions : null,
    material: typeof r.material === 'string' ? r.material : null,
    lead_time_weeks:
      typeof r.lead_time_weeks === 'number' ? r.lead_time_weeks : null,
  }
}

function parseFaqMatch(item: unknown): FaqMatch | null {
  if (!isObject(item)) return null
  const r = item as FaqMatch
  if (typeof r.content !== 'string' || r.content.trim().length === 0) return null

  return {
    content: r.content,
    title: typeof r.title === 'string' ? r.title : null,
    similarity: typeof r.similarity === 'number' ? r.similarity : null,
  }
}
