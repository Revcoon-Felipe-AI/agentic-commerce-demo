import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAX_REQUESTS_PER_HOUR = 10
const WINDOW_SECONDS = 60 * 60

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/chat')) return NextResponse.next()

  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN
  if (!kvUrl || !kvToken) {
    // KV not configured — rate limit disabled (local dev / pre-production)
    return NextResponse.next()
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const key = `linden:ratelimit:${ip}`

  // Fail-open: if KV is unavailable (network blip, quota, regional outage)
  // we let the request through. Better a momentarily uncapped chat than a
  // hard outage on the customer-facing endpoint.
  let count: number
  try {
    const { kv } = await import('@vercel/kv')
    count = await kv.incr(key)
    if (count === 1) await kv.expire(key, WINDOW_SECONDS)
  } catch (err) {
    console.warn('[middleware] rate-limit KV failed; failing open', { err })
    return NextResponse.next()
  }

  if (count > MAX_REQUESTS_PER_HOUR) {
    return NextResponse.json(
      { error: 'Talked enough for now — clone the repo if you want unlimited.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = { matcher: '/api/chat' }
