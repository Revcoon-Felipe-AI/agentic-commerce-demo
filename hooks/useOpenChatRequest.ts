'use client'

import { useEffect, type RefObject } from 'react'
import { LINDEN_OPEN_CHAT_EVENT, type LindenOpenChatDetail } from '@/lib/events'

interface UseOpenChatRequestArgs {
  inputRef: RefObject<HTMLInputElement | null>
  onSendText: (text: string) => void
  onPrefill: (text: string) => void
}

/**
 * React to a `LINDEN_OPEN_CHAT_EVENT` broadcast by another component
 * (typically the PDP "Talk to Linden about this" button). When `autoSend` is
 * set, the message ships immediately; otherwise we pre-fill the input so the
 * customer can review before sending. Either way the input is focused next.
 */
export function useOpenChatRequest({
  inputRef,
  onSendText,
  onPrefill,
}: UseOpenChatRequestArgs): void {
  useEffect(() => {
    function handleOpenRequest(event: Event) {
      const detail = (event as CustomEvent<LindenOpenChatDetail>).detail ?? {}
      const subject = detail.productName?.trim() || detail.productSlug?.trim()
      if (subject) {
        const text = `Tell me about the ${subject}.`
        if (detail.autoSend) onSendText(text)
        else onPrefill(text)
      }
      focusOnNextFrame(inputRef)
    }
    window.addEventListener(LINDEN_OPEN_CHAT_EVENT, handleOpenRequest)
    return () => window.removeEventListener(LINDEN_OPEN_CHAT_EVENT, handleOpenRequest)
  }, [inputRef, onPrefill, onSendText])
}

function focusOnNextFrame(ref: RefObject<HTMLInputElement | null>): void {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => ref.current?.focus())
}
