/**
 * Tool: search_products
 *
 * Returns up to 3 matching pieces from the Linden catalog.
 * Linden Zag: never more than 3 picks per turn — default 2 ("Two picks. Both fit. One reason for each.").
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const searchProductsTool = tool({
  description:
    'Search the Linden furniture catalog. Returns up to 3 matching pieces (Linden Zag: never more than 3 picks per turn — default 2). Use when the customer asks for product recommendations, mentions a category, price range, or specific furniture type. Always pair results with reasoning attached — never present picks without context.',
  inputSchema: z.object({
    category: z
      .enum(['living', 'bedroom', 'dining', 'workspace'])
      .optional()
      .describe(
        'Furniture category. Map customer language: "living room"=living, "bedroom"=bedroom, "dining"=dining, "office/work from home"=workspace.',
      ),
    keywords: z
      .string()
      .optional()
      .describe('Free-text keywords to match against name and description.'),
    min_price_usd: z
      .number()
      .positive()
      .optional()
      .describe('Minimum price filter in USD.'),
    max_price_usd: z
      .number()
      .positive()
      .optional()
      .describe('Maximum price filter in USD.'),
    limit: z
      .number()
      .int()
      .min(1)
      .max(3)
      .default(2)
      .describe(
        'Max 3 per Linden Zag — default 2 because the trueline is "Two picks. Both fit. One reason for each."',
      ),
  }),
  execute: async ({ category, keywords, min_price_usd, max_price_usd, limit }) => {
    const supabase = createServerClient()
    let query = supabase.from('products').select('*').eq('in_stock', true)

    if (category) query = query.eq('category', category)
    if (min_price_usd !== undefined) query = query.gte('price_usd', min_price_usd)
    if (max_price_usd !== undefined) query = query.lte('price_usd', max_price_usd)
    if (keywords) {
      query = query.or(`name.ilike.%${keywords}%,description.ilike.%${keywords}%`)
    }

    const { data, error } = await query.limit(limit)
    if (error) throw new Error(`search_products failed: ${error.message}`)

    return { products: data ?? [], count: data?.length ?? 0 }
  },
})
