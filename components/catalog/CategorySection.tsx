import { CatalogProductCard } from '@/components/catalog/CatalogProductCard'
import { CATEGORY_LABELS, type Product, type ProductCategory } from '@/lib/products'

interface CategorySectionProps {
  category: ProductCategory
  products: Product[]
}

/**
 * One section of the catalog: category headline + grid of product cards.
 * Renders nothing if the category has no pieces — keeps the page tidy when
 * the catalog is partial.
 */
export function CategorySection({ category, products }: CategorySectionProps) {
  if (products.length === 0) return null

  return (
    <section
      aria-labelledby={`catalog-${category}`}
      className="flex flex-col gap-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={`catalog-${category}`} className="t-display text-ink-primary">
          {CATEGORY_LABELS[category]}
        </h2>
        <p className="t-mono text-ink-tertiary">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <CatalogProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
