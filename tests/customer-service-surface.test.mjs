import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/styles/account-service-card.css', import.meta.url), 'utf8')
const rule = selector => {
  const start = css.indexOf(`${selector} {`)
  assert.notEqual(start, -1, `Missing selector: ${selector}`)
  return css.slice(start + selector.length + 2).split('}', 1)[0]
}

test('Expanded services share the outer card surface and its responsive content edges', () => {
  assert.match(rule('.account-service-card'), /background:\s*#f3f3f3\s*;/)
  assert.match(rule('.account-service-disclosure > summary'), /padding:\s*var\(--account-service-inset\)\s*;/)
  const expanded = rule('.account-service-expanded')
  assert.match(expanded, /background:\s*transparent\s*;/)
  assert.match(expanded, /margin:\s*0 var\(--account-service-inset\) var\(--account-service-inset\)\s*;/)
  assert.match(expanded, /padding:\s*20px 0 0\s*;/)
  assert.match(expanded, /border-top:\s*1px solid/)
  for (const [width, inset] of [[820, 18], [480, 15], [380, 12]]) {
    const query = `@media (max-width: ${width}px)`
    assert.ok(css.includes(query), `Missing breakpoint: ${width}px`)
    const breakpoint = css.slice(css.indexOf(query) + query.length).split('@media', 1)[0]
    assert.match(breakpoint, new RegExp(`--account-service-inset:\\s*${inset}px\\s*;`))
  }
})

test('Service information stays flat while its summary device row remains white', () => {
  for (const selector of [
    '.account-service-card .account-service-expanded .account-service-progress',
    '.account-service-expanded__notes > .account-field',
    '.account-service-device',
  ]) {
    const surface = rule(selector)
    assert.match(surface, /background:\s*transparent\s*;/)
    assert.match(surface, /border:\s*0\s*;/)
    assert.match(surface, /border-radius:\s*0\s*;/)
  }
  assert.match(rule('.account-service-summary__device'), /background:\s*#fff\s*;/)
  assert.match(rule('.account-service-expanded__notes'), /border-top:\s*1px solid/)
  assert.match(rule('.account-service-device + .account-service-device'), /border-top:\s*1px solid/)
})
