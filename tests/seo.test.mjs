import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { formatPrice } from '../src/utils/formatPrice.ts'
import { services } from '../src/data/services.ts'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('index.html', root), 'utf8')
const built = await readFile(new URL('dist/index.html', root), 'utf8')
const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8')
const robots = await readFile(new URL('public/robots.txt', root), 'utf8')
const graph = JSON.parse(source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph']

test('built structured data matches the current source without stale service or hours data', () => {
  const builtGraph = JSON.parse(built.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph']
  assert.deepEqual(builtGraph, graph)
})

test('Georgian document has a unique descriptive title and description', () => {
  assert.match(source, /<html lang="ka">/)
  assert.equal((source.match(/<title>/g) ?? []).length, 1)
  assert.match(source, /<title>ტექნიკის შეკეთება თბილისში \| TECSERVICE<\/title>/)
  assert.equal((source.match(/name="description"/g) ?? []).length, 1)
  assert.match(source, /ინფორმაციის აღდგენა თბილისში/)
})

test('canonical, sitemap and social URL use the same production homepage', () => {
  assert.equal((source.match(/rel="canonical"/g) ?? []).length, 1)
  assert.match(source, /rel="canonical" href="https:\/\/tecservice\.ge\/"/)
  assert.match(source, /property="og:url" content="https:\/\/tecservice\.ge\/"/)
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), ['https://tecservice.ge/'])
  assert.match(robots, /Sitemap: https:\/\/tecservice\.ge\/sitemap\.xml/)
  assert.doesNotMatch(sitemap, /localhost|127\.0\.0\.1|\/cabinet|\/blog|\/services|lastmod/)
})

test('sharing and brand image files exist', async () => {
  for (const url of [
    source.match(/property="og:image" content="([^"]+)"/)[1],
    source.match(/name="twitter:image" content="([^"]+)"/)[1],
  ]) {
    const pathname = new URL(url).pathname
    await access(new URL(`public${pathname}`, root))
  }
  await access(new URL('public/assets/brand/tecservice-logo.svg', root))
  assert.match(source, /property="og:image:alt"/)
})

test('business schema matches visible address, telephone, hours and social links', async () => {
  const business = graph.find(item => item['@type'] === 'LocalBusiness')
  const contact = await readFile(new URL('src/sections/AboutSection.tsx', root), 'utf8')
  const footer = await readFile(new URL('src/sections/Footer.tsx', root), 'utf8')
  assert.ok(contact.includes(business.address.streetAddress))
  assert.equal(business.telephone, '+995591474040')
  assert.equal(business.address.addressCountry, 'GE')
  assert.equal(business.openingHoursSpecification[0].opens, '10:00')
  assert.equal(business.openingHoursSpecification[0].closes, '19:00')
  assert.equal(business.openingHoursSpecification[0].dayOfWeek.length, 5)
  assert.deepEqual(business.openingHoursSpecification[1].dayOfWeek, ['Saturday'])
  assert.equal(business.openingHoursSpecification[1].opens, '11:00')
  assert.equal(business.openingHoursSpecification[1].closes, '17:00')
  assert.ok(contact.includes('ორშ–პარ · 10:00–19:00'))
  assert.ok(contact.includes('შაბ · 11:00–17:00'))
  for (const url of business.sameAs) assert.ok(footer.includes(url))
  assert.ok(contact.includes(String(business.geo.latitude)))
  assert.ok(contact.includes(String(business.geo.longitude)))
  assert.equal(graph.find(item => item['@type'] === 'WebSite').inLanguage, 'ka')
  assert.doesNotMatch(JSON.stringify(graph), /aggregateRating|reviewRating|priceRange|Product|Offer|SearchAction/)
})

test('Home description and structured list represent all seven visible service directions', () => {
  const description = source.match(/name="description" content="([^"]+)"/)[1]
  for (const term of ['ლეპტოპების', 'კომპიუტერების', 'ინფორმაციის აღდგენა', 'კონსოლების', 'დრონების', 'მობილურების', 'პლანშეტების', 'სხვა ელექტრონიკის']) {
    assert.ok(description.includes(term), `Missing direction: ${term}`)
  }
  assert.equal(source.match(/property="og:description" content="([^"]+)"/)[1], description)
  assert.equal(source.match(/name="twitter:description" content="([^"]+)"/)[1], description)
  const list = graph.find(item => item['@type'] === 'ItemList')
  assert.equal(list.numberOfItems, 7)
  assert.equal(list.itemListElement.length, services.length)
  assert.deepEqual(graph.find(item => item['@type'] === 'WebPage').mainEntity, { '@id': list['@id'] })
  list.itemListElement.forEach(({ position, item }, index) => {
    const service = services[index]
    assert.equal(position, index + 1)
    assert.equal(item['@type'], 'Service')
    assert.equal(item.description, service.description)
    assert.equal(item.url, `https://tecservice.ge/#service-${service.id}`)
    assert.equal(item['@id'], item.url)
    assert.deepEqual(item.provider, { '@id': 'https://tecservice.ge/#business' })
    assert.ok(built.includes(`id="service-${service.id}"`))
    assert.doesNotMatch(item.url, /\/services\//)
  })
})

test('production HTML includes real page content before JavaScript', () => {
  assert.doesNotMatch(built, /<div id="root"><\/div>/)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((built.match(/class="service-card"/g) ?? []).length, 7)
  for (const id of ['hero-title', 'services', 'ticket', 'shop', 'reviews-heading', 'blog', 'contact']) {
    assert.ok(built.includes(`id="${id}"`), `Missing ${id} from prerendered HTML`)
  }
  assert.match(built, /ლეპტოპების, კომპიუტერების, კონსოლების/)
  assert.match(built, /ტექნიკის შეკეთება თბილისში/)
  assert.doesNotMatch(built, /name="robots" content="noindex/)
})

test('product prices hydrate with the same grouping as the approved browser display', () => {
  assert.equal(formatPrice(2599), '2,599')
  assert.equal(formatPrice(195), '195')
  assert.equal(formatPrice(149.5), '149.5')
  assert.match(built, /<strong>2,599<!-- --> ₾<\/strong>/)
})

test('preview indexing protection is separate from public crawl configuration', async () => {
  const config = await readFile(new URL('vite.config.ts', root), 'utf8')
  assert.match(config, /configureServer/)
  assert.match(config, /configurePreviewServer/)
  assert.match(config, /X-Robots-Tag/)
  assert.match(robots, /Allow: \//)
  assert.doesNotMatch(robots, /Disallow: \/(?:\r?\n|$)/)
})
