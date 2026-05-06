'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Focus the referenced element on the next animation frame whenever
 * `open` flips to true. The frame delay lets the modal finish its layout
 * pass before stealing focus, which prevents iOS Safari from scrolling the
 * page underneath the keyboard.
 */
export function useFocusOnOpen(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
): void {
  useEffect(() => {
    if (!open) return
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => ref.current?.focus())
  }, [open, ref])
}
