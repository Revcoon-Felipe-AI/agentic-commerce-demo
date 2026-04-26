import { Reveal } from '@/components/Reveal'
import type { AboutRefusalCopy } from '@/lib/i18n/about'

interface RefusalSurfaceSectionProps {
  copy: AboutRefusalCopy
}

export function RefusalSurfaceSection({ copy }: RefusalSurfaceSectionProps) {
  const [pullQuoteFirst, pullQuoteSecond] = copy.pullQuote
  const [bodyFirst, bodySecond] = copy.body

  return (
    <Reveal>
      <section
        id="about-refusal"
        aria-label={copy.ariaLabel}
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[820px]">
          <p className="t-micro text-ink-tertiary mb-8 text-center">{copy.eyebrow}</p>
          <div className="relative">
            <span
              aria-hidden="true"
              className="text-accent-warm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-serif text-7xl leading-none opacity-30"
            >
              “
            </span>
            <p className="t-display text-ink-primary text-center">
              {pullQuoteFirst}
              <br />
              {pullQuoteSecond}
            </p>
            <div aria-hidden="true" className="bg-divider mx-auto mt-10 h-px w-12" />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <p className="t-body text-ink-primary max-w-[44ch]">{bodyFirst}</p>
            <p className="t-body text-ink-primary max-w-[44ch]">{bodySecond}</p>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
