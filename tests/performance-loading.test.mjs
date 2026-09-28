import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { createServicePriceAssistantLoader, loadServicePriceAssistant } from '../src/utils/loadServicePriceAssistant.ts'
import { collectRouteAssets } from '../scripts/prerender-assets.mjs'

test('price assistant loader waits for demand and reuses concurrent and completed imports', async () => {
  let calls = 0
  let finish
  const module = { getServicePriceAssessment: () => ({ reply: 'Ready' }) }
  const load = createServicePriceAssistantLoader(() => {
    calls += 1
    return new Promise(resolve => { finish = resolve })
  })
  assert.equal(calls, 0)
  const first = load()
  assert.equal(load(), first)
  assert.equal(calls, 1)
  finish(module)
  assert.equal(await first, module)
  assert.equal(await load(), module)
  assert.equal(calls, 1)
})

test('a failed price assistant download can be retried without reloading the page', async () => {
  let calls = 0
  const module = { getServicePriceAssessment: () => ({ reply: 'Recovered' }) }
  const load = createServicePriceAssistantLoader(async () => {
    if (++calls === 1) throw new Error('Temporary network interruption')
    return module
  })
  const first = load()
  assert.equal(load(), first)
  await assert.rejects(first, /Temporary network interruption/)
  assert.equal(await load(), module)
  assert.equal(calls, 2)
})

test('the deferred assistant still reads the live service price catalog', async () => {
  const { getServicePriceAssessment } = await loadServicePriceAssistant()
  const { laptopPrices, formatLaptopPrice } = await import('../src/data/laptopRepair.ts')
  const screen = laptopPrices.find(row => row.id === 'screen')
  const result = getServicePriceAssessment('computers', 'ლეპტოპის ეკრანის შეცვლა', 'ka', value => value)
  assert.equal(result.assessment.labor_price, formatLaptopPrice(screen))
  assert.equal(result.sources[0].path, '/services/laptop-repair/#laptop-prices')
})

test('homepage prevents stale async assessments and offers accessible loading and retry states', async () => {
  const hero = await readFile(new URL('../src/sections/Hero.tsx', import.meta.url), 'utf8')
  assert.match(hero, /import type \{ ServicePriceAssessment \}/)
  assert.doesNotMatch(hero, /import \{ getServicePriceAssessment \}/)
  assert.match(hero, /await loadServicePriceAssistant\(\)/)
  assert.match(hero, /if \(version !== requestVersion\.current\) return/)
  assert.match(hero, /setSelectedDevice\(device\.id\); clearAssessment\(\)/)
  assert.match(hero, /setProblem\(event\.target\.value\); clearAssessment\(\)/)
  assert.match(hero, /disabled=\{assessmentPending\}/)
  assert.match(hero, /aria-busy=\{assessmentPending\}/)
  assert.match(hero, /feedback === 'unavailable'.*role="alert"/)
  assert.match(hero, /if \(pendingRequest\.current\) return/)
})

test('production homepage does not preload the assistant or seven service catalogs', async () => {
  const root = new URL('../dist/', import.meta.url)
  const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', root), 'utf8'))
  const assistant = manifest['src/utils/servicePriceAssistant.ts']
  assert.ok(assistant?.isDynamicEntry, 'Assistant must stay a separate on-demand entry')
  const assets = collectRouteAssets(manifest, 'src/pages/HomePage.tsx')
  assert.ok(!assets.scripts.includes(assistant.file))
  assert.ok(!assets.scripts.some(file => /\/(?:laptopRepair|computerRepair|consoleRepair|droneRepair|mobileTabletRepair|dataRecovery|otherElectronicsRepair)-/.test(file)))
  for (const document of ['index.html', 'en/index.html']) {
    const html = await readFile(new URL(document, root), 'utf8')
    assert.ok(!html.includes(`"/${assistant.file}"`))
    assert.match(html, /id="problem-description"/)
    assert.match(html, /class="ai-submit"/)
  }
  const bytes = (await Promise.all(assets.scripts.map(file => stat(new URL(file, root))))).reduce((sum, file) => sum + file.size, 0)
  assert.ok(bytes < 550_000, `Homepage initial script payload grew to ${bytes} bytes`)
})
