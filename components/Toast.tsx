'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

const TOAST_AUTO_DISMISS_MS = 5000

interface ToastProps {
  message: string
  onClose: () => void
  /** Optional override of the 5s auto-dismiss. Set to 0 to disable. */
  autoDismissMs?: number
}

export function Toast({
  message,
  onClose,
  autoDismissMs = TOAST_AUTO_DISMISS_MS,
}: ToastProps) {
  useEffect(() => {
    if (autoDismissMs <= 0) return
    const timer = window.setTimeout(onClose, autoDismissMs)
    return () => window.clearTimeout(timer)
  }, [autoDismissMs, onClose])

  return (
    <div
      role="status"
      aria-live="polite"
      className="linden-toast bg-surface-elevated text-ink-primary border-divider fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-4 rounded-md border px-5 py-4 shadow-[0_8px_24px_rgba(42,39,34,0.16)] sm:right-6 sm:bottom-6 sm:max-w-[420px]"
    >
      <p className="t-body flex-1">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-ink-secondary hover:text-ink-primary -mr-1 -mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm transition-colors"
      >
        <X size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>

      <style>{`
        @keyframes linden-toast-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .linden-toast {
          animation: linden-toast-slide-up 200ms ease-out 1;
        }
        @media (prefers-reduced-motion: reduce) {
          .linden-toast { animation: none; }
        }
      `}</style>
    </div>
  )
}
