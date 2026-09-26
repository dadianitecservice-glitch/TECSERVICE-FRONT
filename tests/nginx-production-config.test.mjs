import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const config = await readFile(new URL('docs/nginx-seo-routes.conf', root), 'utf8')
const sitemap = await readFile(new URL('public/sitemap.xml', root), 'utf8')

// Keep nested scopes distinct: a sibling API proxy must not inherit frontend
// policy. Quoted regex quantifiers and commented deployment examples are data.
function parseConfig(source) {
  const rootScope = { header: '', directives: [], children: [], parent: null }
  let scope = rootScope
  let token = ''
  let quote = null
  let comment = false
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (comment) {
      if (character === '\n') comment = false
      continue
    }
    if (quote) {
      token += character
      if (character === '\\') token += source[++index] ?? ''
      else if (character === quote) quote = null
      continue
    }
    if (character === '#') { comment = true; continue }
    if (character === '"' || character === "'") { quote = character; token += character; continue }
    if (character === '{') {
      const child = { header: token.trim(), directives: [], children: [], parent: scope }
      scope.children.push(child)
      scope = child
      token = ''
    } else if (character === '}') {
      assert.equal(token.trim(), '', 'Directives require a semicolon')
      assert.ok(scope.parent, 'Unexpected closing brace')
      scope = scope.parent
    } else if (character === ';') {
      scope.directives.push(token.trim())
      token = ''
    } else token += character
  }
  assert.equal(scope, rootScope, 'Configuration scopes must balance')
  assert.equal(token.trim(), '')
  assert.equal(quote, null)
  return rootScope
}

const server = parseConfig(config)
const walk = scope => [scope, ...scope.children.flatMap(walk)]
const scopes = walk(server)
const location = header => {
  const matches = scopes.filter(scope => scope.header === header)
  assert.equal(matches.length, 1, 'Expected exactly one ' + header)
  return matches[0]
}
const inherited = (scope, name) => {
  const own = scope.directives.filter(directive => directive.startsWith(name + ' '))
  return own.length || !scope.parent ? own : inherited(scope.parent, name)
}
const frontend = location('location /')
const english = location('location /en/')

test('production Nginx scopes frontend compression and caching away from API proxies', () => {
  assert.ok(server.directives.includes('charset utf-8'))
  assert.ok(server.directives.includes('server_tokens off'))
  for (const directive of ['gzip on', 'gzip_vary on', 'gzip_proxied any']) assert.ok(frontend.directives.includes(directive))
  assert.match(inherited(frontend, 'gzip_types')[0], /text\/css.*application\/javascript.*image\/svg\+xml$/)
  assert.equal(server.directives.some(directive => /^(?:gzip\b|gzip_|expires\b|add_header Cache-Control\b)/.test(directive)), false,
    'Frontend settings must not be inherited by sibling API proxies')
  assert.doesNotMatch(config.replace(/^\s*#.*$/gm, ''), /proxy_(?:pass|cache)|location\s+(?:\^~\s+)?\/api\//)
})

test('HTTP and HTTPS www examples preserve the path and query on the literal canonical origin', () => {
  const examples = config.split('\n').filter(line => line.startsWith('# ')).map(line => line.slice(2)).join('\n')
  assert.match(examples, /server\s*\{\s*listen 80;\s*listen \[::\]:80;\s*server_name tecservice\.ge www\.tecservice\.ge;\s*location \/ \{ return 308 https:\/\/tecservice\.ge\$request_uri; \}/)
  assert.match(examples, /server\s*\{\s*listen 443 ssl;\s*listen \[::\]:443 ssl;\s*server_name www\.tecservice\.ge;[\s\S]*?ssl_certificate [^;]+;[\s\S]*?ssl_certificate_key [^;]+;\s*return 308 https:\/\/tecservice\.ge\$request_uri;/)
  assert.doesNotMatch(examples, /return 30[18] https?:\/\/\$host/)
  assert.match(config, /nginx -t/)
})

test('every fixed sitemap page has its own canonical redirect, file and revalidated HTML', () => {
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => new URL(value).pathname)
  assert.equal(paths.length, new Set(paths).size)
  for (const path of paths) {
    if (/^\/(?:en\/)?blog\/[^/]+\/$/.test(path)) continue
    const page = location('location = ' + path)
    assert.ok(page.directives.includes('try_files ' + path + 'index.html =404'), path)
    assert.deepEqual(inherited(page, 'add_header'), ['add_header Cache-Control "no-cache" always'], path)
    assert.deepEqual(inherited(page, 'gzip'), ['gzip on'], path)
    if (path === '/') continue
    const redirect = location('location = ' + path.slice(0, -1))
    assert.ok(redirect.directives.includes('return 308 ' + path + '$is_args$args'), path)
    if (path.startsWith('/en/')) assert.equal(page.parent, english, path + ' must inherit English errors')
  }
})

test('article redirects require an existing document and preserve queries in both languages', () => {
  for (const prefix of ['', '/en']) {
    const blog = location('location ' + prefix + '/blog/')
    assert.ok(blog.directives.includes('try_files $uri $uri/index.html =404'))
    const redirect = location('location ~ ^' + prefix + '/blog/[a-z0-9-]+$')
    assert.equal(redirect.parent, blog)
    assert.ok(redirect.directives.includes('return 404'))
    assert.equal(redirect.children[0].header, 'if (-f $request_filename/index.html)')
    assert.deepEqual(redirect.children[0].directives, ['return 308 $uri/$is_args$args'])
  }
  for (const scope of scopes) for (const directive of scope.directives) {
    if (directive.startsWith('return 308 ')) assert.ok(directive.endsWith('$is_args$args'), directive)
  }
})

test('account shells and direct index aliases keep private no-store and noindex headers', () => {
  for (const prefix of ['', '/en']) for (const suffix of ['/', '/index.html']) {
    const account = location('location = ' + prefix + '/account' + suffix)
    assert.deepEqual(inherited(account, 'add_header'), [
      'add_header Cache-Control "private, no-store" always',
      'add_header X-Robots-Tag "noindex, nofollow" always',
    ])
    assert.deepEqual(inherited(account, 'expires'), ['expires off'])
    if (suffix === '/index.html') assert.ok(account.directives.includes('return 308 ' + prefix + '/account/$is_args$args'))
  }
  for (const prefix of ['', '/en']) for (const page of ['terms', 'privacy']) {
    const legal = location('location = ' + prefix + '/' + page + '/')
    assert.ok(legal.directives.includes('try_files ' + prefix + '/' + page + '/index.html =404'))
    assert.doesNotMatch(legal.directives.join('\n'), /X-Robots-Tag/,
      'Legal indexing remains controlled by approval-gated generated HTML')
  }
})

test('immutable caching matches content-hashed bundles and fonts, never unversioned or private paths', () => {
  const immutable = scopes.find(scope => scope.directives.some(value => value.includes('immutable')))
  assert.ok(immutable)
  const pattern = new RegExp(immutable.header.match(/^location ~ "(.+)"$/)[1].replace(/\\\\/g, '\\'))
  for (const path of ['/assets/index-DC3qyjUp.js', '/assets/index-DK3Ot8X5.css', '/assets/noto-500-normal-D5jQ9CC-.woff2']) {
    assert.ok(pattern.test(path), path)
  }
  for (const path of ['/assets/app.js', '/assets/style.css', '/assets/font.woff2', '/assets/nested/index-DC3qyjUp.js', '/api/private-DC3qyjUp.js', '/account/index.html']) {
    assert.equal(pattern.test(path), false, path)
  }
  assert.deepEqual(inherited(immutable, 'expires'), ['expires off'])
  assert.deepEqual(inherited(immutable, 'add_header'), ['add_header Cache-Control "public, max-age=31536000, immutable"'])
  const images = location('location ~* ^/assets/.*\\.(?:avif|webp|png|jpe?g|gif|svg)$')
  assert.deepEqual(inherited(images, 'add_header'), ['add_header Cache-Control "public, max-age=3600, must-revalidate"'])
})

test('unknown files and bare directories keep real localized HTTP 404 responses', () => {
  assert.ok(frontend.directives.includes('error_page 404 /404.html'))
  assert.ok(english.directives.includes('error_page 404 /en/404.html'))
  for (const parent of [frontend, english]) assert.ok(parent.directives.includes('try_files $uri $uri/index.html =404'))
  for (const parent of [frontend, english]) {
    const hidden = parent.children.find(scope => scope.header === 'location ~ /\\.(?!well-known(?:/|$))')
    assert.deepEqual(hidden?.directives, ['return 404'], 'Build manifests and dotfiles must not be public')
  }
  for (const prefix of ['', '/en']) {
    const error = location('location = ' + prefix + '/404.html')
    assert.ok(error.directives.includes('internal'))
    assert.deepEqual(inherited(error, 'add_header'), [
      'add_header Cache-Control "no-cache" always',
      'add_header X-Robots-Tag "noindex, nofollow" always',
    ])
  }
  assert.equal(scopes.some(scope => scope.directives.some(value => /try_files \$uri \$uri\/ =404|error_page 404 =200/.test(value))), false)
  for (const name of ['canonical_directory', 'english_canonical_directory']) {
    const alias = scopes.find(scope => scope.header.includes('?<' + name + '>'))
    assert.ok(alias)
    assert.ok(alias.directives.includes('return 308 $' + name + '$is_args$args'))
    assert.equal(alias.children[0].header, 'if (!-f $request_filename)')
    assert.deepEqual(alias.children[0].directives, ['return 404'])
  }
})
