export type Locale = 'ka' | 'en'

export function localeFromPath(pathname: string): Locale {
  return /^\/en(?=\/|[?#]|$)/.test(pathname) ? 'en' : 'ka'
}

export function stripLocale(pathname: string): string {
  if (localeFromPath(pathname) !== 'en') return pathname
  const remainder = pathname.slice(3)
  return remainder.startsWith('/') ? remainder : `/${remainder}`
}

export function localePath(pathname: string, locale: Locale): string {
  const base = stripLocale(pathname || '/')
  return locale === 'en' ? `/en${base.startsWith('/') ? base : `/${base}`}` : base
}
