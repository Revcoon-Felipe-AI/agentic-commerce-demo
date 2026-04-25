'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChatModal } from '@/components/ChatModal'

const OPEN_CHAT_EVENT = 'linden:open-chat'

export function ChatBubble() {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setOpen(true)
    // Broadcast so passive listeners (e.g. ChatTeaser) can react without
    // having to know about ChatBubble's internal state.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('linden:chat-opened'))
    }
  }, [])
  const handleClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener(OPEN_CHAT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen)
  }, [])

  // Power-user shortcuts: Cmd/Ctrl+K or "/" toggles the chat. We only handle
  // the global "/" when no input/textarea is focused (so customers typing
  // "I/we want…" in the chat input don't accidentally close it).
  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const isMetaK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      const isSlashWhileIdle =
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isEditableTarget(event.target)

      if (!isMetaK && !isSlashWhileIdle) return
      event.preventDefault()
      setOpen((prev) => !prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open chat with Linden"
        className="
          fixed z-40 right-4 bottom-4 md:right-8 md:bottom-8
          inline-flex items-center gap-2
          bg-accent-warm text-surface-primary
          rounded-md px-5 py-3
          t-small font-medium
          shadow-[0_4px_12px_rgba(42,39,34,0.12)]
          transition-transform hover:scale-[1.02]
        "
      >
        <LeafIcon />
        <span>Talk to Linden</span>
      </button>
      <ChatModal open={open} onClose={handleClose} />
    </>
  )
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}
