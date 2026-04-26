'use client'

import { useCallback, useRef, useState } from 'react'

import { CostPanel } from '@/components/CostPanel'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatInputForm } from '@/components/chat/ChatInputForm'
import { EmptyState } from '@/components/chat/EmptyState'
import { MessageList } from '@/components/chat/MessageList'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useChatSession } from '@/hooks/useChatSession'
import { useDialogFocus } from '@/hooks/useDialogFocus'
import { useEscClose } from '@/hooks/useEscClose'
import { useFocusOnOpen } from '@/hooks/useFocusOnOpen'
import { useOpenChatRequest } from '@/hooks/useOpenChatRequest'
import { cn } from '@/lib/cn'

export interface ChatModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Linden chat modal — composes the chat session hook with layout, the input
 * form, and the cross-component "open with this product" event. Stays mounted
 * across open/close so chat history persists within the session; visibility
 * is toggled via `hidden`.
 */
export function ChatModal({ open, onClose }: ChatModalProps) {
  const { messages, isStreaming, turns, pulse, sendText } = useChatSession()
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEscClose(onClose, open)
  useBodyScrollLock(open)
  useFocusOnOpen(inputRef, open)
  useDialogFocus(dialogRef, open)

  const handleSendText = useCallback(
    (text: string) => {
      sendText(text)
      setInput('')
    },
    [sendText],
  )

  const handleSendCurrent = useCallback(() => {
    handleSendText(input)
  }, [handleSendText, input])

  useOpenChatRequest({
    inputRef,
    onSendText: handleSendText,
    onPrefill: setInput,
  })

  const hasMessages = messages.length > 0

  return (
    <div
      id="linden-chat-modal"
      ref={dialogRef}
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
        <ChatHeader onClose={onClose} />

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8">
          {hasMessages ? (
            <MessageList messages={messages} isStreaming={isStreaming} pulse={pulse} />
          ) : (
            <EmptyState pulse={pulse} onPick={handleSendText} />
          )}
        </div>

        <CostPanel turns={turns} />

        <ChatInputForm
          ref={inputRef}
          value={input}
          isStreaming={isStreaming}
          onChange={setInput}
          onSubmit={handleSendCurrent}
        />
      </div>
    </div>
  )
}
