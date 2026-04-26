/**
 * Tool: get_promotions
 *
 * REFRAMED for Linden: returns pieces flagged `rotating_out = true`
 * ("Final 4 — leaving the catalog this month"). Linden does NOT run
 * promotional sales — there are no discount codes, no seasonal pricing.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { getRotatingOutProducts } from '@/lib/products'

const NO_SALES_MESSAGE =
  'Linden does not run promotional sales. No pieces are currently rotating out.'
const ROTATING_OUT_MESSAGE =
  'These pieces are leaving the catalog within the month — last chance to order at the current price.'

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
    const rotating = await getRotatingOutProducts(limit)
    return {
      rotating_out: rotating,
      message: rotating.length === 0 ? NO_SALES_MESSAGE : ROTATING_OUT_MESSAGE,
    }
  },
})
