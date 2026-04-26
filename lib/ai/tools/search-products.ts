/**
 * Tool: search_products
 *
 * Returns up to 3 matching pieces from the Linden catalog.
 * Linden Zag: never more than 3 picks per turn — default 2 ("Two picks. Both fit. One reason for each.").
 */

import { tool } from 'ai'
import { z } from 'zod'
import { searchProducts } from '@/lib/products'

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
    const products = await searchProducts({
      ...(category !== undefined && { category }),
      ...(keywords !== undefined && { keywords }),
      ...(min_price_usd !== undefined && { minPriceUsd: min_price_usd }),
      ...(max_price_usd !== undefined && { maxPriceUsd: max_price_usd }),
      limit,
    })

    return { products, count: products.length }
  },
})
