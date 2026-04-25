'use client'

import Image from 'next/image'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import type { ProductCategory } from '@/lib/products'
import { CATEGORY_LABELS } from '@/lib/products'

const HERO_HEADLINE = 'What room are you working on?'
const HERO_SUBHEAD = 'Two picks. Both fit. One reason for each.'

const BRAND_STATEMENT =
  'We carry fewer than fifty pieces. The AI will tell you not to buy when a piece doesn’t fit your room.'

const EDITORIAL_COPY =
  'conversation, not a catalog. Tell Linden what room you’re working on, and you’ll get two picks with one reason for each. The AI can — and will — tell you not to buy. That’s the point.'

const BRANDSCRIPT_TITLE = 'Why Linden, in seven lines.'

const OPEN_CHAT_EVENT = 'linden:open-chat'

interface CategoryTile {
  category: ProductCategory
  image: string
  alt: string
  /** Source of truth: docs/.brand-research/12-product-catalog.md. Hardcoded for the demo;
   * a future iteration can compute this from the products table at request time. */
  count: number
}

const CATEGORY_TILES: readonly CategoryTile[] = [
  {
    category: 'living',
    image: '/lifestyle/cat-living.webp',
    alt: 'A lived-in living room with afternoon light, a low sofa and an open book on the coffee table.',
    count: 6,
  },
  {
    category: 'bedroom',
    image: '/lifestyle/cat-bedroom.webp',
    alt: 'A quiet bedroom with a low oak frame bed and a single bedside lamp.',
    count: 2,
  },
  {
    category: 'dining',
    image: '/lifestyle/cat-dining.webp',
    alt: 'A long oak dining table set for a slow weekend meal.',
    count: 2,
  },
  {
    category: 'workspace',
    image: '/lifestyle/cat-workspace.webp',
    alt: 'A clean oak desk against a north-facing window with a single notebook.',
    count: 2,
  },
] as const

const BRANDSCRIPT_SENTENCES: readonly string[] = [
  'You bought the apartment. Now the room is up to you.',
  'Eleven open tabs, seventeen filter facets, and you still cannot tell which sofa fits your wall.',
  'Furniture shopping shouldn’t feel like a part-time job — and we carry fewer than fifty pieces on purpose, so we actually know how each one behaves in a room like yours.',
  'Tell us one thing about your room. Get two picks with the reason attached. See them against your wall — including the honest “neither of these is right” when that is the answer.',
  'Start a conversation about your room. Or — see two picks for your room, no email required.',
  'The longer you compare, the harder the decision gets. Most rooms are not waiting for the perfect sofa; they are waiting for the right-enough one, picked on purpose, that you stop second-guessing by week two.',
  'A room you walk into and stop thinking about. The sofa fits the wall. The light is right. The decision is closed. You spent an afternoon, not a season, and the apartment finally feels like yours.',
] as const

function handleOpenChat(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStatement />
      <Categories />
      <Editorial />
      <BrandScript />
    </>
  )
}

function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="bg-surface-primary relative w-full min-h-[88vh] overflow-hidden"
    >
      <Image
        src="/lifestyle/hero-mobile.webp"
        alt="A lived-in apartment corner with afternoon light, a half-folded throw and an open book."
        fill
        priority
        sizes="(min-width: 768px) 0vw, 100vw"
        className="object-cover md:hidden"
      />
      <Image
        src="/lifestyle/hero-desktop.webp"
        alt="A lived-in apartment corner with afternoon light, a half-folded throw and an open book."
        fill
        priority
        sizes="(min-width: 768px) 100vw, 0vw"
        className="hidden object-cover md:block"
      />

      {/* Gradient overlay so the headline reads cleanly on any frame the
         photographer chose. Soft on top, denser on bottom-left where the text sits. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(247,242,234,0) 55%, rgba(247,242,234,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
        <div className="flex max-w-[36ch] flex-col gap-5">
          <h1 className="t-hero text-ink-primary">{HERO_HEADLINE}</h1>
          <p className="t-subhead text-ink-secondary max-w-[26ch]">
            {HERO_SUBHEAD}
          </p>
          <div>
            <button
              type="button"
              onClick={handleOpenChat}
              className="bg-accent-warm text-surface-primary t-small inline-flex items-center gap-2 rounded-md px-5 py-3 font-medium shadow-[0_4px_12px_rgba(42,39,34,0.12)] transition-transform hover:scale-[1.02]"
            >
              <LeafIcon />
              Talk to Linden
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-6 bottom-6 hidden items-center gap-2 md:flex">
        <span className="t-micro text-ink-tertiary">scroll</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className="text-ink-tertiary linden-scroll-cue"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}

function BrandStatement() {
  return (
    <Reveal>
      <section
        id="brand-statement"
        aria-label="Brand statement"
        className="bg-surface-secondary relative px-4 py-24 md:px-12 md:py-32"
      >
        <div className="relative mx-auto max-w-[640px] text-center">
          <span
            aria-hidden="true"
            className="text-accent-warm pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 select-none font-serif text-7xl leading-none opacity-30"
          >
            &ldquo;
          </span>
          <p className="t-display text-ink-primary">{BRAND_STATEMENT}</p>
          <div
            aria-hidden="true"
            className="bg-divider mx-auto mt-10 h-px w-12"
          />
        </div>
      </section>
    </Reveal>
  )
}

function Categories() {
  return (
    <Reveal>
      <section
        id="categories"
        aria-label="Product categories"
        className="bg-surface-primary px-4 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[1120px]">
          <p className="t-micro text-ink-tertiary mb-8 text-center">Catalog</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {CATEGORY_TILES.map(tile => (
              <li key={tile.category}>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  aria-label={`Talk to Linden about ${CATEGORY_LABELS[tile.category]}`}
                  className="group block w-full cursor-pointer text-left"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md md:rounded-none">
                    <Image
                      src={tile.image}
                      alt={tile.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden="true"
                      className="bg-ink-primary/0 group-hover:bg-ink-primary/15 absolute inset-0 transition-colors duration-300"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-surface-elevated text-ink-primary t-small absolute right-3 bottom-3 inline-flex translate-y-2 items-center gap-1 rounded-md px-3 py-1.5 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      Talk about
                      <ChevronRight size={14} strokeWidth={1.5} />
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between gap-3">
                    <h2 className="t-headline text-ink-primary">
                      {CATEGORY_LABELS[tile.category]}
                    </h2>
                    <span className="t-mono text-ink-tertiary">
                      {tile.count} {tile.count === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  )
}

function Editorial() {
  // First letter is split off so we can drop-cap it without breaking word selection.
  const dropLetter = 'A'
  return (
    <Reveal>
      <section
        id="editorial"
        aria-label="How the conversation works"
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md md:rounded-none">
            <Image
              src="/lifestyle/brand-anchors.webp"
              alt="A composed corner with neutral textures and afternoon light — the kind of room Linden was made for."
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-6">
            <p className="t-body text-ink-primary max-w-[44ch]">
              <span className="text-ink-primary float-left mt-1 mr-3 font-serif text-[5rem] leading-[0.85] md:text-[6rem]">
                {dropLetter}
              </span>
              {EDITORIAL_COPY}
            </p>
            <p className="t-mono text-ink-tertiary self-end italic">
              — Linden
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

function BrandScript() {
  return (
    <Reveal>
      <section
        id="brandscript"
        aria-label="Why Linden"
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[960px]">
          <p className="t-display text-ink-primary mb-16 max-w-[18ch]">
            {BRANDSCRIPT_TITLE}
          </p>
          <ol className="flex flex-col gap-14 md:gap-20">
            {BRANDSCRIPT_SENTENCES.map((sentence, index) => {
              const isOdd = index % 2 === 0
              const isShort = sentence.length < 110
              return (
                <li
                  key={sentence}
                  className={`flex flex-col gap-3 md:max-w-[640px] ${isOdd ? 'md:self-start' : 'md:self-end md:text-right'}`}
                >
                  <span className="t-mono text-ink-tertiary block">
                    {String(index + 1).padStart(2, '0')}
                    <span className="text-ink-tertiary mx-1">&mdash;</span>
                  </span>
                  <p
                    className={
                      isShort
                        ? 't-display text-ink-primary'
                        : 't-subhead text-ink-primary'
                    }
                  >
                    {sentence}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}
