export type Turn = {
  timestamp: number
  model: string
  reason: string
  inputTokens: number
  outputTokens: number
  costUSD: number
  latencyMs: number
  tools: string[]
}

/**
 * Browser-side per-session record of every chat turn — model, cost, latency, tools.
 * Wave 4 wraps this in a React Context so the CostPanel can render live aggregates.
 * Not persisted: when the tab closes, the history goes with it.
 */
export class TelemetryStore {
  turns: Turn[] = []

  /** Append a finished turn. Order preserved; never mutates existing entries. */
  record(turn: Turn): void {
    this.turns.push(turn)
  }

  /** Sum of every turn's cost so far, in USD. */
  totalCost(): number {
    return this.turns.reduce((sum, turn) => sum + turn.costUSD, 0)
  }

  /** How many turns were served by each model — useful for the routing pie chart. */
  modelBreakdown(): Array<{ model: string; count: number }> {
    const map = new Map<string, number>()
    this.turns.forEach((turn) => map.set(turn.model, (map.get(turn.model) ?? 0) + 1))
    return Array.from(map.entries()).map(([model, count]) => ({ model, count }))
  }

  /** Mean response time across all turns. Returns 0 when no turns have been recorded. */
  avgLatency(): number {
    if (this.turns.length === 0) return 0
    return this.turns.reduce((sum, turn) => sum + turn.latencyMs, 0) / this.turns.length
  }
}
