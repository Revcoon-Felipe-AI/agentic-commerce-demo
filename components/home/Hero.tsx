import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { TalkToLindenButton } from '@/components/TalkToLindenButton'

const HERO_HEADLINE = 'What room are you working on?'
const HERO_SUBHEAD = 'Two picks. Both fit. One reason for each.'

const HERO_IMAGE_ALT =
  'A lived-in apartment corner with afternoon light, a half-folded throw and an open book.'

export function Hero() {
  return (
    <section
      id="hero"
      aria-label="Hero"
      className="bg-surface-primary relative w-full min-h-[88vh] overflow-hidden"
    >
      <Image
        src="/lifestyle/hero-mobile.webp"
        alt={HERO_IMAGE_ALT}
        fill
        priority
        sizes="(min-width: 768px) 0vw, 100vw"
        className="object-cover md:hidden"
      />
      <Image
        src="/lifestyle/hero-desktop.webp"
        alt={HERO_IMAGE_ALT}
        fill
        priority
        sizes="(min-width: 768px) 100vw, 0vw"
        className="hidden object-cover md:block"
      />

      {/* Soft on top, denser on bottom-left where the headline sits — keeps it
         legible on whatever frame the photographer chose. */}
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
            <TalkToLindenButton label="Talk to Linden" />
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
