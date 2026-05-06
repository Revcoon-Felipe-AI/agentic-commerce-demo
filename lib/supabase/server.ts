/**
 * Supabase server client.
 *
 * Uses the service-role key, so it bypasses RLS — only call from server contexts
 * (Server Components, Route Handlers, Edge Functions). Never bundle into client code.
 *
 * `server-only` enforces that physically: importing this file from a Client
 * Component breaks the build immediately, so the service-role key cannot leak
 * into the public bundle by accident.
 */

import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function createServerClient(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}
