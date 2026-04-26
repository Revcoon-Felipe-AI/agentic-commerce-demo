/**
 * Browser-side product reads.
 *
 * Counterpart to `lib/products.ts` for client components that cannot import
 * the server module (which uses the service-role key). The browser path
 * goes through the anon key + RLS, which currently allows public read of
 * `in_stock = true` rows.
 *
 * Use ONLY in client components — the cart page is the canonical caller.
 */

import { createBrowserClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/products'

export type { Product }

/**
 * Fetch products by exact UUID. Designed for the cart hydration path:
 * the cart stores `product_id` in sessionStorage and needs to render rows
 * without a dedicated `/api/products` endpoint.
 */
export async function getProductsByIdsBrowser(ids: readonly string[]): Promise<Product[]> {
  if (ids.length === 0) return []

  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids)

  if (error) {
    throw new Error(`getProductsByIdsBrowser failed: ${error.message}`)
  }
  return (data ?? []) as Product[]
}
