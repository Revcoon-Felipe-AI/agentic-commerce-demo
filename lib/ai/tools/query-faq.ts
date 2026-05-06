/**
 * Tool: query_faq
 *
 * Semantic search over the Linden FAQ documents. Embeds the question via
 * `lib/ai/embeddings.ts` and dispatches to `matchFaq` from `lib/db/faq.ts`.
 * The provider boundary lives in those modules — this file only orchestrates.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { embedQuestion } from '@/lib/ai/embeddings'
import { matchFaq } from '@/lib/db/faq'

export const queryFaqTool = tool({
  description:
    'Search the Linden FAQ via semantic similarity. Use for questions about lead times, shipping, returns, warranty, payment, or "why does Linden refuse sales sometimes?". Returns up to 2 most-relevant excerpts for grounding the response — never invent policy answers.',
  inputSchema: z.object({
    question: z
      .string()
      .min(1)
      .describe('The customer question in natural language.'),
  }),
  execute: async ({ question }) => {
    const embedding = await embedQuestion(question)
    const matches = await matchFaq(embedding)
    return { matches }
  },
})
