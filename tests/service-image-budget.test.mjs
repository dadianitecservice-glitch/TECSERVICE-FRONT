import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { laptopProblems } from '../src/data/laptopRepair.ts'
import { computerProblems } from '../src/data/computerRepair.ts'
import { dataRecoveryProblems } from '../src/data/dataRecovery.ts'
import { consoleProblems } from '../src/data/consoleRepair.ts'
import { droneProblems } from '../src/data/droneRepair.ts'
import { mobileTabletProblems } from '../src/data/mobileTabletRepair.ts'
import { otherElectronicsProblems } from '../src/data/otherElectronicsRepair.ts'

const root = new URL('../', import.meta.url)
const groups = [
  ['laptop-repair', 'LaptopRepairPage', laptopProblems],
  ['computer-repair', 'ComputerRepairPage', computerProblems],
  ['data-recovery', 'DataRecoveryPage', dataRecoveryProblems],
  ['console-repair', 'ConsoleRepairPage', consoleProblems],
  ['drone-repair', 'DroneRepairPage', droneProblems],
  ['mobile-tablet-repair', 'MobileTabletRepairPage', mobileTabletProblems],
  ['electronic-board-repair', 'OtherElectronicsRepairPage', otherElectronicsProblems],
]

// Inspect active page and problem references, not unused source-image archives.
const assetsByGroup = await Promise.all(groups.map(async ([folder, page, problems]) => {
  const source = await readFile(new URL(`src/pages/${page}.tsx`, root), 'utf8')
  const references = new Set([
    ...problems.map(({ photo }) => photo.src),
    ...[...source.matchAll(/\/assets\/[a-z0-9/-]+\.(?:webp|png|jpe?g)/gi)].map(([src]) => src),
  ])
  const assets = await Promise.all([...references].map(async src => ({
    src,
    buffer: await readFile(new URL(`public${src}`, root)),
  })))
  return { folder, assets }
}))

function assertWebpContainer(buffer, src) {
  assert.ok(buffer.length >= 30, `${src}: incomplete WebP file`)
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF', src)
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP', src)
  assert.equal(buffer.readUInt32LE(4) + 8, buffer.length, `${src}: invalid RIFF length`)
  let offset = 12
  let hasImagePayload = false
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4)
    const length = buffer.readUInt32LE(offset + 4)
    const end = offset + 8 + length
    assert.ok(end <= buffer.length, `${src}: truncated ${type} chunk`)
    if (type === 'VP8 ' || type === 'VP8L') {
      assert.ok(length > 0, `${src}: empty image payload`)
      hasImagePayload = true
    }
    offset = end + (length % 2)
  }
  assert.equal(offset, buffer.length, `${src}: invalid chunk alignment`)
  assert.ok(hasImagePayload, `${src}: no WebP image payload`)
}

for (const { folder, assets } of assetsByGroup) {
  test(`${folder}: active photographs remain valid WebP files below 100 kB each`, () => {
    assert.ok(assets.length > 0, `${folder}: no active photographs were found`)
    for (const { src, buffer } of assets) {
      assert.ok(src.startsWith(`/assets/${folder}/`), `${src}: unexpected service asset group`)
      assert.ok(src.endsWith('.webp'), `${src}: service photographs must use WebP`)
      assertWebpContainer(buffer, src)
      assert.ok(buffer.length < 100_000, `${src}: ${buffer.length} bytes exceeds the per-image budget`)
    }
  })
}

test('all seven service image collections stay below a combined 4 MB asset budget', () => {
  const uniqueAssets = new Map(assetsByGroup.flatMap(({ assets }) => assets.map(({ src, buffer }) => [src, buffer.length])))
  const bytes = [...uniqueAssets.values()].reduce((sum, size) => sum + size, 0)
  assert.ok(bytes > 0)
  assert.ok(bytes < 4_000_000, `Active service photos total ${bytes} bytes, exceeding the asset budget`)
})
