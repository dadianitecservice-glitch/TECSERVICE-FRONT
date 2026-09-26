import test from 'node:test'
import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { blogCategories, blogPosts, getBlogPost, getBlogPosts } from '../src/data/blogPosts.ts'

const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const preserved = [
  ['lost-files-first-minutes', 'lost-files-first-minutes', '2026-09-04', 'data-recovery-figma.png', 849, 565],
  ['five-reasons-laptop-is-slow', 'five-reasons-laptop-is-slow', '2026-09-01', 'laptop-repair-figma.png', 2000, 1334],
  ['console-overheating', 'console-overheating-signs-and-prevention', '2026-08-28', 'console-repair-figma.png', 800, 533],
  ['choose-right-ssd', 'choose-the-right-ssd-for-your-laptop', '2026-08-24', 'ssd-figma.png', 1000, 1000],
  ['drone-care', 'drone-care-before-and-after-flight', '2026-08-19', 'drone-repair-figma.png', 800, 533],
  ['computer-shuts-down-under-load', 'why-computer-shuts-down-under-load', '2026-08-14', 'ssd-figma.png', 1000, 1000],
  ['data-recovery-after-formatting', 'data-recovery-after-formatting', '2026-08-09', 'data-recovery-figma.png', 849, 565],
  ['xbox-controller-problems', 'common-xbox-controller-problems', '2026-08-03', 'console-repair-figma.png', 800, 533],
  ['laptop-battery-replacement-signs', 'laptop-battery-replacement-signs', '2026-07-28', 'laptop-repair-figma.png', 2000, 1334],
  ['raid-first-steps', 'first-steps-after-raid-failure', '2026-07-21', 'data-recovery-figma.png', 849, 565],
]

test('The 10 original articles preserve their identities, publication dates and image metadata', async () => {
  assert.equal(blogPosts.length, 10)
  assert.deepEqual(blogPosts, getBlogPosts('ka'))
  for (const locale of ['ka', 'en']) {
    const posts = getBlogPosts(locale)
    assert.deepEqual(posts.map(post => [post.id, post.slug, post.dateTime, post.image.split('/').at(-1), post.imageWidth, post.imageHeight]), preserved)
    assert.equal(new Set(posts.map(post => post.slug)).size, posts.length)
    for (const post of posts) {
      assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      assert.equal(new Date(post.dateTime).toISOString().slice(0, 10), post.dateTime)
      await access(new URL(`../public${post.image}`, import.meta.url))
    }
  }
})

test('Every category and service association is explicit and localised', () => {
  assert.deepEqual(blogCategories.map(category => category.id), ['data', 'laptops', 'consoles', 'components', 'drones', 'computers'])
  const services = new Set(['laptop-repair', 'computer-repair', 'data-recovery', 'console-repair', 'drone-repair'])
  for (const locale of ['ka', 'en']) {
    for (const post of getBlogPosts(locale)) {
      const category = blogCategories.find(category => category.id === post.categoryId)
      assert.ok(category, `${post.id}: category exists`)
      assert.equal(post.category, category.label[locale])
      assert.match(post.serviceHref, /^\/services\/[a-z-]+\/$/)
      assert.ok(services.has(post.serviceHref.split('/')[2]))
      assert.ok(Number.isInteger(post.readMinutes) && post.readMinutes >= 1 && post.readMinutes <= 10)
    }
  }
})

test('Both languages contain substantial, unique article bodies with usable section anchors', () => {
  for (const locale of ['ka', 'en']) {
    const bodies = new Set()
    for (const post of getBlogPosts(locale)) {
      assert.ok(post.sections.length >= 3 && post.sections.length <= 4, post.id)
      assert.equal(new Set(post.sections.map(section => section.id)).size, post.sections.length)
      assert.ok(post.takeaway.length >= 70, `${post.id}: useful takeaway`)
      const paragraphs = []
      for (const section of post.sections) {
        assert.match(section.id, /^[a-z][a-z0-9-]*$/)
        assert.ok(section.title.trim().length > 3)
        assert.ok(section.paragraphs.length > 0)
        for (const paragraph of section.paragraphs) {
          assert.ok(paragraph.trim().length >= 60, `${post.id}/${section.id}: substantive paragraph`)
          paragraphs.push(paragraph)
        }
        for (const bullet of section.bullets ?? []) {
          assert.ok(bullet.trim().length > 10)
          paragraphs.push(bullet)
        }
      }
      const body = paragraphs.join(' ')
      assert.ok(body.split(/\s+/u).length >= (locale === 'ka' ? 160 : 185), `${locale}/${post.id}: enough original content`)
      assert.doesNotMatch(body, /lorem ipsum|coming soon|placeholder|TODO/i)
      bodies.add(body)
    }
    assert.equal(bodies.size, 10, `${locale}: no repeated article bodies`)
  }
})

test('English articles translate every public text field without changing article identity', () => {
  const english = getBlogPosts('en')
  for (let index = 0; index < english.length; index++) {
    const post = english[index]
    for (const key of ['title', 'excerpt', 'category', 'date', 'imageAlt', 'takeaway']) {
      assert.doesNotMatch(post[key], georgian, `${post.id}/${key}`)
      assert.notEqual(post[key], blogPosts[index][key], `${post.id}/${key}: translated`)
    }
    assert.doesNotMatch(JSON.stringify(post.sections), georgian, `${post.id}: English body`)
    assert.doesNotMatch(JSON.stringify(post.sources), georgian, `${post.id}: English source labels`)
    assert.deepEqual(post.sections.map(section => section.id), blogPosts[index].sections.map(section => section.id))
    assert.match(blogPosts[index].title, georgian)
    assert.equal(post.dateTime, blogPosts[index].dateTime)
  }
})

test('Manufacturer references are HTTPS links with translated, meaningful labels', () => {
  const primaryDomains = ['microsoft.com', 'seagate.com', 'dell.com', 'playstation.com', 'kingston.com', 'crucial.com', 'djicdn.com', 'dji.com', 'xbox.com', 'hp.com', 'synology.com']
  for (const locale of ['ka', 'en']) {
    for (const post of getBlogPosts(locale)) {
      assert.ok(post.sources.length > 0, post.id)
      for (const source of post.sources) {
        const url = new URL(source.url)
        assert.equal(url.protocol, 'https:')
        assert.ok(primaryDomains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`)), source.url)
        assert.ok(source.label.length > 10)
      }
    }
  }
})

test('Article lookup returns the requested locale and rejects unrecognised slugs', () => {
  const slug = 'console-overheating-signs-and-prevention'
  assert.deepEqual(getBlogPost(slug), blogPosts[2])
  assert.deepEqual(getBlogPost(slug, 'en'), getBlogPosts('en')[2])
  assert.equal(getBlogPost('not-a-real-article'), undefined)
  assert.equal(getBlogPost('console-overheating'), undefined, 'Lookup uses slug, not a mismatched ID')
  assert.equal(getBlogPost(`${slug}/`), undefined, 'Routing normalisation belongs to the route layer')
})

test('Data-loss and battery advice retain their key safety limits in both languages', () => {
  for (const locale of ['ka', 'en']) {
    const formatting = getBlogPost('data-recovery-after-formatting', locale)
    const raid = getBlogPost('first-steps-after-raid-failure', locale)
    const battery = getBlogPost('laptop-battery-replacement-signs', locale)
    assert.match(formatting.takeaway, locale === 'ka' ? /გარანტირებული არ არის/ : /never guaranteed/)
    assert.match(JSON.stringify(formatting.sections), /TRIM/)
    assert.match(JSON.stringify(raid.sections), locale === 'ka' ? /უსაფრთხო არ არის/ : /safe universal instruction/)
    assert.match(battery.takeaway, locale === 'ka' ? /შეწყვიტეთ/ : /Stop using and charging/)
  }
})
