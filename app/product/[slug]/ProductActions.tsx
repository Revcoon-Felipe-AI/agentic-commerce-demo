'use client'

import { useCallback, useState } from 'react'
import { addToCart } from '@/lib/cart'
import { Toast } from '@/components/Toast'
import { dispatchOpenChat } from '@/lib/events'

interface ProductActionsProps {
  productSlug: string
  productId: string
  productName: string
}

export function ProductActions({
  productSlug,
  productId,
  productName,
}: ProductActionsProps) {
  const [toast, setToast] = useState<string | null>(null)

  const handleTalkToLinden = useCallback(() => {
    // autoSend so Linden's reply lands immediately — the customer doesn't
    // hit a pre-filled input wondering whether they need to confirm.
    dispatchOpenChat({ productSlug, productName, autoSend: true })
  }, [productSlug, productName])

  const handleAddToBag = useCallback(() => {
    try {
      addToCart(productId, 1)
      setToast(`Added the ${productName} to your bag.`)
    } catch (err) {
      // sessionStorage can throw QuotaExceededError or be disabled in private
      // browsing. Surface a real message instead of a silent positive toast.
      console.warn('[ProductActions] addToCart failed', { err })
      setToast(`Couldn't save your bag — try again.`)
    }
  }, [productId, productName])

  const handleToastClose = useCallback(() => {
    setToast(null)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleTalkToLinden}
        data-product-context={productSlug}
        className="bg-ink-primary text-surface-primary t-subhead w-full rounded-md px-6 py-4 transition-opacity hover:opacity-90"
      >
        Talk to Linden about this
      </button>
      <button
        type="button"
        onClick={handleAddToBag}
        className="border-ink-primary text-ink-primary t-body w-full rounded-md border px-6 py-3 transition-colors hover:bg-surface-secondary md:w-auto md:self-start"
      >
        Add to bag
      </button>

      {toast ? <Toast message={toast} onClose={handleToastClose} /> : null}
    </div>
  )
}
