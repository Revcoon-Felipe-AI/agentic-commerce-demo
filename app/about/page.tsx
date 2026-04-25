'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Leaf, MessageSquare, XCircle } from 'lucide-react'
import { Reveal } from '@/components/Reveal'

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? '#'
const UPWORK_URL = process.env.NEXT_PUBLIC_UPWORK_URL ?? '#'
const OPEN_CHAT_EVENT = 'linden:open-chat'

function handleOpenChat(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))
}

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <RefusalSurfaceSection />
      <TryItNow />
      <AboutThisDemo />
    </>
  )
}

function Hero() {
  return (
    <section
      id="about-hero"
      aria-label="About Linden"
      className="bg-surface-primary relative w-full min-h-[60vh] overflow-hidden"
    >
      <Image
        src="/lifestyle/about-hero.webp"
        alt="A bone-toned room corner with a single chair and warm afternoon light."
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(247,242,234,0) 50%, rgba(247,242,234,0.6) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
        <div className="flex max-w-[36ch] flex-col gap-4">
          <h1 className="t-hero text-ink-primary">Furniture, considered.</h1>
          <p className="t-subhead text-ink-secondary max-w-[28ch]">
            Or — a chat that does the considering with you.
          </p>
        </div>
      </div>
    </section>
  )
}

function Problem() {
  return (
    <Reveal>
      <section
        id="about-problem"
        aria-label="The problem we solve"
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="t-micro text-ink-tertiary">The problem</p>
            <p className="t-display text-ink-primary">
              You bought the apartment. The room is up to you.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              Eleven open tabs. Three weeks of comparing. Seventeen filter facets that
              still can&rsquo;t tell you which sofa fits an 11-foot wall. The catalog
              promises infinite choice and delivers infinite second-guessing.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              The thing keeping you stuck isn&rsquo;t a missing piece. It&rsquo;s the
              missing person — the friend who happens to know furniture, who&rsquo;ll
              look at your room, ask one good question, and tell you what fits.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md md:rounded-none">
            <Image
              src="/lifestyle/brand-anchors.webp"
              alt="A composed corner with neutral textures and afternoon light."
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </Reveal>
  )
}

interface Step {
  icon: typeof Leaf
  number: string
  title: string
  body: string
}

const STEPS: readonly Step[] = [
  {
    icon: Leaf,
    number: '01',
    title: 'Tell us about your room.',
    body: 'One question opens it: what room are you working on? Then a second: how big, where does the light come from, what&rsquo;s the wall like. Two messages. Forty-five seconds.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Get two picks. Both fit.',
    body: 'Linden returns two pieces — sometimes three — with a one-line reason for each. Not a grid of forty. Not a quiz with eleven facets. Two picks. The reasoning is the product.',
  },
  {
    icon: XCircle,
    number: '03',
    title: 'Or hear &ldquo;don&rsquo;t buy.&rdquo; We mean it.',
    body: 'When the math doesn&rsquo;t work, Linden says so. &ldquo;Honestly, don&rsquo;t buy this one&rdquo; — the wall&rsquo;s wrong, the scale&rsquo;s off, the budget&rsquo;s a stretch. We point you at an alternative that fits, or suggest waiting until you have more information.',
  },
]

function HowItWorks() {
  return (
    <Reveal>
      <section
        id="about-how"
        aria-label="How Linden works"
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[1120px]">
          <p className="t-micro text-ink-tertiary mb-3">How it works</p>
          <p className="t-display text-ink-primary mb-16 max-w-[18ch]">
            Three steps. No filters.
          </p>
          <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {STEPS.map(step => {
              const Icon = step.icon
              return (
                <li key={step.number} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-surface-secondary text-accent-cool inline-flex h-10 w-10 items-center justify-center rounded-md">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="t-mono text-ink-tertiary">{step.number}</span>
                  </div>
                  <h3
                    className="t-headline text-ink-primary"
                    dangerouslySetInnerHTML={{ __html: step.title }}
                  />
                  <p
                    className="t-body text-ink-secondary"
                    dangerouslySetInnerHTML={{ __html: step.body }}
                  />
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}

function RefusalSurfaceSection() {
  return (
    <Reveal>
      <section
        id="about-refusal"
        aria-label="The Refusal Surface"
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[820px]">
          <p className="t-micro text-ink-tertiary mb-8 text-center">
            What makes Linden different
          </p>
          <div className="relative">
            <span
              aria-hidden="true"
              className="text-accent-warm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-serif text-7xl leading-none opacity-30"
            >
              &ldquo;
            </span>
            <p className="t-display text-ink-primary text-center">
              Most furniture sites are optimized to make a sale.
              <br />
              We&rsquo;re optimized to make one that doesn&rsquo;t come back.
            </p>
            <div
              aria-hidden="true"
              className="bg-divider mx-auto mt-10 h-px w-12"
            />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <p className="t-body text-ink-primary max-w-[44ch]">
              Every other site in this category is measured on conversion per session.
              To ship a feature where the agent says <em>&ldquo;don&rsquo;t buy&rdquo;</em>,
              they&rsquo;d have to rebuild their merchandising stack against their own
              incentives.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              Linden doesn&rsquo;t have that constraint. The catalog is small enough
              that we know each piece well enough to make the call. The refusal is
              what makes the next recommendation worth listening to.
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

function TryItNow() {
  return (
    <Reveal>
      <section
        id="about-try"
        aria-label="Try it now"
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-8 text-center">
          <p className="t-micro text-ink-tertiary">Try it</p>
          <p className="t-display text-ink-primary">
            One question. No email. No filters.
          </p>
          <button
            type="button"
            onClick={handleOpenChat}
            className="bg-accent-warm text-surface-primary t-subhead inline-flex items-center gap-3 rounded-md px-8 py-4 font-medium shadow-[0_4px_12px_rgba(42,39,34,0.12)] transition-transform hover:scale-[1.02]"
          >
            <Leaf size={18} strokeWidth={1.5} aria-hidden="true" />
            Talk to Linden
          </button>
          <p className="t-small text-ink-tertiary max-w-[36ch]">
            Opens the chat right where you are. Try mentioning a room you&rsquo;re
            working on, or ask the agent to compare two pieces.
          </p>
        </div>
      </section>
    </Reveal>
  )
}

function AboutThisDemo() {
  return (
    <Reveal>
      <section
        id="about-demo"
        aria-label="About this demo"
        className="bg-surface-secondary px-4 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto flex max-w-[640px] flex-col gap-6 text-center">
          <p className="t-micro text-ink-tertiary">About this demo</p>
          <p className="t-body text-ink-primary">
            Linden is a portfolio piece by{' '}
            <strong className="text-ink-primary">Felipe Moreira</strong> — built to
            show one pattern: AI as the merchandising surface of e-commerce, not a
            help widget pinned to a corner. The store is fictional. The pattern is
            real, and it ships in production today.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <Link
              href={UPWORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ink-primary text-surface-primary t-small inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-90"
            >
              Hire on Upwork
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink-primary text-ink-primary t-small inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium transition-colors hover:bg-surface-primary"
            >
              See the code
            </Link>
          </div>
          <p className="t-small text-ink-tertiary mt-6">
            Open source under MIT &middot;{' '}
            <Link href="/about/pt" className="hover:text-ink-primary underline">
              Leia em português
            </Link>
          </p>
        </div>
      </section>
    </Reveal>
  )
}
