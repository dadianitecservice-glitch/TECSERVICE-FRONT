import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  mobileTabletFaqs,
  mobileTabletPrices,
  mobileTabletProblemMessage,
  mobileTabletProblems,
  mobileTabletRepairSteps,
} from '../src/data/mobileTabletRepair.ts'
import {
  getRouteMetadata,
  isMobileTabletRepairPath,
  mobileTabletRepairPath,
} from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)

test('mobile and tablet service route accepts direct and slash URLs only', () => {
  assert.equal(isMobileTabletRepairPath(mobileTabletRepairPath), true)
  assert.equal(isMobileTabletRepairPath(`${mobileTabletRepairPath}/`), true)
  for (const pathname of ['/', '/services/mobile-tablets', `${mobileTabletRepairPath}/article`]) {
    assert.equal(isMobileTabletRepairPath(pathname), false)
  }
  assert.deepEqual(
    getRouteMetadata(`${mobileTabletRepairPath}/`),
    getRouteMetadata(mobileTabletRepairPath),
  )
})

test('mobile and tablet route is prerendered with its own metadata and page content', async () => {
  const built = await readFile(
    new URL('dist/services/mobile-tablet-repair/index.html', root),
    'utf8',
  )
  const metadata = getRouteMetadata(mobileTabletRepairPath)
  assert.ok(metadata)
  assert.match(metadata.robots, /^index, follow/)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.ok(built.includes(`<meta property="og:image:alt" content="${metadata.imageAlt}" />`))
  assert.ok(built.includes(`<meta name="twitter:image" content="${metadata.image}" />`))
  assert.match(built, /id="mobile-tablet-page"/)
  assert.doesNotMatch(
    built,
    /id="hero-title"|id="laptop-page"|id="computer-page"|id="data-recovery-page"|id="console-page"|id="drone-page"/,
  )
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
})

test('mobile and tablet page follows the approved V2 section order and controls', async () => {
  const built = await readFile(new URL('dist/services/mobile-tablet-repair/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  assert.deepEqual(
    [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1]),
    [
      'mobile-tablet-title',
      'mobile-tablet-problems-title',
      'mobile-tablet-process-title',
      'mobile-tablet-prices-title',
      'mobile-tablet-faq-title',
      'mobile-tablet-contact-title',
    ],
  )
  const sectionNav = main.match(/<nav class="site-container lp-section-nav mobile-tablet-section-nav"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(sectionNav)
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'mobile-tablet-problems',
    'mobile-tablet-prices',
    'mobile-tablet-process',
    'mobile-tablet-status',
    'mobile-tablet-faq',
  ])
  assert.equal((main.match(/role="tab"/g) ?? []).length, mobileTabletProblems.length)
  assert.equal((main.match(/<details\b/g) ?? []).length, mobileTabletFaqs.length)
  assert.match(main, /id="mobile-tablet-service-code"/)
  assert.match(main, /aria-controls="mobile-tablet-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('mobile and tablet Hero and every problem use distinct accessible local photos and icons', async () => {
  const built = await readFile(new URL('dist/services/mobile-tablet-repair/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const heroSources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(heroSources, [
    '/assets/mobile-tablet-repair/hero-main.webp',
    '/assets/mobile-tablet-repair/hero-connectors.webp',
    '/assets/mobile-tablet-repair/hero-screen-touch.webp',
  ])
  for (const source of heroSources) await access(new URL(`public${source}`, root))

  assert.equal(mobileTabletProblems.length, 10)
  assert.equal(new Set(mobileTabletProblems.map(problem => problem.icon)).size, mobileTabletProblems.length)
  assert.equal(new Set(mobileTabletProblems.map(problem => problem.photo.src)).size, mobileTabletProblems.length)
  for (const problem of mobileTabletProblems) {
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('mobile and tablet prices, process, FAQs and WhatsApp messages preserve device context', () => {
  assert.equal(mobileTabletPrices.length, 8)
  assert.equal(mobileTabletRepairSteps.length, 5)
  assert.equal(mobileTabletFaqs.length, 6)
  assert.deepEqual(mobileTabletPrices.map(item => item.name), [
    'მოწყობილობის დიაგნოსტიკა',
    'ეკრანის / სენსორის შეცვლის სამუშაო',
    'ბატარეის შეცვლის სამუშაო',
    'USB‑C / Lightning დამტენის პორტის შეკეთება',
    'კამერის, დინამიკის ან მიკროფონის შეცვლის სამუშაო',
    'წყლით დაზიანების პირველადი დამუშავება',
    'სისტემური პლატის კომპონენტური შეკეთება',
    'პროგრამული გამართვა / მონაცემების მიგრაცია',
  ])
  assert.deepEqual(mobileTabletRepairSteps.map(step => step.title), [
    'მოდელი / მონაცემები',
    'დიაგნოსტიკა',
    'შეთანხმება',
    'შეკეთება',
    'ფუნქციური ტესტი',
  ])
  for (const problem of mobileTabletProblems) {
    const message = mobileTabletProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('მოწყობილობის ბრენდი და ზუსტი მოდელი:'))
    assert.ok(message.includes('წყარო: TECSERVICE — მობილურებისა და პლანშეტების შეკეთება'))
  }
})
