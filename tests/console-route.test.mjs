import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  consoleFaqs,
  consolePrices,
  consoleProblemMessage,
  consoleProblems,
  consoleRepairSteps,
} from '../src/data/consoleRepair.ts'
import { consoleRepairPath, getRouteMetadata, isConsoleRepairPath } from '../src/utils/routes.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)

test('console service route accepts direct and slash URLs only', () => {
  assert.equal(isConsoleRepairPath(consoleRepairPath), true)
  assert.equal(isConsoleRepairPath(`${consoleRepairPath}/`), true)
  for (const pathname of ['/', '/services/consoles', `${consoleRepairPath}/article`]) {
    assert.equal(isConsoleRepairPath(pathname), false)
  }
  assert.deepEqual(getRouteMetadata(`${consoleRepairPath}/`), getRouteMetadata(consoleRepairPath))
})

test('console route is prerendered with its own metadata and page content', async () => {
  const built = await readFile(new URL('dist/services/console-repair/index.html', root), 'utf8')
  const metadata = getRouteMetadata(consoleRepairPath)
  assert.ok(metadata)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.ok(built.includes(`<meta property="og:image:alt" content="${metadata.imageAlt}" />`))
  assert.ok(built.includes(`<meta name="twitter:image" content="${metadata.image}" />`))
  assert.match(built, /id="console-page"/)
  assert.doesNotMatch(built, /id="hero-title"|id="laptop-page"|id="computer-page"|id="data-recovery-page"/)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
})

test('console page follows the approved V2 section order and exposes complete controls', async () => {
  const built = await readFile(new URL('dist/services/console-repair/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(sectionTitles, [
    'console-title',
    'console-problems-title',
    'console-process-title',
    'console-prices-title',
    'console-faq-title',
    'console-contact-title',
  ])
  const sectionNav = main.match(/<nav class="site-container lp-section-nav console-section-nav"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(sectionNav)
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'console-problems',
    'console-prices',
    'console-process',
    'console-status',
    'console-faq',
  ])
  assert.equal((main.match(/role="tab"/g) ?? []).length, consoleProblems.length)
  assert.equal((main.match(/<details\b/g) ?? []).length, consoleFaqs.length)
  assert.match(main, /id="console-service-code"/)
  assert.match(main, /aria-controls="console-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('console Hero and every problem use distinct accessible local photos and icons', async () => {
  const built = await readFile(new URL('dist/services/console-repair/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const heroSources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(heroSources, [
    '/assets/console-repair/hero-controller.webp',
    '/assets/console-repair/hero-ps5.webp',
    '/assets/console-repair/hero-xbox.webp',
  ])
  for (const source of heroSources) await access(new URL(`public${source}`, root))

  assert.equal(consoleProblems.length, 10)
  assert.equal(new Set(consoleProblems.map(problem => problem.icon)).size, consoleProblems.length)
  assert.equal(new Set(consoleProblems.map(problem => problem.photo.src)).size, consoleProblems.length)
  for (const problem of consoleProblems) {
    assert.ok(problem.icon)
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('console prices, process, FAQs and WhatsApp messages preserve service context', () => {
  assert.equal(consolePrices.length, 11)
  assert.equal(consoleRepairSteps.length, 5)
  assert.equal(consoleFaqs.length, 6)
  assert.deepEqual(
    consolePrices.map(item => item.name),
    [
      'კონსოლის დიაგნოსტიკა',
      'წმენდა და თერმოინტერფეისის განახლება',
      'HDMI პორტის შეცვლა / სიგნალის აღდგენა',
      'Nintendo Switch-ის USB‑C პორტის შეკეთება',
      'კვების ბლოკის ან კვების ჯაჭვის შეკეთება',
      'ქულერის ან დისკ-დრაივის შეკეთება',
      'კონტროლერის ანალოგის თვითნებური მოძრაობა / ღილაკები',
      'კონტროლერის ბატარეისა და დამტენის პორტის შეცვლა',
      'Wi‑Fi / Bluetooth მოდულის შეკეთება',
      'SSD / მეხსიერება / სისტემური პროგრამული გამართვა',
      'სისტემური პლატის კომპონენტური შეკეთება',
    ],
  )
  for (const label of ['მიღება', 'დიაგნოსტიკა', 'შეთანხმება', 'შეკეთება', 'ტესტირება / ჩაბარება']) {
    assert.equal(consoleRepairSteps.some(step => toGeorgianMtavruli(step.title) === toGeorgianMtavruli(label)), true)
  }
  for (const problem of consoleProblems) {
    const message = consoleProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('კონსოლის ტიპი და ზუსტი მოდელი:'))
    assert.ok(message.includes('წყარო: TECSERVICE — კონსოლების შეკეთება'))
  }
})
