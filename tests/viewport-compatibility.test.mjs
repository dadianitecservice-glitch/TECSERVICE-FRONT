import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// Static compatibility guard, not a claim of testing on a real Safari device.
for (const [file, selector, expectedRules] of [
  ['account-auth.css', '.account-auth', 2],
  ['account-invoices.css', '.account-invoice-dialog', 1],
  ['account-profile.css', '.account-profile-confirm', 1],
  ['responsive.css', '.site-header__navigation-shell', 1],
  ['blog-page.css', '.journal-sidebar', 1],
  ['legal-page.css', '.legal-page__sidebar', 1],
  ['global.css', '.review-modal__dialog', 1],
]) {
  test(`${file}: ${selector} retains an equivalent vh fallback before dvh`, async () => {
    const css = await readFile(new URL(`../src/styles/${file}`, import.meta.url), 'utf8')
    const selectorPattern = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const blocks = [...css.matchAll(new RegExp(`${selectorPattern}\\s*\\{([^{}]*)\\}`, 'g'))]
      .map(match => match[1]).filter(body => /max-height:\s*[^;]*dvh/.test(body))
    assert.equal(blocks.length, expectedRules)
    for (const body of blocks) {
      const declarations = body.split(';').map(item => item.trim())
      const index = declarations.findIndex(item => /^max-height:\s*.*dvh/.test(item))
      assert.ok(index > 0)
      assert.equal(declarations[index - 1], declarations[index].replaceAll('dvh', 'vh'))
    }
  })
}
