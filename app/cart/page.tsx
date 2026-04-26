'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { CartItemRow } from '@/components/CartItemRow'
import { CartSummary } from '@/components/CartSummary'
import { Toast } from '@/components/Toast'
import { removeFromCart, setQty } from '@/lib/cart'
import { useCartWithProducts } from '@/app/cart/use-cart-with-products'

const PLACE_ORDER_MESSAGE =
  'This is a portfolio demo — no real checkout. Want to talk to Linden about anything else?'
const REMOVED_MESSAGE = 'Removed from your bag.'

export default function CartPage() {
  const view = useCartWithProducts()
  const [toast, setToast] = useState<string | null>(null)

  const handleDecrement = useCallback((productId: string, currentQty: number) => {
    if (currentQty <= 1) setToast(REMOVED_MESSAGE)
    setQty(productId, currentQty - 1)
  }, [])

  const handleIncrement = useCallback((productId: string, currentQty: number) => {
    setQty(productId, currentQty + 1)
  }, [])

  const handleRemove = useCallback((productId: string) => {
    removeFromCart(productId)
    setToast(REMOVED_MESSAGE)
  }, [])

  const handlePlaceOrder = useCallback(() => {
    setToast(PLACE_ORDER_MESSAGE)
  }, [])

  const handleToastClose = useCallback(() => setToast(null), [])

  const subtotal = useMemo(
    () => view.rows.reduce((sum, row) => sum + row.product.price_usd * row.qty, 0),
    [view.rows],
  )

  if (view.status === 'loading') return <CartSkeleton />
  if (view.status === 'error') return <CartError message={view.error} />
  if (view.status === 'empty') {
    return (
      <>
        <EmptyCart />
        {toast ? <Toast message={toast} onClose={handleToastClose} /> : null}
      </>
    )
  }

  return (
    <section className="mx-auto max-w-[640px] px-4 py-12 md:px-12 md:py-20">
      <h1 className="t-display text-ink-primary">Your bag</h1>

      <ul className="mt-12 flex flex-col divide-y divide-divider">
        {view.rows.map(row => (
          <CartItemRow
            key={row.product.id}
            product={row.product}
            qty={row.qty}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onRemove={handleRemove}
          />
        ))}
      </ul>

      <CartSummary subtotal={subtotal} onPlaceOrder={handlePlaceOrder} />

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

interface CartErrorProps {
  message: string | undefined
}

function CartError({ message }: CartErrorProps) {
  return (
    <section className="mx-auto max-w-[640px] px-4 py-20 md:px-12">
      <h1 className="t-display text-ink-primary">Your bag</h1>
      <p className="t-body text-danger mt-6">{message ?? 'Something went wrong.'}</p>
    </section>
  )
}
