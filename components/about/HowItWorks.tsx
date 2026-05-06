import type { LucideIcon } from 'lucide-react'
import { Leaf, MessageSquare, XCircle } from 'lucide-react'
import { Reveal } from '@/components/Reveal'
import type { AboutHowItWorksCopy, AboutStepIconKey } from '@/lib/i18n/about'

const STEP_ICONS: Record<AboutStepIconKey, LucideIcon> = {
  leaf: Leaf,
  messageSquare: MessageSquare,
  xCircle: XCircle,
}

interface HowItWorksProps {
  copy: AboutHowItWorksCopy
}

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <Reveal>
      <section
        id="about-how"
        aria-label={copy.ariaLabel}
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[1120px]">
          <p className="t-micro text-ink-tertiary mb-3">{copy.eyebrow}</p>
          <p className="t-display text-ink-primary mb-16 max-w-[18ch]">
            {copy.headline}
          </p>
          <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {copy.steps.map(step => {
              const Icon = STEP_ICONS[step.iconKey]
              return (
                <li key={step.number} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-surface-secondary text-accent-cool inline-flex h-10 w-10 items-center justify-center rounded-md">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="t-mono text-ink-tertiary">{step.number}</span>
                  </div>
                  <h3 className="t-headline text-ink-primary">{step.title}</h3>
                  <p className="t-body text-ink-secondary">{step.body}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}
