import { localePath, type Locale } from './locale.ts'

type Catalog = Record<string, string>
type CatalogPair = readonly [Catalog, Catalog]

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('ka-GE')
const english = new Map<string, string>()
const georgian = /[\u10a0-\u10ff\u1c90-\u1cbf]/
const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
type Fragment = { source: string; target: string; anchor?: string; pattern?: RegExp }
let fragments: Fragment[] = []
const fallbackCache = new Map<string, string>()
const fallbackCacheLimit = 500
let installed = false
let preparation: Promise<void> | undefined

/** The eager facade installs the paired catalogs once for both runtime consumers. */
export function installEnglishCatalogs(catalogs: readonly CatalogPair[]): void {
  if (installed) return
  for (const [ka, en] of catalogs) {
    for (const [id, source] of Object.entries(ka)) if (en[id]) english.set(normalize(source), en[id])
  }
  english.set('აირჩიეთ პრობლემა', 'Choose a problem')
  english.set('აირჩიეთ შესაბამისი ვარიანტი.', 'Select the option that matches your device.')
  english.set('საიტზე ავირჩიე', 'Selected on the website')
  english.set('მიუთითეთ', 'please specify')
  english.set('მოწყობილობის მოდელსა და ფოტოებს გამოგიგზავნით.', 'I will send you the device model and photos.')
  fragments = [...english]
    .sort(([a], [b]) => b.length - a.length)
    .map(([source, target]) => ({
      source, target,
      // A literal Georgian substring must occur before the full pattern can
      // match. Do not prefilter Latin/Greek text: Unicode /iu case folding has
      // extra equivalences (such as long s) that lowercased.includes misses.
      anchor: source.match(/[\u10d0-\u10fa]+/g)?.sort((a, b) => b.length - a.length)[0],
    }))
  fallbackCache.clear()
  installed = true
}

/** Georgian uses the source text; only English fetches and initializes catalogs. */
export function prepareTranslations(locale: Locale): Promise<void> {
  if (locale === 'ka' || installed) return Promise.resolve()
  preparation ??= import('./translate.ts').then(() => undefined).catch(error => {
    preparation = undefined
    throw error
  })
  return preparation
}

function rememberFallback(source: string, translated: string): string {
  if (fallbackCache.size >= fallbackCacheLimit) {
    const oldest = fallbackCache.keys().next().value
    if (oldest !== undefined) fallbackCache.delete(oldest)
  }
  fallbackCache.set(source, translated)
  return translated
}

export function translateText(value: string, locale: Locale): string {
  if (locale === 'ka' || !georgian.test(value) || !installed) return value
  const direct = english.get(normalize(value))
  if (direct) return direct
  const cached = fallbackCache.get(value)
  if (cached !== undefined) return cached
  if (/[\r\n]/.test(value)) return rememberFallback(value, value.split(/(\r?\n)/).map(line => /[\r\n]/.test(line) ? line : translateText(line, locale)).join(''))
  let text = value.replace(/\s+/g, ' ')
  // Dynamic amounts and times are not separate catalogue entries.
  text = text.replace(/(\d+(?:[.,]\d+)?)\s*₾-დან/g, 'from $1 ₾')
    .replace(/ღიაა (\d{1,2}:\d{2})-მდე/gi, 'Open until $1')
    .replace(/გაიხსნება დღეს (\d{1,2}:\d{2})-ზე/gi, 'Opens today at $1')
    .replace(/გაიხსნება ხვალ (\d{1,2}:\d{2})-ზე/gi, 'Opens tomorrow at $1')
    .replace(/გაიხსნება ორშაბათს (\d{1,2}:\d{2})-ზე/gi, 'Opens Monday at $1')
  if (!georgian.test(text)) return rememberFallback(value, text)
  let lowerText = text.toLocaleLowerCase('ka-GE')
  for (const fragment of fragments) {
    if (fragment.anchor && !lowerText.includes(fragment.anchor)) continue
    fragment.pattern ??= new RegExp(`(?<![\\p{L}])${escaped(fragment.source)}(?![\\p{L}])`, 'giu')
    // String.replace resets lastIndex for these shared global expressions.
    const translated = text.replace(fragment.pattern, () => fragment.target)
    if (translated !== text) {
      text = translated
      if (!georgian.test(text)) break
      lowerText = text.toLocaleLowerCase('ka-GE')
    }
  }
  return rememberFallback(value, text)
}

// Translate rendered text and arrays without changing React elements, IDs or user input.
export function translateValue<T>(value: T, locale: Locale): T {
  if (typeof value === 'string') return translateText(value, locale) as T
  if (Array.isArray(value)) return value.map(item => translateValue(item, locale)) as T
  return value
}

export function localizedHref(value: string | undefined, locale: Locale): string | undefined {
  if (!value) return value
  if (value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/assets/') && !value.startsWith('/api/')) return localePath(value, locale)
  if (locale === 'en' && value.startsWith('https://wa.me/')) {
    const url = new URL(value)
    const message = url.searchParams.get('text')
    if (message) url.searchParams.set('text', translateText(message, locale))
    return url.href
  }
  return value
}
