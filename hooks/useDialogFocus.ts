'use client'

import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Manages focus for a modal dialog. While `open` is true, Tab and Shift+Tab
 * cycle through focusable elements inside `containerRef` instead of escaping
 * to the page. On close, focus returns to the element that opened the dialog
 * (the trigger), so keyboard users land back where they were.
 *
 * WCAG 2.4.3 Focus Order — required for `role="dialog" aria-modal="true"`.
 */
export function useDialogFocus(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
): void {
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(isVisible)
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open, containerRef])
}

function isVisible(el: HTMLElement): boolean {
  return el.offsetParent !== null
}
