import { Reveal } from '@/components/Reveal'

const BRANDSCRIPT_TITLE = 'Why Linden, in seven lines.'

const BRANDSCRIPT_SENTENCES: readonly string[] = [
  'You bought the apartment. Now the room is up to you.',
  'Eleven open tabs, seventeen filter facets, and you still cannot tell which sofa fits your wall.',
  'Furniture shopping shouldn’t feel like a part-time job — and we carry fewer than fifty pieces on purpose, so we actually know how each one behaves in a room like yours.',
  'Tell us one thing about your room. Get two picks with the reason attached. See them against your wall — including the honest “neither of these is right” when that is the answer.',
  'Start a conversation about your room. Or — see two picks for your room, no email required.',
  'The longer you compare, the harder the decision gets. Most rooms are not waiting for the perfect sofa; they are waiting for the right-enough one, picked on purpose, that you stop second-guessing by week two.',
  'A room you walk into and stop thinking about. The sofa fits the wall. The light is right. The decision is closed. You spent an afternoon, not a season, and the apartment finally feels like yours.',
] as const

const SHORT_SENTENCE_THRESHOLD = 110

export function BrandScript() {
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
              const isEvenIndex = index % 2 === 0
              const isShort = sentence.length < SHORT_SENTENCE_THRESHOLD
              const alignmentClass = isEvenIndex
                ? 'md:self-start'
                : 'md:self-end md:text-right'
              const sentenceClass = isShort
                ? 't-display text-ink-primary'
                : 't-subhead text-ink-primary'
              return (
                <li
                  key={sentence}
                  className={`flex flex-col gap-3 md:max-w-[640px] ${alignmentClass}`}
                >
                  <span className="t-mono text-ink-tertiary block">
                    {String(index + 1).padStart(2, '0')}
                    <span className="text-ink-tertiary mx-1">&mdash;</span>
                  </span>
                  <p className={sentenceClass}>{sentence}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}
