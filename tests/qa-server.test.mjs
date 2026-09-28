import test from 'node:test'
import assert from 'node:assert/strict'
import { createQaServer, decodeRequestPath, isWithin, METRICS_TAG } from '../scripts/serve-qa.mjs'
import { resolve } from 'node:path'
import { readFile } from 'node:fs/promises'

test('QA path handling rejects traversal, malformed encoding and hidden paths', () => {
  for (const path of ['/../secret', '/%2e%2e/secret', '/assets/../../secret', '/.env', '/.vite/manifest.json', '/a\\b', '/%00', '/C:/secret', '/%zz', '//outside/file']) {
    assert.equal(decodeRequestPath(path), null, path)
  }
  assert.equal(decodeRequestPath('/en/blog/?x=1'), '/en/blog/')
  assert.ok(isWithin(resolve('dist'), resolve('dist/en/index.html')))
  assert.ok(!isWithin(resolve('dist'), resolve('dist-other/index.html')))
})

test('QA server serves prerendered HTML, metrics, assets, localized 404s and disabled APIs', async t => {
  const server = await createQaServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const origin = `http://127.0.0.1:${server.address().port}`
  const page = await fetch(`${origin}/blog/sd-card-photo-recovery-for-photographers/`)
  assert.equal(page.status, 200)
  assert.equal(page.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal(page.headers.get('content-encoding'), 'gzip')
  assert.match(await page.text(), new RegExp(METRICS_TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  const disk = await readFile('dist/blog/sd-card-photo-recovery-for-photographers/index.html', 'utf8')
  assert.ok(!disk.includes(METRICS_TAG), 'injection must never change dist files')

  for (const [path, language] of [['/not-a-route/', 'ka'], ['/en/not-a-route/', 'en']]) {
    const missing = await fetch(origin + path)
    assert.equal(missing.status, 404)
    assert.equal(missing.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.match(await missing.text(), new RegExp(`<html[^>]*lang="${language}"`))
  }
  const image = await fetch(`${origin}/assets/blog/sd-card-photo-recovery.webp`)
  assert.equal(image.status, 200)
  assert.equal(image.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal(image.headers.get('content-type'), 'image/webp')
  assert.equal(image.headers.get('cache-control'), 'public, max-age=3600')
  const auth = await fetch(`${origin}/api/auth/me`)
  assert.equal(auth.status, 401)
  assert.equal(auth.headers.get('x-robots-tag'), 'noindex, nofollow')
  assert.equal((await fetch(`${origin}/api/orders`, { method: 'POST', body: '{}' })).status, 503)
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405)
  const head = await fetch(origin, { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(await head.text(), '')
})
