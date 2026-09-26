import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import { blogPageCopy } from '../src/data/blogPageCopy.ts'

const root = new URL('../', import.meta.url)
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), decode(value)]))
const visibleText = html => decode(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim()
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function elementById(html, id) {
  const opening = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bid="${escapePattern(id)}"[^>]*>`, 'i').exec(html)
  if (!opening) return null
  const tagName = opening[1]
  const tags = new RegExp(`<(/?)${tagName}\\b[^>]*>`, 'gi')
  tags.lastIndex = opening.index + opening[0].length
  let depth = 1
  for (let tag = tags.exec(html); tag; tag = tags.exec(html)) {
    depth += tag[1] ? -1 : 1
    if (depth === 0) return html.slice(opening.index, tags.lastIndex)
  }
  return null
}

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const posts = getBlogPosts(locale)
  const copy = blogPageCopy[locale]
  const indexPath = `${prefix}/blog/`

  test(`${indexPath} polished cards offer one keyboard-accessible whole-card link named by its article heading`, async () => {
    for (const path of [indexPath, ...posts.map(post => `${prefix}/blog/${post.slug}/`)]) {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const cards = [...html.matchAll(/<article\b[^>]*class="[^"]*\bjournal-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/g)]
      assert.equal(cards.length, path === indexPath ? 10 : 3, `${path} retains its index or related cards`)
      const headingIds = new Set()
      for (const [card] of cards) {
        assert.equal((card.match(/<a\b/g) ?? []).length, 1, `${path}: cards do not contain nested or duplicate links`)
        const links = [...card.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)]
        assert.equal(links.length, 1, `${path}: a card should have one link and one keyboard stop`)
        const link = links[0][0]
        const anchor = attributes(link.match(/^<a\b[^>]*>/)[0])
        assert.ok(anchor['aria-labelledby'], `${path}: card link is named by its heading`)
        assert.ok(anchor.tabindex === undefined || anchor.tabindex === '0', `${path}: normal keyboard navigation is preserved`)
        assert.notEqual(anchor['aria-hidden'], 'true')
        const heading = elementById(link, anchor['aria-labelledby'])
        assert.ok(heading, `${path}: the labelled heading belongs inside its whole-card link`)
        assert.match(heading, /^<h[2-6]\b/)
        assert.equal(headingIds.has(anchor['aria-labelledby']), false, `${path}: heading ids are unique`)
        headingIds.add(anchor['aria-labelledby'])
        const post = posts.find(item => anchor.href === `${prefix}/blog/${item.slug}/`)
        assert.ok(post, `${path}: card opens an existing localized article`)
        assert.equal(visibleText(heading), post.title)
        assert.match(link, /<img\b/)
        assert.match(link, /<time\b/)
        assert.doesNotMatch(card, /<(?:button|input|select|textarea)\b/)
        const images = [...card.matchAll(/<img\b[^>]*>/g)]
        assert.equal(images.length, 1)
        assert.equal(attributes(images[0][0]).alt, '', `${path}: image is decorative beside the article heading`)
        const icons = [...card.matchAll(/<svg\b[^>]*>/g)]
        assert.ok(icons.length > 0, `${path}: visual arrow remains present`)
        for (const [icon] of icons) assert.equal(attributes(icon)['aria-hidden'], 'true', `${path}: arrow does not duplicate the link name`)
      }
    }
  })

  test(`${indexPath} search is labelled and explicitly controls the live results region`, async () => {
    const html = await readFile(new URL(`dist${indexPath}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    const inputs = [...main.matchAll(/<input\b[^>]*>/g)].map(([tag]) => attributes(tag)).filter(input => input.type === 'search')
    assert.equal(inputs.length, 1)
    const input = inputs[0]
    assert.ok(input.id)
    const label = [...main.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/g)].find(([tag]) => attributes(tag.match(/^<label\b[^>]*>/)[0]).for === input.id)
    assert.ok(label, 'Search has an explicit label, not just a placeholder')
    assert.equal(visibleText(label[0]), copy.search)
    assert.ok(input['aria-controls'], 'Search identifies its result region')
    const results = elementById(main, input['aria-controls'])
    assert.ok(results)
    for (const post of posts) assert.ok(results.includes(`href="${prefix}/blog/${post.slug}/"`))
    const status = main.match(/<([a-z][a-z0-9]*)\b[^>]*role="status"[^>]*>[\s\S]*?<\/\1>/)?.[0]
    assert.ok(status)
    assert.equal(attributes(status.match(/^<[^>]*>/)[0])['aria-live'], 'polite')
    assert.equal(visibleText(status), copy.articleCount(posts.length))
  })

  test(`${indexPath} usability polish does not restore the oversized feature or verbose card copy`, async () => {
    const html = await readFile(new URL(`dist${indexPath}index.html`, root), 'utf8')
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
    assert.ok(main)
    assert.doesNotMatch(main, /class="[^"]*\bjournal-(?:featured|eyebrow)(?:\b|__)/)
    const cards = [...main.matchAll(/<article\b[^>]*class="[^"]*\bjournal-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/g)]
    assert.equal(cards.length, 10)
    for (const [card] of cards) assert.doesNotMatch(card, /<p\b/)
    const content = visibleText(main)
    for (const post of posts) {
      assert.equal(content.includes(post.excerpt), false)
      assert.equal(content.includes(copy.minutes(post.readMinutes)), false)
    }
  })
}
