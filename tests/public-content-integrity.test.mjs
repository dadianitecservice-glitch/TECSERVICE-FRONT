import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { getBlogPaths } from '../src/utils/routes.ts'

const origin = 'https://tecservice.ge'
const paths = [
  '/',
  '/contact/',
  '/about/',
  '/account/',
  '/terms/',
  '/privacy/',
  ...getBlogPaths().map(path => `${path}/`),
  ...[
    'laptop-repair',
    'computer-repair',
    'data-recovery',
    'console-repair',
    'drone-repair',
    'mobile-tablet-repair',
    'other-electronics',
  ].map(service => `/services/${service}/`),
]
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`))
  return match?.[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"')
}

const pages = new Map()
for (const locale of ['ka', 'en']) {
  for (const path of paths) {
    const pathname = `${locale === 'en' ? '/en' : ''}${path}`
    const html = await readFile(new URL(`../dist${pathname}index.html`, import.meta.url), 'utf8')
    pages.set(pathname, html.slice(html.indexOf('<div id="root">')))
  }
}

for (const [pathname, body] of pages) {
  test(`${pathname}: public images, headings and internal links remain usable`, async () => {
    const headings = [...body.matchAll(/<h([1-6])\b[^>]*>/g)].map(match => Number(match[1]))
    assert.equal(headings.filter(level => level === 1).length, 1, 'Exactly one page H1 is needed')
    assert.equal(headings[0], 1, 'The first heading should be the page H1')
    for (let index = 1; index < headings.length; index++) {
      assert.ok(headings[index] <= headings[index - 1] + 1, 'Heading levels must not be skipped')
    }

    const images = [...body.matchAll(/<img\b[^>]*>/g)].map(match => match[0])
    assert.ok(images.length > 0)
    for (const image of images) {
      const src = attribute(image, 'src')
      const alt = attribute(image, 'alt')
      assert.ok(src, `Image has no src: ${image}`)
      assert.notEqual(alt, undefined, `Image has no alt: ${src}`)
      if (pathname.startsWith('/en/') && alt) assert.doesNotMatch(alt, georgian, `Untranslated image alt: ${src}`)
      if (src.startsWith('/')) await access(new URL(`../public${src}`, import.meta.url))
    }

    const base = new URL(pathname, origin)
    for (const match of body.matchAll(/<a\b[^>]*>/g)) {
      const href = attribute(match[0], 'href')
      assert.ok(href, `Link has no href: ${match[0]}`)
      const target = new URL(href, base)
      if (target.origin !== origin) continue
      const targetBody = pages.get(target.pathname)
      assert.ok(targetBody, `Internal link points outside the published pages: ${href}`)
      if (target.hash) {
        const id = decodeURIComponent(target.hash.slice(1))
        assert.ok(targetBody.includes(`id="${id}"`), `Internal link has no target: ${href}`)
      }
    }
  })
}

test('ticket search method is an accessible two-button group on Home in both languages', () => {
  for (const pathname of ['/', '/en/']) {
    const body = pages.get(pathname)
    assert.match(body, /class="ticket-tabs" role="group" aria-label="[^"]+"/)
    const group = body.match(/<div class="ticket-tabs"[\s\S]*?<\/div>/)?.[0]
    assert.ok(group, pathname)
    assert.equal((group.match(/aria-pressed="true"/g) ?? []).length, 1, pathname)
    assert.equal((group.match(/aria-pressed="false"/g) ?? []).length, 1, pathname)
    assert.doesNotMatch(group, /role="tab"|role="tablist"/)
  }
})

test('English public page H1s use natural sentence case', () => {
  const titles = new Map([
    ['/en/', 'Professional device repair and diagnostics'],
    ['/en/contact/', 'Contact us'],
    ['/en/services/laptop-repair/', 'Laptop repair'],
    ['/en/services/computer-repair/', 'Computer repair and assembly'],
    ['/en/services/data-recovery/', 'Laboratory data recovery'],
    ['/en/services/console-repair/', 'Console repair'],
    ['/en/services/drone-repair/', 'Drone diagnostics and repair'],
    ['/en/services/mobile-tablet-repair/', 'Phone and tablet repair'],
    ['/en/services/other-electronics/', 'Circuit boards and specialist equipment repair'],
  ])
  for (const [pathname, expected] of titles) {
    const html = pages.get(pathname)
    const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]
    assert.ok(heading, pathname)
    const text = heading.replace(/<[^>]+>/g, ' ').replace(/<!--.*?-->/g, '').replace(/\s+/g, ' ').trim()
    assert.equal(text, expected, pathname)
  }
})
