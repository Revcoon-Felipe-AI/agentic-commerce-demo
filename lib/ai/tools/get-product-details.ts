/**
 * Tool: get_product_details
 *
 * Looks up a single Linden piece by UUID or slug.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { findProductByIdOrSlug } from '@/lib/products'

export const getProductDetailsTool = tool({
  description:
    'Get full details of a single Linden piece by ID or slug. Use when the customer asks specifically about one piece you previously mentioned, or when they want dimensions, materials, or lead time information.',
  inputSchema: z.object({
    product_id: z
      .string()
      .min(1)
      .describe('UUID or slug of the piece (e.g., "easy-sunday-lounge").'),
  }),
  execute: async ({ product_id }) => {
    const product = await findProductByIdOrSlug(product_id)
    if (!product) return { found: false as const }
    return { found: true as const, product }
  },
})
