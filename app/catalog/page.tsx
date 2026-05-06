import type { Metadata } from 'next'
import { CategorySection } from '@/components/catalog/CategorySection'
import { getAllProducts, type Product, type ProductCategory } from '@/lib/products'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Catalog',
  description:
    'The full Linden catalog — twelve pieces today, fewer than fifty on purpose. Mid-century × japandi.',
}

const CATEGORY_ORDER: readonly ProductCategory[] = [
  'living',
  'bedroom',
  'dining',
  'workspace',
] as const

export default async function CatalogPage() {
  const products = await getAllProducts()
  const grouped = groupByCategory(products)

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <header className="mb-16 flex flex-col gap-3 md:mb-20">
        <p className="t-micro text-ink-tertiary">Catalog</p>
        <h1 className="t-hero text-ink-primary">
          Twelve pieces, on purpose.
        </h1>
        <p className="t-body text-ink-secondary max-w-[640px]">
          Mid-century lines, japandi restraint. Every piece earns its place by
          fitting a real room — not by filling a category slot.
        </p>
      </header>

      <div className="flex flex-col gap-20">
        {CATEGORY_ORDER.map((category) => (
          <CategorySection
            key={category}
            category={category}
            products={grouped[category]}
          />
        ))}
      </div>
    </div>
  )
}

function groupByCategory(products: Product[]): Record<ProductCategory, Product[]> {
  const empty: Record<ProductCategory, Product[]> = {
    living: [],
    bedroom: [],
    dining: [],
    workspace: [],
  }
  return products.reduce((acc, product) => {
    acc[product.category].push(product)
    return acc
  }, empty)
}
