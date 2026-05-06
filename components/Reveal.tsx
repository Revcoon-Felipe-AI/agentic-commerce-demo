'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface RevealProps {
  children: ReactNode
  /** Tailwind class for the wrapper element (background, padding, etc.) */
  className?: string
  /** ms — fires once when the element enters the viewport. */
  delay?: number
  /** Pixels of root margin top to trigger early. Default 80. */
  rootMarginTop?: number
}

/**
 * Lightweight IntersectionObserver wrapper that fades + lifts its child once
 * when it scrolls into view. Pure CSS animation (no Framer Motion). Respects
 * prefers-reduced-motion and renders fully visible on the server (no FOUC for
 * users without JS).
 */
export function Reveal({
  children,
  className,
  delay = 0,
  rootMarginTop = 80,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Reveal is fundamentally a "subscribe to scroll position via IO" effect —
  // every setVisible call here either escape-hatches the animation or fires
  // from the IO callback (an external event). The lint rule doesn't model
  // either pattern, so disable across the effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: `0px 0px -${rootMarginTop}px 0px`, threshold: 0.05 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMarginTop])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      ref={ref}
      className={cn('linden-reveal', visible && 'linden-reveal--in', className)}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
