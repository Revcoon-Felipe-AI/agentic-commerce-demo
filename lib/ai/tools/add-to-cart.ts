/**
 * Tool: add_to_cart
 *
 * Returns the customer's intent. The actual cart lives in browser sessionStorage
 * (key: linden_cart_v1). The client (<ChatModal />) intercepts the tool call
 * via useChat({ onToolCall }) and calls addToCart() from lib/cart.ts.
 *
 * Linden voice: confirm with "Good choice" — no emoji, no "Want more?".
 */

import { tool } from 'ai'
import { z } from 'zod'

export const addToCartTool = tool({
  description:
    'Confirm a customer\'s intent to add a Linden piece to their cart. The actual cart lives in browser sessionStorage; this tool returns the action for the client to execute. Linden voice: confirm with "Good choice." or "Added the [name] to your cart." — never use emoji, never say "Want more?".',
  inputSchema: z.object({
    product_id: z
      .string()
      .min(1)
      .describe('UUID or slug of the piece to add.'),
    qty: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(1)
      .describe('Quantity to add. Default 1; max 10 per call.'),
  }),
  execute: async ({ product_id, qty }) => {
    return {
      action: 'add_to_cart' as const,
      product_id,
      qty,
      message: `Added ${qty}× to cart.`,
    }
  },
})
