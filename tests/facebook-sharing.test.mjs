import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { getBlogPosts } from '../src/data/blogPosts.ts'

const origin = 'https://tecservice.ge'
const root = new URL('../', import.meta.url)
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (/^#x/i.test(code)) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)]
  .map(([, name, value]) => [name.toLowerCase(), decode(value)]))
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]
  .map(([tag]) => attributes(tag))

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const homeHtml = await readFile(new URL(`dist${prefix}/index.html`, root), 'utf8')
  const homeMeta = tags(homeHtml.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)[0], 'meta')

  for (const post of getBlogPosts(locale)) {
    const path = `${prefix}/blog/${post.slug}/`
    const canonical = `${origin}${path}`

    test(`${path} Facebook sharing uses the localized article and its prerendered preview`, async () => {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const head = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0]
      assert.ok(head, 'Crawlers must receive metadata in the initial HTML head')
      assert.deepEqual(tags(head, 'link').filter(link => link.rel === 'canonical').map(link => link.href), [canonical])

      const shareLinks = tags(html, 'a').filter(link => link.class?.split(/\s+/).includes('journal-share-link'))
      assert.equal(shareLinks.length, 1, 'Each article must expose one Facebook share link')
      const shareUrl = new URL(shareLinks[0].href)
      assert.equal(shareUrl.origin, 'https://www.facebook.com')
      assert.equal(shareUrl.pathname, '/sharer/sharer.php')
      assert.deepEqual(shareUrl.searchParams.getAll('u'), [canonical], 'Share this localized article, including its trailing slash')
      assert.notEqual(shareUrl.searchParams.get('u'), `${origin}${prefix}/`)

      const meta = tags(head, 'meta')
      for (const [property, expected] of [
        ['og:url', canonical],
        ['og:type', 'article'],
        ['og:title', `${post.title} | TECSERVICE`],
        ['og:description', post.excerpt],
        ['og:image', `${origin}${post.image}`],
      ]) {
        const matches = meta.filter(tag => tag.property === property)
        assert.equal(matches.length, 1, `${property} must appear exactly once`)
        assert.equal(matches[0].content, expected, `${property} must describe the article`)
        if (property === 'og:title') {
          assert.notEqual(matches[0].content, homeMeta.find(tag => tag.property === property)?.content,
            `${property} must not reuse the homepage preview`)
        }
      }

      const image = new URL(meta.find(tag => tag.property === 'og:image').content)
      assert.equal(image.origin, origin)
      assert.notEqual(image.href, `${origin}${prefix}/`)
      assert.match(image.pathname, /^\/assets\/blog\//)
      const imageFile = await stat(new URL(`dist${image.pathname}`, root))
      assert.ok(imageFile.isFile() && imageFile.size > 0, 'The deployable build must contain the article sharing image')
    })
  }
}
