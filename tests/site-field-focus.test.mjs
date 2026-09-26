import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const styles = Object.fromEntries(await Promise.all(
  ['global', 'blog-page', 'contact-page', 'laptop-repair'].map(async name => [
    name,
    await readFile(new URL(`../src/styles/${name}.css`, import.meta.url), 'utf8'),
  ]),
))

function rule(style, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = styles[style].match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))
  assert.ok(match, `Missing ${selector} rule in ${style}`)
  return match[1]
}

function assertQuietFocus(style, selector) {
  const declarations = rule(style, selector)
  assert.match(declarations, /background(?:-color)?:\s*#[\da-f]+;/i)
  assert.match(declarations, /box-shadow:\s*none;/)
  // Leave resting and error border declarations untouched instead of replacing them.
  assert.doesNotMatch(declarations, /(?:^|[;\s])border(?:-[\w-]+)?:/)
  const outline = declarations.match(/outline:\s*([^;]+);/)?.[1].trim()
  if (outline !== undefined) assert.equal(outline, 'none')
}

test('public text, ticket and OTP fields use a background-only focus cue', () => {
  for (const selector of ['.textarea-shell textarea', '.ticket-form input', '.otp-inputs input']) {
    assertQuietFocus('global', `${selector}:focus`)
    assert.match(rule('global', selector), /outline:\s*none;/)
  }
})

test('blog search has no added focus border while search actions keep keyboard focus', () => {
  assertQuietFocus('blog-page', '.journal-search:focus-within')
  assert.match(rule('blog-page', '.journal-search input'), /outline:\s*none;/)
  assert.match(rule('blog-page', '.journal-page :is(a, button, summary):focus-visible'), /outline:\s*3px solid/)
  assert.doesNotMatch(styles['blog-page'], /:is\([^)]*\binput\b[^)]*\):focus-visible/)
})

test('contact copy fallback has quiet focus without removing link or button indicators', () => {
  assertQuietFocus('contact-page', '.contact-page__copy-fallback input:focus')
  assert.match(rule('contact-page', '.contact-page button:focus-visible'), /outline:\s*3px solid/)
  assert.doesNotMatch(styles['contact-page'], /\.contact-page input:focus-visible/)
})

test('all shared repair-page lookup fields use quiet focus', () => {
  assertQuietFocus('laptop-repair', '.lp-status-strip input:focus')
  assert.match(rule('laptop-repair', '.lp-problem-panel:focus-visible'), /outline:\s*2px solid/)
  assert.match(rule('laptop-repair', '.lp-problem-picker__control:focus-visible'), /outline:\s*2px solid/)
  assert.doesNotMatch(styles['laptop-repair'], /\.laptop-page input:focus-visible/)
})
