'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatUSD } from '@/lib/format'
import { CATEGORY_LABELS, type ProductCategory } from '@/lib/products'

export interface ProductCardInlineProps {
  slug: string
  name: string
  price_usd: number
  image_url: string
  category?: ProductCategory
}

/**
 * Compact product card rendered inline within a chat agent message.
 * Per DESIGN-BRIEF §5.4: 75% chat-width, square photo, name + price + a single
 * "View piece" link. Same-tab navigation via next/link for client-side routing
 * (chat session is lost — see analysis note: cross-page chat persistence is a
 * future enhancement).
 */
export function ProductCardInline({
  slug,
  name,
  price_usd,
  image_url,
  category,
}: ProductCardInlineProps) {
  return (
    <article className="bg-surface-elevated border-divider w-[75%] flex-shrink-0 overflow-hidden rounded-md border">
      <div className="bg-surface-secondary relative aspect-square w-full">
        <Image
          src={image_url}
          alt={name}
          fill
          sizes="320px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 px-3 py-3">
        {category ? (
          <p className="t-micro text-ink-tertiary">{CATEGORY_LABELS[category]}</p>
        ) : null}
        <h4 className="t-headline text-ink-primary leading-tight">{name}</h4>
        <p className="t-mono text-ink-secondary">{formatUSD(price_usd)}</p>
        <Link
          href={`/product/${slug}`}
          className="t-small text-ink-primary mt-1 underline-offset-2 hover:underline"
        >
          View piece
        </Link>
      </div>
    </article>
  )
}
