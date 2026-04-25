'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import {
  DefaultChatTransport,
  isToolUIPart,
  type UIMessage,
  type UIMessagePart,
} from 'ai'
import { useChat } from '@ai-sdk/react'
import { X } from 'lucide-react'

import { CompareTable, type CompareTableProduct } from '@/components/CompareTable'
import { CostPanel } from '@/components/CostPanel'
import { ProductCardInline } from '@/components/ProductCardInline'
import { addToCart } from '@/lib/cart'
import type { Turn } from '@/lib/ai/telemetry'
import type { Product, ProductCategory } from '@/lib/products'
import { cn } from '@/lib/utils'

interface ChatModalProps {
  open: boolean
  onClose: () => void
}

const SUGGESTED_PROMPTS = ['Living room', 'Bedroom', "I'm not sure yet"] as const
const MAX_INLINE_CARDS = 3
const PULSE_DURATION_MS = 240
const OPEN_CHAT_EVENT = 'linden:open-chat'
// sessionStorage key — sessionStorage (not localStorage) intentionally: chat
// resets when the customer closes the tab, never carries across visits.
const STORAGE_KEY = 'linden_chat_v1'

type OpenChatDetail = {
  productSlug?: string
  productName?: string
  /** When true, the pre-filled input is sent immediately instead of waiting for the user to press Enter. */
  autoSend?: boolean
}

type FaqMatch = {
  title?: string | null
  content?: string | null
  similarity?: number | null
}

type ChatTransport = ConstructorParameters<typeof DefaultChatTransport>[0]

/**
 * Linden chat modal — wires `useChat` (AI SDK v6) to /api/chat, intercepts
 * `add_to_cart` tool calls to mutate the browser cart, and renders inline
 * product cards / comparison tables / FAQ excerpts based on typed tool parts.
 *
 * The modal stays mounted across open/close so the chat hook keeps history
 * within the session. Visibility is toggled via `hidden`.
 */
export function ChatModal({ open, onClose }: ChatModalProps) {
  const [turns, setTurns] = useState<Turn[]>([])
  const hasPulsedRef = useRef(false)
  const [pulse, setPulse] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat' } satisfies ChatTransport),
    [],
  )

  // Track when the most recent turn started so we can record real
  // client-side latency when the response finishes.
  const lastTurnStartRef = useRef<number | null>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName !== 'add_to_cart') return
      const input = toolCall.input as { product_id?: unknown; qty?: unknown } | undefined
      const productId =
        typeof input?.product_id === 'string' && input.product_id.length > 0
          ? input.product_id
          : null
      if (!productId) return
      const qty =
        typeof input?.qty === 'number' && Number.isFinite(input.qty) && input.qty > 0
          ? Math.floor(input.qty)
          : 1
      addToCart(productId, qty)
    },
    onFinish: () => {
      // Latency is measured client-side (submit -> finish). Token counts and
      // cost USD require a streaming meta event from the route — tracked in
      // server logs for now (see app/api/chat/route.ts onFinish handler).
      // TODO(year-1): emit `data-cost` UI message part from the route and
      // consume here via `onData` to populate inputTokens/outputTokens/costUSD.
      const start = lastTurnStartRef.current
      const latencyMs = start ? Date.now() - start : 0
      lastTurnStartRef.current = null

      setTurns((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          model: 'gemini-2.5-flash-lite',
          reason: 'measured client-side',
          inputTokens: 0,
          outputTokens: 0,
          costUSD: 0,
          latencyMs,
          tools: [],
        },
      ])
    },
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  const hasMessages = messages.length > 0

  const triggerPulse = useCallback(() => {
    if (hasPulsedRef.current) return
    hasPulsedRef.current = true
    setPulse(true)
    window.setTimeout(() => setPulse(false), PULSE_DURATION_MS)
  }, [])

  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      triggerPulse()
      lastTurnStartRef.current = Date.now()
      void sendMessage({ text: trimmed })
      setInput('')
    },
    [sendMessage, triggerPulse],
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      submitText(input)
    },
    [input, submitText],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        submitText(input)
      }
    },
    [input, submitText],
  )

  // Listen for cross-component open requests from the PDP "Talk to Linden
  // about this" button. Auto-sends when detail.autoSend is true (default for
  // PDP); otherwise pre-fills the input so the customer can review and send.
  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<OpenChatDetail>).detail ?? {}
      const slug = detail.productSlug?.trim()
      const name = detail.productName?.trim()
      const subject = name && name.length > 0 ? name : slug
      if (subject && subject.length > 0) {
        const text = `Tell me about the ${subject}.`
        if (detail.autoSend) {
          submitText(text)
        } else {
          setInput(text)
        }
      }
      window.requestAnimationFrame(() => inputRef.current?.focus())
    }
    window.addEventListener(OPEN_CHAT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen)
  }, [submitText])

  useEffect(() => {
    if (!open) return
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, open])

  // ESC closes the modal — universal keyboard convention for dialogs.
  useEffect(() => {
    if (!open) return
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Body scroll lock — mobile only. On desktop the modal is a 640px right
  // drawer and the page beside it remains useful (scrolling the PDP while
  // chatting about it is the expected interaction). Locking on desktop made
  // the page feel broken when the chat covered most of the viewport.
  useEffect(() => {
    if (!open) return
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Hydrate previously-saved chat history (sessionStorage) on first mount,
  // and persist on every messages change. The chat survives navigation
  // between PDP / cart / home but resets at end of session (closed tab).
  const hydratedRef = useRef(false)
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as UIMessage[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed)
      }
    } catch {
      // Corrupt JSON or storage unavailable — silently start clean.
    }
  }, [setMessages])

  useEffect(() => {
    if (!hydratedRef.current) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Quota exceeded or storage unavailable — drop persistence silently.
    }
  }, [messages])

  return (
    <div
      className={cn('fixed inset-0 z-50', !open && 'pointer-events-none hidden')}
      role="dialog"
      aria-modal="true"
      aria-label="Linden chat"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close chat"
        tabIndex={-1}
      />

      <div
        className="
          bg-surface-elevated absolute right-0 bottom-0 left-0
          flex h-[92vh] flex-col rounded-t-[16px]
          md:top-0 md:left-auto md:h-screen md:w-[640px]
          md:rounded-none
        "
      >
        <header className="border-divider flex h-14 items-center justify-between border-b px-4 md:px-8">
          <p className="t-micro text-ink-secondary">LINDEN</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-primary -m-1 p-1"
            aria-label="Close chat"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
          {!hasMessages ? (
            <EmptyState
              pulse={pulse}
              onPick={(text) => submitText(text)}
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {messages.map((message) => (
                <li key={message.id}>
                  <MessageRow message={message} pulse={pulse} />
                </li>
              ))}
              {isStreaming ? (
                <li>
                  <TypingIndicator />
                </li>
              ) : null}
              <li>
                <div ref={messagesEndRef} aria-hidden="true" />
              </li>
            </ul>
          )}
        </div>

        <CostPanel turns={turns} />

        <form
          onSubmit={handleSubmit}
          className="border-divider border-t px-4 py-4 md:px-8"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isStreaming}
              autoComplete="off"
              className="
                bg-surface-primary text-ink-primary placeholder:text-ink-tertiary t-body
                flex-1 rounded-md px-4 py-3
                outline-none disabled:cursor-not-allowed disabled:opacity-70
              "
            />
            <button
              type="submit"
              disabled={isStreaming || input.trim().length === 0}
              className="
                bg-ink-primary text-surface-primary
                flex h-11 w-11 shrink-0 items-center justify-center rounded-md
                disabled:cursor-not-allowed disabled:opacity-60
              "
              aria-label="Send"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  pulse: boolean
  onPick: (text: string) => void
}

function EmptyState({ pulse, onPick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <LeafAvatar size={32} pulse={pulse} />
      <p className="t-subhead text-ink-primary max-w-xs">
        Hi &mdash; what room are you working on?
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(label)}
            className="t-small text-ink-primary bg-surface-secondary hover:bg-divider rounded-sm px-3 py-2 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface MessageRowProps {
  message: UIMessage
  pulse: boolean
}

function MessageRow({ message, pulse }: MessageRowProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-surface-primary text-ink-primary t-body max-w-[80%] rounded-md px-4 py-3">
          {extractText(message.parts)}
        </div>
      </div>
    )
  }

  if (message.role !== 'assistant') return null

  const renderedParts = renderAssistantParts(message.parts)
  if (renderedParts.length === 0) return null

  return (
    <div className="flex items-start gap-2">
      <LeafAvatar size={24} pulse={pulse} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {renderedParts}
      </div>
    </div>
  )
}

function renderAssistantParts(
  parts: UIMessage['parts'],
): ReactNode[] {
  const rendered: ReactNode[] = []

  parts.forEach((part, index) => {
    const key = `part-${index}`

    if (part.type === 'text') {
      const text = part.text.trim()
      if (text.length === 0) return
      rendered.push(<AgentBubble key={key}>{text}</AgentBubble>)
      return
    }

    if (!isToolUIPart(part)) return

    const toolName = part.type.slice('tool-'.length)
    if (part.state !== 'output-available') {
      // Show a small thinking placeholder while the tool call is in flight,
      // but only for the customer-facing tools — debug tools are skipped.
      if (toolName === 'route_decision') return
      rendered.push(
        <AgentBubble key={key}>
          <span className="text-ink-tertiary t-small italic">
            Linden is thinking…
          </span>
        </AgentBubble>,
      )
      return
    }

    const output = part.output as unknown
    rendered.push(<ToolOutput key={key} toolName={toolName} output={output} />)
  })

  return rendered
}

interface ToolOutputProps {
  toolName: string
  output: unknown
}

function ToolOutput({ toolName, output }: ToolOutputProps) {
  if (toolName === 'add_to_cart') {
    return (
      <AgentBubble>
        <span className="t-small italic">Good choice — added to your bag.</span>
      </AgentBubble>
    )
  }

  if (toolName === 'route_decision') {
    // Internal/debug — never render in the conversation.
    return null
  }

  if (toolName === 'query_faq') {
    const matches = extractFaqMatches(output)
    if (matches.length === 0) return null
    return (
      <div className="bg-surface-secondary border-l-accent-cool border-l-2 px-3 py-2 text-left">
        <p className="t-micro text-ink-tertiary mb-1">Linden notes</p>
        <ul className="flex flex-col gap-1">
          {matches.map((match, idx) => (
            <li key={`faq-${idx}`} className="t-small text-ink-secondary italic">
              {match.title ? <strong className="not-italic">{match.title}: </strong> : null}
              {match.content?.trim()}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (toolName === 'compare_products') {
    const products = extractCompareProducts(output)
    if (products.length === 0) return null
    return <CompareTable products={products} />
  }

  if (
    toolName === 'search_products' ||
    toolName === 'get_promotions' ||
    toolName === 'get_product_details'
  ) {
    const products = extractInlineProducts(output)
    if (products.length === 0) return null

    const sliced = products.slice(0, MAX_INLINE_CARDS)
    const overflow = products.length - sliced.length

    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 overflow-x-auto pb-1">
          {sliced.map((product) => (
            <ProductCardInline
              key={product.slug}
              slug={product.slug}
              name={product.name}
              price_usd={product.price_usd}
              image_url={product.image_url}
              {...(product.category ? { category: product.category } : {})}
            />
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

function AgentBubble({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-surface-secondary text-ink-primary t-body border-l-accent-cool max-w-[80%] rounded-md border-l-2 px-4 py-3"
    >
      {children}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <LeafAvatar size={24} pulse={false} />
      <div className="bg-surface-secondary border-l-accent-cool flex max-w-[80%] items-center gap-1 rounded-md border-l-2 px-4 py-4">
        <span className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full" />
        <span
          className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full"
          style={{ animationDelay: '200ms' }}
        />
        <span
          className="bg-accent-warm linden-typing-dot block h-1.5 w-1.5 rounded-full"
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  )
}

interface LeafAvatarProps {
  size: number
  pulse: boolean
}

function LeafAvatar({ size, pulse }: LeafAvatarProps) {
  const circleSize = size + 8
  return (
    <span
      className={cn(
        'bg-surface-secondary inline-flex flex-shrink-0 items-center justify-center rounded-full',
        pulse && 'linden-pulse-once',
      )}
      style={{ width: circleSize, height: circleSize }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent-cool"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </svg>
    </span>
  )
}

function extractText(parts: UIMessage['parts']): string {
  return parts
    .filter((part): part is UIMessagePart<never, never> & { type: 'text'; text: string } =>
      part.type === 'text',
    )
    .map((part) => part.text)
    .join('')
    .trim()
}

type InlineProductLike = {
  slug: string
  name: string
  price_usd: number
  image_url: string
  category?: ProductCategory
}

function extractInlineProducts(output: unknown): InlineProductLike[] {
  if (output === null || typeof output !== 'object') return []

  const record = output as {
    products?: unknown
    rotating_out?: unknown
    found?: boolean
    product?: unknown
  }

  const candidates: unknown[] = Array.isArray(record.products)
    ? record.products
    : Array.isArray(record.rotating_out)
      ? record.rotating_out
      : record.found && record.product
        ? [record.product]
        : []

  const result: InlineProductLike[] = []
  for (const item of candidates) {
    if (item === null || typeof item !== 'object') continue
    const r = item as Partial<Product>
    if (
      typeof r.slug !== 'string' ||
      typeof r.name !== 'string' ||
      typeof r.image_url !== 'string' ||
      typeof r.price_usd !== 'number'
    ) {
      continue
    }
    const entry: InlineProductLike = {
      slug: r.slug,
      name: r.name,
      price_usd: r.price_usd,
      image_url: r.image_url,
    }
    if (
      r.category === 'living' ||
      r.category === 'bedroom' ||
      r.category === 'dining' ||
      r.category === 'workspace'
    ) {
      entry.category = r.category
    }
    result.push(entry)
  }
  return result
}

function extractCompareProducts(output: unknown): CompareTableProduct[] {
  if (output === null || typeof output !== 'object') return []
  const record = output as { products?: unknown }
  if (!Array.isArray(record.products)) return []

  const result: CompareTableProduct[] = []
  for (const item of record.products) {
    if (item === null || typeof item !== 'object') continue
    const r = item as Partial<Product>
    if (
      typeof r.slug !== 'string' ||
      typeof r.name !== 'string' ||
      typeof r.image_url !== 'string' ||
      typeof r.price_usd !== 'number'
    ) {
      continue
    }
    result.push({
      slug: r.slug,
      name: r.name,
      price_usd: r.price_usd,
      image_url: r.image_url,
      dimensions: typeof r.dimensions === 'string' ? r.dimensions : null,
      material: typeof r.material === 'string' ? r.material : null,
      lead_time_weeks:
        typeof r.lead_time_weeks === 'number' ? r.lead_time_weeks : null,
    })
  }
  return result
}

function extractFaqMatches(output: unknown): FaqMatch[] {
  if (output === null || typeof output !== 'object') return []
  const record = output as { matches?: unknown }
  if (!Array.isArray(record.matches)) return []

  const result: FaqMatch[] = []
  for (const item of record.matches) {
    if (item === null || typeof item !== 'object') continue
    const r = item as FaqMatch
    if (typeof r.content !== 'string' || r.content.trim().length === 0) continue
    result.push({
      content: r.content,
      title: typeof r.title === 'string' ? r.title : null,
      similarity: typeof r.similarity === 'number' ? r.similarity : null,
    })
  }
  return result
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
