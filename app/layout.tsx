import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { ChatBubble } from '@/components/ChatBubble'
import { ChatTeaser } from '@/components/ChatTeaser'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import '@/app/globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-fraunces',
  display: 'swap',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Linden — Furniture you can think with.',
    template: '%s · Linden',
  },
  description:
    'A small modern furniture studio. The AI agent will tell you not to buy when a piece doesn\'t fit your room.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Linden — Furniture you can think with.',
    description: 'Two picks. Both fit. One reason for each.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Linden' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linden — Furniture you can think with.',
    description: 'Two picks. Both fit. One reason for each.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: { index: true, follow: true },
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-surface-primary text-ink-primary min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatBubble />
        <ChatTeaser />
      </body>
    </html>
  )
}
