import { cn } from '@/lib/cn'

const AVATAR_PADDING_PX = 8

export interface LeafAvatarProps {
  size: number
  pulse: boolean
}

/** Round leaf avatar used inside the chat bubbles and the empty state. */
export function LeafAvatar({ size, pulse }: LeafAvatarProps) {
  const circleSize = size + AVATAR_PADDING_PX
  return (
    <span
      className={cn(
        'bg-surface-secondary inline-flex flex-shrink-0 items-center justify-center rounded-full',
        pulse && 'linden-pulse-once',
      )}
      style={{ width: circleSize, height: circleSize }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-cool"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </svg>
    </span>
  )
}
