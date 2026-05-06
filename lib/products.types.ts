/**
 * Product types and i18n labels — runtime-pure module.
 *
 * Separate from `lib/products.ts` (which holds the server-side data access
 * helpers) so Client Components can import the types and the category labels
 * without dragging the Supabase server client (and its service-role key) into
 * the public bundle. `server-only` enforces that boundary at build time.
 */

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

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  living: 'Living Room',
  bedroom: 'Bedroom',
  dining: 'Dining',
  workspace: 'Workspace',
}
