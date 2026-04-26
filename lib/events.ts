/**
 * Custom event constants and dispatch helpers used by chat-related UI.
 *
 * Any component that needs to ask the chat to open OR react when the chat
 * opens should import from here — never use the raw event-name strings.
 * That keeps the channel typed, greppable, and easy to rename.
 */

/** Broadcast when any UI requests the chat to open (PDP CTA, Hero, Cart empty, ESC menu, etc.). */
export const LINDEN_OPEN_CHAT_EVENT = 'linden:open-chat'

/** Broadcast when the chat actually opened (post-mount). Used by the teaser to stop. */
export const LINDEN_CHAT_OPENED_EVENT = 'linden:chat-opened'

export interface LindenOpenChatDetail {
  productSlug?: string
  productName?: string
  /** When true, the pre-filled prompt is sent immediately instead of waiting for Enter. */
  autoSend?: boolean
}

/** Dispatch a request for the chat to open. SSR-safe. */
export function dispatchOpenChat(detail?: LindenOpenChatDetail): void {
  if (typeof window === 'undefined') return
  const event = detail
    ? new CustomEvent(LINDEN_OPEN_CHAT_EVENT, { detail })
    : new CustomEvent(LINDEN_OPEN_CHAT_EVENT)
  window.dispatchEvent(event)
}

/** Notify listeners (teaser, etc.) that the chat opened. SSR-safe. */
export function dispatchChatOpened(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LINDEN_CHAT_OPENED_EVENT))
}
