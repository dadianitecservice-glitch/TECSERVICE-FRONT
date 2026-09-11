import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { laptopProblems } from '../src/data/laptopRepair.ts'
import { getRouteMetadata, isLaptopRepairPath } from '../src/utils/routes.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)

test('laptop route accepts direct and slash URLs without taking over Home or other services', () => {
  assert.equal(isLaptopRepairPath('/services/laptop-repair'), true)
  assert.equal(isLaptopRepairPath('/services/laptop-repair/'), true)
  for (const pathname of ['/', '/services/computer-repair', '/services/laptop-repair/article']) {
    assert.equal(isLaptopRepairPath(pathname), false)
    assert.equal(getRouteMetadata(pathname), null)
  }
  assert.deepEqual(getRouteMetadata('/services/laptop-repair/'), getRouteMetadata('/services/laptop-repair'))
})

test('static laptop route serves its own HTML and preview metadata on a direct refresh', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const metadata = getRouteMetadata('/services/laptop-repair')
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:url" content="${metadata.canonical}" />`))
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.doesNotMatch(built, /<div id="root"><\/div>|id="hero-title"|id="shop"|id="blog"|application\/ld\+json/)
  assert.match(built, /<footer\b/)
  const scriptPath = built.match(/<script type="module"[^>]*src="([^"]+)"/)[1]
  assert.ok(scriptPath.startsWith('/assets/'), 'Nested route assets must resolve from the site root')
  await access(new URL(`dist${scriptPath}`, root))
})

test('laptop Header links reach Home sections and mark the current service', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const header = built.match(/<header\b[\s\S]*?<\/header>/)[0]
  for (const target of ['/#blog', '/#contact', '/#ticket']) assert.ok(header.includes(`href="${target}"`))
  assert.match(header, /href="\/services\/laptop-repair"[^>]*aria-current="page"/)
  assert.doesNotMatch(header, /href="#(?:blog|contact|ticket)"/)
})

test('laptop Hero uses three distinct service photos and both approved actions', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const sources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.equal(sources.length, 3)
  assert.equal(new Set(sources).size, 3)
  assert.doesNotMatch(hero, /assets\/blog\/ssd-figma/)
  const actions = hero.match(/<div class="lp-hero__actions">([\s\S]*?)<\/div>/)?.[1]
  assert.ok(actions)
  assert.equal((actions.match(/<a\b/g) ?? []).length, 2)
  assert.match(actions, /https:\/\/wa\.me\/995591474040/)
  assert.match(actions, /href="#laptop-contact"/)
  assert.match(actions, new RegExp(toGeorgianMtavruli('დაგვიკავშირდით')))
})

test('every laptop problem has its own accessible local photo', async () => {
  const sources = laptopProblems.map(problem => problem.photo.src)
  assert.equal(laptopProblems.length, 10)
  assert.equal(new Set(sources).size, laptopProblems.length)
  for (const problem of laptopProblems) {
    assert.ok(problem.photo.alt.trim().length > 0, `Missing photo alt: ${problem.id}`)
    assert.ok(problem.photo.width > 0 && problem.photo.height > 0, `Missing photo dimensions: ${problem.id}`)
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('laptop preview keeps the problem selector and completes the page without duplicate services', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)[0]
  const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(sectionTitles, [
    'laptop-title', 'laptop-problems-title', 'laptop-prices-title', 'laptop-process-title',
    'laptop-faq-title', 'laptop-contact-title',
  ])
  assert.doesNotMatch(main, /laptop-services|lp-service-list|lp-featured-service/)
  assert.equal((main.match(/role="tab"/g) ?? []).length, 10)
  for (const id of ['boot', 'hinges', 'ports']) assert.ok(main.includes(`id="problem-tab-${id}"`))
  assert.match(main, /role="tabpanel" aria-labelledby="problem-tab-screen"/)
  const sectionNav = main.match(/<nav class="site-container lp-section-nav"[\s\S]*?<\/nav>/)[0]
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'laptop-problems', 'laptop-prices', 'laptop-process', 'laptop-status', 'laptop-faq',
  ])
  assert.match(main, /class="lp-ticket-lookup" id="laptop-status"/)
})

test('laptop completion includes visible FAQ, direct contact actions, map and routed Footer links', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const faq = built.match(/<section\b[^>]*id="laptop-faq"[\s\S]*?<\/section>/)?.[0]
  const contact = built.match(/<section\b[^>]*id="laptop-contact"[\s\S]*?<\/section>/)?.[0]
  const footer = built.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]

  assert.ok(faq)
  assert.equal((faq.match(/<details\b/g) ?? []).length, 6)
  assert.equal((faq.match(/<summary\b/g) ?? []).length, 6)
  assert.ok(contact)
  assert.match(contact, /https:\/\/wa\.me\/995591474040/)
  assert.match(contact, /href="tel:\+995591474040"/)
  const contactActions = contact.match(/<div class="lp-contact__actions">([\s\S]*?)<\/div>/)?.[1]
  assert.ok(contactActions)
  assert.equal((contactActions.match(/<a\b/g) ?? []).length, 1)
  assert.doesNotMatch(contactActions, /დაგვირეკეთ/)
  assert.match(contact, /google\.com\/maps\?q=41\.7188516,44\.8036156/)
  assert.ok(footer)
  for (const target of ['/#services', '/#ticket', '/#blog', '/#contact']) assert.ok(footer.includes(`href="${target}"`))
})

test('laptop status lookup stays compact until a service code is submitted', async () => {
  const built = await readFile(new URL('dist/services/laptop-repair/index.html', root), 'utf8')
  const statusStrip = built.match(/<div class="lp-status-strip"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/)?.[0]

  assert.ok(statusStrip, 'Laptop page must include the compact service-status strip')
  assert.match(statusStrip, /<form\b/)
  assert.match(statusStrip, /id="laptop-service-code"/)
  assert.match(statusStrip, /name="service-code"/)
  assert.match(statusStrip, /aria-label="სერვისის კოდი"/)
  assert.match(statusStrip, /placeholder="სერვისის კოდი"/)
  assert.match(statusStrip, /<button\b[^>]*aria-controls="laptop-ticket-result"[^>]*aria-expanded="false"[^>]*>სტატუსის ნახვა/)
  assert.doesNotMatch(statusStrip, /action="\/#ticket"/)
  assert.doesNotMatch(built, /<article class="ticket-result"/)
})

test('unpublished laptop route stays out of the sitemap and Home remains indexable', async () => {
  const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8')
  const home = await readFile(new URL('dist/index.html', root), 'utf8')
  assert.doesNotMatch(sitemap, /laptop-repair/)
  assert.match(home, /name="robots" content="index, follow/)
  assert.match(home, /id="hero-title"/)
  assert.match(home, /href="#blog"/)
})
