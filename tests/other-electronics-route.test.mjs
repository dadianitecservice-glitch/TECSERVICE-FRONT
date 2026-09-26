import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  otherElectronicsFaqs,
  otherElectronicsPrices,
  otherElectronicsProblemMessage,
  otherElectronicsProblems,
  otherElectronicsRepairSteps,
} from '../src/data/otherElectronicsRepair.ts'
import {
  getRouteMetadata,
  isOtherElectronicsPath,
  otherElectronicsPath,
} from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)

test('other electronics route accepts direct and trailing-slash URLs only', () => {
  assert.equal(isOtherElectronicsPath(otherElectronicsPath), true)
  assert.equal(isOtherElectronicsPath(`${otherElectronicsPath}/`), true)
  for (const pathname of ['/', '/services/electronics', `${otherElectronicsPath}/article`]) {
    assert.equal(isOtherElectronicsPath(pathname), false)
  }
  assert.deepEqual(getRouteMetadata(`${otherElectronicsPath}/`), getRouteMetadata(otherElectronicsPath))
})

test('other electronics route is prerendered with its own SEO and page content', async () => {
  const built = await readFile(new URL('dist/services/other-electronics/index.html', root), 'utf8')
  const metadata = getRouteMetadata(otherElectronicsPath)
  assert.ok(metadata)
  assert.match(metadata.robots, /^index, follow/)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.ok(built.includes(`<meta property="og:image:alt" content="${metadata.imageAlt}" />`))
  assert.match(built, /id="other-electronics-page"/)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
  await access(new URL('public/assets/electronic-board-repair/hero-tv-repair.webp', root))
})

test('other electronics page follows the Figma section order and complete controls', async () => {
  const built = await readFile(new URL('dist/services/other-electronics/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  assert.deepEqual(
    [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1]),
    [
      'other-electronics-title',
      'other-electronics-directions-title',
      'other-electronics-process-title',
      'other-electronics-prices-title',
      'other-electronics-faq-title',
      'other-electronics-contact-title',
    ],
  )
  assert.equal((main.match(/role="tab"/g) ?? []).length, otherElectronicsProblems.length)
  assert.equal((main.match(/<details\b/g) ?? []).length, otherElectronicsFaqs.length)
  assert.match(main, /id="other-electronics-service-code"/)
  assert.match(main, /aria-controls="other-electronics-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('approved ten repair directions and three repair Hero photos are present', async () => {
  const built = await readFile(new URL('dist/services/other-electronics/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const heroSources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(heroSources, [
    '/assets/electronic-board-repair/hero-tv-repair.webp',
    '/assets/electronic-board-repair/hero-ups-repair.webp',
    '/assets/electronic-board-repair/hero-nonstandard-board-repair.webp',
  ])
  for (const source of heroSources) await access(new URL(`public${source}`, root))
  assert.equal(otherElectronicsProblems.length, 10)
  assert.match(built, /სიგნალიზაციის/)
  assert.equal(new Set(otherElectronicsProblems.map(problem => problem.photo.src)).size, otherElectronicsProblems.length)
  for (const problem of otherElectronicsProblems) {
    assert.ok(built.includes(problem.label), `Missing ${problem.label}`)
    assert.equal(problem.checks.length, 3)
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('pricing keeps all amounts indicative and WhatsApp drafts retain the selected direction', () => {
  assert.equal(otherElectronicsPrices.length, 10)
  assert.equal(otherElectronicsRepairSteps.length, 5)
  assert.equal(otherElectronicsFaqs.length, 9)
  assert.deepEqual(
    otherElectronicsPrices
      .filter(price => ['ups-inverter', 'tv-board', 'tv-backlight'].includes(price.id))
      .map(({ id, priceLabel, duration }) => ({ id, priceLabel, duration })),
    [
      { id: 'ups-inverter', priceLabel: '100 ₾-დან', duration: '2–5 სამუშაო დღე' },
      { id: 'tv-board', priceLabel: '100 ₾-დან', duration: '2–3 სამუშაო დღე' },
      { id: 'tv-backlight', priceLabel: '120 ₾-დან', duration: '2–3 სამუშაო დღე' },
    ],
  )
  for (const price of otherElectronicsPrices) {
    assert.match(price.priceLabel, /^\d+\s*₾-დან$/)
  }
  for (const problem of otherElectronicsProblems) {
    const message = otherElectronicsProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('მწარმოებელი და მოდელი:'))
    assert.ok(message.includes('მონაცემთა ფირფიტისა და პლატის ფოტოებს'))
    assert.ok(message.includes('წყარო: TECSERVICE — ელექტრონული პლატებისა და არასტანდარტული ტექნიკის შეკეთება'))
  }
})
