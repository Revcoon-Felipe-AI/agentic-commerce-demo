import { X } from 'lucide-react'

const CLOSE_ICON_SIZE_PX = 20

export interface ChatHeaderProps {
  onClose: () => void
}

/** Modal header — brand label on the left, close button on the right. */
export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <header className="border-divider flex h-14 items-center justify-between border-b px-4 md:px-8">
      <p className="t-micro text-ink-secondary">LINDEN</p>
      <button
        type="button"
        onClick={onClose}
        className="text-ink-primary -m-1 p-1"
        aria-label="Close chat"
      >
        <X size={CLOSE_ICON_SIZE_PX} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </header>
  )
}
