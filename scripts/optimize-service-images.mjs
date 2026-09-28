// Mechanical WebP compression only: no resizing, cropping or generated content.
// Sharp is a maintenance tool, not a production dependency. If it is supplied by
// an external tooling runtime, set IMAGE_TOOLS_ROOT to its Node package root.
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const groups = ['laptop-repair', 'computer-repair', 'data-recovery', 'console-repair', 'drone-repair', 'mobile-tablet-repair', 'electronic-board-repair']
const quality = 55
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const inside = (parent, child) => {
  const path = relative(parent, child)
  return path !== '' && !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`)
}
const validAsset = asset => groups.some(group => new RegExp(`^${group}/[a-z0-9-]+\\.webp$`).test(asset))

async function prepare() {
  const require = createRequire(process.env.IMAGE_TOOLS_ROOT
    ? pathToFileURL(resolve(process.env.IMAGE_TOOLS_ROOT, 'package.json'))
    : import.meta.url)
  const sharp = require('sharp')
  const stage = resolve(root, '.tmp', `service-image-compression-${new Date().toISOString().replace(/[:.]/g, '-')}`)
  await mkdir(stage, { recursive: true })
  const assets = []
  for (const group of groups) {
    const directory = resolve(root, 'public/assets', group)
    const files = (await readdir(directory)).filter(file => file.endsWith('.webp')).sort()
    for (const file of files) {
      const asset = `${group}/${file}`
      if (!validAsset(asset)) throw new Error(`Unexpected asset: ${asset}`)
      const source = await readFile(resolve(directory, file))
      const before = await sharp(source).metadata()
      if (before.format !== 'webp' || (before.pages ?? 1) !== 1) throw new Error(`Not a static WebP: ${asset}`)
      const candidate = await sharp(source).webp({ quality, effort: 6, smartSubsample: true }).toBuffer()
      const after = await sharp(candidate).metadata()
      if (before.width !== after.width || before.height !== after.height || before.hasAlpha !== after.hasAlpha) {
        throw new Error(`Image geometry or transparency changed: ${asset}`)
      }
      // Never replace an existing image with a larger or insignificantly smaller file.
      const output = candidate.length < source.length * 0.95 ? candidate : source
      for (const [folder, data] of [['originals', source], ['optimized', output]]) {
        const destination = resolve(stage, folder, asset)
        await mkdir(dirname(destination), { recursive: true })
        await writeFile(destination, data, { flag: 'wx' })
      }
      assets.push({ asset, width: before.width, height: before.height, alpha: before.hasAlpha,
        beforeBytes: source.length, afterBytes: output.length, beforeSha256: sha256(source), afterSha256: sha256(output) })
    }
  }
  const beforeBytes = assets.reduce((sum, asset) => sum + asset.beforeBytes, 0)
  const afterBytes = assets.reduce((sum, asset) => sum + asset.afterBytes, 0)
  const report = { preparedAt: new Date().toISOString(), encoder: `sharp ${sharp.versions.sharp}`, quality,
    dimensionsPreserved: true, beforeBytes, afterBytes, savedPercent: Number(((1 - afterBytes / beforeBytes) * 100).toFixed(2)), assets }
  await writeFile(resolve(stage, 'report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' })
  console.log(JSON.stringify({ stage, count: assets.length, beforeBytes, afterBytes, savedPercent: report.savedPercent }, null, 2))
  console.log('Public files are unchanged. Inspect the staged images, then run: node scripts/optimize-service-images.mjs apply <stage>')
}

async function apply(stageArgument) {
  if (!stageArgument) throw new Error('Provide the prepared staging directory.')
  const scratch = await realpath(resolve(root, '.tmp'))
  const stage = await realpath(resolve(stageArgument))
  if (!inside(scratch, stage)) throw new Error('Staging directory must be inside this project’s .tmp directory.')
  const publicRoot = await realpath(resolve(root, 'public/assets'))
  const report = JSON.parse(await readFile(resolve(stage, 'report.json'), 'utf8'))
  const plans = []
  const seen = new Set()
  for (const asset of report.assets) {
    if (!validAsset(asset.asset) || seen.has(asset.asset)) throw new Error('Unexpected or duplicate asset in report.')
    seen.add(asset.asset)
    const destination = await realpath(resolve(publicRoot, asset.asset))
    const originalPath = await realpath(resolve(stage, 'originals', asset.asset))
    const outputPath = await realpath(resolve(stage, 'optimized', asset.asset))
    if (!inside(publicRoot, destination) || !inside(stage, originalPath) || !inside(stage, outputPath)) throw new Error('Asset path escapes the approved directories.')
    const [current, original, output] = await Promise.all([readFile(destination), readFile(originalPath), readFile(outputPath)])
    if (sha256(original) !== asset.beforeSha256 || sha256(output) !== asset.afterSha256 || output.length > original.length) throw new Error(`Staged image validation failed: ${asset.asset}`)
    const currentHash = sha256(current)
    if (currentHash !== asset.beforeSha256 && currentHash !== asset.afterSha256) throw new Error(`Source changed since staging: ${asset.asset}`)
    if (currentHash !== asset.afterSha256) plans.push({ destination, output })
  }
  // All paths, backups and source hashes have been checked before the first write.
  for (const { destination, output } of plans) await writeFile(destination, output)
  console.log(`Applied ${plans.length} compressed images. Original files remain recoverable in ${resolve(stage, 'originals')}.`)
}

const [command = 'prepare', argument] = process.argv.slice(2)
if (command === 'prepare') await prepare()
else if (command === 'apply') await apply(argument)
else throw new Error('Use prepare or apply <stage>.')
