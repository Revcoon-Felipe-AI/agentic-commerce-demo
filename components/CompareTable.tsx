'use client'

import Image from 'next/image'
import { formatUSD } from '@/lib/format'

export interface CompareTableProduct {
  slug: string
  name: string
  price_usd: number
  dimensions: string | null
  material: string | null
  lead_time_weeks: number | null
  image_url: string
}

export interface CompareTableProps {
  products: CompareTableProduct[]
}

/**
 * Inline comparison table for the `compare_products` tool result.
 * 2-3 columns, compact layout. The agent's narration ranks the picks honestly
 * in the next text part — this table is purely the structured spec sheet.
 */
export function CompareTable({ products }: CompareTableProps) {
  if (products.length === 0) return null

  const colWidth = `${Math.floor(100 / products.length)}%`

  return (
    <div className="bg-surface-elevated border-divider overflow-hidden rounded-md border">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">
          Comparison of {products.length} Linden pieces
        </caption>
        <thead>
          <tr className="border-divider border-b">
            {products.map((product) => (
              <th
                key={`${product.slug}-image`}
                scope="col"
                className="bg-surface-secondary p-2 align-top font-normal"
                style={{ width: colWidth }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                <span className="sr-only">{product.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <CompareRow
            products={products}
            label="Name"
            renderCell={(p) => (
              <h4 className="t-headline text-ink-primary leading-tight">{p.name}</h4>
            )}
          />
          <CompareRow
            products={products}
            label="Price"
            renderCell={(p) => (
              <p className="t-mono text-ink-primary">{formatUSD(p.price_usd)}</p>
            )}
          />
          <CompareRow
            products={products}
            label="Dimensions"
            renderCell={(p) => (
              <p className="t-small text-ink-secondary">{p.dimensions ?? '—'}</p>
            )}
          />
          <CompareRow
            products={products}
            label="Material"
            renderCell={(p) => (
              <p className="t-small text-ink-secondary">{p.material ?? '—'}</p>
            )}
          />
          <CompareRow
            products={products}
            label="Lead time"
            renderCell={(p) => (
              <p className="t-small text-ink-secondary">
                {p.lead_time_weeks != null ? `${p.lead_time_weeks} weeks` : '—'}
              </p>
            )}
          />
        </tbody>
      </table>
    </div>
  )
}

interface CompareRowProps {
  products: CompareTableProduct[]
  /** Row label — rendered as a sr-only `<th scope="row">` per cell so screen readers can announce both axes. */
  label: string
  renderCell: (product: CompareTableProduct) => React.ReactNode
}

function CompareRow({ products, label, renderCell }: CompareRowProps) {
  const isNameRow = label === 'Name'
  return (
    <tr className="border-divider border-b last:border-b-0">
      {products.map((product) => (
        <td key={`${product.slug}-${label}`} className="px-3 py-2 align-top">
          <p className={isNameRow ? 'sr-only' : 't-micro text-ink-tertiary mb-1'}>
            {label}
          </p>
          {renderCell(product)}
        </td>
      ))}
    </tr>
  )
}
