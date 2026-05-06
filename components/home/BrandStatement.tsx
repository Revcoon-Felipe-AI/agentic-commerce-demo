import { Reveal } from '@/components/Reveal'

const BRAND_STATEMENT =
  'We carry fewer than fifty pieces. The AI will tell you not to buy when a piece doesn’t fit your room.'

export function BrandStatement() {
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
