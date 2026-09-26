import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { laptopProblems } from '../src/data/laptopRepair.ts'
import { computerProblems } from '../src/data/computerRepair.ts'
import { consoleProblems } from '../src/data/consoleRepair.ts'
import { droneProblems } from '../src/data/droneRepair.ts'
import { mobileTabletProblems } from '../src/data/mobileTabletRepair.ts'

const root = new URL('../', import.meta.url)
const dimensionsBySource = new Map()
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key.toLowerCase(), value]))

async function assetDimensions(src) {
  if (dimensionsBySource.has(src)) return dimensionsBySource.get(src)
  const buffer = await readFile(new URL(`public${src}`, root))
  let dimensions
  if (buffer.toString('ascii', 1, 4) === 'PNG') {
    dimensions = [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]
  } else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const type = buffer.toString('ascii', offset, offset + 4)
      const length = buffer.readUInt32LE(offset + 4)
      const data = offset + 8
      if (type === 'VP8X') dimensions = [buffer.readUIntLE(data + 4, 3) + 1, buffer.readUIntLE(data + 7, 3) + 1]
      if (type === 'VP8 ') dimensions = [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff]
      if (type === 'VP8L') {
        const packed = buffer.readUInt32LE(data + 1)
        dimensions = [(packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1]
      }
      if (dimensions) break
      offset += 8 + length + (length % 2)
    }
  } else if (buffer.readUInt16BE(0) === 0xffd8) {
    for (let offset = 2; offset + 4 < buffer.length;) {
      if (buffer[offset++] !== 0xff) continue
      const marker = buffer[offset++]
      if (marker === 0xd9 || marker === 0xda) break
      if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
      const length = buffer.readUInt16BE(offset)
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        dimensions = [buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3)]
        break
      }
      offset += length
    }
  }
  assert.ok(dimensions, `Unsupported or invalid raster asset: ${src}`)
  dimensionsBySource.set(src, dimensions)
  return dimensions
}

for (const [name, problems] of Object.entries({ laptopProblems, computerProblems, consoleProblems, droneProblems, mobileTabletProblems })) {
  test(`${name}: source dimensions match the optimized images`, async () => {
    for (const { photo } of problems) {
      assert.deepEqual([photo.width, photo.height], await assetDimensions(photo.src), photo.src)
    }
  })
}

test('published pages reserve the actual raster image dimensions and defer secondary media', async () => {
  const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8')
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => new URL(url).pathname)
  assert.ok(paths.length > 0)
  for (const pathname of paths) {
    const html = await readFile(new URL(`dist${pathname}index.html`, root), 'utf8')
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => attributes(tag))
    const raster = images.filter(image => /^\/.*\.(?:webp|png|jpe?g)$/i.test(image.src))
    for (const image of raster) {
      assert.deepEqual([Number(image.width), Number(image.height)], await assetDimensions(image.src), `${pathname}: ${image.src}`)
      assert.equal(image.decoding, 'async', `${pathname}: ${image.src} should decode asynchronously`)
    }

    const priority = raster.filter(image => image.fetchpriority === 'high')
    assert.ok(priority.length <= 1, `${pathname}: competing high-priority content images`)
    for (const image of priority) assert.notEqual(image.loading, 'lazy', `${pathname}: a primary image cannot be lazy`)

    const eagerSources = new Set(raster.filter(image => image.loading !== 'lazy').map(image => image.src))
    const preloads = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag)).filter(link => link.rel === 'preload' && link.as === 'image')
    for (const image of raster.filter(image => image.loading === 'lazy' && !eagerSources.has(image.src))) {
      assert.ok(!preloads.some(link => link.href === image.src), `${pathname}: deferred image was eagerly preloaded: ${image.src}`)
    }

    for (const [tag] of html.matchAll(/<iframe\b[^>]*>/g)) {
      const frame = attributes(tag)
      assert.ok(frame.title?.trim(), `${pathname}: embed needs an accessible title`)
      assert.equal(frame.loading, 'lazy', `${pathname}: external map should be deferred`)
      assert.ok(Number(frame.width) > 0 && Number(frame.height) > 0, `${pathname}: embed needs reserved dimensions`)
    }

    const logo = images.find(image => image.src === '/assets/brand/tecservice-logo.svg')
    const footerLogo = images.find(image => image.src === '/assets/brand/tecservice-logo-footer.svg')
    for (const image of [logo, footerLogo]) assert.ok(Number(image?.width) > 0 && Number(image?.height) > 0, `${pathname}: brand image needs dimensions`)
    assert.notEqual(logo.loading, 'lazy', `${pathname}: header logo must remain immediately available`)
    assert.equal(footerLogo.loading, 'lazy', `${pathname}: footer logo should be deferred`)

    if (/^\/(?:en\/)?$/.test(pathname)) {
      assert.equal(raster.find(image => image.src === '/assets/map/tecservice-map.jpg')?.loading, 'lazy', `${pathname}: homepage map is below the fold`)
    }
    if (/^\/(?:en\/)?blog\/$/.test(pathname)) {
      assert.equal(raster[0].fetchpriority, 'high', `${pathname}: prioritize the first article image`)
      assert.equal(raster[0].loading, 'eager')
      assert.ok(raster.slice(1).every(image => image.loading === 'lazy'), `${pathname}: defer remaining article images`)
    }
    if (pathname.includes('/services/')) {
      assert.equal(priority.length, 1, `${pathname}: service hero should have one primary image`)
      for (const [panel] of html.matchAll(/class="lp-problem-panel__photo[^>]*>([\s\S]*?)<\/div>/g)) {
        const image = attributes(panel.match(/<img\b[^>]*>/)[0])
        assert.equal(image.loading, 'lazy', `${pathname}: lower-page symptom image should be deferred`)
      }
    }
  }
})
