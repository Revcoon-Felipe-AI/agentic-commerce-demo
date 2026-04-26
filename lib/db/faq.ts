/**
 * FAQ semantic-search boundary.
 *
 * Wraps the `match_documents` Postgres RPC declared in
 * `supabase/migrations/001_init.sql`. The query_faq tool, the chat route,
 * and any future ingestion job consume this — never `supabase.rpc(...)`
 * directly. Trocar embedding store passa a ser uma mudança neste arquivo.
 */

import { createServerClient } from '@/lib/supabase/server'

export const FAQ_MATCH_LIMIT_DEFAULT = 2
export const FAQ_SIMILARITY_FLOOR_DEFAULT = 0.6

export interface FaqMatch {
  id: string
  title: string
  content: string
  similarity: number
}

interface MatchFaqOptions {
  limit?: number
  threshold?: number
}

/**
 * Vector-similarity search over `documents`. Caller supplies a 768-dim
 * embedding (see `lib/ai/embeddings.ts`); rows under `threshold` are
 * filtered out by the RPC itself, not by JS — keeps the prompt grounded.
 */
export async function matchFaq(
  embedding: readonly number[],
  options: MatchFaqOptions = {},
): Promise<FaqMatch[]> {
  if (embedding.length === 0) {
    throw new Error('matchFaq failed: embedding is empty')
  }

  const limit = options.limit ?? FAQ_MATCH_LIMIT_DEFAULT
  const threshold = options.threshold ?? FAQ_SIMILARITY_FLOOR_DEFAULT

  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: limit,
    similarity_threshold: threshold,
  })

  if (error) throw new Error(`matchFaq failed: ${error.message}`)
  return (data ?? []) as FaqMatch[]
}
