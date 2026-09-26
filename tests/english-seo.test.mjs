import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getBlogPaths } from '../src/utils/routes.ts'

const origin = 'https://tecservice.ge'
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const servicePaths = [
  '/services/laptop-repair/',
  '/services/computer-repair/',
  '/services/data-recovery/',
  '/services/console-repair/',
  '/services/drone-repair/',
  '/services/mobile-tablet-repair/',
  '/services/other-electronics/',
]
const paths = ['/', ...servicePaths, '/contact/', '/about/']
const globalEntityIds = new Set([`${origin}/#business`, `${origin}/#website`])

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
    if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
  })
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(([, key, doubleQuoted, singleQuoted]) => [key.toLowerCase(), decodeEntities(doubleQuoted ?? singleQuoted)]))
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag))
}

function getMeta(html, key) {
  const matches = tags(html, 'meta').filter(meta => meta.name === key || meta.property === key)
  assert.equal(matches.length, 1, `Expected one ${key} meta tag`)
  return matches[0].content
}

function structuredData(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => attributes(attrs).type === 'application/ld+json')
  assert.equal(scripts.length, 1, 'Expected one JSON-LD document')
  const document = JSON.parse(scripts[0][2])
  assert.equal(document['@context'], 'https://schema.org')
  assert.ok(Array.isArray(document['@graph']))
  return document
}

function walkStrings(value, visit, key = '') {
  if (typeof value === 'string') visit(value, key)
  else if (Array.isArray(value)) value.forEach(item => walkStrings(item, visit, key))
  else if (value && typeof value === 'object') Object.entries(value).forEach(([name, item]) => walkStrings(item, visit, name))
}

const pages = await Promise.all(paths.map(async path => {
  const [ka, en] = await Promise.all(['ka', 'en'].map(async locale => {
    const localizedPath = `${locale === 'en' ? '/en' : ''}${path}`
    const html = await readFile(new URL(`../dist${localizedPath}index.html`, import.meta.url), 'utf8')
    return { locale, html, path: localizedPath, canonical: `${origin}${localizedPath}` }
  }))
  return { path, ka, en }
}))

for (const pair of pages) {
  test(`${pair.path} builds reciprocal English and Georgian metadata`, () => {
    for (const page of [pair.ka, pair.en]) {
      const { html, locale, canonical } = page
      assert.equal(tags(html, 'html')[0].lang, locale)
      const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)]
      assert.equal(titles.length, 1)
      const title = decodeEntities(titles[0][1])
      assert.ok(title.length > 15)
      assert.match(title, /TECSERVICE/)
      if (locale === 'en') assert.doesNotMatch(title, georgian)
      else assert.match(title, georgian)

      const description = getMeta(html, 'description')
      assert.ok(description.length > 30)
      if (locale === 'en') assert.doesNotMatch(description, georgian)
      assert.equal(getMeta(html, 'og:title'), title)
      assert.equal(getMeta(html, 'twitter:title'), title)
      assert.equal(getMeta(html, 'og:description'), description)
      assert.equal(getMeta(html, 'og:url'), canonical)
      assert.equal(getMeta(html, 'og:locale'), locale === 'en' ? 'en_GB' : 'ka_GE')
      assert.doesNotMatch(getMeta(html, 'robots'), /noindex/i)
      assert.deepEqual(tags(html, 'link').filter(link => link.rel === 'canonical').map(link => link.href), [canonical])

      const alternates = tags(html, 'link').filter(link => link.rel === 'alternate' && link.hreflang)
      assert.equal(alternates.length, 3)
      assert.deepEqual(Object.fromEntries(alternates.map(link => [link.hreflang, link.href])), {
        ka: pair.ka.canonical,
        en: pair.en.canonical,
        'x-default': pair.ka.canonical,
      })
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
      assert.doesNotMatch(html, /<div id="root"><\/div>/)
    }
  })

  test(`${pair.path} builds valid localized schema without changing business hours`, () => {
    for (const page of [pair.ka, pair.en]) {
      const document = structuredData(page.html)
      const graph = document['@graph']
      const webpageType = pair.path === '/contact/' ? 'ContactPage' : pair.path === '/about/' ? 'AboutPage' : 'WebPage'
      const webpage = graph.find(item => item['@type'] === webpageType)
      const website = graph.find(item => item['@type'] === 'WebSite')
      const business = graph.find(item => item['@type'] === 'LocalBusiness')
      assert.ok(webpage)
      assert.ok(website)
      assert.ok(business)
      assert.equal(webpage.url, page.canonical)
      assert.equal(webpage.inLanguage, page.locale)
      assert.equal(website.inLanguage, page.locale)
      assert.equal(business.telephone, '+995591474040')
      const saturday = business.openingHoursSpecification.find(hours => hours.dayOfWeek.includes('Saturday'))
      assert.equal(saturday.opens, '11:00')
      assert.equal(saturday.closes, '18:00')

      walkStrings(document, (value, key) => {
        if (page.locale === 'en') assert.doesNotMatch(value, georgian, `${page.path}: ${key}`)
        if (key === 'inLanguage') assert.equal(value, page.locale)
        if (!value.startsWith(`${origin}/`)) return
        const url = new URL(value)
        if (url.pathname.startsWith('/assets/') || globalEntityIds.has(value)) return
        assert.equal(url.pathname === '/en' || url.pathname.startsWith('/en/'), page.locale === 'en', value)
        assert.doesNotMatch(url.pathname, /^\/en\/en(?:\/|$)/)
      })
    }
  })

  test(`${pair.path} keeps internal navigation in the active language except explicit language switches`, () => {
    for (const page of [pair.ka, pair.en]) {
      const anchors = tags(page.html, 'a')
      assert.ok(anchors.some(anchor => anchor.hreflang === 'ka'))
      assert.ok(anchors.some(anchor => anchor.hreflang === 'en'))
      for (const anchor of anchors) {
        if (!anchor.href || /^(?:tel:|mailto:|javascript:)/i.test(anchor.href)) continue
        const url = new URL(anchor.href, page.canonical)
        if (url.origin !== origin || /^\/(?:assets|api)\//.test(url.pathname)) continue
        const expectedLocale = anchor.hreflang ?? page.locale
        assert.equal(url.pathname === '/en' || url.pathname.startsWith('/en/'), expectedLocale === 'en', `${page.path}: ${anchor.href}`)
        assert.doesNotMatch(url.pathname, /^\/en\/en(?:\/|$)/)
      }
    }
  })
}

test('English service schema preserves Georgian offer amounts, price types, and FAQ counts', () => {
  for (const pair of pages.filter(page => servicePaths.includes(page.path))) {
    const graphs = [pair.ka, pair.en].map(page => structuredData(page.html)['@graph'])
    const offers = graphs.map(graph => graph.find(item => item['@type'] === 'Service').hasOfferCatalog.itemListElement)
    assert.equal(offers[0].length, offers[1].length, pair.path)
    const priceDetails = offer => ({
      type: offer['@type'],
      price: offer.price,
      currency: offer.priceCurrency,
      minPrice: offer.priceSpecification?.minPrice,
      specificationCurrency: offer.priceSpecification?.priceCurrency,
    })
    assert.deepEqual(offers[1].map(priceDetails), offers[0].map(priceDetails), pair.path)
    const faqs = graphs.map(graph => graph.find(item => item['@type'] === 'FAQPage').mainEntity)
    assert.ok(faqs[0].length > 0)
    assert.equal(faqs[1].length, faqs[0].length, pair.path)
  }
})

test('all seven English service pages render translated WhatsApp drafts to the original phone', () => {
  for (const page of pages.filter(page => servicePaths.includes(page.path)).map(page => page.en)) {
    const whatsapp = tags(page.html, 'a').filter(anchor => anchor.href?.startsWith('https://wa.me/'))
    assert.ok(whatsapp.length > 0, page.path)
    for (const anchor of whatsapp) {
      const url = new URL(anchor.href)
      assert.equal(url.pathname, '/995591474040', page.path)
      const text = url.searchParams.get('text')
      if (text !== null) {
        assert.ok(text.trim(), page.path)
        assert.doesNotMatch(text, georgian, page.path)
      }
    }
  }
})

test('all completed canonical language pages, including Blog, are listed once in the built sitemap', async () => {
  const sitemap = await readFile(new URL('../dist/sitemap.xml', import.meta.url), 'utf8')
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, value]) => decodeEntities(value))
  const expected = [...pages.flatMap(page => [page.ka.canonical, page.en.canonical]), ...getBlogPaths().flatMap(path => [`${origin}${path}/`, `${origin}/en${path}/`])]
  assert.equal(new Set(urls).size, urls.length)
  assert.deepEqual(urls.sort(), expected.sort())
  assert.doesNotMatch(sitemap, /404|localhost|127\.0\.0\.1/)
  assert.equal(new Set(pages.map(page => page.en.html.match(/<title>([\s\S]*?)<\/title>/)[1])).size, paths.length)
})

test('English and Georgian 404 pages are noindexed and have no canonical or structured data', async () => {
  for (const locale of ['ka', 'en']) {
    const html = await readFile(new URL(`../dist${locale === 'en' ? '/en' : ''}/404.html`, import.meta.url), 'utf8')
    assert.equal(tags(html, 'html')[0].lang, locale)
    assert.match(getMeta(html, 'robots'), /(?:^|,)\s*noindex\b/i)
    assert.equal(tags(html, 'link').filter(link => link.rel === 'canonical' || link.rel === 'alternate').length, 0)
    assert.equal(tags(html, 'script').filter(script => script.type === 'application/ld+json').length, 0)
    assert.equal(getMeta(html, 'twitter:card'), 'summary')
    assert.equal(tags(html, 'meta').filter(meta => meta.property === 'og:url' || meta.property?.startsWith('og:image') || meta.name?.startsWith('twitter:image')).length, 0)
    assert.match(html, /id="not-found-title"/)
    const title = decodeEntities(html.match(/<title>([\s\S]*?)<\/title>/)[1])
    if (locale === 'en') {
      assert.match(title, /page not found/i)
      assert.doesNotMatch(title, georgian)
    } else assert.match(title, georgian)
  }
})

test('English homepage schema connects its seven services to the website and business', () => {
  const graph = structuredData(pages.find(page => page.path === '/').en.html)['@graph']
  const webpage = graph.find(item => item['@type'] === 'WebPage')
  const website = graph.find(item => item['@type'] === 'WebSite')
  const list = graph.find(item => item['@type'] === 'ItemList')
  assert.deepEqual(webpage.mainEntity, { '@id': list['@id'] })
  assert.equal(list['@id'], `${origin}/en/#services`)
  assert.deepEqual(website.publisher, { '@id': `${origin}/#business` })
  assert.equal(list.numberOfItems, servicePaths.length)
  for (const entry of list.itemListElement) {
    assert.equal(entry.item['@id'], `${entry.item.url}#service`)
    assert.deepEqual(entry.item.provider, { '@id': `${origin}/#business` })
  }
})
