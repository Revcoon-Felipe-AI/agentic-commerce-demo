/**
 * Embedding boundary for the Linden chat agent.
 *
 * Wraps `@ai-sdk/google` so that callers (FAQ tool, ingestion script) never
 * import the provider SDK directly. Trocar de provider passa a ser uma
 * mudança de UM arquivo.
 *
 * The output dimension is pinned to 768 so it matches the `vector(768)`
 * column declared in `supabase/migrations/001_init.sql` and consumed by the
 * `match_documents` RPC. Mudar `EMBEDDING_DIM` exige migration nova.
 */

import 'server-only'
import { google } from '@ai-sdk/google'
import { embed } from 'ai'

/** Matches the `vector(768)` column in `documents.embedding` (Matryoshka-truncated). */
export const EMBEDDING_DIM = 768

const EMBEDDING_MODEL_ID = 'gemini-embedding-001'

/**
 * Embed an arbitrary text (typically a customer question) into a 768-dim vector.
 * Falha do provider vira `Error` com contexto, para o LLM poder reagir.
 */
export async function embedQuestion(text: string): Promise<number[]> {
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    throw new Error('embedQuestion failed: text is empty')
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel(EMBEDDING_MODEL_ID),
      value: trimmed,
      providerOptions: {
        google: { outputDimensionality: EMBEDDING_DIM },
      },
    })
    return embedding
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`embedQuestion failed (${EMBEDDING_MODEL_ID}, ${EMBEDDING_DIM}d): ${message}`)
  }
}
