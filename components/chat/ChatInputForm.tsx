'use client'

import { forwardRef, type FormEvent, type KeyboardEvent } from 'react'

export interface ChatInputFormProps {
  value: string
  isStreaming: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

/**
 * Bottom-of-modal text input + send button. Submit fires on form submit and
 * on Enter (without Shift). Disabled while a stream is in flight or empty.
 */
export const ChatInputForm = forwardRef<HTMLInputElement, ChatInputFormProps>(
  function ChatInputForm({ value, isStreaming, onChange, onSubmit }, ref) {
    const isSendDisabled = isStreaming || value.trim().length === 0

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault()
      onSubmit()
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onSubmit()
      }
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="border-divider border-t px-4 py-4 md:px-8"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
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
            disabled={isSendDisabled}
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
    )
  },
)
