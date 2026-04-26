import { Reveal } from '@/components/Reveal'
import { TalkToLindenButton } from '@/components/TalkToLindenButton'
import type { AboutTryItNowCopy } from '@/lib/i18n/about'

interface TryItNowProps {
  copy: AboutTryItNowCopy
}

export function TryItNow({ copy }: TryItNowProps) {
  return (
    <Reveal>
      <section
        id="about-try"
        aria-label={copy.ariaLabel}
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-8 text-center">
          <p className="t-micro text-ink-tertiary">{copy.eyebrow}</p>
          <p className="t-display text-ink-primary">{copy.headline}</p>
          <TalkToLindenButton label={copy.ctaLabel} />
          <p className="t-small text-ink-tertiary max-w-[36ch]">{copy.helper}</p>
        </div>
      </section>
    </Reveal>
  )
}
