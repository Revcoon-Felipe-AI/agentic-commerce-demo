'use client'

import { Leaf } from 'lucide-react'

// Event name will be centralized in `lib/events.ts` in a follow-up frente
// (`fix/08-cross-cutting-helpers`). Until then, every callsite uses the
// literal — keep this string in sync with ChatBubble/ChatModal/ProductActions.
const OPEN_CHAT_EVENT = 'linden:open-chat'

interface TalkToLindenButtonProps {
  label: string
  productSlug?: string
  productName?: string
  autoSend?: boolean
}

export function TalkToLindenButton({
  label,
  productSlug,
  productName,
  autoSend,
}: TalkToLindenButtonProps) {
  function handleClick(): void {
    if (typeof window === 'undefined') return
    const detail =
      productSlug !== undefined || productName !== undefined || autoSend !== undefined
        ? { productSlug, productName, autoSend }
        : undefined
    const event = detail
      ? new CustomEvent(OPEN_CHAT_EVENT, { detail })
      : new CustomEvent(OPEN_CHAT_EVENT)
    window.dispatchEvent(event)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-accent-warm text-surface-primary t-subhead inline-flex items-center gap-3 rounded-md px-8 py-4 font-medium shadow-[0_4px_12px_rgba(42,39,34,0.12)] transition-transform hover:scale-[1.02]"
    >
      <Leaf size={18} strokeWidth={1.5} aria-hidden="true" />
      {label}
    </button>
  )
}
