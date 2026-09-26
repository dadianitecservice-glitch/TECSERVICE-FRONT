export function accountDate(value: string, locale: 'ka' | 'en', withTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const parts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Tbilisi' }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? ''
  const months = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ']
  const display = locale === 'ka'
    ? `${part('day')} ${months[Number(part('month')) - 1]} ${part('year')}`
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Tbilisi' }).format(date)
  if (!withTime) return display
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Tbilisi' }).format(date)
  return `${display} · ${time}`
}

/** Compact receipt-style date, always in the service centre's local timezone. */
export function accountDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const parts = new Intl.DateTimeFormat('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Tbilisi',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? ''
  return `${part('month')}/${part('day')}/${part('year')} ${part('hour')}:${part('minute')}`
}

export function accountMoney(value: number | null | undefined, locale: 'ka' | 'en') {
  if (value == null || !Number.isFinite(value)) return '—'
  const amount = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 }).format(value)
  return locale === 'ka' ? `${amount.replaceAll(',', '\u00a0')}\u00a0₾` : `GEL ${amount}`
}
