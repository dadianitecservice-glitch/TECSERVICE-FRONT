/** Accept Georgian mobile numbers with a local or +995 prefix and common separators. */
export function normalizeGeorgianMobile(value: string): string | null {
  const compact = value.trim().replace(/[\s()-]/g, '')
  const match = compact.match(/^(?:\+?995)?(5\d{8})$/)
  return match ? `+995${match[1]}` : null
}

/** Distribute pasted/autofilled codes, while preserving normal single-digit editing. */
export function updateOtpDigits(current: string[], index: number, value: string) {
  const incoming = value.replace(/\D/g, '').slice(0, 6)
  const digits = [...current]
  if (!incoming) {
    if (!value) digits[index] = ''
    return { digits, focusIndex: index }
  }

  const start = incoming.length === 6 ? 0 : index
  for (let offset = 0; offset < incoming.length && start + offset < 6; offset += 1) {
    digits[start + offset] = incoming[offset]
  }
  return { digits, focusIndex: Math.min(start + incoming.length, 5) }
}
