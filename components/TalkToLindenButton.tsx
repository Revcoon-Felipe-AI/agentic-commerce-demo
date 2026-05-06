'use client'

import { Leaf } from 'lucide-react'
import { dispatchOpenChat, type LindenOpenChatDetail } from '@/lib/events'

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
    // exactOptionalPropertyTypes forbids passing `undefined` explicitly —
    // build the detail by spreading only the keys that are actually set.
    const detail: LindenOpenChatDetail = {
      ...(productSlug !== undefined && { productSlug }),
      ...(productName !== undefined && { productName }),
      ...(autoSend !== undefined && { autoSend }),
    }
    dispatchOpenChat(Object.keys(detail).length > 0 ? detail : undefined)
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
