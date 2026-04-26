import Image from 'next/image'
import { Reveal } from '@/components/Reveal'

const EDITORIAL_COPY =
  'conversation, not a catalog. Tell Linden what room you’re working on, and you’ll get two picks with one reason for each. The AI can — and will — tell you not to buy. That’s the point.'

// First letter is split off so we can drop-cap it without breaking word selection.
const DROP_CAP_LETTER = 'A'

export function Editorial() {
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
                {DROP_CAP_LETTER}
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
