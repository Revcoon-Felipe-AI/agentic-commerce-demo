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
        <tbody>
          <tr className="border-divider border-b">
            {products.map((product) => (
              <td
                key={`${product.slug}-image`}
                className="bg-surface-secondary p-2 align-top"
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
              </td>
            ))}
          </tr>
          <CompareRow
            products={products}
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
  label?: string
  renderCell: (product: CompareTableProduct) => React.ReactNode
}

function CompareRow({ products, label, renderCell }: CompareRowProps) {
  return (
    <tr className="border-divider border-b last:border-b-0">
      {products.map((product) => (
        <td key={`${product.slug}-${label ?? 'name'}`} className="px-3 py-2 align-top">
          {label ? (
            <p className="t-micro text-ink-tertiary mb-1">{label}</p>
          ) : null}
          {renderCell(product)}
        </td>
      ))}
    </tr>
  )
}
