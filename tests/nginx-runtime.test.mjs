import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import { assertImageFormat } from './helpers/image-format.mjs'

// Optional native integration check. Run after build with NGINX_BINARY pointing
// to a local nginx executable; it binds only to loopback and never reloads live.
const binary = process.env.NGINX_BINARY
const root = new URL('../', import.meta.url)

test('native Nginx serves all canonical pages, private shells, redirects and localized errors', {
  skip: !binary && 'Set NGINX_BINARY to run the native delivery check',
  timeout: 60000,
}, async () => {
  const temporaryRoot = fileURLToPath(new URL('.tmp/', root))
  await mkdir(temporaryRoot, { recursive: true })
  const temporary = await mkdtemp(join(temporaryRoot, 'nginx-runtime-'))
  await mkdir(join(temporary, 'logs'))
  await mkdir(join(temporary, 'temp'))
  const portProbe = createServer()
  await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve))
  const port = portProbe.address().port
  await new Promise(resolve => portProbe.close(resolve))
  const template = await readFile(new URL('docs/nginx-seo-routes.conf', root), 'utf8')
  const dist = fileURLToPath(new URL('dist/', root)).replaceAll('\\', '/')
  const configuration = join(temporary, 'nginx.conf')
  const apiFixture = JSON.stringify({ privateFixture: 'synthetic test value '.repeat(100) })
  await writeFile(configuration, [
    'daemon off;',
    'worker_processes 1;',
    'error_log logs/error.log;',
    'pid logs/nginx.pid;',
    'events { worker_connections 128; }',
    'http {',
    '  access_log off;',
    '  types { text/html html; text/css css; application/javascript js; application/xml xml; text/plain txt; image/svg+xml svg; image/webp webp; image/jpeg jpg jpeg; image/png png; }',
    '  server {',
    '    listen 127.0.0.1:' + port + ';',
    '    server_name localhost;',
    template.replace('root /var/www/tecservice/dist;', 'root "' + dist + '";'),
    '    location /api/ {',
    '      default_type application/json;',
    '      add_header Cache-Control "private, no-store" always;',
    '      add_header X-Robots-Tag "noindex" always;',
    "      return 200 '" + apiFixture + "';",
    '    }',
    '  }',
    '}',
  ].join('\n'))
  const args = ['-p', temporary.replaceAll('\\', '/') + '/', '-c', configuration]
  const syntax = spawnSync(binary, [...args, '-t'], { windowsHide: true, encoding: 'utf8' })
  assert.equal(syntax.status, 0, syntax.stderr || syntax.error?.message)
  const process = spawn(binary, args, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let errors = ''
  process.stderr.on('data', data => { errors += data })
  const exited = new Promise(resolve => process.once('exit', resolve))
  const base = 'http://127.0.0.1:' + port
  const request = (path, headers = {}) => fetch(base + path, { redirect: 'manual', headers, signal: AbortSignal.timeout(5000) })
  try {
    let ready = false
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try { const response = await request('/robots.txt'); await response.arrayBuffer(); ready = true; break } catch {}
      if (process.exitCode !== null) break
      await delay(100)
    }
    assert.ok(ready, 'Nginx failed to start: ' + errors)
    const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8')
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => new URL(value).pathname)
    assert.ok(paths.length >= 42)
    for (const path of paths) {
      const response = await request(path)
      assert.equal(response.status, 200, path)
      assert.match(response.headers.get('content-type'), /text\/html; charset=utf-8/, path)
      assert.equal(response.headers.get('cache-control'), 'no-cache', path)
      assert.equal(response.headers.get('x-robots-tag'), null, path)
      assert.match(response.headers.get('vary'), /Accept-Encoding/, path)
      const html = await response.text()
      assert.ok(html.includes('href="https://tecservice.ge' + path + '"'), path)
      const aliases = [path + 'index.html', ...(path === '/' ? [] : [path.slice(0, -1)])]
      for (const alias of aliases) {
        const redirect = await request(alias + '?service=repair&utm_source=seo-check')
        assert.equal(redirect.status, 308, alias)
        const target = new URL(redirect.headers.get('location'), base)
        assert.equal(target.pathname, path, alias)
        assert.equal(target.search, '?service=repair&utm_source=seo-check', alias)
        await redirect.arrayBuffer()
      }
    }
    // Facebook reads the initial HTML, then fetches the declared image directly.
    // Validate that delivery path for every article in both locales, not just the
    // latest post; shared image assets only need downloading once.
    const facebookHeaders = { 'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' }
    const checkedImages = new Map()
    let checkedArticles = 0
    for (const locale of ['ka', 'en']) {
      const prefix = locale === 'en' ? '/en' : ''
      for (const post of getBlogPosts(locale)) {
        const path = `${prefix}/blog/${post.slug}/`
        const response = await request(path, facebookHeaders)
        assert.equal(response.status, 200, `Facebook must receive the article HTML: ${path}`)
        assert.match(response.headers.get('content-type'), /^text\/html(?:;|$)/, path)
        const html = await response.text()
        const head = html.match(/<head\b[^>]*>[\s\S]*?<\/head>/i)?.[0]
        assert.ok(head, `Missing initial document head: ${path}`)
        const meta = property => [...head.matchAll(new RegExp(`<meta\\s+property="${property}"\\s+content="([^"]*)"`, 'g'))].map(match => match[1])
        assert.deepEqual(meta('og:url'), [`https://tecservice.ge${path}`], `The crawler must not receive the Home page: ${path}`)
        assert.deepEqual(meta('og:type'), ['article'], path)
        assert.deepEqual(meta('og:image'), [`https://tecservice.ge${post.image}`], path)
        if (!checkedImages.has(post.image)) {
          const imageResponse = await request(post.image, facebookHeaders)
          assert.equal(imageResponse.status, 200, post.image)
          const bytes = Buffer.from(await imageResponse.arrayBuffer())
          const imageType = assertImageFormat(post.image, bytes)
          assert.equal(imageResponse.headers.get('content-type')?.split(';')[0], imageType, `${post.image}: HTTP MIME must match image bytes`)
          assert.deepEqual(bytes, await readFile(new URL(`dist${post.image}`, root)), `${post.image}: serve the article photograph, not fallback HTML`)
          checkedImages.set(post.image, imageType)
        }
        assert.deepEqual(meta('og:image:type'), [checkedImages.get(post.image)], `Declared MIME must match the served photograph: ${path}`)
        checkedArticles += 1
      }
    }
    assert.equal(checkedArticles, getBlogPosts('ka').length + getBlogPosts('en').length)
    assert.equal(checkedImages.size, new Set(getBlogPosts('ka').map(post => post.image)).size)
    for (const prefix of ['', '/en']) {
      for (const missing of ['/missing-page/', '/services/', '/services/missing/', '/blog/missing-post', '/blog/missing-post/', '/missing/index.html', '/account/extra/', '/.vite/manifest.json', '/.env']) {
        const response = await request(prefix + missing)
        assert.equal(response.status, 404, prefix + missing)
        assert.equal(response.headers.get('cache-control'), 'no-cache')
        assert.match(response.headers.get('x-robots-tag'), /noindex/)
        assert.ok((await response.text()).includes('<html lang="' + (prefix ? 'en' : 'ka') + '">'), prefix + missing)
      }
      for (const suffix of ['/', '/index.html']) {
        const response = await request(prefix + '/account' + suffix)
        assert.equal(response.status, suffix === '/' ? 200 : 308)
        assert.equal(response.headers.get('cache-control'), 'private, no-store')
        assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
        await response.arrayBuffer()
      }
      for (const name of ['terms', 'privacy']) {
        const response = await request(prefix + '/' + name + '/')
        assert.equal(response.status, 200)
        assert.match(await response.text(), /name="robots" content="noindex, follow"/)
      }
    }
    const home = await request('/', { 'Accept-Encoding': 'gzip' })
    assert.equal(home.headers.get('content-encoding'), 'gzip')
    assert.equal(home.headers.get('server'), 'nginx')
    const homeHtml = await home.text()
    const asset = homeHtml.match(/src="(\/assets\/[^"/]+\.js)"/)[1]
    const script = await request(asset)
    assert.equal(script.status, 200)
    assert.equal(script.headers.get('cache-control'), 'public, max-age=31536000, immutable')
    await script.arrayBuffer()
    const missingAsset = await request('/assets/missing-12345678.js')
    assert.equal(missingAsset.status, 404)
    assert.equal(missingAsset.headers.get('cache-control'), 'no-cache')
    await missingAsset.arrayBuffer()
    const api = await request('/api/customer-record-12345678.js', { 'Accept-Encoding': 'gzip' })
    assert.equal(api.status, 200)
    assert.equal(api.headers.get('cache-control'), 'private, no-store')
    assert.equal(api.headers.get('content-encoding'), null)
    assert.equal(await api.text(), apiFixture)
  } finally {
    const stopped = spawnSync(binary, [...args, '-s', 'quit'], { windowsHide: true, encoding: 'utf8', timeout: 5000 })
    await Promise.race([exited, delay(5000, undefined, { ref: false })])
    if (process.exitCode === null) process.kill()
    assert.equal(stopped.status, 0, stopped.stderr || stopped.error?.message)
    assert.notEqual(process.exitCode, null, 'The temporary Nginx process must exit after graceful shutdown')
  }
})
