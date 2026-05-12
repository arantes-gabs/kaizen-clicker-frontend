const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1_000_000) {
    return `${NUMBER_FORMATTER.format(value / 1_000_000)}M`
  }

  if (absoluteValue >= 1_000) {
    return `${NUMBER_FORMATTER.format(value / 1_000)}K`
  }

  return NUMBER_FORMATTER.format(value)
}

export function formatRate(value: number): string {
  return `${formatNumber(value)}/sec`
}
