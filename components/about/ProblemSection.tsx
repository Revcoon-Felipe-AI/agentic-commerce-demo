import Image from 'next/image'
import { Reveal } from '@/components/Reveal'
import type { AboutProblemCopy } from '@/lib/i18n/about'

interface ProblemSectionProps {
  copy: AboutProblemCopy
}

export function ProblemSection({ copy }: ProblemSectionProps) {
  return (
    <Reveal>
      <section
        id="about-problem"
        aria-label={copy.ariaLabel}
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="t-micro text-ink-tertiary">{copy.eyebrow}</p>
            <p className="t-display text-ink-primary">{copy.headline}</p>
            {copy.body.map(paragraph => (
              <p key={paragraph} className="t-body text-ink-primary max-w-[44ch]">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md md:rounded-none">
            <Image
              src="/lifestyle/brand-anchors.webp"
              alt={copy.imageAlt}
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
