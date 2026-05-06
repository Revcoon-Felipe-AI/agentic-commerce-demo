'use client'

import { formatUSD } from '@/lib/format'

const SHIPPING_LINE = 'Ships in 8 weeks; we’ll email when it leaves the warehouse.'

interface CartSummaryProps {
  subtotal: number
  onPlaceOrder: () => void
}

export function CartSummary({ subtotal, onPlaceOrder }: CartSummaryProps) {
  return (
    <>
      <div className="border-divider mt-8 flex items-baseline justify-between border-t pt-8">
        <p className="t-subhead text-ink-secondary">Subtotal</p>
        <p className="t-display text-ink-primary">{formatUSD(subtotal)}</p>
      </div>

      <p className="t-small text-ink-secondary mt-6">{SHIPPING_LINE}</p>

      <button
        type="button"
        onClick={onPlaceOrder}
        className="bg-ink-primary text-surface-primary t-subhead mt-4 w-full rounded-md px-6 py-4 transition-opacity hover:opacity-90"
      >
        Place Order
      </button>
    </>
  )
}
