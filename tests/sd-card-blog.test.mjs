import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { getBlogPost, getBlogPosts } from '../src/data/blogPosts.ts'
import { blogSlugs } from '../src/data/blogSlugs.ts'
import { getRouteMetadata } from '../src/utils/routes.ts'
import { getBlogStructuredData } from '../src/seo/blogStructuredData.ts'
import { matchesBlogQuery } from '../src/utils/blogSearch.ts'

const slug = 'sd-card-photo-recovery-for-photographers'
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const removedSourceUrls = [
  'https://www.sony.co.uk/electronics/support/e-mount-body-ilce-6000-series/ilce-6400ak/articles/00338204',
  'https://www.sdcard.org/press/thoughtleadership/lost-data-and-sd-memory-cards-a-primer/',
  'https://www.sdcard.org/downloads/formatter/faq/',
  'https://cam.start.canon/en/C004/manual/html/UG-07_Set-up_0070.html',
  'https://support.d-imaging.sony.co.jp/support/memorycard/datarescue/en/index.html',
  'https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/setting-up-the-dual-card-slots-in-the-z-5-mirrorless-camera',
]
const orderedSections = ['missing-photos', 'first-steps', 'card-damage', 'avoid-mistakes', 'recoverable-formats', 'assessment', 'next-shoot', 'get-help']
const prose = post => [post.takeaway, ...post.sections.flatMap(section => [section.title, ...section.paragraphs, ...(section.bullets ?? [])])].join('\n')

test('The SD card guide is the latest published article with a local recovery-service destination and cover', async () => {
  assert.equal(blogSlugs[0], slug)
  assert.equal(blogSlugs.filter(value => value === slug).length, 1)
  for (const locale of ['ka', 'en']) {
    const post = getBlogPost(slug, locale)
    assert.ok(post)
    assert.equal(getBlogPosts(locale)[0].slug, slug)
    assert.equal(post.id, slug)
    assert.equal(post.dateTime, '2026-09-26')
    assert.equal(post.categoryId, 'data')
    assert.equal(post.serviceHref, '/services/data-recovery/')
    assert.equal(post.readMinutes, 6)
    assert.equal(post.image, '/assets/blog/sd-card-photo-recovery.webp')
    assert.deepEqual([post.imageWidth, post.imageHeight], [1280, 720])
    await access(new URL(`../public${post.image}`, import.meta.url))
  }
})

test('The photographer guide has eight matching, ordered sections and complete bilingual public copy', () => {
  const georgianPost = getBlogPost(slug, 'ka')
  const englishPost = getBlogPost(slug, 'en')
  assert.ok(georgianPost && englishPost)
  const sectionIds = georgianPost.sections.map(section => section.id)
  assert.equal(sectionIds.length, 8)
  assert.equal(new Set(sectionIds).size, 8)
  assert.deepEqual(sectionIds, orderedSections)
  assert.deepEqual(englishPost.sections.map(section => section.id), sectionIds)
  for (const id of sectionIds) assert.match(id, /^[a-z][a-z0-9-]*$/)
  for (const field of ['title', 'excerpt', 'imageAlt', 'takeaway']) {
    assert.match(georgianPost[field], georgian, `${field}: Georgian copy`)
    assert.doesNotMatch(englishPost[field], georgian, `${field}: translated English copy`)
    assert.notEqual(englishPost[field], georgianPost[field])
  }
  assert.doesNotMatch(JSON.stringify(englishPost.sections), georgian)
  for (const post of [georgianPost, englishPost]) {
    assert.match(post.title, /SD/i)
    assert.ok(post.sections.every(section => section.paragraphs.length > 0))
    assert.ok(prose(post).split(/\s+/u).length >= 350, 'A substantial guide rather than a teaser')
    assert.match(prose(post), /RAW|JPEG/i, 'Addresses photographic file formats')
    assert.doesNotMatch(prose(post), /lorem ipsum|coming soon|placeholder|TODO/i)
  }
})

test('The SD guide retains stop-writing, no-formatting and qualified recovery advice in both languages', () => {
  const ka = prose(getBlogPost(slug, 'ka'))
  const en = prose(getBlogPost(slug, 'en'))
  assert.match(ka, /(?:შეწყვიტეთ|შეაჩერეთ)[^.\n]*(?:გადაღება|ჩაწერა)/u, 'Stop activity that can overwrite missing photos')
  assert.match(en, /(?:stop|do not|don['’]t)[^.\n]*(?:shooting|taking|recording|writ)/i)
  assert.match(ka, /(?:არ|ნუ)[^.\n]*(?:დააფორმატ|ფორმატირ)/u, 'Do not format the affected card')
  assert.match(en, /(?:do not|don['’]t|never)[^.\n]*format/i)
  assert.match(ka, /(?:გარანტირებული\s+არ\s+არის|არ\s+არის\s+გარანტირებული)/u, 'Explicitly rejects a guaranteed recovery outcome')
  assert.match(en, /(?:never|not)\s+guaranteed|cannot\s+be\s+guaranteed/i)
  assert.doesNotMatch(en, /(?:we|tecservice)\s+(?:always\s+)?(?:guarantee|will recover)\s+(?:all|every|100)/i)
  assert.doesNotMatch(ka, /(?:გარანტირებულად\s+აღვადგენთ|ყველა\s+ფაილს\s+აღვადგენთ)/u)
})

test('The SD guide deliberately omits public external references in both languages while existing articles keep theirs', () => {
  for (const locale of ['ka', 'en']) {
    assert.deepEqual(getBlogPost(slug, locale).sources, [])
    assert.ok(getBlogPost('lost-files-first-minutes', locale).sources.length > 0)
  }
})

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const path = `${prefix}/blog/${slug}/`

  test(`${path} exposes its own indexable metadata, article schema and searchable photographic content`, () => {
    const post = getBlogPost(slug, locale)
    const metadata = getRouteMetadata(path)
    assert.ok(post && metadata)
    assert.equal(metadata.canonical, `https://tecservice.ge${path}`)
    assert.equal(metadata.title, `${post.title} | TECSERVICE`)
    assert.equal(metadata.description, post.excerpt)
    assert.equal(metadata.image, `https://tecservice.ge${post.image}`)
    assert.equal(metadata.imageAlt, post.imageAlt)
    assert.match(metadata.robots, /^index, follow/)
    const article = getBlogStructuredData(path)['@graph'].find(node => node['@type'] === 'BlogPosting')
    assert.equal(article.datePublished, '2026-09-26')
    assert.equal(article.inLanguage, locale)
    assert.equal(article.url, metadata.canonical)
    assert.equal(article.headline, post.title)
    assert.ok(article.articleBody.includes(post.sections.at(-1).paragraphs[0]))
    assert.equal(matchesBlogQuery(post, 'SD'), true)
    assert.equal(matchesBlogQuery(post, 'RAW'), true)
    assert.equal(matchesBlogQuery(post, locale === 'ka' ? 'ფოტო' : 'photo'), true)
  })

  test(`${path} rendered SD guide omits its additional source links while existing articles retain theirs`, async () => {
    const html = await readFile(new URL(`../dist${path}index.html`, import.meta.url), 'utf8')
    assert.doesNotMatch(html, /class="[^"]*\bjournal-sources\b[^"]*"/)
    const hrefs = [...html.matchAll(/\bhref="([^"]*)"/g)].map(([, href]) => href)
    for (const sourceUrl of removedSourceUrls) assert.ok(!hrefs.includes(sourceUrl), `${path}: removed source link must not reappear`)

    const existingPath = `${prefix}/blog/lost-files-first-minutes/`
    const existingHtml = await readFile(new URL(`../dist${existingPath}index.html`, import.meta.url), 'utf8')
    assert.match(existingHtml, /class="[^"]*\bjournal-sources\b[^"]*"/)
    for (const source of getBlogPost('lost-files-first-minutes', locale).sources) {
      assert.ok(existingHtml.includes(`href="${source.url}"`), `${existingPath}: existing reference remains available`)
    }
  })
}
