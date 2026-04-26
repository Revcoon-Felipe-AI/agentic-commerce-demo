import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type LanguageModelUsage,
  type UIMessage,
} from 'ai'
import { allTools } from '@/lib/ai/tools'
import { routeModel } from '@/lib/ai/model-router'
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt'

export const runtime = 'edge'
export const maxDuration = 30

type ChatRequestBody = {
  messages?: UIMessage[]
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as ChatRequestBody
  const messages = body.messages

  if (!messages || messages.length === 0) {
    return Response.json({ error: 'No messages' }, { status: 400 })
  }

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
      const latencyMs = Date.now() - startTime
      const inputTokens = usage.inputTokens ?? 0
      const outputTokens = usage.outputTokens ?? 0
      const costUSD =
        (inputTokens / 1_000_000) * route.costPer1MInput +
        (outputTokens / 1_000_000) * route.costPer1MOutput

      console.log(
        JSON.stringify({
          model: route.modelId,
          reason: route.reason,
          tokens: { inputTokens, outputTokens },
          cost_usd: costUSD.toFixed(6),
          latency_ms: latencyMs,
        }),
      )
    },
  })

  return result.toUIMessageStreamResponse({
    headers: {
      'X-Model-Used': route.modelId,
      'X-Routing-Reason': route.reason,
    },
  })
}
