import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('Mobile account navigation wraps Georgian labels between words instead of splitting letters', async () => {
  const css = await readFile(new URL('../src/styles/account-dashboard.css', import.meta.url), 'utf8')
  const mobile = css.slice(css.indexOf('@media (max-width: 600px)'))
  assert.match(mobile, /\.account-nav__label\s*\{[^}]*overflow-wrap:\s*normal;[^}]*word-break:\s*normal;/)
  assert.match(mobile, /\.account-nav button\s*\{[^}]*padding:\s*10px 8px;[^}]*gap:\s*6px;/)
  assert.match(mobile, /\.account-nav__number\s*\{[^}]*flex-basis:\s*14px;/)
})
