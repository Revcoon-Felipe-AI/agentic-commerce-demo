'use client'

import { useEffect, type RefObject } from 'react'

const OPEN_CHAT_EVENT = 'linden:open-chat'

type OpenChatDetail = {
  productSlug?: string
  productName?: string
  /** When true, the pre-filled input is sent immediately instead of waiting for the user to press Enter. */
  autoSend?: boolean
}

interface UseOpenChatRequestArgs {
  inputRef: RefObject<HTMLInputElement | null>
  onSendText: (text: string) => void
  onPrefill: (text: string) => void
}

/**
 * React to a `linden:open-chat` event broadcast by another component
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
      const detail = (event as CustomEvent<OpenChatDetail>).detail ?? {}
      const subject = detail.productName?.trim() || detail.productSlug?.trim()
      if (subject) {
        const text = `Tell me about the ${subject}.`
        if (detail.autoSend) onSendText(text)
        else onPrefill(text)
      }
      focusOnNextFrame(inputRef)
    }
    window.addEventListener(OPEN_CHAT_EVENT, handleOpenRequest)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handleOpenRequest)
  }, [inputRef, onPrefill, onSendText])
}

function focusOnNextFrame(ref: RefObject<HTMLInputElement | null>): void {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => ref.current?.focus())
}
