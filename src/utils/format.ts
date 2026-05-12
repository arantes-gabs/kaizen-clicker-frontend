const NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  const absoluteValue = Math.abs(value)

  if (absoluteValue >= 1_000_000) {
    return `${NUMBER_FORMATTER.format(value / 1_000_000)} mi`
  }

  if (absoluteValue >= 1_000) {
    return `${NUMBER_FORMATTER.format(value / 1_000)} mil`
  }

  return NUMBER_FORMATTER.format(value)
}

export function formatRate(value: number): string {
  return `${formatNumber(value)}/s`
}
