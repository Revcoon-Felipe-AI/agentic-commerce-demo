/**
 * Tool: route_decision (BONUS — easter egg)
 *
 * Returns metadata about which model handled the request and why.
 * Use ONLY when the customer explicitly asks about the AI itself.
 * Linden does NOT advertise the medium — never volunteer this.
 *
 * Real values are wired from telemetry context in Wave 4 — placeholders here.
 */

import { tool } from 'ai'
import { z } from 'zod'

export const routeDecisionTool = tool({
  description:
    'Returns metadata about which model handled this request and why. Use ONLY when the customer explicitly asks about the AI itself ("which model did you use?", "why this model?", "what does it cost?"). NEVER volunteer this information unprompted — Linden does not advertise the medium.',
  inputSchema: z.object({}),
  execute: async () => {
    return {
      model: 'gemini-2.5-flash-lite',
      reason:
        'Single tool call detected, low complexity — routed to Flash Lite for cost optimization (3x cheaper than Flash on input).',
      tokens: { input: 0, output: 0 },
      cost_usd: 0,
    }
  },
})
