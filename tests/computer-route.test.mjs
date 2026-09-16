import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  computerBuildRequestUrl,
  computerPrices,
  computerProblemMessage,
  computerProblems,
} from '../src/data/computerRepair.ts'
import { computerRepairPath, getRouteMetadata, isComputerRepairPath } from '../src/utils/routes.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)

test('computer service route accepts direct and slash URLs only', () => {
  assert.equal(isComputerRepairPath(computerRepairPath), true)
  assert.equal(isComputerRepairPath(`${computerRepairPath}/`), true)
  for (const pathname of ['/', '/services/computers', `${computerRepairPath}/article`]) {
    assert.equal(isComputerRepairPath(pathname), false)
  }
  assert.deepEqual(getRouteMetadata(`${computerRepairPath}/`), getRouteMetadata(computerRepairPath))
})

test('computer route is prerendered with its own metadata and page content', async () => {
  const built = await readFile(new URL('dist/services/computer-repair/index.html', root), 'utf8')
  const metadata = getRouteMetadata(computerRepairPath)
  assert.ok(metadata)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.ok(built.includes(`<meta property="og:image:alt" content="${metadata.imageAlt}" />`))
  assert.ok(built.includes(`<meta name="twitter:image" content="${metadata.image}" />`))
  assert.match(built, /id="computer-page"/)
  assert.match(built, /id="computer-build"/)
  assert.doesNotMatch(built, /id="hero-title"|id="laptop-page"/)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
})

test('computer Hero and every problem use accessible local photos', async () => {
  const built = await readFile(new URL('dist/services/computer-repair/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const heroSources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.equal(heroSources.length, 3)
  assert.equal(new Set(heroSources).size, 3)
  assert.equal(computerProblems.length, 8)
  assert.equal(new Set(computerProblems.map(problem => problem.photo.src)).size, computerProblems.length)
  for (const problem of computerProblems) {
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
  await access(new URL('public/assets/computer-repair/custom-build-components.webp', root))
})

test('computer page contains complete navigation, build, price, status and FAQ sections', async () => {
  const built = await readFile(new URL('dist/services/computer-repair/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(sectionTitles, [
    'computer-title', 'computer-problems-title', 'computer-build-title', 'computer-process-title',
    'computer-prices-title', 'computer-faq-title', 'computer-contact-title',
  ])
  for (const label of ['მიღება', 'დიაგნოსტიკა', 'შეთანხმება', 'შეკეთება', 'ტესტირება / ჩაბარება']) {
    assert.match(main, new RegExp(`>${toGeorgianMtavruli(label)}<`))
  }
  const sectionNav = main.match(/<nav class="site-container lp-section-nav"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(sectionNav)
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'computer-problems', 'computer-build', 'computer-prices', 'computer-process', 'computer-status', 'computer-faq',
  ])
  assert.equal((main.match(/role="tab"/g) ?? []).length, 8)
  assert.equal((main.match(/<details\b/g) ?? []).length, 8)
  const contact = main.match(/<section\b[^>]*id="computer-contact"[\s\S]*?<\/section>/)?.[0]
  assert.ok(contact)
  assert.match(contact, new RegExp(toGeorgianMtavruli('დაგვიკავშირდით')))
  assert.equal((contact.match(/class="contact-detail"/g) ?? []).length, 3)
  for (const label of ['ტელეფონი', 'მისამართი', 'სამუშაო საათები']) assert.ok(contact.includes(`<small>${label}</small>`))
  assert.match(contact, /google\.com\/maps\?q=41\.7188516,44\.8036156/)
  assert.doesNotMatch(contact, /lp-contact__card|lp-contact__actions|მზად ხართ კომპიუტერის შესაკეთებლად/)
  assert.match(main, /id="computer-service-code"/)
  assert.match(main, /aria-controls="computer-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('computer prices are explicit and assembly component cost is not fabricated', () => {
  assert.equal(computerPrices.length, 16)
  for (const item of computerPrices) {
    assert.ok(Number.isFinite(item.fromPrice) && item.fromPrice > 0)
    assert.ok(item.duration.trim())
    assert.ok(item.priceNote.trim())
  }
  const assembly = computerBuildRequestUrl()
  assert.match(assembly, /^https:\/\/wa\.me\/995591474040\?text=/)
  const decoded = decodeURIComponent(assembly.split('?text=')[1])
  for (const prompt of ['დანიშნულება:', 'ბიუჯეტი:', 'საჭირო პროგრამები ან თამაშები:', 'მონიტორი და პერიფერია:']) {
    assert.ok(decoded.includes(prompt))
  }
})

test('problem WhatsApp messages preserve selected symptom and source', () => {
  for (const problem of computerProblems) {
    const message = computerProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('კომპიუტერის ძირითადი მონაცემები:'))
    assert.ok(message.includes('წყარო: TECSERVICE — კომპიუტერების შეკეთება'))
  }
})
