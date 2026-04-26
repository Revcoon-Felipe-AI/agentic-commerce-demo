'use client'

import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'

import { MessageRow } from '@/components/chat/MessageRow'
import { TypingIndicator } from '@/components/chat/TypingIndicator'

export interface MessageListProps {
  messages: UIMessage[]
  isStreaming: boolean
  pulse: boolean
}

/**
 * Vertical list of chat messages with auto-scroll to the latest.
 * Renders the typing indicator at the tail while a stream is in flight.
 */
export function MessageList({ messages, isStreaming, pulse }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isStreaming])

  return (
    <ul
      className="flex flex-col gap-4"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Conversation with Linden"
    >
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
        <div ref={endRef} aria-hidden="true" />
      </li>
    </ul>
  )
}
