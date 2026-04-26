import type { ReactNode } from 'react'

export interface AgentBubbleProps {
  children: ReactNode
}

/** Standard text bubble used for every assistant text part. */
export function AgentBubble({ children }: AgentBubbleProps) {
  return (
    <div className="bg-surface-secondary text-ink-primary t-body border-l-accent-cool max-w-[80%] rounded-md border-l-2 px-4 py-3">
      {children}
    </div>
  )
}
