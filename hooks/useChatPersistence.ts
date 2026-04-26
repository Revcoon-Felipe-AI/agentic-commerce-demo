import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'

const STORAGE_KEY = 'linden_chat_v1'
const PERSIST_DEBOUNCE_MS = 400

interface UseChatPersistenceArgs {
  messages: UIMessage[]
  setMessages: (messages: UIMessage[]) => void
}

/**
 * Hydrate chat history from sessionStorage once on mount and persist
 * subsequent message changes (debounced, so streaming token updates don't
 * thrash storage). The chat survives in-tab navigation but resets when the
 * tab closes — matches the rest of the demo's session model.
 */
export function useChatPersistence({ messages, setMessages }: UseChatPersistenceArgs): void {
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as UIMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed)
      }
    } catch (err) {
      console.warn('[chat] failed to hydrate session history', { err })
    }
  }, [setMessages])

  useEffect(() => {
    if (!hydratedRef.current) return
    const handle = window.setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch (err) {
        console.warn('[chat] failed to persist session history', { err })
      }
    }, PERSIST_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [messages])
}
