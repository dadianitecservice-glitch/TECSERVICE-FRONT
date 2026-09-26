import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { collectRouteAssets, applyRouteAssets } from '../scripts/prerender-assets.mjs'

const root = new URL('../dist/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', root), 'utf8'))

test('route asset collection follows static imports, never unrelated dynamic pages', () => {
  const fixture = {
    page: { file: 'page.js', imports: ['shared'], dynamicImports: ['account'], css: ['page.css'] },
    shared: { file: 'shared.js', css: ['shared.css'] },
    account: { file: 'private.js', css: ['private.css'] },
  }
  assert.deepEqual(collectRouteAssets(fixture, 'page'), { scripts: ['shared.js', 'page.js'], styles: ['shared.css', 'page.css'] })
  assert.throws(() => collectRouteAssets(fixture, 'missing'), /Missing build manifest/)
  const html = applyRouteAssets('<head><link rel="stylesheet" href="/shared.css" /></head>', fixture, 'page')
  assert.equal((html.match(/shared\.css/g) ?? []).length, 1)
  assert.doesNotMatch(html, /private/)
})

for (const [path, entry] of [
  ['index.html', 'HomePage'],
  ['en/index.html', 'HomePage'],
  ['services/laptop-repair/index.html', 'LaptopRepairPage'],
  ['services/data-recovery/index.html', 'DataRecoveryPage'],
  ['about/index.html', 'AboutPage'],
  ['blog/index.html', 'BlogPage'],
  ['blog/lost-files-first-minutes/index.html', 'BlogArticlePage'],
  ['terms/index.html', 'LegalPage'],
  ['privacy/index.html', 'LegalPage'],
  ['account/index.html', 'AccountPage'],
  ['404.html', 'NotFoundPage'],
]) {
  test(`${path} has full HTML and preloads only its own page assets`, async () => {
    const html = await readFile(new URL(path, root), 'utf8')
    const assets = collectRouteAssets(manifest, `src/pages/${entry}.tsx`)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.doesNotMatch(html, /\[object Promise\]|Switched to client rendering|<!--\$!-->/)
    for (const file of [...assets.scripts, ...assets.styles]) {
      assert.ok(html.includes(`"/${file}"`), `${file} must load directly from HTML without a script waterfall or CSS flash`)
      await stat(new URL(file, root))
    }
    for (const [key, value] of Object.entries(manifest)) {
      if (!key.startsWith('src/pages/') || key === `src/pages/${entry}.tsx`) continue
      // The article component includes a small 404 fallback for an invalid slug.
      if (entry === 'BlogArticlePage' && key === 'src/pages/NotFoundPage.tsx') continue
      assert.ok(!html.includes(`"/${value.file}"`), `Unrelated ${key} was eagerly loaded`)
    }
  })
}

test('public pages do not download the account implementation or client-side schema recreation', () => {
  for (const key of Object.keys(manifest).filter(key => key.startsWith('src/pages/') && !key.includes('AccountPage'))) {
    const files = collectRouteAssets(manifest, key).scripts
    assert.ok(!files.some(file => /AccountPage-/.test(file)), key)
    assert.ok(!files.some(file => /serviceStructuredData-/.test(file)), key)
  }
})

test('only English documents preload the English translation catalogs', async () => {
  const catalog = manifest['src/i18n/translate.ts']
  assert.ok(catalog, 'English translations must have a separate build entry')
  for (const path of ['index.html', 'services/laptop-repair/index.html', 'blog/index.html', 'account/index.html']) {
    const ka = await readFile(new URL(path, root), 'utf8')
    const en = await readFile(new URL(`en/${path}`, root), 'utf8')
    assert.ok(!ka.includes(`"/${catalog.file}"`), `${path} must not preload English`)
    assert.ok(en.includes(`"/${catalog.file}"`), `en/${path} must prepare translations without a waterfall`)
  }
})

test('route splitting retains a material reduction from the previous 1.47 MB all-page script', async () => {
  for (const entry of ['HomePage', 'LaptopRepairPage', 'BlogPage', 'LegalPage']) {
    const files = collectRouteAssets(manifest, `src/pages/${entry}.tsx`).scripts
    const bytes = (await Promise.all(files.map(file => stat(new URL(file, root))))).reduce((sum, file) => sum + file.size, 0)
    const budget = entry === 'HomePage' ? 850_000 : 450_000
    assert.ok(bytes < budget, `${entry} downloads ${bytes} bytes; check for eager cross-page or locale imports`)
  }
})
