/**
 * Tool: get_promotions
 *
 * REFRAMED for Linden: returns pieces flagged `rotating_out = true`
 * ("Final 4 — leaving the catalog this month"). Linden does NOT run
 * promotional sales — there are no discount codes, no seasonal pricing.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const getPromotionsTool = tool({
  description:
    'List Linden pieces currently rotating out of the catalog ("Final 4 — leaving the catalog this month"). Linden does NOT run traditional sales — this returns pieces being discontinued only. Use ONLY when the customer asks about deals, discounts, end-of-line, or "anything special". If empty, say plainly that Linden does not discount.',
  inputSchema: z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(4)
      .default(4)
      .describe('Max 4 rotating-out pieces to return. Default 4.'),
  }),
  execute: async ({ limit }) => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, price_usd, image_url, category, lead_time_weeks')
      .eq('in_stock', true)
      .eq('rotating_out', true)
      .limit(limit)

    if (error) throw new Error(`get_promotions failed: ${error.message}`)

    const rows = data ?? []

    return {
      rotating_out: rows,
      message:
        rows.length === 0
          ? 'Linden does not run promotional sales. No pieces are currently rotating out.'
          : 'These pieces are leaving the catalog within the month — last chance to order at the current price.',
    }
  },
})
