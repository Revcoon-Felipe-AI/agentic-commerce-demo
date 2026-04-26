import Image from 'next/image'
import type { AboutHeroCopy } from '@/lib/i18n/about'

interface HeroProps {
  copy: AboutHeroCopy
}

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="about-hero"
      aria-label={copy.ariaLabel}
      className="bg-surface-primary relative w-full min-h-[60vh] overflow-hidden"
    >
      <Image
        src="/lifestyle/about-hero.webp"
        alt={copy.imageAlt}
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
          <h1 className="t-hero text-ink-primary">{copy.headline}</h1>
          <p className="t-subhead text-ink-secondary max-w-[28ch]">{copy.lede}</p>
        </div>
      </div>
    </section>
  )
}
