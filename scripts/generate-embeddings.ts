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

import { google } from '@ai-sdk/google'
import { embed } from 'ai'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const GOOGLE_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_KEY) {
  console.error('Missing env. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_GENERATIVE_AI_API_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, title, content')
    .is('embedding', null)

  if (error) {
    console.error('Failed to fetch documents:', error.message)
    process.exit(1)
  }

  if (!docs || docs.length === 0) {
    console.log('No documents missing embeddings. Nothing to do.')
    return
  }

  console.log(`Embedding ${docs.length} document(s)...`)

  // Use gemini-embedding-001 (current production model as of 2026).
  // Default output is 3072-dim; we cap to 768 via providerOptions to match the schema's vector(768) column.
  // Matryoshka representation learning means the truncated embedding remains semantically valid.
  const embeddingModel = google.textEmbeddingModel('gemini-embedding-001')

  for (const doc of docs) {
    const { embedding } = await embed({
      model: embeddingModel,
      value: doc.content,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    })

    const { error: updateError } = await supabase
      .from('documents')
      .update({ embedding })
      .eq('id', doc.id)

    if (updateError) {
      console.error(`Failed to update ${doc.id} (${doc.title}):`, updateError.message)
      continue
    }

    console.log(`  ok  ${doc.title}`)
  }

  console.log('Done.')
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err)
  process.exit(1)
})
