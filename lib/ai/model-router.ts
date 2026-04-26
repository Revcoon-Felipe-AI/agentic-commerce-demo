import { deepseek } from '@ai-sdk/deepseek'

export type ModelChoice = {
  model: ReturnType<typeof deepseek>
  modelId: string
  reason: string
  costPer1MInput: number
  costPer1MOutput: number
}

// Pricing per 1M tokens (cache miss; cache hit is significantly cheaper but
// we don't track it here for the demo). DeepSeek prices as of 2026-04.
export const MODELS = {
  chat: {
    model: deepseek('deepseek-chat'),
    modelId: 'deepseek-chat',
    costPer1MInput: 0.27,
    costPer1MOutput: 1.10,
  },
} as const

/**
 * Always returns deepseek-chat — the cheapest DeepSeek tier with full
 * function-calling support. Per-turn cost stays well under $0.001 even on
 * multi-tool conversations, and the model is more than capable of the
 * Linden tool surface (search_products / compare_products / query_faq /
 * add_to_cart).
 *
 * Add user-message-aware tier promotion here when there's a real signal to
 * route on (e.g. detected complexity, multi-tool plans).
 */
export function routeModel(): ModelChoice {
  return {
    ...MODELS.chat,
    // Reason ships in HTTP header (X-Routing-Reason), so it must stay ASCII-safe.
    reason: 'deepseek-chat - cheapest tier with function calling',
  }
}
