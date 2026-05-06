import type { NextConfig } from 'next'

/**
 * Security headers applied to every response. Vercel covers HSTS by default;
 * the rest are explicit so the browser refuses to render the site in an
 * iframe, refuses to MIME-sniff responses, leaks the minimum referrer, and
 * disables sensors we never use.
 */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [{ source: '/(.*)', headers: SECURITY_HEADERS }]
  },
}

export default nextConfig
