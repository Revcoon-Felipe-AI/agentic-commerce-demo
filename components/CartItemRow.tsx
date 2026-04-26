'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatUSD } from '@/lib/format'
import type { Product } from '@/lib/products'

interface CartItemRowProps {
  product: Product
  qty: number
  onIncrement: (productId: string, currentQty: number) => void
  onDecrement: (productId: string, currentQty: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({
  product,
  qty,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  return (
    <li className="flex items-start gap-4 py-6">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Link
          href={`/product/${product.slug}`}
          className="t-headline text-ink-primary hover:underline"
        >
          {product.name}
        </Link>
        {product.material ? (
          <p className="t-small text-ink-secondary">{product.material}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onDecrement(product.id, qty)}
            aria-label={`Decrease quantity of ${product.name}`}
            className="border-divider text-ink-primary hover:bg-surface-secondary h-8 w-8 rounded-md border"
          >
            −
          </button>
          <span className="t-mono text-ink-primary w-6 text-center">{qty}</span>
          <button
            type="button"
            onClick={() => onIncrement(product.id, qty)}
            aria-label={`Increase quantity of ${product.name}`}
            className="border-divider text-ink-primary hover:bg-surface-secondary h-8 w-8 rounded-md border"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <p className="t-mono text-ink-primary">
          {formatUSD(product.price_usd * qty)}
        </p>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="t-small text-ink-secondary hover:text-ink-primary underline"
        >
          Remove
        </button>
      </div>
    </li>
  )
}
