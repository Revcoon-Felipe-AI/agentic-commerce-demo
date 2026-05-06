import Link from 'next/link'
import { Reveal } from '@/components/Reveal'
import type { AboutThisDemoCopy } from '@/lib/i18n/about'

interface AboutThisDemoProps {
  copy: AboutThisDemoCopy
  otherLocaleHref: string
  upworkUrl: string
  githubUrl: string
}

export function AboutThisDemo({
  copy,
  otherLocaleHref,
  upworkUrl,
  githubUrl,
}: AboutThisDemoProps) {
  return (
    <Reveal>
      <section
        id="about-demo"
        aria-label={copy.ariaLabel}
        className="bg-surface-secondary px-4 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto flex max-w-[640px] flex-col gap-6 text-center">
          <p className="t-micro text-ink-tertiary">{copy.eyebrow}</p>
          <p className="t-body text-ink-primary">
            {copy.bodyLead}
            <strong className="text-ink-primary">{copy.bodyAuthor}</strong>
            {copy.bodyTrail}
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <Link
              href={upworkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ink-primary text-surface-primary t-small inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-90"
            >
              {copy.upworkLabel}
            </Link>
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink-primary text-ink-primary t-small inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium transition-colors hover:bg-surface-primary"
            >
              {copy.githubLabel}
            </Link>
          </div>
          <p className="t-small text-ink-tertiary mt-6">
            {copy.licenseLabel} ·{' '}
            <Link href={otherLocaleHref} className="hover:text-ink-primary underline">
              {copy.otherLocaleLabel}
            </Link>
          </p>
        </div>
      </section>
    </Reveal>
  )
}
