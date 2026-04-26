'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { UIMessage } from 'ai'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'

import { addToCart } from '@/lib/cart'
import type { Turn } from '@/lib/ai/telemetry'
import { useChatPersistence } from '@/hooks/useChatPersistence'

const PULSE_DURATION_MS = 240
const CHAT_API_PATH = '/api/chat'
const CART_TOOL_NAME = 'add_to_cart'
const PLACEHOLDER_MODEL = 'gemini-2.5-flash-lite'

type ChatTransport = ConstructorParameters<typeof DefaultChatTransport>[0]

type AddToCartInput = { product_id?: unknown; qty?: unknown }

export interface ChatSession {
  messages: UIMessage[]
  status: ReturnType<typeof useChat>['status']
  isStreaming: boolean
  turns: Turn[]
  pulse: boolean
  sendText: (text: string) => void
  triggerPulse: () => void
}

/**
 * Owns the chat lifecycle: AI SDK transport, useChat wiring, the cart-side
 * effect of the `add_to_cart` tool, per-turn telemetry, and sessionStorage
 * persistence. The modal becomes a layout-only component once it consumes
 * this hook.
 */
export function useChatSession(): ChatSession {
  const [turns, setTurns] = useState<Turn[]>([])
  const [pulse, setPulse] = useState(false)
  const hasPulsedRef = useRef(false)
  const lastTurnStartRef = useRef<number | null>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: CHAT_API_PATH } satisfies ChatTransport),
    [],
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName !== CART_TOOL_NAME) return
      const parsed = parseAddToCartInput(toolCall.input)
      if (parsed) addToCart(parsed.productId, parsed.qty)
    },
    onFinish: () => {
      const start = lastTurnStartRef.current
      const latencyMs = start ? Date.now() - start : 0
      lastTurnStartRef.current = null
      setTurns((previous) => [...previous, buildPlaceholderTurn(latencyMs)])
    },
  })

  useChatPersistence({ messages, setMessages })

  const triggerPulse = useCallback(() => {
    if (hasPulsedRef.current) return
    hasPulsedRef.current = true
    setPulse(true)
    window.setTimeout(() => setPulse(false), PULSE_DURATION_MS)
  }, [])

  const sendText = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      triggerPulse()
      lastTurnStartRef.current = Date.now()
      void sendMessage({ text: trimmed })
    },
    [sendMessage, triggerPulse],
  )

  const isStreaming = status === 'streaming' || status === 'submitted'

  return { messages, status, isStreaming, turns, pulse, sendText, triggerPulse }
}

function parseAddToCartInput(
  raw: unknown,
): { productId: string; qty: number } | null {
  if (raw === null || typeof raw !== 'object') return null
  const input = raw as AddToCartInput

  const productId =
    typeof input.product_id === 'string' && input.product_id.length > 0
      ? input.product_id
      : null
  if (!productId) return null

  const qty =
    typeof input.qty === 'number' && Number.isFinite(input.qty) && input.qty > 0
      ? Math.floor(input.qty)
      : 1

  return { productId, qty }
}

function buildPlaceholderTurn(latencyMs: number): Turn {
  // Token counts and cost USD will be populated when the route emits a
  // `data-cost` UI message part (tracked separately). For now we ship a
  // measured-latency turn so CostPanel can render real-time activity.
  return {
    timestamp: Date.now(),
    model: PLACEHOLDER_MODEL,
    reason: 'measured client-side',
    inputTokens: 0,
    outputTokens: 0,
    costUSD: 0,
    latencyMs,
    tools: [],
  }
}
