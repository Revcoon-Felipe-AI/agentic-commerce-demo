import type { ComponentType } from 'react'

import { CompareTable } from '@/components/CompareTable'
import { ProductCardInline } from '@/components/ProductCardInline'
import { AgentBubble } from '@/components/chat/AgentBubble'
import {
  extractCompareProducts,
  extractFaqMatches,
  extractInlineProducts,
  safeStringify,
  type FaqMatch,
  type InlineProductLike,
} from '@/lib/ai/chat-output-adapters'

const MAX_INLINE_CARDS = 3

interface ToolRendererProps {
  output: unknown
}

type ToolRenderer = ComponentType<ToolRendererProps>

/** Maps a tool name to the React component that renders its output. */
const TOOL_RENDERERS: Readonly<Record<string, ToolRenderer>> = {
  add_to_cart: AddToCartConfirmation,
  query_faq: QueryFaqMatches,
  compare_products: CompareProductsResult,
  search_products: RecommendProducts,
  get_promotions: RecommendProducts,
  get_product_details: RecommendProducts,
}

export interface ToolOutputProps {
  toolName: string
  output: unknown
}

/**
 * Render a tool result by routing on `toolName`. Unknown tools fall through
 * to a collapsible debug `<details>` so nothing is silently dropped.
 */
export function ToolOutput({ toolName, output }: ToolOutputProps) {
  const Renderer = TOOL_RENDERERS[toolName]
  if (Renderer) return <Renderer output={output} />
  return <DebugFallback toolName={toolName} output={output} />
}

function AddToCartConfirmation() {
  return (
    <AgentBubble>
      <span className="t-small italic">Good choice — added to your bag.</span>
    </AgentBubble>
  )
}

function QueryFaqMatches({ output }: ToolRendererProps) {
  const matches = extractFaqMatches(output)
  if (matches.length === 0) return null
  return (
    <div className="bg-surface-secondary border-l-accent-cool border-l-2 px-3 py-2 text-left">
      <p className="t-micro text-ink-tertiary mb-1">Linden notes</p>
      <ul className="flex flex-col gap-1">
        {matches.map((match, idx) => (
          <FaqRow key={`faq-${idx}`} match={match} />
        ))}
      </ul>
    </div>
  )
}

function FaqRow({ match }: { match: FaqMatch }) {
  return (
    <li className="t-small text-ink-secondary italic">
      {match.title ? <strong className="not-italic">{match.title}: </strong> : null}
      {match.content?.trim()}
    </li>
  )
}

function CompareProductsResult({ output }: ToolRendererProps) {
  const products = extractCompareProducts(output)
  if (products.length === 0) return null
  return <CompareTable products={products} />
}

function RecommendProducts({ output }: ToolRendererProps) {
  const products = extractInlineProducts(output)
  if (products.length === 0) return null

  const sliced = products.slice(0, MAX_INLINE_CARDS)
  const overflow = products.length - sliced.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 overflow-x-auto pb-1">
        {sliced.map((product) => (
          <InlineCard key={product.slug} product={product} />
        ))}
      </div>
      {overflow > 0 ? (
        <p className="t-small text-ink-tertiary italic">
          Showing {MAX_INLINE_CARDS} of {products.length}. Want me to narrow further?
        </p>
      ) : null}
    </div>
  )
}

function InlineCard({ product }: { product: InlineProductLike }) {
  return (
    <ProductCardInline
      slug={product.slug}
      name={product.name}
      price_usd={product.price_usd}
      image_url={product.image_url}
      {...(product.category ? { category: product.category } : {})}
    />
  )
}

function DebugFallback({ toolName, output }: { toolName: string; output: unknown }) {
  return (
    <details className="bg-surface-secondary rounded-md px-3 py-2">
      <summary className="t-micro text-ink-tertiary cursor-pointer">
        tool result · {toolName}
      </summary>
      <pre className="t-mono text-ink-secondary mt-2 overflow-x-auto text-xs">
        {safeStringify(output)}
      </pre>
    </details>
  )
}
