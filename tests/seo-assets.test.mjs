import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8')
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => new URL(url).pathname)

function imageDimensions(buffer) {
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
  }
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const type = buffer.toString('ascii', offset, offset + 4)
      const length = buffer.readUInt32LE(offset + 4)
      const data = offset + 8
      if (type === 'VP8X') return [buffer.readUIntLE(data + 4, 3) + 1, buffer.readUIntLE(data + 7, 3) + 1]
      if (type === 'VP8 ') return [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff]
      if (type === 'VP8L') {
        const dimensions = buffer.readUInt32LE(data + 1)
        return [(dimensions & 0x3fff) + 1, ((dimensions >>> 14) & 0x3fff) + 1]
      }
      offset += 8 + length + (length % 2)
    }
  }
  if (buffer.readUInt16BE(0) === 0xffd8) {
    for (let offset = 2; offset + 4 < buffer.length;) {
      if (buffer[offset++] !== 0xff) continue
      const marker = buffer[offset++]
      if (marker === 0xd9 || marker === 0xda) break
      if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
      const length = buffer.readUInt16BE(offset)
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return [buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3)]
      }
      offset += length
    }
  }
  throw new Error('Unsupported or invalid sharing image')
}

function meta(html, property) {
  return html.match(new RegExp(`<meta (?:property|name)="${property}" content="([^"]*)"`))?.[1]
}

for (const path of paths) {
  test(`${path} social images and structured dimensions match the optimized asset`, async () => {
    const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
    const image = new URL(meta(html, 'og:image'))
    assert.equal(image.origin, 'https://tecservice.ge')
    assert.equal(meta(html, 'twitter:image'), image.href)
    assert.ok(meta(html, 'og:image:alt')?.trim())
    assert.equal(meta(html, 'twitter:image:alt'), meta(html, 'og:image:alt'))
    const dimensions = imageDimensions(await readFile(new URL(`public${image.pathname}`, root)))
    assert.deepEqual([Number(meta(html, 'og:image:width')), Number(meta(html, 'og:image:height'))], dimensions)

    const schema = JSON.parse(html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)[1])
    const page = schema['@graph'].find(item => ['WebPage', 'ContactPage', 'AboutPage'].includes(item['@type']))
    if (page.primaryImageOfPage) {
      assert.equal(page.primaryImageOfPage.url, image.href)
      assert.deepEqual([page.primaryImageOfPage.width, page.primaryImageOfPage.height], dimensions)
    }
  })
}

test('all canonical pages have unique titles and descriptions', async () => {
  const documents = await Promise.all(paths.map(path => readFile(new URL(`dist${path}index.html`, root), 'utf8')))
  assert.equal(new Set(documents.map(html => html.match(/<title>(.*?)<\/title>/)[1])).size, paths.length)
  assert.equal(new Set(documents.map(html => meta(html, 'description'))).size, paths.length)
})
