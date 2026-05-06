import Image from 'next/image'
import Link from 'next/link'
import { formatUSD } from '@/lib/format'
import { CATEGORY_LABELS, type Product } from '@/lib/products.types'

interface CatalogProductCardProps {
  product: Product
}

/**
 * Catalog grid tile — full card is the link target so the whole image area is
 * clickable. Hover lifts the photo subtly to signal interactivity without
 * announcing it loudly (Linden voice: editorial, not e-commerce).
 */
export function CatalogProductCard({ product }: CatalogProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary rounded-md"
      aria-label={`${product.name}, ${formatUSD(product.price_usd)}`}
    >
      <div className="bg-surface-secondary relative aspect-[4/5] w-full overflow-hidden rounded-md">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="bg-ink-primary/0 group-hover:bg-ink-primary/10 absolute inset-0 transition-colors duration-300"
        />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <p className="t-micro text-ink-tertiary">
          {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="t-headline text-ink-primary leading-tight">
          {product.name}
        </h3>
        <p className="t-mono text-ink-secondary">
          {formatUSD(product.price_usd)}
        </p>
      </div>
    </Link>
  )
}
