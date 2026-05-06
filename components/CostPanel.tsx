'use client'

import { useState } from 'react'
import type { Turn } from '@/lib/ai/telemetry'

export interface CostPanelProps {
  turns: Turn[]
}

const usdMicroFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 6,
})

/**
 * Telemetry strip rendered between the message list and the chat input.
 * Default collapsed; an expand toggle reveals per-session cost, model
 * breakdown, and average latency. The panel is intentionally low-key —
 * Linden does not advertise the medium (BRAND-IDENTITY §9.3 "no Powered by AI").
 */
export function CostPanel({ turns }: CostPanelProps) {
  const [expanded, setExpanded] = useState(false)

  const totalCost = turns.reduce((sum, turn) => sum + turn.costUSD, 0)
  // Cost USD requires a server-emitted streaming meta event we haven't wired
  // yet — hide the column when every recorded turn is $0 to avoid showing a
  // misleading "$0.0000" total. Server logs still capture real cost per turn.
  const showCost = turns.length > 0 && turns.some((turn) => turn.costUSD > 0)

  const avgLatency =
    turns.length === 0
      ? 0
      : turns.reduce((sum, turn) => sum + turn.latencyMs, 0) / turns.length

  const breakdown = aggregateModels(turns)

  return (
    <section className="bg-surface-secondary border-divider border-t border-b px-4 py-2 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <p className="t-micro text-ink-tertiary">
          Telemetry · {turns.length} {turns.length === 1 ? 'turn' : 'turns'}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="t-small text-ink-secondary inline-flex items-center gap-1"
          aria-expanded={expanded}
          aria-controls="telemetry-panel"
        >
          <span>{expanded ? 'Hide' : 'Show'}</span>
          <span aria-hidden="true">{expanded ? '⌄' : '⌃'}</span>
        </button>
      </div>

      {expanded ? (
        <dl
          id="telemetry-panel"
          className="t-small text-ink-secondary mt-2 grid grid-cols-2 gap-y-1 md:grid-cols-3"
        >
          {showCost ? (
            <div>
              <dt className="t-micro text-ink-tertiary">Cost (session)</dt>
              <dd className="t-mono text-ink-primary">
                {usdMicroFormatter.format(totalCost)}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="t-micro text-ink-tertiary">Avg latency</dt>
            <dd className="t-mono text-ink-primary">
              {turns.length === 0 ? '—' : `${Math.round(avgLatency)} ms`}
            </dd>
          </div>
          <div className={showCost ? 'col-span-2 md:col-span-1' : 'col-span-2'}>
            <dt className="t-micro text-ink-tertiary">Models</dt>
            <dd className="t-mono text-ink-primary">
              {breakdown.length === 0
                ? '—'
                : breakdown
                    .map(({ model, count }) => `${count}× ${shortModel(model)}`)
                    .join(', ')}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}

function aggregateModels(turns: Turn[]): Array<{ model: string; count: number }> {
  const map = new Map<string, number>()
  for (const turn of turns) {
    map.set(turn.model, (map.get(turn.model) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([model, count]) => ({ model, count }))
}

function shortModel(modelId: string): string {
  if (modelId.startsWith('deepseek-')) return 'deepseek'
  return modelId.replace(/^gemini-2\.5-/, '')
}
