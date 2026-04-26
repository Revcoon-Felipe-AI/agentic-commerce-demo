'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { cartCount, onCartChange } from '@/lib/cart'
import { LanguageToggle } from '@/components/LanguageToggle'

export function Header() {
  const [count, setCount] = useState(0)
  const [pulseToken, setPulseToken] = useState(0)
  const previousCountRef = useRef(0)

  // Hydrate cart count from sessionStorage post-mount (SSR renders 0 to avoid
  // mismatch). The setState calls below are intentional and run once per
  // event from the cart store — not in a loop.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const initial = cartCount()
    setCount(initial)
    previousCountRef.current = initial

    return onCartChange(items => {
      const next = cartCount(items)
      setCount(next)
      if (next > previousCountRef.current) {
        // bump token to retrigger the one-shot pulse on every increment
        setPulseToken(t => t + 1)
      }
      previousCountRef.current = next
    })
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-primary border-b border-divider">
      <div className="mx-auto h-full max-w-[1120px] px-4 md:px-8 lg:px-12 flex items-center justify-between">
        <Link
          href="/"
          className="t-headline text-ink-primary leading-none"
          aria-label="Linden — home"
        >
          Linden
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          <Link href="/" className="t-body text-ink-secondary hover:text-ink-primary">
            Catalog
          </Link>
          <Link href="/about" className="t-body text-ink-secondary hover:text-ink-primary">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center text-ink-primary"
            aria-label={count > 0 ? `Cart, ${count} items` : 'Cart, empty'}
          >
            <ShoppingBag size={20} strokeWidth={1.5} aria-hidden="true" />
            {count > 0 && (
              <span
                key={pulseToken}
                className={`absolute -top-1.5 -right-2.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-warm px-1 text-surface-primary text-[10px] font-medium leading-none${pulseToken > 0 ? ' linden-cart-badge-pulse' : ''}`}
                aria-hidden="true"
              >
                {count}
              </span>
            )}
          </Link>
          <LanguageToggle variant="header" />
        </div>
      </div>
    </header>
  )
}
