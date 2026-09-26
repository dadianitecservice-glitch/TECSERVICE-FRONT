import { readFile, readdir, stat } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { legalDocumentsApproved } from '../src/data/legalPages.ts'

const defaultDirectory = fileURLToPath(new URL('../dist/', import.meta.url))
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.startsWith('#')) {
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1))
    return point <= 0x10ffff ? String.fromCodePoint(point) : entity
  }
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
  .map(([, key, double, single]) => [key.toLowerCase(), decode(double ?? single)]))
const textContent = value => decode(value.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag))

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return htmlFiles(path)
    return entry.isFile() && entry.name.endsWith('.html') ? [path] : []
  }))).flat().sort()
}

export async function auditSeo({ directory = defaultDirectory, origin = 'https://tecservice.ge', legalPagesApproved = legalDocumentsApproved } = {}) {
  directory = resolve(directory)
  origin = new URL(origin).origin
  const errors = []
  const fail = (route, message) => errors.push(`${route}: ${message}`)
  const files = await htmlFiles(directory)
  if (!files.length) fail('build', 'No HTML documents found; build and prerender the site first.')
  const documents = await Promise.all(files.map(async file => {
    const local = relative(directory, file).split(sep).join('/')
    const pathname = `/${local}`.replace(/index\.html$/, '')
    const html = await readFile(file, 'utf8')
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
    const meta = tags(head, 'meta')
    const links = tags(head, 'link')
    const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(([, title]) => textContent(title))
    const robots = meta.filter(item => item.name?.toLowerCase() === 'robots')
    const directives = (robots[0]?.content ?? '').toLowerCase().split(/[\s,]+/)
    return {
      pathname, html, head, meta, links, titles, robots, directives,
      url: `${origin}${pathname}`,
      lang: tags(html, 'html')[0]?.lang,
      is404: /(?:^|\/)404\.html$/.test(pathname),
      noindex: directives.includes('noindex') || directives.includes('none'),
      canonical: links.filter(link => link.rel === 'canonical'),
      alternates: links.filter(link => link.rel === 'alternate' && link.hreflang),
      anchors: tags(html, 'a'),
      ids: new Set([...html.matchAll(/\bid=(?:"([^"]*)"|'([^']*)')/g)].map(([, double, single]) => decode(double ?? single))),
    }
  }))
  const byPath = new Map(documents.map(document => [document.pathname, document]))
  const localAssets = new Map()
  const localFileExists = async pathname => {
    if (!localAssets.has(pathname)) {
      let file
      try { file = resolve(directory, `.${decodeURIComponent(pathname)}`) } catch { return false }
      const local = relative(directory, file)
      if (local.startsWith(`..${sep}`) || local === '..') return false
      localAssets.set(pathname, stat(file).then(value => value.isFile()).catch(() => false))
    }
    return localAssets.get(pathname)
  }
  const urlValue = (value, route, label, base = origin) => {
    try { return new URL(value, base) } catch { fail(route, `${label} is not a valid URL: ${value}`); return null }
  }
  const singleMeta = (document, key, required = true) => {
    const matches = document.meta.filter(item => (item.name ?? item.property)?.toLowerCase() === key)
    if (matches.length !== 1 || !matches[0]?.content?.trim()) {
      if (required || matches.length) fail(document.pathname, `Expected one nonempty ${key} meta tag; found ${matches.length}.`)
    }
    return matches[0]?.content ?? ''
  }
  const uniqueTitles = new Map()
  const uniqueDescriptions = new Map()
  for (const document of documents) {
    const { pathname, html, is404, noindex, canonical, lang } = document
    const expectedLang = pathname.startsWith('/en/') ? 'en' : 'ka'
    if (lang !== expectedLang) fail(pathname, `HTML lang must be ${expectedLang}; found ${lang ?? '(missing)'}.`)
    if (!document.head) fail(pathname, 'Missing document head.')
    if (document.titles.length !== 1 || !document.titles[0]) fail(pathname, 'Expected exactly one nonempty title.')
    const description = singleMeta(document, 'description')
    if (document.robots.length !== 1 || !document.robots[0]?.content?.trim()) fail(pathname, 'Expected exactly one explicit robots meta tag.')
    if (document.directives.includes('index') && noindex) fail(pathname, 'Robots directives contain both index and noindex.')
    if (document.directives.includes('follow') && document.directives.includes('nofollow')) fail(pathname, 'Robots directives contain both follow and nofollow.')
    const account = /^\/(?:en\/)?account\/$/.test(pathname)
    if ((is404 || account) && !noindex) fail(pathname, 'Account and 404 documents must be noindex.')
    if (account && !document.directives.includes('nofollow')) fail(pathname, 'Account sign-in document must be nofollow.')
    if (/^\/(?:en\/)?(?:terms|privacy)\/$/.test(pathname) && noindex === legalPagesApproved) {
      fail(pathname, `Legal indexing disagrees with legalDocumentsApproved=${legalPagesApproved}.`)
    }
    if (!noindex && !document.directives.includes('index')) fail(pathname, 'Public documents must explicitly declare index or noindex.')
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
    if (headings.length !== 1 || !textContent(headings[0]?.[1] ?? '')) fail(pathname, 'Expected exactly one nonempty prerendered H1.')

    if (is404) {
      if (canonical.length) fail(pathname, '404 documents must not declare a canonical URL.')
      if (document.alternates.length) fail(pathname, '404 documents must not declare hreflang alternatives.')
    } else {
      if (canonical.length !== 1 || canonical[0]?.href !== document.url) fail(pathname, `Canonical must be exactly ${document.url}.`)
      if (singleMeta(document, 'og:url') !== document.url) fail(pathname, 'og:url must match the self-canonical URL.')
      for (const [key, expected] of [['og:title', document.titles[0]], ['twitter:title', document.titles[0]], ['og:description', description], ['twitter:description', description]]) {
        if (singleMeta(document, key) !== expected) fail(pathname, `${key} must match the page title or description.`)
      }
      const image = singleMeta(document, 'og:image')
      if (singleMeta(document, 'twitter:image') !== image) fail(pathname, 'Twitter and Open Graph must use the same sharing image.')
      const imageUrl = urlValue(image, pathname, 'Sharing image')
      if (imageUrl && (imageUrl.origin !== origin || imageUrl.href !== image)) fail(pathname, 'Sharing image must be an absolute URL on the canonical origin.')
      if (imageUrl?.origin === origin && !await localFileExists(imageUrl.pathname)) fail(pathname, `Sharing image does not exist in the build: ${imageUrl.pathname}`)
      if (singleMeta(document, 'twitter:image:alt') !== singleMeta(document, 'og:image:alt')) fail(pathname, 'Sharing image alt text must match on Open Graph and Twitter.')
      for (const key of ['og:image:width', 'og:image:height']) if (!(Number(singleMeta(document, key)) > 0)) fail(pathname, `${key} must be a positive number.`)
      singleMeta(document, 'twitter:card')
    }

    const schemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attrs]) => attributes(attrs).type === 'application/ld+json')
    if (!noindex && schemas.length !== 1) fail(pathname, 'Indexable pages need exactly one JSON-LD block.')
    if ((is404 || account) && schemas.length) fail(pathname, 'Account and 404 documents must not contain public-page JSON-LD.')
    for (const [, , body] of schemas) {
      try {
        const schema = JSON.parse(body)
        const nodes = Array.isArray(schema) ? schema : [schema]
        if (!nodes.length || nodes.some(node => !node || typeof node !== 'object' || (!node['@type'] && !Array.isArray(node['@graph'])))) {
          fail(pathname, 'JSON-LD must contain a typed entity or an entity graph.')
        }
      } catch (error) { fail(pathname, `Invalid JSON-LD: ${error.message}`) }
    }
    if (!noindex) {
      for (const [label, value, seen] of [['title', document.titles[0], uniqueTitles], ['description', description, uniqueDescriptions]]) {
        if (seen.has(value)) fail(pathname, `Duplicate indexable ${label}; also used by ${seen.get(value)}.`)
        else seen.set(value, pathname)
      }
    }
  }

  for (const document of documents) {
    if (!document.is404) {
      const languages = document.alternates.map(link => link.hreflang).sort()
      if (languages.join(',') !== 'en,ka,x-default') fail(document.pathname, 'Expected exactly one ka, en and x-default hreflang link.')
      const basePath = document.pathname.replace(/^\/en(?=\/)/, '') || '/'
      for (const alternate of document.alternates) {
        const expectedPath = `${alternate.hreflang === 'en' ? '/en' : ''}${basePath}`
        if (alternate.href !== `${origin}${expectedPath}`) fail(document.pathname, `Unexpected ${alternate.hreflang} alternate: ${alternate.href}`)
        const target = byPath.get(expectedPath)
        if (!target || target.is404) fail(document.pathname, `Hreflang target is not a built canonical page: ${expectedPath}`)
        else {
          if (target.noindex !== document.noindex) fail(document.pathname, `Hreflang targets disagree on indexing: ${expectedPath}`)
          if (!target.alternates.some(link => link.hreflang === document.lang && link.href === document.url)) fail(document.pathname, `Hreflang target lacks the reciprocal ${document.lang} link: ${expectedPath}`)
        }
      }
    }
    for (const anchor of document.anchors) {
      if (!anchor.href?.trim()) { fail(document.pathname, 'Anchor has no nonempty href.'); continue }
      const target = urlValue(anchor.href, document.pathname, 'Anchor href', document.url)
      if (!target || target.origin !== origin) continue
      const targetDocument = byPath.get(target.pathname)
      if (!targetDocument) {
        if (document.is404 && anchor.hreflang) continue
        if (!await localFileExists(target.pathname)) fail(document.pathname, `Internal link target is not built: ${anchor.href}`)
      } else if (target.hash) {
        let id
        try { id = decodeURIComponent(target.hash.slice(1)) } catch { fail(document.pathname, `Invalid fragment encoding: ${anchor.href}`); continue }
        if (!targetDocument.ids.has(id)) fail(document.pathname, `Internal fragment target is missing: ${anchor.href}`)
      }
    }
  }

  let sitemap = ''
  try { sitemap = await readFile(resolve(directory, 'sitemap.xml'), 'utf8') } catch { fail('sitemap.xml', 'Built sitemap is missing.') }
  const sitemapUrls = [...sitemap.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map(([, url]) => decode(url.trim()))
  const sitemapSet = new Set(sitemapUrls)
  if (sitemapSet.size !== sitemapUrls.length) fail('sitemap.xml', 'Duplicate canonical URLs found.')
  const indexable = documents.filter(document => !document.noindex)
  const expectedUrls = new Set(indexable.map(document => document.url))
  for (const url of expectedUrls) if (!sitemapSet.has(url)) fail('sitemap.xml', `Indexable canonical is missing: ${url}`)
  for (const url of sitemapSet) if (!expectedUrls.has(url)) fail('sitemap.xml', `URL is not an indexable built canonical: ${url}`)
  return { documents: documents.length, indexable: indexable.length, sitemapUrls: sitemapUrls.length, errors }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await auditSeo({ directory: process.argv[2] ?? defaultDirectory })
    if (result.errors.length) {
      console.error(`SEO audit failed: ${result.errors.length} issue(s) across ${result.documents} HTML documents.`)
      for (const error of result.errors) console.error(`- ${error}`)
      process.exitCode = 1
    } else console.log(`SEO audit passed: ${result.documents} HTML documents, ${result.indexable} indexable canonicals, ${result.sitemapUrls} sitemap URLs.`)
  } catch (error) {
    console.error(`SEO audit could not complete: ${error.message}`)
    process.exitCode = 1
  }
}
