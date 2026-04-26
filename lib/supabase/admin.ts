/**
 * Supabase admin client for one-shot Node scripts (seed, embeddings, audits).
 *
 * Distinct from `lib/supabase/server.ts` to make the intent explicit:
 * - `server.ts` is consumed by Server Components / Route Handlers and lives
 *   inside an edge isolate that may be reused across requests.
 * - `admin.ts` runs in a plain Node process via `tsx`, so a module-level
 *   singleton is safe and explicitly desirable (one client per process).
 *
 * Both use the service-role key, but keeping the seam separate means that
 * if the edge boundary ever needs per-request clients (multi-tenant, RLS
 * spoofing, etc.), the script path is not collateral damage.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (cached) return cached

  const missing = (
    ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY'] as const
  ).filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `createAdminClient failed: missing env var(s): ${missing.join(', ')}`,
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_KEY as string

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}
