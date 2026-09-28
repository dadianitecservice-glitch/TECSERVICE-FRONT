import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import { assertImageFormat } from './helpers/image-format.mjs'

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

function webpDimensions(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF')
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP')
  assert.equal(bytes.readUInt32LE(4) + 8, bytes.length, 'The WebP container must not be truncated')
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const chunk = bytes.toString('ascii', offset, offset + 4)
    const length = bytes.readUInt32LE(offset + 4)
    const data = offset + 8
    assert.ok(data + length <= bytes.length, 'WebP chunks must fit in the image file')
    if (chunk === 'VP8X') return [bytes.readUIntLE(data + 4, 3) + 1, bytes.readUIntLE(data + 7, 3) + 1]
    if (chunk === 'VP8 ') return [bytes.readUInt16LE(data + 6) & 0x3fff, bytes.readUInt16LE(data + 8) & 0x3fff]
    if (chunk === 'VP8L') {
      const packed = bytes.readUInt32LE(data + 1)
      return [(packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1]
    }
    offset = data + length + (length % 2)
  }
  assert.fail('The WebP image must contain readable dimensions')
}

test('sharing image validation rejects JPEG content disguised as PNG', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0])
  assert.equal(assertImageFormat('/photo.jpg', jpeg), 'image/jpeg')
  assert.equal(assertImageFormat('/photo.jpeg', jpeg), 'image/jpeg')
  assert.throws(() => assertImageFormat('/photo.png', jpeg), /extension must match/)
  assert.throws(() => assertImageFormat('/photo.webp', jpeg), /extension must match/)
  assert.throws(() => assertImageFormat('/photo.jpg', Buffer.from('<html>')), /unrecognized image bytes/)
})

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const homeHtml = await readFile(new URL(`dist${prefix}/index.html`, root), 'utf8')
  const homeMeta = tags(homeHtml.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)[0], 'meta')

  test(`${locale} every article uses a genuine WebP cover with the same format contract as the SD-card article`, async () => {
    const posts = getBlogPosts(locale)
    const sdCard = posts.find(post => post.slug === 'sd-card-photo-recovery-for-photographers')
    assert.ok(sdCard)
    assert.equal(sdCard.image, '/assets/blog/sd-card-photo-recovery.webp', 'Keep the existing SD-card cover unchanged')
    for (const post of posts) {
      assert.match(post.image, /^\/assets\/blog\/[a-z0-9-]+\.webp$/, post.slug)
      assert.doesNotMatch(post.image, /-figma|\.(?:png|jpe?g)$/i, post.slug)
      const bytes = await readFile(new URL(`public${post.image}`, root))
      assert.equal(assertImageFormat(post.image, bytes), 'image/webp', post.slug)
      const dimensions = webpDimensions(bytes)
      assert.ok(dimensions.every(value => Number.isInteger(value) && value > 0), post.slug)
      assert.deepEqual([post.imageWidth, post.imageHeight], dimensions, `${post.slug}: declared dimensions match the selected current cover`)
      assert.ok(post.imageAlt.trim(), `${post.slug}: cover has a meaningful localized alternative text`)
      assert.equal(getBlogPosts('ka').find(item => item.slug === post.slug)?.image, post.image, 'Both languages share the same selected photograph')
    }
  })

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
      const sidebar = html.match(/<aside\b[^>]*class="journal-sidebar"[^>]*>[\s\S]*?<\/aside>/)?.[0]
      assert.ok(sidebar, 'Sharing remains in the article sidebar')
      assert.equal(tags(sidebar, 'a').filter(link => link['data-share'] === 'facebook').length, 1)
      assert.equal(shareLinks[0]['data-share'], 'facebook')
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
        ['og:image:width', String(post.imageWidth)],
        ['og:image:height', String(post.imageHeight)],
        ['og:image:alt', post.imageAlt],
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
      const imageBytes = await readFile(new URL(`dist${image.pathname}`, root))
      const imageType = assertImageFormat(image.pathname, imageBytes)
      assert.equal(imageType, 'image/webp', 'Every blog preview uses the same real WebP encoding as the SD-card post')
      assert.deepEqual(webpDimensions(imageBytes), [post.imageWidth, post.imageHeight])
      const typeTags = meta.filter(tag => tag.property === 'og:image:type')
      assert.deepEqual(typeTags.map(tag => tag.content), [imageType], 'Exactly one declared MIME type must match the actual image bytes')
      assert.deepEqual(imageBytes, await readFile(new URL(`public${post.image}`, root)), 'The build must preserve the selected article photograph')
      const articleImage = tags(html, 'img').find(tag => tag.src === post.image && tag.fetchpriority?.toLowerCase() === 'high')
      assert.ok(articleImage, 'The sharing preview must use the actual article hero image')
    })
  }
}
