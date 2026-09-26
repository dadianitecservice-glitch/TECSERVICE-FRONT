import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { blogCategories, getBlogPosts } from '../src/data/blogPosts.ts'
import { blogPageCopy } from '../src/data/blogPageCopy.ts'
import { getRouteMetadata } from '../src/utils/routes.ts'
import { getBlogStructuredData } from '../src/seo/blogStructuredData.ts'

const root = new URL('../', import.meta.url)
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const visibleText = html => decode(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim()
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), decode(value)]))

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const path = `${prefix}/blog/`
  const title = locale === 'en' ? 'News' : 'სიახლეები'
  const copy = blogPageCopy[locale]
  const posts = getBlogPosts(locale)

  test(`${path} compact index has a News heading and only one short introduction without a featured block`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const headings = [...main.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
    assert.equal(headings.length, 1)
    assert.equal(visibleText(headings[0][1]), title)
    assert.equal(copy.indexTitle, title)
    const intro = main.match(/<section\b[^>]*class="[^"]*\bjournal-intro\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0]
    assert.ok(intro)
    const paragraphs = [...intro.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(([, paragraph]) => visibleText(paragraph))
    assert.deepEqual(paragraphs, [copy.description])
    assert.doesNotMatch(main, /class="[^"]*\bjournal-(?:featured|eyebrow)(?:\b|__)/)
  })

  test(`${path} displays every existing article as the same compact card without excerpts or reading-time text`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const cards = [...main.matchAll(/<article\b[^>]*class="([^"]*\bjournal-card\b[^"]*)"[^>]*>[\s\S]*?<\/article>/g)]
    assert.equal(cards.length, posts.length)
    assert.equal(new Set(cards.map(([, classes]) => classes)).size, 1)
    for (const post of posts) {
      const href = `${prefix}/blog/${post.slug}/`
      const matchingCards = cards.filter(([card]) => card.includes(`href="${href}"`))
      assert.equal(matchingCards.length, 1, `${href} should appear in one equal card`)
      const card = matchingCards[0][0]
      assert.ok(visibleText(card).includes(post.title), `${href} keeps its readable article title`)
      assert.ok(card.includes(`src="${post.image}"`), `${href} keeps its article image`)
      assert.match(card, new RegExp(`<time\\b[^>]*datetime="${post.dateTime}"`, 'i'), `${href} keeps its publication date`)
      assert.equal(visibleText(card).includes(post.excerpt), false, `${href} has no index excerpt`)
      assert.equal(visibleText(card).includes(copy.minutes(post.readMinutes)), false, `${href} has no index reading time`)
      assert.doesNotMatch(card, /<p\b/)
    }
    assert.match(main, /<input\b[^>]*type="search"/)
    assert.match(main, /class="journal-filters"[^>]*role="group"/)
  })

  test(`${path} integrates the result count into the active filter while preserving a screen-reader-only live status`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const filters = main.match(/<div\b[^>]*class="journal-filters"[^>]*>([\s\S]*?)<\/div>/)?.[0]
    assert.ok(filters)
    const group = attributes(filters.match(/^<div\b[^>]*>/)[0])
    assert.equal(group.role, 'group')
    assert.equal(group['aria-label'], copy.categories)
    const buttons = [...filters.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
    assert.equal(buttons.length, blogCategories.length + 1)
    for (const [index, [, opening, content]] of buttons.entries()) {
      const button = attributes(opening)
      assert.equal(button.type, 'button')
      assert.equal(button['aria-pressed'], index === 0 ? 'true' : 'false')
      assert.ok(main.includes(`id="${button['aria-controls']}"`))
      const badges = [...content.matchAll(/<span\b[^>]*class="[^"]*\bjournal-filter-count\b[^"]*"[^>]*>([\s\S]*?)<\/span>/g)]
      assert.equal(badges.length, index === 0 ? 1 : 0, 'Only the initially active filter shows its count')
      if (index === 0) {
        assert.equal(attributes(badges[0][0])['aria-hidden'], 'true')
        assert.equal(visibleText(badges[0][1]), String(posts.length))
        assert.equal(visibleText(content.replace(badges[0][0], '')), copy.all)
      } else {
        assert.equal(visibleText(content), blogCategories[index - 1].label[locale])
      }
    }
    const status = main.match(/<p\b[^>]*role="status"[^>]*>[\s\S]*?<\/p>/)?.[0]
    assert.ok(status)
    const statusAttributes = attributes(status.match(/^<p\b[^>]*>/)[0])
    assert.equal(statusAttributes['aria-live'], 'polite')
    assert.ok(statusAttributes.class.split(/\s+/).includes('journal-sr-only'))
    assert.equal(visibleText(status), copy.articleCount(posts.length))
    assert.equal(visibleText(main.replace(status, '')).includes(copy.articleCount(posts.length)), false, 'No separate visible result-count line returns')
  })

  test(`${path} mobile topics use a labelled collapsed button connected to the existing category group, not a native select`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const toggles = [...main.matchAll(/<button\b[^>]*class="[^"]*\bjournal-topic-toggle\b[^"]*"[^>]*>([\s\S]*?)<\/button>/g)]
    assert.equal(toggles.length, 1)
    const [toggle, content] = toggles[0]
    const toggleAttributes = attributes(toggle.match(/^<button\b[^>]*>/)[0])
    assert.equal(toggleAttributes.type, 'button')
    assert.equal(toggleAttributes['aria-expanded'], 'false')
    assert.ok(toggleAttributes['aria-controls'])
    const groups = [...main.matchAll(/<div\b[^>]*class="journal-filters"[^>]*>/g)]
    assert.equal(groups.length, 1)
    const group = attributes(groups[0][0])
    assert.equal(toggleAttributes['aria-controls'], group.id)
    assert.equal(group.role, 'group')
    assert.equal(group['aria-label'], copy.categories)
    const prefix = content.match(/<span\b[^>]*class="journal-sr-only"[^>]*>[\s\S]*?<\/span>/)?.[0]
    assert.ok(prefix)
    assert.equal(visibleText(prefix), `${copy.categories}:`)
    const badge = content.match(/<span\b[^>]*class="journal-filter-count"[^>]*>[\s\S]*?<\/span>/)?.[0]
    assert.ok(badge)
    assert.equal(attributes(badge)['aria-hidden'], 'true')
    assert.equal(visibleText(badge), String(posts.length))
    assert.equal(visibleText(content.replace(prefix, '').replace(badge, '')), copy.all)
    assert.doesNotMatch(main, /<select\b/)
  })

  test(`${path} News metadata and navigation stay unchanged while compact article headers keep date and sharing above the image`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const metadata = getRouteMetadata(path)
    assert.equal(metadata.canonical, `https://tecservice.ge${path}`)
    assert.equal(metadata.title, locale === 'en' ? 'News and practical tips | TECSERVICE' : 'სიახლეები და პრაქტიკული რჩევები | TECSERVICE')
    assert.doesNotMatch(metadata.description, /discount|special offer|sale|ფასდაკლება|შეთავაზება/i)
    assert.equal(visibleText(html.match(/<title>([\s\S]*?)<\/title>/)[1]), metadata.title)
    const graph = getBlogStructuredData(path)['@graph']
    assert.equal(graph.find(node => node['@type'] === 'Blog').name, title)
    const structured = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])
    assert.deepEqual(structured, getBlogStructuredData(path))
    const blogLabel = locale === 'en' ? 'Blog' : 'ბლოგი'
    for (const element of ['header', 'footer']) {
      const region = html.match(new RegExp(`<${element}\\b[\\s\\S]*?<\\/${element}>`))[0]
      const links = [...region.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)]
      const link = links.find(([tag, href]) => href === path && !/\bhreflang=/i.test(tag))
      assert.ok(link, `${element} retains its Blog route`)
      assert.equal(visibleText(link[2]).toLocaleLowerCase(), blogLabel.toLocaleLowerCase())
    }
    const article = posts[0]
    const articlePath = `${prefix}/blog/${article.slug}/`
    const articleHtml = await readFile(new URL(`dist${articlePath}index.html`, root), 'utf8')
    const articleMain = articleHtml.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(articleMain)
    assert.equal(getRouteMetadata(articlePath).title, `${article.title} | TECSERVICE`)
    assert.equal(getRouteMetadata(articlePath).description, article.excerpt)
    const articleHeading = articleMain.match(/<header\b[^>]*class="journal-article-heading"[^>]*>([\s\S]*?)<\/header>/)?.[1]
    assert.ok(articleHeading)
    assert.equal(visibleText(articleHeading.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1]), article.title)
    assert.match(articleHeading, /class="journal-article-meta"/)
    assert.match(articleHeading, /class="journal-share-link"/)
    assert.match(articleHeading, new RegExp(`<time\\b[^>]*datetime="${article.dateTime}"`, 'i'))
    assert.ok(articleMain.indexOf('class="journal-article-meta"') < articleMain.indexOf('class="journal-article-image"'))
    assert.doesNotMatch(articleHeading, /<p\b|journal-card__meta|journal-byline|journal-author-mark/)
    const articleSchema = getBlogStructuredData(articlePath)['@graph'].find(node => node['@type'] === 'BlogPosting')
    assert.equal(articleSchema.description, article.excerpt, 'Removing the visible header excerpt does not erase article metadata')
  })
}
