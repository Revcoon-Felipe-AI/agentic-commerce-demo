import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LIMIT = 10
const WINDOW = 3600

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/chat')) return NextResponse.next()

  const kvUrl = process.env.KV_REST_API_URL
  const kvToken = process.env.KV_REST_API_TOKEN
  if (!kvUrl || !kvToken) {
    // KV not configured — rate limit disabled (local dev / pre-production)
    return NextResponse.next()
  }

  const { kv } = await import('@vercel/kv')
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous'
  const key = `linden:ratelimit:${ip}`

  const count = await kv.incr(key)
  if (count === 1) await kv.expire(key, WINDOW)

  if (count > LIMIT) {
    return NextResponse.json(
      { error: 'Talked enough for now — clone the repo if you want unlimited.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = { matcher: '/api/chat' }
