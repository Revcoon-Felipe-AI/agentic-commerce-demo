'use client'

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { CATEGORY_LABELS, type ProductCategory } from '@/lib/products.types'

// Event name will be centralized in `lib/events.ts` in a follow-up frente
// (`fix/08-cross-cutting-helpers`). Until then, every callsite uses the
// literal — keep this string in sync with `TalkToLindenButton`/`ChatBubble`.
const OPEN_CHAT_EVENT = 'linden:open-chat'

interface CategoryTileProps {
  category: ProductCategory
  image: string
  imageAlt: string
  pieceCount: number
}

export function CategoryTile({
  category,
  image,
  imageAlt,
  pieceCount,
}: CategoryTileProps) {
  function handleOpenChat(): void {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))
  }

  return (
    <button
      type="button"
      onClick={handleOpenChat}
      aria-label={`Talk to Linden about ${CATEGORY_LABELS[category]}`}
      className="group block w-full cursor-pointer text-left"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md md:rounded-none">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div
          aria-hidden="true"
          className="bg-ink-primary/0 group-hover:bg-ink-primary/15 absolute inset-0 transition-colors duration-300"
        />
        <span
          aria-hidden="true"
          className="bg-surface-elevated text-ink-primary t-small absolute right-3 bottom-3 inline-flex translate-y-2 items-center gap-1 rounded-md px-3 py-1.5 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Talk about
          <ChevronRight size={14} strokeWidth={1.5} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h2 className="t-headline text-ink-primary">
          {CATEGORY_LABELS[category]}
        </h2>
        <span className="t-mono text-ink-tertiary">
          {pieceCount} {pieceCount === 1 ? 'piece' : 'pieces'}
        </span>
      </div>
    </button>
  )
}
