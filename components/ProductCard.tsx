import Image from 'next/image'
import Link from 'next/link'
import { formatUSD } from '@/lib/format'
import { CATEGORY_LABELS, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

type ProductCardVariant = 'grid' | 'list'

interface ProductCardProps {
  product: Product
  variant?: ProductCardVariant
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  if (variant === 'list') {
    return <ProductCardList product={product} />
  }
  return <ProductCardGrid product={product} />
}

function ProductCardGrid({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      aria-label={`${product.name}, ${formatUSD(product.price_usd)}`}
    >
      <div
        className={cn(
          'relative aspect-square w-full overflow-hidden bg-surface-secondary',
          'rounded-md md:rounded-none',
          'transition-opacity group-hover:opacity-[0.92]',
        )}
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        {product.rotating_out && (
          <p className="t-micro text-accent-cool">
            Final 4 &mdash; leaving the catalog
          </p>
        )}
        <p className="t-micro text-ink-tertiary">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="t-headline text-ink-primary">{product.name}</h3>
        <p className="t-mono text-ink-secondary">{formatUSD(product.price_usd)}</p>
      </div>
    </Link>
  )
}

function ProductCardList({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex gap-4 items-start"
      aria-label={`${product.name}, ${formatUSD(product.price_usd)}`}
    >
      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-md bg-surface-secondary transition-opacity group-hover:opacity-[0.92]">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <p className="t-micro text-ink-tertiary">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="t-headline text-ink-primary truncate">{product.name}</h3>
        <p className="t-mono text-ink-secondary">{formatUSD(product.price_usd)}</p>
      </div>
    </Link>
  )
}
