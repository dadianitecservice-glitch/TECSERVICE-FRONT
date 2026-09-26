import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import {
  droneFaqs,
  dronePrices,
  droneProblemMessage,
  droneProblems,
  droneRepairSteps,
} from '../src/data/droneRepair.ts'
import { droneRepairPath, getRouteMetadata, isDroneRepairPath } from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)

test('drone service route accepts direct and slash URLs only', () => {
  assert.equal(isDroneRepairPath(droneRepairPath), true)
  assert.equal(isDroneRepairPath(`${droneRepairPath}/`), true)
  for (const pathname of ['/', '/services/drones', `${droneRepairPath}/article`]) {
    assert.equal(isDroneRepairPath(pathname), false)
  }
  assert.deepEqual(getRouteMetadata(`${droneRepairPath}/`), getRouteMetadata(droneRepairPath))
})

test('drone route is prerendered with its own metadata and page content', async () => {
  const built = await readFile(new URL('dist/services/drone-repair/index.html', root), 'utf8')
  const metadata = getRouteMetadata(droneRepairPath)
  assert.ok(metadata)
  assert.equal(metadata.image, 'https://tecservice.ge/assets/drone-repair/hero-mavic-4-pro.webp')
  assert.equal(metadata.imageWidth, '1280')
  assert.equal(metadata.imageHeight, '720')
  assert.match(metadata.robots, /^index, follow/)
  assert.ok(built.includes(`<title>${metadata.title}</title>`))
  assert.ok(built.includes(`<meta name="robots" content="${metadata.robots}" />`))
  assert.ok(built.includes(`<link rel="canonical" href="${metadata.canonical}" />`))
  assert.ok(built.includes(`<meta property="og:image" content="${metadata.image}" />`))
  assert.ok(built.includes(`<meta property="og:image:alt" content="${metadata.imageAlt}" />`))
  assert.ok(built.includes(`<meta name="twitter:image" content="${metadata.image}" />`))
  assert.match(built, /id="drone-page"/)
  assert.doesNotMatch(built, /id="hero-title"|id="laptop-page"|id="computer-page"|id="data-recovery-page"|id="console-page"/)
  assert.equal((built.match(/<main\b/g) ?? []).length, 1)
  assert.equal((built.match(/<h1\b/g) ?? []).length, 1)
  assert.match(built, /<footer\b/)
})

test('drone page follows the approved V2 section order and exposes complete controls', async () => {
  const built = await readFile(new URL('dist/services/drone-repair/index.html', root), 'utf8')
  const main = built.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main)
  const sectionTitles = [...main.matchAll(/<section\b[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(sectionTitles, [
    'drone-title',
    'drone-problems-title',
    'drone-process-title',
    'drone-prices-title',
    'drone-faq-title',
    'drone-contact-title',
  ])
  const sectionNav = main.match(/<nav class="site-container lp-section-nav drone-section-nav"[\s\S]*?<\/nav>/)?.[0]
  assert.ok(sectionNav)
  assert.deepEqual([...sectionNav.matchAll(/href="#([^"]+)"/g)].map(match => match[1]), [
    'drone-problems',
    'drone-prices',
    'drone-process',
    'drone-status',
    'drone-faq',
  ])
  assert.equal((main.match(/role="tab"/g) ?? []).length, droneProblems.length)
  assert.equal((main.match(/<details\b/g) ?? []).length, droneFaqs.length)
  assert.match(main, /id="drone-service-code"/)
  assert.match(main, /aria-controls="drone-ticket-result"[^>]*aria-expanded="false"/)
  assert.doesNotMatch(main, /<article class="ticket-result"/)
})

test('drone Hero and every problem use distinct accessible local photos and icons', async () => {
  const built = await readFile(new URL('dist/services/drone-repair/index.html', root), 'utf8')
  const hero = built.match(/<section\b[^>]*class="lp-hero"[\s\S]*?<\/section>/)?.[0]
  assert.ok(hero)
  const heroSources = [...hero.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1])
  assert.deepEqual(heroSources, [
    '/assets/drone-repair/hero-mavic-4-pro.webp',
    '/assets/drone-repair/hero-gimbal-disassembled.webp',
    '/assets/drone-repair/hero-controller-disassembled.webp',
  ])
  for (const source of heroSources) await access(new URL(`public${source}`, root))

  assert.equal(droneProblems.length, 10)
  assert.equal(new Set(droneProblems.map(problem => problem.icon)).size, droneProblems.length)
  assert.equal(new Set(droneProblems.map(problem => problem.photo.src)).size, droneProblems.length)
  for (const problem of droneProblems) {
    assert.ok(problem.icon)
    assert.ok(problem.photo.alt.trim())
    await access(new URL(`public${problem.photo.src}`, root))
  }
})

test('drone prices, process, FAQs and WhatsApp messages preserve service context', () => {
  assert.equal(dronePrices.length, 8)
  assert.equal(droneRepairSteps.length, 5)
  assert.equal(droneFaqs.length, 6)
  assert.deepEqual(
    dronePrices.map(item => item.name),
    [
      'დრონის სრული დიაგნოსტიკა',
      'დაცემის შემდეგ გიმბალისა და გეომეტრიის შემოწმება',
      'მკლავის ან კორპუსის შეცვლის სამუშაო',
      'მოტორის შეცვლა და ESC-ის შემოწმება',
      'კამერის / გიმბალის შლეიფის ან კვანძის სამუშაო',
      'IMU-ის / კომპასის / GPS-ის კალიბრაცია',
      'მიკროპროგრამა / FlySafe / აპთან დაკავშირების გამართვა',
      'წყლით დაზიანება ან ESC/FC პლატის შეკეთება',
    ],
  )
  assert.deepEqual(droneRepairSteps.map(step => step.title), [
    'ვიზუალური ინსპექცია',
    'ელექტრონული დიაგნოსტიკა',
    'შეთანხმება',
    'შეკეთება / კალიბრაცია',
    'ფუნქციური ტესტი',
  ])
  for (const problem of droneProblems) {
    const message = droneProblemMessage(problem)
    assert.ok(message.includes(`„${problem.label}“`))
    assert.ok(message.includes('დრონის ბრენდი და ზუსტი მოდელი:'))
    assert.ok(message.includes('წყარო: TECSERVICE — დრონების შეკეთება'))
  }
})
