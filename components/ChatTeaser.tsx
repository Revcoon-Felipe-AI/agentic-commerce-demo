'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { LeafIcon } from '@/components/icons/LeafIcon'
import {
  LINDEN_CHAT_OPENED_EVENT,
  LINDEN_OPEN_CHAT_EVENT,
} from '@/lib/events'

/**
 * Rotating invitation teaser shown above the persistent chat pill.
 *
 * State machine:
 *   IDLE (5s initial delay) -> TYPING (1.2s) -> MESSAGE (14s)
 *     -> IDLE (3s gap)      -> TYPING (next msg) -> ...
 *
 * Stops permanently for the session when:
 *   - The customer dismisses it (X button) -> sessionStorage flag
 *   - The chat opens via any code path (open-chat request OR chat-opened notification)
 *
 * Pure presentation; never touches the AI agent, the chat hook, or the cart.
 */

const MESSAGES = [
  'What room are you working on?',
  'Two picks. Both fit. One reason for each.',
  'Eleven tabs open and still undecided? Tell me about your room.',
  'I might tell you not to buy. That’s the point.',
  'Stuck on a sofa? Let me look at your wall first.',
] as const

const STORAGE_KEY = 'linden_teaser_dismissed'

const INITIAL_DELAY_MS = 5_000
const TYPING_MS = 1_200
const MESSAGE_MS = 14_000
const GAP_MS = 3_000

type Phase = 'hidden' | 'typing' | 'message'

export function ChatTeaser() {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [msgIndex, setMsgIndex] = useState(0)
  const [stopped, setStopped] = useState(true)
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    setStopped(true)
    setPhase('hidden')
  }, [clearTimer])

  // Mount: respect dismiss flag, then schedule the first appearance. The two
  // setState calls hydrate teaser visibility from sessionStorage and start a
  // timer-driven cycle — neither is a synchronous render-state coupling.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      // sessionStorage unavailable (private mode etc.) — proceed without persistence.
    }

    setStopped(false)
    timerRef.current = window.setTimeout(() => {
      setPhase('typing')
    }, INITIAL_DELAY_MS)

    return clearTimer
  }, [clearTimer])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Drive the cycle: typing -> message -> hidden -> typing ...
  useEffect(() => {
    if (stopped) return

    if (phase === 'typing') {
      timerRef.current = window.setTimeout(() => setPhase('message'), TYPING_MS)
    } else if (phase === 'message') {
      timerRef.current = window.setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length)
        setPhase('hidden')
      }, MESSAGE_MS)
    } else {
      // 'hidden' between messages — gap, then next typing
      timerRef.current = window.setTimeout(() => setPhase('typing'), GAP_MS)
    }

    return clearTimer
  }, [phase, stopped, clearTimer])

  // Stop on any chat-open signal.
  useEffect(() => {
    window.addEventListener(LINDEN_OPEN_CHAT_EVENT, stop)
    window.addEventListener(LINDEN_CHAT_OPENED_EVENT, stop)
    return () => {
      window.removeEventListener(LINDEN_OPEN_CHAT_EVENT, stop)
      window.removeEventListener(LINDEN_CHAT_OPENED_EVENT, stop)
    }
  }, [stop])

  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    stop()
  }, [stop])

  if (stopped || phase === 'hidden') return null

  const message = MESSAGES[msgIndex] ?? MESSAGES[0]

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed right-4 bottom-20 z-30 max-w-[280px]
        md:right-8 md:bottom-24 md:max-w-[300px]
        linden-teaser-enter
      "
    >
      <div
        className="
          bg-surface-elevated border-divider relative
          rounded-md border
          px-4 py-3
          shadow-[0_4px_12px_rgba(42,39,34,0.08)]
        "
      >
        <div className="flex items-start gap-2.5">
          <LeafIcon className="text-accent-cool mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            {phase === 'typing' ? (
              <TypingDots />
            ) : (
              <p className="t-small text-ink-primary">{message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss invitation"
            className="text-ink-tertiary hover:text-ink-primary -mt-0.5 -mr-1 p-1 transition-colors"
          >
            <X size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div
          aria-hidden="true"
          className="bg-surface-elevated border-divider absolute -bottom-[6px] right-8 h-3 w-3 rotate-45 border-r border-b"
        />
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div
      className="flex items-center gap-1 py-1.5"
      aria-label="Linden is typing"
    >
      <span className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full" />
      <span
        className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full"
        style={{ animationDelay: '200ms' }}
      />
      <span
        className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full"
        style={{ animationDelay: '400ms' }}
      />
    </div>
  )
}
