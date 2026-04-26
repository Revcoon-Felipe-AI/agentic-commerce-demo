import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModelUsage,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { allTools } from '@/lib/ai/tools'
import { routeModel, type ModelChoice } from '@/lib/ai/model-router'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'

export const runtime = 'edge'
export const maxDuration = 30

const ChatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1, 'messages must contain at least one entry'),
})

type TurnTelemetry = {
  modelId: string
  reason: string
  inputTokens: number
  outputTokens: number
  costUSD: number
  latencyMs: number
}

function computeTurnCost(
  usage: LanguageModelUsage,
  route: ModelChoice,
): { inputTokens: number; outputTokens: number; costUSD: number } {
  const inputTokens = usage.inputTokens ?? 0
  const outputTokens = usage.outputTokens ?? 0
  const costUSD =
    (inputTokens / 1_000_000) * route.costPer1MInput +
    (outputTokens / 1_000_000) * route.costPer1MOutput
  return { inputTokens, outputTokens, costUSD }
}

function logTurnTelemetry(turn: TurnTelemetry): void {
  console.log(
    JSON.stringify({
      model: turn.modelId,
      reason: turn.reason,
      tokens: { inputTokens: turn.inputTokens, outputTokens: turn.outputTokens },
      cost_usd: turn.costUSD.toFixed(6),
      latency_ms: turn.latencyMs,
    }),
  )
}

export async function POST(req: Request): Promise<Response> {
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch (err) {
    console.warn('[/api/chat] invalid JSON body', { err })
    return Response.json({ error: 'INVALID_JSON' }, { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_BODY', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const messages = parsed.data.messages as UIMessage[]

  try {
    const route = routeModel()
    const startTime = Date.now()
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: route.model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: allTools,
      stopWhen: stepCountIs(5),
      onFinish: ({ usage }: { usage: LanguageModelUsage }) => {
        const { inputTokens, outputTokens, costUSD } = computeTurnCost(usage, route)
        logTurnTelemetry({
          modelId: route.modelId,
          reason: route.reason,
          inputTokens,
          outputTokens,
          costUSD,
          latencyMs: Date.now() - startTime,
        })
      },
    })

    return result.toUIMessageStreamResponse({
      headers: {
        'X-Model-Used': route.modelId,
        'X-Routing-Reason': route.reason,
      },
    })
  } catch (err) {
    console.error('[/api/chat] streamText failed', { err })
    return Response.json({ error: 'CHAT_UNAVAILABLE' }, { status: 503 })
  }
}
