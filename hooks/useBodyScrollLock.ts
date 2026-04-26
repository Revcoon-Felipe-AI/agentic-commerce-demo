import { useEffect } from 'react'

const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)'

/**
 * Lock body scroll on mobile while `enabled` is true.
 * Desktop layouts intentionally stay scrollable — locking there made the
 * surrounding page feel broken when the chat covered most of the viewport.
 */
export function useBodyScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const isMobile = window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches
    if (!isMobile) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [enabled])
}
