/**
 * Tool: compare_products
 *
 * Side-by-side comparison of 2-3 Linden pieces (default 2 — Linden Zag).
 * The narration MUST rank options honestly — Linden never says "both are great".
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const compareProductsTool = tool({
  description:
    'Compare 2 or 3 Linden pieces side by side. Returns name, price, dimensions, material, lead time. CRITICAL: when presenting the comparison to the customer, always RANK the options honestly with one sentence per piece on which is more right for the customer\'s stated context. NEVER say "both are great" — Linden ranks. Default to 2 pieces (Linden trueline); use 3 only if the customer explicitly asked for three.',
  inputSchema: z.object({
    product_ids: z
      .array(z.string().min(1))
      .min(2)
      .max(3)
      .describe(
        'Array of 2-3 product IDs or slugs. Default to 2 (Linden trueline). Use 3 only if the customer explicitly asks for three.',
      ),
  }),
  execute: async ({ product_ids }) => {
    const supabase = createServerClient()
    const orFilter = product_ids
      .map((id) => `id.eq.${id},slug.eq.${id}`)
      .join(',')

    const { data, error } = await supabase
      .from('products')
      .select(
        'id, slug, name, price_usd, dimensions, material, lead_time_weeks, image_url, category',
      )
      .or(orFilter)

    if (error) throw new Error(`compare_products failed: ${error.message}`)

    return { products: data ?? [] }
  },
})
