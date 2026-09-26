import test from 'node:test'
import assert from 'node:assert/strict'
import { applyRouteMetadata, getRouteMetadata } from '../src/utils/routes.ts'

// A small head-only DOM model keeps these route transition checks independent
// of the build output and does not load application code or customer data.
function createHeadDocument() {
  const nodes = []
  const matches = (node, selector) => {
    const tag = selector.match(/^\w+/)?.[0]
    if (tag && node.tagName !== tag) return false
    return [...selector.matchAll(/\[([\w:-]+)(?:(\^?=)"([^"]*)")?\]/g)].every(([, name, operator, value]) => {
      const actual = node.attributes[name] ?? node[name]
      return operator === '=' ? actual === value : operator === '^=' ? actual?.startsWith(value) : actual !== undefined
    })
  }
  const head = { append(node) { node.parentNode = head; nodes.push(node) } }
  return {
    head, documentElement: {}, title: '',
    createElement(tagName) {
      return {
        tagName, attributes: {}, parentNode: null,
        setAttribute(name, value) { this.attributes[name] = value },
        getAttribute(name) { return this.attributes[name] ?? this[name] ?? null },
        remove() { const index = nodes.indexOf(this); if (index >= 0) nodes.splice(index, 1); this.parentNode = null },
      }
    },
    querySelectorAll(selector) { return nodes.filter(node => selector.split(',').some(part => matches(node, part.trim()))) },
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null },
  }
}

function withHead(run) {
  const previous = globalThis.document
  const document = createHeadDocument()
  globalThis.document = document
  try { run(document) } finally {
    if (previous === undefined) delete globalThis.document
    else globalThis.document = previous
  }
}

test('known routes restore canonical and social metadata after a 404 has removed them', () => withHead(document => {
  for (const path of ['/services/laptop-repair/', '/en/blog/lost-files-first-minutes/', '/privacy/', '/en/account/']) {
    applyRouteMetadata('/missing-page/')
    assert.equal(document.querySelector('link[rel="canonical"]'), null)
    assert.equal(document.querySelector('meta[property="og:image"]'), null)
    assert.equal(document.querySelector('meta[name="twitter:card"]').getAttribute('content'), 'summary')

    applyRouteMetadata(path)
    const metadata = getRouteMetadata(path)
    assert.equal(document.title, metadata.title)
    assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), metadata.canonical)
    assert.equal(document.querySelector('meta[property="og:url"]').getAttribute('content'), metadata.canonical)
    assert.equal(document.querySelector('meta[property="og:image"]').getAttribute('content'), metadata.image)
    assert.equal(document.querySelector('meta[property="og:image:width"]').getAttribute('content'), metadata.imageWidth)
    assert.equal(document.querySelector('meta[name="twitter:image"]').getAttribute('content'), metadata.image)
    assert.equal(document.querySelector('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image')
    assert.equal(document.querySelector('meta[name="robots"]').getAttribute('content'), metadata.robots)
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 3)
  }
}))

test('applying metadata repeatedly removes duplicate tags and never indexes private or unapproved legal routes', () => withHead(document => {
  for (const path of ['/en/services/drone-repair/', '/terms/', '/privacy/', '/account/']) {
    for (let index = 0; index < 2; index++) {
      const meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      meta.setAttribute('content', 'index, follow')
      document.head.append(meta)
      const link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      link.setAttribute('href', 'https://example.invalid/')
      document.head.append(link)
    }
    applyRouteMetadata(path)
    applyRouteMetadata(path)
    assert.equal(document.querySelectorAll('meta[name="robots"]').length, 1)
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1)
    assert.equal(document.querySelectorAll('meta[property="og:image"]').length, 1)
    assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 3)
    assert.equal(document.querySelector('meta[name="robots"]').getAttribute('content'), getRouteMetadata(path).robots)
  }
}))

test('unknown paths remove all canonical and image signals without losing noindex', () => withHead(document => {
  applyRouteMetadata('/en/blog/')
  applyRouteMetadata('/en/missing-page/')
  assert.equal(document.documentElement.lang, 'en')
  assert.equal(document.querySelector('link[rel="canonical"]'), null)
  assert.equal(document.querySelectorAll('link[rel="alternate"][hreflang]').length, 0)
  assert.equal(document.querySelectorAll('meta[property^="og:image"]').length, 0)
  assert.equal(document.querySelectorAll('meta[name^="twitter:image"]').length, 0)
  assert.equal(document.querySelector('meta[name="robots"]').getAttribute('content'), 'noindex, follow')
}))
