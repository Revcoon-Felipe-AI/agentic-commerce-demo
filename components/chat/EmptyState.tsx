import { LeafAvatar } from '@/components/chat/LeafAvatar'

const SUGGESTED_PROMPTS = ['Living room', 'Bedroom', "I'm not sure yet"] as const
const AVATAR_SIZE_PX = 32

export interface EmptyStateProps {
  pulse: boolean
  onPick: (text: string) => void
}

/** First-paint state of the chat: leaf avatar, greeting, three suggestion chips. */
export function EmptyState({ pulse, onPick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <LeafAvatar size={AVATAR_SIZE_PX} pulse={pulse} />
      <p className="t-subhead text-ink-primary max-w-xs">
        Hi &mdash; what room are you working on?
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(label)}
            className="t-small text-ink-primary bg-surface-secondary hover:bg-divider rounded-sm px-3 py-2 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
