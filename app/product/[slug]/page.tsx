import Image from 'next/image'
import { notFound } from 'next/navigation'
import { formatUSD } from '@/lib/format'
import { getProductBySlug } from '@/lib/products'
import { ProductActions } from './ProductActions'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const PDP_QUESTION = 'How will this work in your room?'

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  return (
    <>
      <section
        id="pdp-hero"
        aria-label={`${product.name} hero photo`}
        className="px-4 pt-8 md:px-12 md:pt-12"
      >
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[1120px] overflow-hidden rounded-md md:aspect-[16/9] md:rounded-none">
          <Image
            src={product.image_url}
            alt={`${product.name} photographed in a north-lit room.`}
            fill
            priority
            sizes="(min-width: 1120px) 1120px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section
        id="pdp-detail"
        aria-label="Product details"
        className="px-4 py-12 md:px-12 md:py-20"
      >
        <div className="mx-auto flex max-w-[640px] flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="t-display text-ink-primary">{PDP_QUESTION}</p>
            <h1 className="t-headline text-ink-primary">{product.name}</h1>
            <p className="t-display text-ink-primary">
              {formatUSD(product.price_usd)}
            </p>
          </div>

          <dl className="t-mono text-ink-secondary border-t border-b border-divider py-6 leading-relaxed">
            {product.dimensions ? (
              <div>
                <dt className="sr-only">Dimensions</dt>
                <dd>{product.dimensions}</dd>
              </div>
            ) : null}
            {product.material ? (
              <div>
                <dt className="sr-only">Material</dt>
                <dd>{product.material}</dd>
              </div>
            ) : null}
            {product.lead_time_weeks !== null ? (
              <div>
                <dt className="sr-only">Lead time</dt>
                <dd>Lead time: {product.lead_time_weeks} weeks</dd>
              </div>
            ) : null}
          </dl>

          <p className="t-body text-ink-primary max-w-[60ch]">
            {product.description}
          </p>

          <ProductActions
            productSlug={product.slug}
            productId={product.id}
            productName={product.name}
          />
        </div>
      </section>

      <section
        id="pdp-context"
        aria-label="Contextual photos"
        className="px-4 pb-20 md:px-12"
      >
        {/* TODO: replace with multi-shot images per SKU once a `images: string[]` field exists on Product. For v1, the same hero image renders three times. */}
        <ul className="mx-auto grid max-w-[1120px] grid-cols-1 gap-6 md:grid-cols-3">
          {([0, 1, 2] as const).map(index => (
            <li key={index} className="relative aspect-square w-full overflow-hidden rounded-md md:rounded-none">
              <Image
                src={product.image_url}
                alt={`${product.name} contextual photograph ${index + 1}`}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
