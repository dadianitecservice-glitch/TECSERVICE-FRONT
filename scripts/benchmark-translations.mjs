import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { stripTypeScriptTypes } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'

const root = fileURLToPath(new URL('../', import.meta.url))
const baselineRef = process.argv[3] ?? 'a7a559b5d6d2ec7bf4c2673d8d9a69d180ffe7f9'
const mode = process.argv[2]

if (!['baseline', 'current'].includes(mode)) {
  const reports = []
  for (let run = 0; run < 3; run += 1) {
    for (const implementation of ['baseline', 'current']) {
      const result = execFileSync(process.execPath, [fileURLToPath(import.meta.url), implementation, baselineRef], { cwd: root, encoding: 'utf8' })
      reports.push(JSON.parse(result))
    }
  }
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  console.log(JSON.stringify({
    method: 'Three fresh Node processes per version; local CPU timing, no browser or network throttling. Catalog installation then actual Home text and representative fallback strings. Exact outputs compared within each process.',
    baselineRef,
    runs: reports,
    medians: Object.fromEntries(['baseline', 'current'].map(implementation => [implementation, Object.fromEntries(['installMs', 'homeAndFallbackMs', 'allCatalogParityMs'].map(metric => [metric, median(reports.filter(item => item.implementation === implementation).map(item => item[metric]))]))])),
  }, null, 2))
} else {
  const baseline = execFileSync('git', ['show', `${baselineRef}:src/i18n/translateRuntime.ts`], { cwd: root, encoding: 'utf8' })
  const current = await readFile(new URL('../src/i18n/translateRuntime.ts', import.meta.url), 'utf8')
  const load = async (source, name) => {
    const javascript = stripTypeScriptTypes(source, { mode: 'strip' }).replace('./locale.ts', pathToFileURL(`${root}/src/i18n/locale.ts`).href)
    return import(`data:text/javascript;base64,${Buffer.from(`${javascript}\n// ${name}`).toString('base64')}`)
  }
  const pairs = await Promise.all(['common', 'devices', 'recovery', 'equipment'].map(async catalog => [
    JSON.parse(await readFile(new URL(`../src/i18n/catalogs/${catalog}.ka.json`, import.meta.url), 'utf8')),
    JSON.parse(await readFile(new URL(`../src/i18n/catalogs/${catalog}.en.json`, import.meta.url), 'utf8')),
  ]))
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
  const home = [...new Set([...html.matchAll(/>([^<>]*[\u10d0-\u10ff\u1c90-\u1cbf][^<>]*)</g)].map(match => match[1]))]
  const extras = [
    'არჩეულია: მთავარი · სერვისი',
    'საიტზე ავირჩიე: ლეპტოპის შეკეთება. მიუთითეთ ფასი.',
    '249 ₾-დან', 'ღიაა 18:00-მდე', 'გაიხსნება ხვალ 10:00-ზე',
    'მთავარი\n249 ₾-დან', 'ᲛᲗᲐᲕᲐᲠᲘ — TECSERVICE',
    'წინასიტყვაობა რომელიც კატალოგში ზუსტად არ ფიქსირდება',
  ]
  const samples = [...home, ...extras]
  const implementation = await load(mode === 'baseline' ? baseline : current, `timed-${mode}`)
  const start = performance.now()
  implementation.installEnglishCatalogs(pairs)
  const installed = performance.now()
  const translated = samples.map(value => implementation.translateText(value, 'en'))
  const finished = performance.now()
  const reference = await load(mode === 'baseline' ? current : baseline, `reference-${mode}`)
  reference.installEnglishCatalogs(pairs)
  const parityStart = performance.now()
  const all = [...new Set(pairs.flatMap(([ka]) => Object.values(ka)))].flatMap(value => [value, `◆ ${value} ◆`, `◆ ${value.toLocaleUpperCase('ka-GE')} ◆`])
  for (const [index, value] of [...samples, ...all].entries()) {
    const actual = index < samples.length ? translated[index] : implementation.translateText(value, 'en')
    const expected = reference.translateText(value, 'en')
    if (actual !== expected) throw new Error(`Translation mismatch for ${JSON.stringify(value)}: ${JSON.stringify({ actual, expected })}`)
  }
  console.log(JSON.stringify({ implementation: mode, catalogEntries: pairs.reduce((sum, [ka]) => sum + Object.keys(ka).length, 0), homeSamples: home.length, initialSamples: samples.length, parityCases: samples.length + all.length, installMs: installed - start, homeAndFallbackMs: finished - installed, allCatalogParityMs: performance.now() - parityStart }))
}
