'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChatModal } from '@/components/ChatModal'
import { LeafIcon } from '@/components/icons/LeafIcon'
import { LINDEN_OPEN_CHAT_EVENT, dispatchChatOpened } from '@/lib/events'

export function ChatBubble() {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => {
    setOpen(true)
    // Broadcast so passive listeners (e.g. ChatTeaser) can react without
    // having to know about ChatBubble's internal state.
    dispatchChatOpened()
  }, [])
  const handleClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener(LINDEN_OPEN_CHAT_EVENT, onOpen)
    return () => window.removeEventListener(LINDEN_OPEN_CHAT_EVENT, onOpen)
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
        aria-expanded={open}
        aria-controls="linden-chat-modal"
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
