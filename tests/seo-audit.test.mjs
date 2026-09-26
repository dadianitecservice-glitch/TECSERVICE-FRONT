import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { auditSeo } from '../scripts/audit-seo.mjs'

const origin = 'https://tecservice.ge'
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
const meta = (name, content) => `<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${escape(content)}">`

function documentHtml(pathname, { legalApproved = false } = {}) {
  const english = pathname.startsWith('/en/')
  const lang = english ? 'en' : 'ka'
  const base = pathname.replace(/^\/en(?=\/)/, '')
  const missing = pathname.endsWith('/404.html')
  const account = base === '/account/'
  const noindex = missing || account || (base === '/terms/' && !legalApproved)
  const url = `${origin}${pathname}`
  const title = `Page ${pathname} | TECSERVICE`
  const description = `Useful information about the page ${pathname}.`
  const image = `${origin}/assets/share.svg`
  return `<!doctype html><html lang="${lang}"><head><title>${title}</title>
    ${meta('description', description)}${meta('robots', `${noindex ? 'noindex' : 'index'}, ${account ? 'nofollow' : 'follow'}`)}
    ${missing ? '' : `<link rel="canonical" href="${url}">
      ${['ka', 'en', 'x-default'].map(locale => `<link rel="alternate" hreflang="${locale}" href="${origin}${locale === 'en' ? '/en' : ''}${base}">`).join('')}
      ${meta('og:url', url)}${meta('og:title', title)}${meta('twitter:title', title)}
      ${meta('og:description', description)}${meta('twitter:description', description)}
      ${meta('og:image', image)}${meta('twitter:image', image)}${meta('og:image:alt', 'Service centre')}${meta('twitter:image:alt', 'Service centre')}
      ${meta('og:image:width', '1200')}${meta('og:image:height', '630')}${meta('twitter:card', 'summary_large_image')}
      ${account ? '' : `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', url })}</script>`}`}
    </head><body><main id="main"><h1>${title}</h1><a href="/#main">Home</a>
    ${missing ? '<a href="/en/404-not-found/" hreflang="en">English</a>' : ''}</main></body></html>`
}

async function fixture(t, { extra = [], legalApproved = false } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'tecservice-seo-audit-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const paths = ['', '/en'].flatMap(prefix => ['/', '/account/', '/terms/', ...extra, '/404.html'].map(route => `${prefix}${route}`))
  const fileFor = pathname => join(directory, pathname.replace(/^\//, '') + (pathname.endsWith('/') ? 'index.html' : ''))
  for (const pathname of paths) {
    const file = fileFor(pathname)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, documentHtml(pathname, { legalApproved }))
  }
  const indexable = paths.filter(pathname => !pathname.includes('/account/') && !pathname.endsWith('/404.html') && (legalApproved || !pathname.includes('/terms/')))
  await writeFile(join(directory, 'sitemap.xml'), `<urlset>${indexable.map(pathname => `<url><loc>${origin}${pathname}</loc></url>`).join('')}</urlset>`)
  await mkdir(join(directory, 'assets'), { recursive: true })
  await writeFile(join(directory, 'assets/share.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"/>')
  return {
    directory,
    audit: options => auditSeo({ directory, legalPagesApproved: legalApproved, ...options }),
    edit: async (pathname, transform) => { const file = fileFor(pathname); await writeFile(file, transform(await readFile(file, 'utf8'))) },
  }
}

test('SEO audit derives built-document and indexable counts without hardcoded route totals', async t => {
  const site = await fixture(t, { extra: ['/new-page/'] })
  assert.deepEqual(await site.audit(), { documents: 10, indexable: 4, sitemapUrls: 4, errors: [] })
})

test('SEO audit follows the legal approval gate while preserving account and 404 noindex', async t => {
  const site = await fixture(t, { legalApproved: true })
  assert.equal((await site.audit()).errors.length, 0)
  assert.ok((await site.audit({ legalPagesApproved: false })).errors.some(error => error.includes('Legal indexing disagrees')))
  await site.edit('/account/', html => html.replace('noindex, nofollow', 'index, follow'))
  await site.edit('/404.html', html => html.replace('noindex, follow', 'index, follow'))
  const { errors } = await site.audit()
  assert.ok(errors.some(error => error.startsWith('/account/:') && error.includes('must be noindex')))
  assert.ok(errors.some(error => error.startsWith('/404.html:') && error.includes('must be noindex')))
})

test('SEO audit rejects metadata duplication, empty prerender, wrong language and canonical drift', async t => {
  const site = await fixture(t)
  await site.edit('/en/', html => html
    .replace('lang="en"', 'lang="ka"')
    .replace('<title>Page /en/ | TECSERVICE</title>', '<title>Page / | TECSERVICE</title>')
    .replace('name="description" content="Useful information about the page /en/."', 'name="description" content="Useful information about the page /."')
    .replace('rel="canonical" href="https://tecservice.ge/en/"', 'rel="canonical" href="https://tecservice.ge/"')
    .replace(/<h1>.*?<\/h1>/, ''))
  const { errors } = await site.audit()
  for (const expected of ['HTML lang must be en', 'Canonical must be exactly', 'Duplicate indexable title', 'Duplicate indexable description', 'prerendered H1']) {
    assert.ok(errors.some(error => error.includes(expected)), expected)
  }
})

test('SEO audit catches broken hreflang, internal links, fragments, sharing assets and JSON-LD', async t => {
  const site = await fixture(t)
  await site.edit('/', html => html
    .replace('hreflang="ka" href="https://tecservice.ge/"', 'hreflang="ka" href="https://tecservice.ge/missing/"')
    .replace('href="/#main"', 'href="/en/#missing"')
    .replace('</main>', '<a href="/missing/">Broken</a><a href="https://shop.tecservice.ge/catalog/">External shop</a></main>')
    .replaceAll('/assets/share.svg', '/assets/missing.svg')
    .replace('"@type":"WebPage"', 'invalid-json'))
  const { errors } = await site.audit()
  for (const expected of ['alternate:', 'reciprocal ka link', 'fragment target is missing', 'Internal link target is not built', 'Sharing image does not exist', 'Invalid JSON-LD']) {
    assert.ok(errors.some(error => error.includes(expected)), expected)
  }
  assert.ok(errors.every(error => !error.includes('shop.tecservice.ge')))
})

test('SEO audit compares sitemap membership exactly, including noindex exclusions and duplicate URLs', async t => {
  const site = await fixture(t)
  await writeFile(join(site.directory, 'sitemap.xml'), `<urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/</loc></url><url><loc>${origin}/account/</loc></url></urlset>`)
  const { errors } = await site.audit()
  assert.ok(errors.some(error => error.includes('Duplicate canonical URLs')))
  assert.ok(errors.some(error => error.includes('Indexable canonical is missing: https://tecservice.ge/en/')))
  assert.ok(errors.some(error => error.includes('not an indexable built canonical: https://tecservice.ge/account/')))
})
