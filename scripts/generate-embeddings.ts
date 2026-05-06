/**
 * generate-embeddings.ts
 *
 * Populates `documents.embedding` for any FAQ rows missing one.
 * Idempotent: only embeds rows where `embedding is null`.
 *
 * Usage: `npm run embeddings` (after running `001_init.sql` + `002_seed.sql`).
 *
 * Required env: GOOGLE_GENERATIVE_AI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { embedQuestion, EMBEDDING_DIM } from '@/lib/ai/embeddings'

const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
] as const

const RETRY_BACKOFF_MS = 2_000

type DocRow = { id: string; title: string; content: string }

function ensureEnv(): void {
  const missing = REQUIRED_ENV.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error(`Missing env: ${missing.join(', ')}.`)
    process.exit(1)
  }
}

async function fetchDocsMissingEmbedding(): Promise<DocRow[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, content')
    .is('embedding', null)

  if (error) throw new Error(`fetchDocsMissingEmbedding failed: ${error.message}`)
  return (data ?? []) as DocRow[]
}

async function embedAndStore(doc: DocRow): Promise<void> {
  const supabase = createAdminClient()
  const embedding = await embedQuestion(doc.content)
  const { error } = await supabase
    .from('documents')
    .update({ embedding })
    .eq('id', doc.id)
  if (error) throw new Error(`update embedding failed for ${doc.id}: ${error.message}`)
}

async function processDoc(doc: DocRow): Promise<boolean> {
  try {
    await embedAndStore(doc)
    return true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.warn(`  retry ${doc.title} after error: ${message}`)
    await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS))
    try {
      await embedAndStore(doc)
      return true
    } catch (retryErr) {
      const retryMessage = retryErr instanceof Error ? retryErr.message : 'Unknown error'
      console.error(`  fail ${doc.title}: ${retryMessage}`)
      return false
    }
  }
}

async function main(): Promise<void> {
  ensureEnv()

  const docs = await fetchDocsMissingEmbedding()
  if (docs.length === 0) {
    console.log('No documents missing embeddings. Nothing to do.')
    return
  }

  console.log(`Embedding ${docs.length} document(s) at ${EMBEDDING_DIM} dimensions...`)

  let succeeded = 0
  let failed = 0
  for (const doc of docs) {
    const ok = await processDoc(doc)
    if (ok) {
      succeeded++
      console.log(`  ok  ${doc.title}`)
    } else {
      failed++
    }
  }

  console.log(`Done. ${succeeded} succeeded, ${failed} failed.`)
  if (failed > 0) process.exit(1)
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : undefined
  console.error('Unexpected error:', message)
  if (stack) console.error(stack)
  process.exit(1)
})
