'use client'

import { X } from 'lucide-react'

interface ChatModalPlaceholderProps {
  open: boolean
  onClose: () => void
}

const SUGGESTED_PROMPTS = ['Living room', 'Bedroom', "I'm not sure yet"] as const

export function ChatModalPlaceholder({ open, onClose }: ChatModalPlaceholderProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Linden chat"
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
          absolute bottom-0 left-0 right-0 h-[92vh]
          bg-surface-elevated
          rounded-t-[16px]
          flex flex-col
          md:left-auto md:top-0 md:bottom-0 md:w-[640px] md:h-screen
          md:rounded-none
        "
      >
        <header className="flex items-center justify-between px-4 md:px-8 h-14 border-b border-divider">
          <p className="t-micro text-ink-secondary">LINDEN</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-primary p-1 -m-1"
            aria-label="Close chat"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 flex flex-col items-center justify-center gap-6 text-center">
          <LeafIcon className="w-8 h-8 text-accent-cool" />
          <p className="t-subhead text-ink-primary max-w-xs">
            Hi &mdash; what room are you working on?
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {SUGGESTED_PROMPTS.map(label => (
              <span
                key={label}
                className="t-small text-ink-primary bg-surface-secondary rounded-sm px-3 py-2 cursor-not-allowed select-none"
                aria-disabled="true"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-divider px-4 md:px-8 py-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              disabled
              className="
                flex-1 bg-surface-primary text-ink-primary placeholder:text-ink-tertiary
                rounded-md px-4 py-3 t-body
                disabled:cursor-not-allowed
                outline-none
              "
            />
            <button
              type="button"
              disabled
              className="
                shrink-0 w-11 h-11 rounded-md bg-ink-primary text-surface-primary
                flex items-center justify-center
                disabled:opacity-60 disabled:cursor-not-allowed
              "
              aria-label="Send"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}
