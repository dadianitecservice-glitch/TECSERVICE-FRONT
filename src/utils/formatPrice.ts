// Explicit grouping keeps the approved display identical across browser/Node ICU versions.
const priceFormatter = new Intl.NumberFormat('en-US', {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const formatPrice = (value: number) => priceFormatter.format(value)
