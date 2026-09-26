import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  contactPath,
  getRouteMetadata,
  isContactPath,
  isKnownPublicPath,
} from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)

test('Contact route accepts its canonical direct and trailing-slash paths only', () => {
  assert.equal(contactPath, '/contact')
  assert.equal(isContactPath('/contact'), true)
  assert.equal(isContactPath('/contact/'), true)
  assert.equal(isKnownPublicPath('/contact/'), true)
  for (const pathname of ['/', '/contacts', '/contact/team']) assert.equal(isContactPath(pathname), false)
  assert.deepEqual(getRouteMetadata('/contact/'), getRouteMetadata('/contact'))
})

test('Contact route is prerendered with unique indexable metadata and real content', async () => {
  const built = await readFile(new URL('dist/contact/index.html', root), 'utf8')
  const metadata = getRouteMetadata('/contact/')

  assert.ok(metadata)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="description" content="${metadata.description}" />`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /class="contact-page"/)
  assert.match(built, /\+995 591 47 40 40/)
  assert.match(built, /ცოტნე დადიანის 7ბ\/2/)
  assert.match(built, /ორშ–პარ · 10:00–19:00/)
  assert.match(built, /შაბ · 11:00–18:00/)
  assert.doesNotMatch(built, /11:00–17:00/)
  assert.match(built, /assets\/map\/tecservice-map\.jpg/)
  assert.match(built, /href="\/contact\/"[^>]*aria-current="page"/)
  assert.doesNotMatch(built, /<div id="root"><\/div>|id="not-found-title"/)

  await access(new URL('public/assets/map/tecservice-map.jpg', root))
})

test('Contact route publishes ContactPage and LocalBusiness structured data', async () => {
  const metadata = getRouteMetadata('/contact/')
  const built = await readFile(new URL('dist/contact/index.html', root), 'utf8')
  const graph = JSON.parse(built.match(/<script type="application\/ld\+json" data-tecservice-route-schema>([\s\S]*?)<\/script>/)[1])['@graph']

  assert.ok(graph)
  assert.equal(graph.find(item => item['@type'] === 'ContactPage')?.url, metadata.canonical)
  const business = graph.find(item => item['@type'] === 'LocalBusiness')
  assert.equal(business.telephone, '+995591474040')
  assert.equal(business.address.streetAddress, 'ცოტნე დადიანის 7ბ/2')
  assert.equal(business.hasMap, 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7')
  assert.equal(business.openingHoursSpecification.find(item => item.dayOfWeek.includes('Saturday')).closes, '18:00')
})

test('Contact copy action and opening-hours placeholder survive prerender without a stale live status', async () => {
  const built = await readFile(new URL('dist/contact/index.html', root), 'utf8')
  assert.match(built, /class="contact-page__copy-address"[^>]*type="button"[^>]*aria-label="მისამართის კოპირება"/)
  assert.match(built, /<address>თბილისი, ცოტნე დადიანის 7ბ\/2<\/address>/)
  assert.match(built, /class="contact-page__opening-status" role="status" aria-live="polite"/)
  assert.match(built, /სამუშაო გრაფიკი · თბილისის დროით/)
  assert.doesNotMatch(built, /ახლა ღიაა|ახლა დაკეტილია|მისამართი დაკოპირებულია/)
})

for (const prefix of ['', '/en']) {
  test(`Contact WhatsApp message follows the page language on ${prefix}/contact/`, async () => {
    const built = await readFile(new URL(`dist${prefix}/contact/index.html`, root), 'utf8')
    const href = built.match(/<a\b[^>]*class="contact-page__whatsapp"[^>]*href="([^"]+)"/)?.[1]
    assert.ok(href, 'WhatsApp action must have a destination')
    const url = new URL(href.replaceAll('&amp;', '&'))
    assert.equal(url.origin, 'https://wa.me')
    assert.equal(url.pathname, '/995591474040')
    const message = url.searchParams.get('text')
    assert.ok(message?.trim(), 'WhatsApp action must include a message')
    if (prefix === '/en') {
      assert.doesNotMatch(message, /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
      assert.match(message, /repairing my device/)
    } else {
      assert.match(message, /ტექნიკის შეკეთებაზე/)
    }
  })

  test(`Contact opening hours provides a labelled keyboard-focusable anchor on ${prefix}/contact/`, async () => {
    const built = await readFile(new URL(`dist${prefix}/contact/index.html`, root), 'utf8')
    assert.match(built, /<section class="contact-page__hours" id="working-hours" tabindex="-1" aria-labelledby="contact-hours-title">/)
    assert.equal((built.match(/id="working-hours"/g) ?? []).length, 1)
    assert.equal((built.match(/id="contact-hours-title"/g) ?? []).length, 1)
    assert.match(built, /<h2 id="contact-hours-title">[^<]+<\/h2>/)
    const hours = built.match(/<section class="contact-page__hours"[\s\S]*?<\/section>/)?.[0]
    assert.match(hours, /10:00–19:00/)
    assert.match(hours, /11:00–18:00/)
  })
}
