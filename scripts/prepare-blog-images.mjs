// Mechanical format conversion only. Keep the existing photographs and pixel
// dimensions; never rename JPEG bytes to another image extension.
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(process.env.IMAGE_TOOLS_ROOT
  ? pathToFileURL(resolve(process.env.IMAGE_TOOLS_ROOT, 'package.json'))
  : import.meta.url)
const sharp = require('sharp')
const assets = ['data-recovery', 'laptop-repair', 'console-repair', 'drone-repair', 'ssd']
const plans = []

for (const name of assets) {
  const source = await readFile(new URL(`../public/assets/blog/${name}.jpg`, import.meta.url))
  const original = await sharp(source).metadata()
  if (original.format !== 'jpeg' || (original.pages ?? 1) !== 1) throw new Error(`Unexpected source format: ${name}`)
  const webp = await sharp(source).webp({ quality: 82, effort: 6 }).toBuffer()
  const converted = await sharp(webp).metadata()
  if (converted.format !== 'webp' || converted.width !== original.width || converted.height !== original.height) {
    throw new Error(`The image format or dimensions are incorrect: ${name}`)
  }
  const destination = new URL(`../public/assets/blog/${name}.webp`, import.meta.url)
  let existing
  try { existing = await readFile(destination) } catch (error) { if (error.code !== 'ENOENT') throw error }
  if (existing && !existing.equals(webp)) throw new Error(`Refusing to overwrite a different image: ${name}.webp`)
  plans.push({ name, destination, webp, existing, width: original.width, height: original.height, beforeBytes: source.length })
}

for (const plan of plans) {
  if (!plan.existing) await writeFile(plan.destination, plan.webp, { flag: 'wx' })
  console.log(JSON.stringify({ image: `${plan.name}.webp`, width: plan.width, height: plan.height, beforeBytes: plan.beforeBytes, afterBytes: plan.webp.length }))
}
console.log('Original JPG files are preserved. The existing SD-card WebP is unchanged.')
