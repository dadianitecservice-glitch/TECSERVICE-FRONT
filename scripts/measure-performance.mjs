import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { resolve, relative, sep } from 'node:path'
import { gzipSync } from 'node:zlib'

// Static payload accounting, not a Lighthouse score or a measured network transfer.
// Follow the assets explicitly requested by each prerendered HTML document.
const root = resolve(process.argv[2] ?? 'dist')
const output = process.argv[3]
const cache = new Map()
const local = value => value?.startsWith('/') && !value.startsWith('//') ? value.split(/[?#]/)[0] : null
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]

async function size(path) {
  if (!cache.has(path)) {
    const buffer = await readFile(resolve(root, `.${path}`))
    cache.set(path, { bytes: buffer.length, gzipBytes: gzipSync(buffer).length })
  }
  return cache.get(path)
}

async function totals(paths) {
  const values = await Promise.all([...paths].map(size))
  return {
    count: values.length,
    bytes: values.reduce((sum, item) => sum + item.bytes, 0),
    gzipBytes: values.reduce((sum, item) => sum + item.gzipBytes, 0),
  }
}

async function walk(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else files.push(path)
  }
  return files
}

const files = await walk(root)
const routes = []
for (const file of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8')
  const scripts = new Set()
  const styles = new Set()
  const images = new Set()
  const eagerImages = new Set()
  for (const [tag] of html.matchAll(/<(?:script|link|img)\b[^>]*>/g)) {
    const path = local(attribute(tag, 'src') ?? attribute(tag, 'href'))
    if (!path) continue
    if (tag.startsWith('<script') || attribute(tag, 'rel') === 'modulepreload') scripts.add(path)
    if (attribute(tag, 'rel') === 'stylesheet') styles.add(path)
    if (tag.startsWith('<img')) {
      images.add(path)
      if (attribute(tag, 'loading') !== 'lazy') eagerImages.add(path)
    }
  }
  routes.push({
    document: relative(root, file).split(sep).join('/'),
    htmlBytes: Buffer.byteLength(html),
    javascript: await totals(scripts),
    css: await totals(styles),
    images: await totals(images),
    eagerImages: await totals(eagerImages),
    scriptFiles: [...scripts],
  })
}

const media = await Promise.all(files.filter(file => /\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(file)).map(async file => ({
  file: relative(root, file).split(sep).join('/'),
  bytes: (await stat(file)).size,
})))
const report = {
  generatedAt: new Date().toISOString(),
  method: 'Unique local assets in prerendered HTML. Gzip is an estimate, not live HTTP compression. Lazy images, CSS backgrounds, responsive srcset choice, font requests, CPU, caching and network timing require a browser measurement.',
  documents: routes.length,
  routes,
  largestMedia: media.sort((a, b) => b.bytes - a.bytes).slice(0, 15),
}
const json = `${JSON.stringify(report, null, 2)}\n`
if (output) await writeFile(resolve(output), json)
else console.log(json)
