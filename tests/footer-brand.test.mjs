import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)

test('footer logo uses a white wordmark and the original red tile without recoloring the header logo', async () => {
  const footerLogo = await readFile(new URL('public/assets/brand/tecservice-logo-footer.svg', root), 'utf8')
  const headerLogo = await readFile(new URL('public/assets/brand/tecservice-logo.svg', root), 'utf8')
  const css = await readFile(new URL('src/styles/global.css', root), 'utf8')
  const footerImageStyle = css.match(/\.site-footer__logo img\s*\{([^}]+)\}/)?.[1]

  assert.match(footerLogo, /viewBox="0 0 211\.2 44\.0968"/)
  assert.equal((footerLogo.match(/<path\b/g) ?? []).length, 2)
  assert.match(footerLogo, /<path\b[^>]*id="Vector"[^>]*fill="#F51B27"/)
  assert.match(footerLogo, /<path\b[^>]*id="Vector_2"[^>]*fill="#FFFFFF"/)
  assert.doesNotMatch(footerLogo, /fill="#0B63B6"/)
  assert.match(headerLogo, /fill="#0B63B6"/)
  assert.match(headerLogo, /fill="#F51B27"/)
  assert.ok(footerImageStyle)
  assert.match(footerImageStyle, /filter:\s*none;/)
})
