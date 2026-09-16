import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  dataRecoveryFaqs,
  dataRecoveryPrices,
  dataRecoveryProblemMessage,
  dataRecoveryProblems,
  dataRecoverySteps,
} from '../src/data/dataRecovery.ts'
import { dataRecoveryPath, getRouteMetadata, isDataRecoveryPath } from '../src/utils/routes.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)

test('data recovery route accepts direct and slash URLs only', () => {
  assert.equal(isDataRecoveryPath(dataRecoveryPath), true)
  assert.equal(isDataRecoveryPath(`${dataRecoveryPath}/`), true)
  for (const pathname of ['/', '/services/recovery', `${dataRecoveryPath}/article`]) {
    assert.equal(isDataRecoveryPath(pathname), false)
  }
  assert.deepEqual(getRouteMetadata(`${dataRecoveryPath}/`), getRouteMetadata(dataRecoveryPath))
})

test('data recovery route is prerendered with its own metadata and content', async () => {
  const built = await readFile(new URL('dist/services/data-recovery/index.html', root), 'utf8')
  const metadata = getRouteMetadata(dataRecoveryPath)
  assert.ok(metadata)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.match(built, /id="data-recovery-page"/)
  assert.doesNotMatch(built, /id="hero-title"|id="laptop-page"|id="computer-page"/)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
})

test('data recovery page follows the approved V2 section order and controls', async () => {
  const built = await readFile(new URL('dist/services/data-recovery/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(sectionTitles, [
    'data-recovery-title',
    'data-recovery-problems-title',
    'data-recovery-process-title',
    'data-recovery-prices-title',
    'data-recovery-faq-title',
    'data-recovery-contact-title',
  ])
  const sectionNav = main.match(/<nav class="site-container lp-section-nav dr-section-nav"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(sectionNav)
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'data-recovery-problems',
    'data-recovery-prices',
    'data-recovery-process',
    'data-recovery-status',
    'data-recovery-faq',
  ])
  assert.equal((main.match(/role="tab"/g) ?? []).length, 10)
  assert.equal((main.match(/<details\b/g) ?? []).length, 6)
  assert.match(main, /src="\/assets\/data-recovery\/problem-usb-sd\.jpg"[^>]*alt="USB ფლეშკისა და microSD მეხსიერების მიკროსკოპით დიაგნოსტიკა"/)
  assert.match(main, /USB \/ SD აღდგენა/)
  assert.match(main, /src="\/assets\/data-recovery\/hero-ssd-lab\.jpg"[^>]*alt="SSD და NVMe მეხსიერების ჩიპების ლაბორატორიული დიაგნოსტიკა"/)
  assert.match(main, /SSD \/ NVMe/)
  assert.match(main, /id="data-recovery-service-code"/)
  assert.match(main, /aria-controls="data-recovery-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('data recovery content, pricing and local Figma assets are complete', async () => {
  assert.equal(dataRecoveryProblems.length, 10)
  assert.equal(dataRecoveryPrices.length, 9)
  assert.equal(dataRecoverySteps.length, 5)
  assert.equal(dataRecoveryFaqs.length, 6)
  assert.deepEqual(
    {
      name: dataRecoveryPrices[0].name,
      price: dataRecoveryPrices[0].price,
      duration: dataRecoveryPrices[0].duration,
    },
    {
      name: 'სტანდარტული დიაგნოსტიკა',
      price: '30 ₾',
      duration: '1–2 სამუშაო დღე',
    },
  )
  assert.equal(dataRecoveryPrices[1].name, 'მატარებლის ლაბორატორიული დიაგნოსტიკა')
  assert.deepEqual(dataRecoveryPrices.map(item => item.price), [
    '30 ₾',
    '50 ₾',
    '150 ₾-დან',
    '300 ₾-დან',
    'დიაგნოსტიკის შემდეგ',
    '300 ₾-დან',
    '600 ₾-დან',
    '150 ₾-დან',
    'ცალკე შეთანხმებით',
  ])
  for (const path of [
    'public/assets/data-recovery/hero-lab.png',
    'public/assets/data-recovery/hero-lab-wide.jpg',
    'public/assets/data-recovery/hero-hdd-opening.jpg',
    'public/assets/data-recovery/hero-hdd-opened.jpg',
    'public/assets/data-recovery/hero-ssd-lab.jpg',
  ]) await access(new URL(path, root))
  assert.equal(new Set(dataRecoveryProblems.map(problem => problem.icon)).size, dataRecoveryProblems.length)
  assert.equal(new Set(dataRecoveryProblems.map(problem => problem.photo.src)).size, dataRecoveryProblems.length)
  for (const problem of dataRecoveryProblems) {
    assert.ok(problem.icon)
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('data recovery process and WhatsApp links retain context', () => {
  for (const label of ['შეწყვიტეთ გამოყენება', 'მიღება / დაცვა', 'დიაგნოსტიკა', 'უსაფრთხო იმიჯინგი', 'აღდგენა / ჩაბარება']) {
    assert.equal(dataRecoverySteps.some(step => toGeorgianMtavruli(step.title) === toGeorgianMtavruli(label)), true)
  }
  for (const problem of dataRecoveryProblems) {
    const message = dataRecoveryProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('მატარებლის ტიპი, ბრენდი და მოდელი:'))
    assert.ok(message.includes('წყარო: TECSERVICE — ინფორმაციის აღდგენა'))
  }
})
