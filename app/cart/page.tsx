'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import {
  type CartItem,
  getCart,
  onCartChange,
  removeFromCart,
  setQty,
} from '@/lib/cart'
import { formatUSD } from '@/lib/format'
import type { Product } from '@/lib/products'
import { getProductsByIdsBrowser } from '@/lib/products.client'
import { Toast } from '@/components/Toast'

interface CartRow {
  product: Product
  qty: number
}

const SHIPPING_LINE = 'Ships in 8 weeks; we’ll email when it leaves the warehouse.'
const PLACE_ORDER_MESSAGE =
  'This is a portfolio demo — no real checkout. Want to talk to Linden about anything else?'
const REMOVED_MESSAGE = 'Removed from your bag.'

export default function CartPage() {
  const [items, setItems] = useState<CartItem[] | null>(null)
  const [products, setProducts] = useState<Map<string, Product> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate cart items from sessionStorage post-mount; SSR renders skeleton to avoid hydration mismatch
    setItems(getCart())
    const unsubscribe = onCartChange(next => setItems(next))
    return unsubscribe
  }, [])

  useEffect(() => {
    if (items === null) return
    if (items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- empty cart short-circuit; products list reflects items state
      setProducts(new Map())
      return
    }

    let cancelled = false
    async function load(productIds: readonly string[]) {
      try {
        const rows = await getProductsByIdsBrowser(productIds)
        if (cancelled) return

        const map = new Map<string, Product>()
        for (const row of rows) map.set(row.id, row)
        setProducts(map)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Failed to load cart products', { error: err })
        setError(`Failed to load cart products: ${message}`)
      }
    }

    void load(items.map(i => i.product_id))
    return () => {
      cancelled = true
    }
  }, [items])

  const handleDecrement = useCallback((productId: string, current: number) => {
    if (current <= 1) {
      setToast(REMOVED_MESSAGE)
    }
    setQty(productId, current - 1)
  }, [])

  const handleIncrement = useCallback((productId: string, current: number) => {
    setQty(productId, current + 1)
  }, [])

  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId)
    setToast(REMOVED_MESSAGE)
  }, [])

  const handlePlaceOrder = useCallback(() => {
    setToast(PLACE_ORDER_MESSAGE)
  }, [])

  const handleToastClose = useCallback(() => {
    setToast(null)
  }, [])

  if (items === null || products === null) {
    return <CartSkeleton />
  }

  if (error) {
    return (
      <section className="mx-auto max-w-[640px] px-4 py-20 md:px-12">
        <h1 className="t-display text-ink-primary">Your bag</h1>
        <p className="t-body text-danger mt-6">{error}</p>
      </section>
    )
  }

  const rows: CartRow[] = items
    .map(item => {
      const product = products.get(item.product_id)
      return product ? { product, qty: item.qty } : null
    })
    .filter((row): row is CartRow => row !== null)

  if (rows.length === 0) {
    return (
      <>
        <EmptyCart />
        {toast ? <Toast message={toast} onClose={handleToastClose} /> : null}
      </>
    )
  }

  const subtotal = rows.reduce((sum, row) => sum + row.product.price_usd * row.qty, 0)

  return (
    <section className="mx-auto max-w-[640px] px-4 py-12 md:px-12 md:py-20">
      <h1 className="t-display text-ink-primary">Your bag</h1>

      <ul className="mt-12 flex flex-col divide-y divide-divider">
        {rows.map(row => (
          <li key={row.product.id} className="flex items-start gap-4 py-6">
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={row.product.image_url}
                alt={row.product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Link
                href={`/product/${row.product.slug}`}
                className="t-headline text-ink-primary hover:underline"
              >
                {row.product.name}
              </Link>
              {row.product.material ? (
                <p className="t-small text-ink-secondary">{row.product.material}</p>
              ) : null}
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDecrement(row.product.id, row.qty)}
                  aria-label={`Decrease quantity of ${row.product.name}`}
                  className="border-divider text-ink-primary hover:bg-surface-secondary h-8 w-8 rounded-md border"
                >
                  −
                </button>
                <span className="t-mono text-ink-primary w-6 text-center">
                  {row.qty}
                </span>
                <button
                  type="button"
                  onClick={() => handleIncrement(row.product.id, row.qty)}
                  aria-label={`Increase quantity of ${row.product.name}`}
                  className="border-divider text-ink-primary hover:bg-surface-secondary h-8 w-8 rounded-md border"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="t-mono text-ink-primary">
                {formatUSD(row.product.price_usd * row.qty)}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(row.product.id)}
                className="t-small text-ink-secondary hover:text-ink-primary underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-divider mt-8 flex items-baseline justify-between border-t pt-8">
        <p className="t-subhead text-ink-secondary">Subtotal</p>
        <p className="t-display text-ink-primary">{formatUSD(subtotal)}</p>
      </div>

      <p className="t-small text-ink-secondary mt-6">{SHIPPING_LINE}</p>

      <button
        type="button"
        onClick={handlePlaceOrder}
        className="bg-ink-primary text-surface-primary t-subhead mt-4 w-full rounded-md px-6 py-4 transition-opacity hover:opacity-90"
      >
        Place Order
      </button>

      {toast ? <Toast message={toast} onClose={handleToastClose} /> : null}
    </section>
  )
}

function CartSkeleton() {
  return (
    <section className="mx-auto max-w-[640px] px-4 py-12 md:px-12 md:py-20">
      <h1 className="t-display text-ink-primary">Your bag</h1>
      <ul
        className="mt-12 flex flex-col divide-y divide-divider"
        aria-hidden="true"
      >
        {[0, 1].map(index => (
          <li key={index} className="flex items-start gap-4 py-6">
            <div className="bg-surface-secondary h-20 w-20 flex-shrink-0 animate-pulse rounded-md" />
            <div className="flex flex-1 flex-col gap-3 pt-1">
              <div className="bg-surface-secondary h-5 w-[60%] animate-pulse rounded-sm" />
              <div className="bg-surface-secondary h-4 w-[40%] animate-pulse rounded-sm" />
              <div className="bg-surface-secondary h-4 w-[30%] animate-pulse rounded-sm" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyCart() {
  return (
    <section className="mx-auto flex max-w-[640px] flex-col items-start gap-6 px-4 py-20 md:px-12">
      <h1 className="t-display text-ink-primary">Your bag</h1>
      <p className="t-subhead text-ink-secondary">
        Nothing here yet. Want to talk to Linden?
      </p>
      <Link
        href="/"
        className="bg-accent-warm text-surface-primary t-small mt-2 inline-flex items-center gap-2 rounded-sm px-5 py-3 font-medium hover:opacity-95"
      >
        Talk to Linden
      </Link>
    </section>
  )
}
