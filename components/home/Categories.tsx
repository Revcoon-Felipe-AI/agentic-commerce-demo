import { Reveal } from '@/components/Reveal'
import { CategoryTile } from '@/components/home/CategoryTile'
import type { ProductCategory } from '@/lib/products.types'

interface CategoryTileData {
  category: ProductCategory
  image: string
  alt: string
  /** Source of truth: docs/.brand-research/12-product-catalog.md. Hardcoded for the demo;
   * a future iteration can compute this from the products table at request time. */
  count: number
}

const CATEGORY_TILES: readonly CategoryTileData[] = [
  {
    category: 'living',
    image: '/lifestyle/cat-living.webp',
    alt: 'A lived-in living room with afternoon light, a low sofa and an open book on the coffee table.',
    count: 6,
  },
  {
    category: 'bedroom',
    image: '/lifestyle/cat-bedroom.webp',
    alt: 'A quiet bedroom with a low oak frame bed and a single bedside lamp.',
    count: 2,
  },
  {
    category: 'dining',
    image: '/lifestyle/cat-dining.webp',
    alt: 'A long oak dining table set for a slow weekend meal.',
    count: 2,
  },
  {
    category: 'workspace',
    image: '/lifestyle/cat-workspace.webp',
    alt: 'A clean oak desk against a north-facing window with a single notebook.',
    count: 2,
  },
] as const

export function Categories() {
  return (
    <Reveal>
      <section
        id="categories"
        aria-label="Product categories"
        className="bg-surface-primary px-4 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[1120px]">
          <p className="t-micro text-ink-tertiary mb-8 text-center">Catalog</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {CATEGORY_TILES.map(tile => (
              <li key={tile.category}>
                <CategoryTile
                  category={tile.category}
                  image={tile.image}
                  imageAlt={tile.alt}
                  pieceCount={tile.count}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  )
}
