import { LeafAvatar } from '@/components/chat/LeafAvatar'

const AVATAR_SIZE_PX = 24
const DOT_DELAYS_MS = [0, 200, 400] as const

/** Three-dot animation rendered while the assistant is composing a reply. */
export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <LeafAvatar size={AVATAR_SIZE_PX} pulse={false} />
      <div className="bg-surface-secondary border-l-accent-cool flex max-w-[80%] items-center gap-1 rounded-md border-l-2 px-4 py-4">
        {DOT_DELAYS_MS.map((delay) => (
          <span
            key={delay}
            className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full"
            style={delay === 0 ? undefined : { animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
