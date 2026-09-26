import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { aboutPageCopy } from '../src/data/aboutPage.ts'
import { services } from '../src/data/services.ts'
import {
  aboutPath,
  getRouteMetadata,
  isAboutPath,
  isKnownPublicPath,
} from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)
const origin = 'https://tecservice.ge'
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const factIconPaths = {
  calendar: ['M3 5h18v16H3zM7 2v6m10-6v6M3 10h18', 'M7 14h2m3 0h2m3 0h1M7 17h2m3 0h2'],
  chip: ['M6 6h12v12H6zM9 9h6v6H9z', 'M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4'],
  briefcase: ['M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 12v3h4v-3'],
  check: ['m5 12 4 4L19 6'],
}
const servicePaths = [
  '/services/laptop-repair/',
  '/services/computer-repair/',
  '/services/data-recovery/',
  '/services/console-repair/',
  '/services/drone-repair/',
  '/services/mobile-tablet-repair/',
  '/services/other-electronics/',
]

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
    if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
  })
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)]
    .map(([, key, value]) => [key.toLowerCase(), decodeEntities(value)]))
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) => attributes(tag))
}

function meta(html, key) {
  const matches = tags(html, 'meta').filter(tag => tag.name === key || tag.property === key)
  assert.equal(matches.length, 1, `Expected one ${key} meta tag`)
  return matches[0].content
}

test('About route accepts direct and trailing-slash URLs in both languages without absorbing unknown paths', () => {
  assert.equal(aboutPath, '/about')
  for (const prefix of ['', '/en']) {
    for (const pathname of [`${prefix}/about`, `${prefix}/about/`]) {
      assert.equal(isAboutPath(pathname), true, pathname)
      assert.equal(isKnownPublicPath(pathname), true, pathname)
    }
    assert.deepEqual(getRouteMetadata(`${prefix}/about`), getRouteMetadata(`${prefix}/about/`))
    for (const pathname of [`${prefix}/abouts`, `${prefix}/about/team`, `${prefix}/about//`]) {
      assert.equal(isAboutPath(pathname), false, pathname)
      assert.equal(isKnownPublicPath(pathname), false, pathname)
      assert.equal(getRouteMetadata(pathname), null, pathname)
    }
  }
  for (const pathname of ['/', '/en/', '/contact/', '/en/contact/', '/english/about/', '/en/en/about/']) {
    assert.equal(isAboutPath(pathname), false, pathname)
  }
})

test('Georgian About hero preserves the approved lead and separates company history from current services in two paragraphs', () => {
  assert.equal(aboutPageCopy.ka.lead, 'ტექნიკის სერვისი მრავალწლიანი გამოცდილებით.')
  assert.deepEqual(aboutPageCopy.ka.intro, [
    'TECSERVICE ტექნიკის მომსახურების სფეროში 2002 წლიდან მუშაობს. დღეს გთავაზობთ ლეპტოპების, კომპიუტერების, კონსოლების, დრონების, მობილურებისა და პლანშეტების დიაგნოსტიკასა და შეკეთებას, ასევე ინფორმაციის აღდგენას დაზიანებული დისკებიდან, მეხსიერების ჩიპებიდან და ფლეშმეხსიერებიდან.',
    'ასევე გთავაზობთ რთული და არასტანდარტული მოწყობილობებისა და ელექტრონული პლატების შეკეთებას. ვადგენთ დაზიანების მიზეზს, განვიხილავთ შეკეთების შესაძლო გზებს და ყურადღებას ვაქცევთ თითოეულ დეტალს.',
  ])
})

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const pathname = `${prefix}/about/`
  const canonical = `${origin}${pathname}`
  const readPage = () => readFile(new URL(`dist${pathname}index.html`, root), 'utf8')

  test(`${locale} About copy describes the company and supplies five repair stages and seven compact service summaries`, () => {
    const copy = aboutPageCopy[locale]
    assert.ok(Array.isArray(copy.intro), 'Hero intro must preserve individual paragraphs')
    assert.equal(copy.intro.length, 2)
    for (const paragraph of copy.intro) {
      assert.equal(typeof paragraph, 'string')
      assert.ok(paragraph.trim().length > 0)
      assert.doesNotMatch(paragraph, /RAID/i)
    }
    assert.doesNotMatch(copy.lead, /RAID/i)
    assert.match(copy.approachTitle, /TECSERVICE/)
    assert.doesNotMatch(copy.approachTitle, /2002/)
    assert.equal(copy.story.length, 2, 'Lower profile should remain two concise paragraphs')
    assert.doesNotMatch(copy.story.join(' '), /2002|PlayStation|Nintendo|RAID|UPS/i, 'Lower profile must not repeat the hero history or device list')
    assert.ok(copy.story.join(' ').length < copy.intro.join(' ').length, 'Lower profile should be shorter than the hero')
    for (const paragraph of copy.story) {
      assert.ok(paragraph.trim().length > 0)
      assert.ok(!copy.intro.includes(paragraph), 'Lower profile must add context, not repeat a hero paragraph')
    }
    assert.equal(copy.steps.length, 5)
    assert.deepEqual(copy.steps.map(step => step.title), locale === 'ka'
      ? ['მიღება', 'დიაგნოსტიკა', 'შეთანხმება', 'შეკეთება', 'ტესტირება / ჩაბარება']
      : ['Check-in', 'Diagnostics', 'Agreement', 'Repair', 'Testing / handover'])
    assert.equal(copy.processTitle, locale === 'ka' ? 'მიღებიდან — დასრულებამდე' : 'From check-in to completion')
    assert.deepEqual(Object.keys(copy.serviceSummaries).sort(), services.map(service => service.id).sort())
    for (const summary of Object.values(copy.serviceSummaries)) {
      assert.ok(summary.trim().length > 0)
      assert.ok(summary.trim().split(/\s+/).length <= 8, `Service summary is too long: ${summary}`)
    }
    if (locale === 'en') assert.doesNotMatch(JSON.stringify(copy), georgian)
  })

  test(`${locale} About facts provide four localized points with short labels and matching icons`, () => {
    const facts = aboutPageCopy[locale].facts
    assert.deepEqual(facts.map(fact => fact.value), locale === 'ka'
      ? ['2002 წლიდან', 'მრავალმხრივი სერვისი', 'კორპორატიული სერვისი', 'გამჭვირვალე პირობები']
      : ['Since 2002', 'Comprehensive services', 'Corporate services', 'Transparent terms'])
    assert.deepEqual(facts.map(fact => fact.icon), ['calendar', 'chip', 'briefcase', 'check'])
    assert.deepEqual(facts.map(fact => fact.label), locale === 'ka'
      ? ['გამოცდილება ტექნიკის მომსახურებაში', 'დიაგნოსტიკა და შეკეთება', 'ტექნიკური მხარდაჭერა კომპანიებისთვის', 'ფასი და სავარაუდო ვადა — წინასწარი შეთანხმებით']
      : ['Experience in device servicing', 'Diagnostics and repair', 'Technical support for businesses', 'Cost and estimated timeframe agreed in advance'])
    for (const fact of facts) {
      assert.equal(typeof fact.label, 'string', `${fact.value}.label`)
      assert.ok(fact.label.trim().length > 0, `${fact.value}.label must not be empty`)
      if (locale === 'ka') assert.match(fact.label, georgian, `${fact.value}.label must be localized`)
      else assert.doesNotMatch(fact.label, georgian, `${fact.value}.label must be localized`)
      assert.ok(fact.label.trim().split(/\s+/).length <= 9, `Fact label must stay short: ${fact.label}`)
      assert.equal(Object.hasOwn(fact, 'detail'), false, 'Slim facts must omit the extra detail line')
    }
    assert.doesNotMatch(JSON.stringify(facts[1]), /\b7\b/)
  })

  test(`${pathname} is prerendered with unique localized metadata and reciprocal language URLs`, async () => {
    const html = await readPage()
    const metadata = getRouteMetadata(pathname)
    assert.ok(metadata)
    assert.equal(metadata.canonical, canonical)
    assert.equal(tags(html, 'html')[0].lang, locale)
    const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)]
    assert.equal(titles.length, 1)
    assert.equal(decodeEntities(titles[0][1]), metadata.title)
    assert.equal(meta(html, 'description'), metadata.description)
    assert.equal(meta(html, 'robots'), metadata.robots)
    assert.match(metadata.robots, /^index, follow/)
    assert.notEqual(metadata.title, getRouteMetadata(`${prefix}/contact/`).title)
    assert.equal(meta(html, 'og:title'), metadata.title)
    assert.equal(meta(html, 'og:description'), metadata.description)
    assert.equal(meta(html, 'og:url'), canonical)
    assert.equal(meta(html, 'og:locale'), locale === 'en' ? 'en_GB' : 'ka_GE')
    assert.equal(meta(html, 'og:image'), `${origin}/assets/about/multi-device-repair.webp`)
    assert.equal(meta(html, 'og:image:width'), '1440')
    assert.equal(meta(html, 'og:image:height'), '960')
    assert.equal(meta(html, 'og:image:alt'), metadata.imageAlt)
    assert.equal(meta(html, 'twitter:title'), metadata.title)
    assert.equal(meta(html, 'twitter:description'), metadata.description)
    assert.equal(meta(html, 'twitter:image'), metadata.image)
    assert.equal(meta(html, 'twitter:image:alt'), metadata.imageAlt)
    const links = tags(html, 'link')
    assert.deepEqual(links.filter(link => link.rel === 'canonical').map(link => link.href), [canonical])
    assert.deepEqual(Object.fromEntries(links.filter(link => link.rel === 'alternate').map(link => [link.hreflang, link.href])), {
      ka: `${origin}/about/`,
      en: `${origin}/en/about/`,
      'x-default': `${origin}/about/`,
    })
    if (locale === 'en') {
      for (const copy of [metadata.title, metadata.description, metadata.imageAlt]) assert.doesNotMatch(copy, georgian)
    } else assert.match(metadata.title, georgian)
  })

  test(`${pathname} renders one About heading, the multi-device repair image, service links and a contact action`, async () => {
    const html = await readPage()
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    assert.equal((html.match(/<main\b/g) ?? []).length, 1)
    assert.match(main, /class="about-page"/)
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
    assert.equal(headings.length, 1)
    assert.equal(decodeEntities(headings[0][1].replace(/<[^>]+>/g, '')).toLowerCase(), locale === 'en' ? 'about us' : 'ჩვენს შესახებ')
    assert.doesNotMatch(html, /<div id="root"><\/div>|id="not-found-title"/)
    const photo = tags(main, 'img').find(img => img.src === '/assets/about/multi-device-repair.webp')
    assert.ok(photo)
    assert.ok(photo.alt.trim())
    assert.equal(photo.width, '1440')
    assert.equal(photo.height, '960')
    await access(new URL(`public${photo.src}`, root))
    const links = tags(main, 'a')
    for (const servicePath of servicePaths) {
      assert.ok(links.some(link => link.href === `${prefix}${servicePath}`), `Missing service link ${servicePath}`)
    }
    assert.ok(links.some(link => link.href === `${prefix}/contact/`), 'Missing contact page action')
    const mainText = decodeEntities(main.replace(/<[^>]+>/g, '')).toLowerCase()
    const copy = aboutPageCopy[locale]
    const hero = main.match(/<section\b[^>]*class="about-hero"[^>]*>([\s\S]*?)<\/section>/)?.[1]
    assert.ok(hero, 'Missing About hero')
    const heroParagraphs = [...hero.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)]
      .map(([, attrs, content]) => ({
        attributes: attributes(attrs),
        text: decodeEntities(content.replace(/<[^>]+>/g, '')).trim(),
      }))
    const heroLead = heroParagraphs.filter(paragraph => paragraph.attributes.class?.split(/\s+/).includes('about-hero__lead'))
    assert.equal(heroLead.length, 1)
    assert.equal(heroLead[0].text, copy.lead)
    const renderedIntro = heroParagraphs.filter(paragraph => copy.intro.includes(paragraph.text))
    assert.deepEqual(renderedIntro.map(paragraph => paragraph.text), copy.intro, 'Render both introductory paragraphs separately and in order')
    assert.doesNotMatch(decodeEntities(hero.replace(/<[^>]+>/g, ' ')), /RAID/i)
    assert.ok(mainText.includes(copy.approachTitle.toLowerCase()), 'Missing company profile heading')
    for (const paragraph of copy.story) assert.ok(mainText.includes(paragraph.toLowerCase()), 'Missing company profile text')
    for (const summary of Object.values(copy.serviceSummaries)) {
      assert.ok(mainText.includes(summary.toLowerCase()), `Missing compact service summary: ${summary}`)
    }
    const process = main.match(/<ol\b[^>]*class="about-process__steps"[^>]*>([\s\S]*?)<\/ol>/)?.[1]
    assert.ok(process, 'Missing repair process list')
    assert.equal((process.match(/<li\b/g) ?? []).length, 5)
    assert.deepEqual([...process.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)]
      .map(([, title]) => decodeEntities(title.replace(/<[^>]+>/g, '')).toLowerCase()), copy.steps.map(step => step.title.toLowerCase()))
    if (locale === 'en') assert.doesNotMatch(decodeEntities(main), georgian)
  })

  test(`${pathname} hero places homepage-style Services before Contact us with localized working links`, async () => {
    const html = await readPage()
    const hero = html.match(/<section\b[^>]*class="about-hero"[^>]*>([\s\S]*?)<\/section>/)?.[1]
    assert.ok(hero, 'Missing About hero')
    const groups = [...hero.matchAll(/<div\b([^>]*\bclass="[^"]*\babout-hero__actions\b[^"]*"[^>]*)>([\s\S]*?)<\/div>/g)]
    assert.equal(groups.length, 1, 'Hero must contain one action group')
    assert.ok(attributes(groups[0][1]).class.split(/\s+/).includes('hero__actions'), 'Hero actions must share the homepage layout class')
    const actions = [...groups[0][2].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
      .map(([, attrs, content]) => ({ attributes: attributes(attrs), content, text: decodeEntities(content.replace(/<[^>]+>/g, '')).trim().toLowerCase() }))
    assert.equal(actions.length, 2)
    const copy = aboutPageCopy[locale]
    assert.equal(copy.explore, locale === 'ka' ? 'ნახეთ სერვისები' : 'View services')
    assert.deepEqual(actions.map(action => action.text), [copy.explore.toLowerCase(), copy.contact.toLowerCase()], 'Services must come before Contact us')
    assert.deepEqual(actions.map(action => action.attributes.href), ['#about-services', `${prefix}/contact/`])
    const variants = ['button--primary', 'button--secondary']
    const icons = ['/assets/icons/arrow-right-white.svg', '/assets/icons/contact-red.svg']
    for (const [index, action] of actions.entries()) {
      const classes = action.attributes.class.split(/\s+/)
      assert.ok(classes.includes('button'), 'Hero action must share the homepage button class')
      assert.ok(classes.includes(variants[index]), `Missing ${variants[index]} style`)
      const images = tags(action.content, 'img')
      assert.equal(images.length, 1)
      assert.equal(images[0].src, icons[index])
      assert.equal(images[0].alt, '', 'Button icons must be decorative')
      await access(new URL(`public${icons[index]}`, root))
    }
    const targetElements = [...html.matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)]
      .filter(([tag]) => attributes(tag).id === 'about-services')
    assert.equal(targetElements.length, 1, 'Services action must resolve to one target')
    const servicesSection = tags(html, 'section').find(section => section.id === 'about-services')
    assert.ok(servicesSection, 'Services action must target the service section')
    assert.equal(servicesSection['aria-labelledby'], 'about-services-title')
  })

  test(`${pathname} renders one slim facts strip with four icon, value and label pairs`, async () => {
    const html = await readPage()
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const hero = main.match(/<section\b[^>]*class="about-hero"[^>]*>([\s\S]*?)<\/section>/)?.[1]
    assert.ok(hero)
    assert.equal(tags(hero, 'dl').filter(tag => tag.class?.split(/\s+/).includes('about-facts')).length, 1)
    assert.doesNotMatch(main, /class="about-highlight(?:s|\s|__|--|")/)
    const facts = hero.match(/<dl\b[^>]*class="about-facts"[^>]*>([\s\S]*?)<\/dl>/)?.[1]
    assert.ok(facts, 'Missing facts strip')
    assert.doesNotMatch(facts, /<(?:a|button|article)\b/)
    const entries = [...facts.matchAll(/<div\b[^>]*>([\s\S]*?)<\/div>/g)].map(([, content]) => content)
    assert.equal(entries.length, 4)
    for (const [index, fact] of aboutPageCopy[locale].facts.entries()) {
      const entry = entries[index]
      assert.equal(tags(entry, 'dt').length, 1, `${fact.value} needs one term`)
      assert.equal(tags(entry, 'dd').length, 1, `${fact.value} needs one description`)
      const pair = entry.match(/^\s*<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>\s*$/)
      assert.ok(pair, `${fact.value} must keep a term followed by its description`)
      assert.equal(decodeEntities(pair[1].replace(/<[^>]+>/g, '')).trim(), fact.value)
      assert.equal(tags(pair[1], 'span').filter(tag => tag.class?.split(/\s+/).includes('about-fact-icon')).length, 1)
      const icon = pair[1].match(/<span\b[^>]*class="about-fact-icon"[^>]*>([\s\S]*?)<\/span>/)?.[1]
      assert.ok(icon, `${fact.value} needs its icon`)
      assert.equal(tags(icon, 'svg').length, 1)
      assert.equal(tags(icon, 'svg')[0]['aria-hidden'], 'true')
      assert.deepEqual(tags(icon, 'path').map(path => path.d), factIconPaths[fact.icon], `${fact.value} must render the ${fact.icon} icon`)
      assert.doesNotMatch(pair[2], /<[^>]+>/, `${fact.value} should have a single plain-text label`)
      assert.equal(decodeEntities(pair[2]).trim(), fact.label, `${fact.value} must render its localized label`)
    }
  })

  test(`${pathname} displays an accessible linked location map`, async () => {
    const html = await readPage()
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const map = tags(main, 'img').find(img => img.src === '/assets/map/tecservice-map.jpg')
    assert.ok(map)
    assert.ok(map.alt.trim())
    assert.equal(map.loading, 'lazy')
    await access(new URL(`public${map.src}`, root))
    const mapLink = tags(main, 'a').find(link => link.href === 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7')
    assert.ok(mapLink)
    assert.ok(mapLink['aria-label'])
    assert.equal(mapLink.target, '_blank')
    assert.match(mapLink.rel, /noreferrer/)
    assert.doesNotMatch(main, /\/assets\/about\/service-center\.jpg|\/assets\/about-responsive-figma\.png/)
  })

  test(`${pathname} keeps header, footer and language-switch navigation on the correct routes`, async () => {
    const html = await readPage()
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0]
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]
    assert.ok(header)
    assert.ok(footer)
    const aboutLink = tags(header, 'a').find(link => link.href === pathname && !link.hreflang)
    assert.ok(aboutLink)
    assert.equal(aboutLink['aria-current'], 'page')
    assert.ok(tags(footer, 'a').some(link => link.href === pathname))
    for (const [language, href] of [['ka', '/about/'], ['en', '/en/about/']]) {
      assert.ok(tags(header, 'a').some(link => link.hreflang === language && link.href === href))
    }
    for (const link of tags(html, 'a')) {
      if (!link.href || /^(?:tel:|mailto:)/i.test(link.href)) continue
      const url = new URL(link.href, canonical)
      if (url.origin !== origin || /^\/(?:assets|api)\//.test(url.pathname)) continue
      assert.equal(url.pathname.startsWith('/en/'), (link.hreflang ?? locale) === 'en', link.href)
      assert.doesNotMatch(url.pathname, /^\/en\/en(?:\/|$)/)
    }
  })

  test(`${pathname} publishes localized AboutPage, business and breadcrumb structured data`, async () => {
    const html = await readPage()
    const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
      .filter(([, attrs]) => attributes(attrs).type === 'application/ld+json')
    assert.equal(scripts.length, 1)
    const document = JSON.parse(scripts[0][2])
    assert.equal(document['@context'], 'https://schema.org')
    const graph = document['@graph']
    const page = graph.find(item => item['@type'] === 'AboutPage')
    const website = graph.find(item => item['@type'] === 'WebSite')
    const business = graph.find(item => item['@type'] === 'LocalBusiness')
    const breadcrumb = graph.find(item => item['@type'] === 'BreadcrumbList')
    assert.ok(page)
    assert.ok(website)
    assert.ok(business)
    assert.ok(breadcrumb)
    assert.equal(page.url, canonical)
    assert.equal(page.inLanguage, locale)
    assert.equal(website.inLanguage, locale)
    assert.deepEqual(page.about, { '@id': business['@id'] })
    assert.equal(business.telephone, '+995591474040')
    assert.equal(business.hasMap, 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7')
    assert.deepEqual(breadcrumb.itemListElement.map(item => item.item), [`${origin}${prefix}/`, canonical])
    const saturday = business.openingHoursSpecification.find(hours => hours.dayOfWeek.includes('Saturday'))
    assert.equal(saturday.opens, '11:00')
    assert.equal(saturday.closes, '18:00')
    if (locale === 'en') assert.doesNotMatch(JSON.stringify(document), georgian)
    assert.ok(!graph.some(item => ['Person', 'Review', 'AggregateRating'].includes(item['@type'])))
  })
}

test('both About pages appear once in the built sitemap', async () => {
  const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8')
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url)
  for (const pathname of ['/about/', '/en/about/']) {
    assert.equal(urls.filter(url => url === `${origin}${pathname}`).length, 1)
  }
})
