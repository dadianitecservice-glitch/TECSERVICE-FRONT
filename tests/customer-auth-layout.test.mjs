import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')

test('Both account access modes use the same compact form without removing short-screen scrolling', async () => {
  const css = await read('src/styles/account-auth.css')
  assert.match(css, /\.account-auth__panel\s*\{[^}]*padding:\s*25px 32px 18px/)
  assert.match(css, /\.account-auth__brand\s*\{[^}]*margin:\s*0 0 15px/)
  assert.match(css, /\.account-auth__tabs\s*\{[^}]*margin:\s*15px 0 17px/)
  assert.match(css, /\.account-auth__form fieldset\s*\{[^}]*gap:\s*10px/)
  assert.match(css, /\.account-auth__form input:not\(\[type=checkbox\]\)\s*\{[^}]*height:\s*44px;[^}]*margin-top:\s*4px/)
  assert.match(css, /\.account-auth\s*\{[^}]*max-height:\s*calc\(100dvh - 40px\);[^}]*overflow-y:\s*auto/)
  assert.match(css, /@media \(max-width:\s*600px\)\s*\{[\s\S]*?\.account-auth__panel\s*\{[^}]*padding:\s*25px 20px 18px/)
  assert.match(css, /\.account-auth__form input:not\(\[type=checkbox\]\)\s*\{\s*font-size:\s*16px/)
  assert.doesNotMatch(css, /\.account-auth(?:__form|__panel)?\s*\{[^}]*overflow(?:-y)?:\s*hidden/)
})

test('Compact account controls retain keyboard focus and 44px primary touch targets', async () => {
  const css = await read('src/styles/account-auth.css')
  assert.match(css, /\.account-auth :is\(a, button, input\[type=checkbox\]\):focus-visible\s*\{[^}]*outline:\s*3px/)
  for (const selector of ['.account-auth__close', '.account-auth__tabs button', '.account-auth__password button']) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(css, new RegExp(`${escaped}\\s*\\{[^}]*(?:min-)?height:\\s*44px`))
  }
  assert.match(css, /\.account-auth__primary, \.account-auth__secondary\s*\{[^}]*min-height:\s*44px/)
})
