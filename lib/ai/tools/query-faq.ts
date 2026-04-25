/**
 * Tool: query_faq
 *
 * Semantic search over the Linden FAQ documents.
 * Embeds the question with Gemini gemini-embedding-001 (capped at 768 dims to match the schema) and
 * calls the `match_documents` Supabase RPC.
 */

import { tool } from 'ai'
import { z } from 'zod'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'
import { createServerClient } from '@/lib/supabase/server'

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
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: question,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    })

    const supabase = createServerClient()
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_count: 2,
      similarity_threshold: 0.6,
    })

    if (error) throw new Error(`query_faq failed: ${error.message}`)

    return { matches: data ?? [] }
  },
})
