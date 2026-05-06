import type { ReactNode } from 'react'
import { isToolUIPart, type UIMessage } from 'ai'

import { AgentBubble } from '@/components/chat/AgentBubble'
import { LeafAvatar } from '@/components/chat/LeafAvatar'
import { ToolOutput } from '@/components/chat/ToolOutput'
import { extractText } from '@/lib/ai/chat-output-adapters'

const ASSISTANT_AVATAR_SIZE_PX = 24
const TOOL_PART_PREFIX = 'tool-'

export interface MessageRowProps {
  message: UIMessage
  pulse: boolean
}

/** Render a single chat message: user bubble, assistant column, or nothing. */
export function MessageRow({ message, pulse }: MessageRowProps) {
  if (message.role === 'user') return <UserBubble message={message} />
  if (message.role !== 'assistant') return null

  const renderedParts = renderAssistantParts(message.parts)
  if (renderedParts.length === 0) return null

  return (
    <div className="flex items-start gap-2">
      <LeafAvatar size={ASSISTANT_AVATAR_SIZE_PX} pulse={pulse} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">{renderedParts}</div>
    </div>
  )
}

function UserBubble({ message }: { message: UIMessage }) {
  return (
    <div className="flex justify-end">
      <div className="bg-surface-primary text-ink-primary t-body max-w-[80%] rounded-md px-4 py-3">
        {extractText(message.parts)}
      </div>
    </div>
  )
}

function renderAssistantParts(parts: UIMessage['parts']): ReactNode[] {
  return parts.flatMap((part, index) => renderPart(part, `part-${index}`))
}

function renderPart(part: UIMessage['parts'][number], key: string): ReactNode[] {
  if (part.type === 'text') {
    const text = part.text.trim()
    if (text.length === 0) return []
    return [<AgentBubble key={key} text={text} />]
  }

  if (!isToolUIPart(part)) return []

  const toolName = part.type.slice(TOOL_PART_PREFIX.length)
  if (part.state !== 'output-available') {
    return [
      <AgentBubble key={key}>
        <span className="text-ink-tertiary t-small italic">Linden is thinking…</span>
      </AgentBubble>,
    ]
  }

  return [<ToolOutput key={key} toolName={toolName} output={part.output as unknown} />]
}
