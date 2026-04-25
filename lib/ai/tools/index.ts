/**
 * Tool registry — single source of truth for the Linden chat agent.
 *
 * Imported by app/api/chat/route.ts as: `import { allTools } from '@/lib/ai/tools'`.
 * Keys here are the tool names the model sees and calls.
 */

import { searchProductsTool } from './search-products'
import { getProductDetailsTool } from './get-product-details'
import { getPromotionsTool } from './get-promotions'
import { compareProductsTool } from './compare-products'
import { addToCartTool } from './add-to-cart'
import { queryFaqTool } from './query-faq'
import { routeDecisionTool } from './route-decision'

export const allTools = {
  search_products: searchProductsTool,
  get_product_details: getProductDetailsTool,
  get_promotions: getPromotionsTool,
  compare_products: compareProductsTool,
  add_to_cart: addToCartTool,
  query_faq: queryFaqTool,
  route_decision: routeDecisionTool,
} as const
