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
const PLACEHOLDER_MODEL = 'deepseek-chat'

type ChatTransport = ConstructorParameters<typeof DefaultChatTransport>[0]

type AddToCartInput = { product_id?: unknown; qty?: unknown }

interface TurnCostData {
  model: string
  inputTokens: number
  outputTokens: number
  costUSD: number
}

function isTurnCostData(value: unknown): value is TurnCostData {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['model'] === 'string' &&
    typeof v['inputTokens'] === 'number' &&
    typeof v['outputTokens'] === 'number' &&
    typeof v['costUSD'] === 'number'
  )
}

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
  const pendingCostRef = useRef<TurnCostData | null>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: CHAT_API_PATH } satisfies ChatTransport),
    [],
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onData: (dataPart) => {
      if (dataPart.type !== 'data-turn-cost') return
      const cost = dataPart.data
      if (isTurnCostData(cost)) pendingCostRef.current = cost
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName !== CART_TOOL_NAME) return
      const parsed = parseAddToCartInput(toolCall.input)
      if (parsed) addToCart(parsed.productId, parsed.qty)
    },
    onFinish: () => {
      const start = lastTurnStartRef.current
      const latencyMs = start ? Date.now() - start : 0
      lastTurnStartRef.current = null
      const cost = pendingCostRef.current
      pendingCostRef.current = null
      setTurns((previous) => [...previous, buildTurn(latencyMs, cost)])
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

function buildTurn(latencyMs: number, cost: TurnCostData | null): Turn {
  return {
    timestamp: Date.now(),
    model: cost?.model ?? PLACEHOLDER_MODEL,
    reason: cost ? 'server' : 'measured client-side',
    inputTokens: cost?.inputTokens ?? 0,
    outputTokens: cost?.outputTokens ?? 0,
    costUSD: cost?.costUSD ?? 0,
    latencyMs,
    tools: [],
  }
}
