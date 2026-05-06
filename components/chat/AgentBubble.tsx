import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

export interface AgentBubbleProps {
  /** Markdown source text (renders via ReactMarkdown). */
  text?: string
  /** Raw JSX for non-text content (e.g. "thinking…" indicator). */
  children?: ReactNode
}

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-0.5">{children}</li>,
}

/** Standard text bubble for assistant messages. Pass `text` for markdown, `children` for raw JSX. */
export function AgentBubble({ text, children }: AgentBubbleProps) {
  return (
    <div className="bg-surface-secondary text-ink-primary t-body border-l-accent-cool max-w-[80%] rounded-md border-l-2 px-4 py-3">
      {text ? (
        <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
      ) : (
        children
      )}
    </div>
  )
}
