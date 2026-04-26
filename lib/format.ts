const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** USD with no decimals — furniture is priced in whole dollars. */
export function formatUSD(value: number): string {
  return usdFormatter.format(value)
}
