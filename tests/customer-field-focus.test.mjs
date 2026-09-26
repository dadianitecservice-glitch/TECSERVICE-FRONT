import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const authCss = await readFile(new URL('src/styles/account-auth.css', root), 'utf8')
const [dashboardCss, profileCss, settingsCss, commentsCss] = await Promise.all([
  'src/styles/account-dashboard.css', 'src/styles/account-profile.css',
  'src/styles/account-settings.css', 'src/styles/customer-comments.css',
].map(path => readFile(new URL(path, root), 'utf8')))
const rule = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`^\\s*${escaped}\\s*\\{([^}]+)\\}`, 'm'))
  assert.ok(match, `Missing scoped focus rule: ${selector}`)
  return match[1]
}

test('Auth text fields keep their neutral border and use background-only focus feedback', () => {
  const resting = rule(authCss, '.account-auth__form input:not([type=checkbox])')
  const focused = rule(authCss, '.account-auth__form input:not([type=checkbox]):is(:focus, :focus-visible)')
  assert.match(resting, /border:\s*1px solid #dce6ee/)
  assert.match(resting, /height:\s*44px/)
  assert.match(resting, /outline:\s*none/)
  assert.match(resting, /box-shadow:\s*none/)
  assert.match(focused, /outline:\s*none/)
  assert.match(focused, /box-shadow:\s*none/)
  assert.match(focused, /background:\s*#[\da-f]{6}\b/i)
  assert.notEqual(focused.match(/background:\s*([^;]+)/)?.[1], resting.match(/background:\s*([^;]+)/)?.[1], 'A focused field remains visually distinguishable without an added frame')
  assert.doesNotMatch(focused, /\bborder(?:-color|-width|-style)?:/)
  assert.doesNotMatch(focused, /outline-color:|outline-offset:/)
})

test('Auth links, buttons and consent checkbox retain keyboard focus and validation styles', () => {
  const actionableFocus = rule(authCss, '.account-auth :is(a, button, input[type=checkbox]):focus-visible')
  assert.match(actionableFocus, /outline:\s*3px solid/)
  assert.match(actionableFocus, /outline-offset:\s*3px/)
  assert.doesNotMatch(authCss, /\.account-auth :is\(a, button, input\):focus-visible/)
  assert.doesNotMatch(authCss, /\.account-auth\s+\*[^{}]*\{[^}]*outline:\s*(?:0|none)/)
  assert.match(rule(authCss, '.account-auth__error'), /border:\s*1px solid #f3d3d8/)
  assert.match(rule(authCss, '.account-auth__consent input'), /width:\s*18px;\s*height:\s*18px/)
})

test('Cabinet address/password and search wrappers change background without gaining another frame', () => {
  for (const [css, wrapper, input] of [
    [settingsCss, '.account-settings__field:focus-within', '.account-dashboard .account-settings__field input:is(:focus, :focus-visible)'],
    [dashboardCss, '.account-search:focus-within', '.account-dashboard .account-search input:is(:focus, :focus-visible)'],
  ]) {
    const focusedWrapper = rule(css, wrapper)
    assert.match(focusedWrapper, /background:\s*#edf3f7/)
    assert.doesNotMatch(focusedWrapper, /border(?:-color|-width|-style)?:|outline:|box-shadow:/)
    const focusedInput = rule(css, input)
    assert.match(focusedInput, /outline:\s*none/)
    assert.match(focusedInput, /box-shadow:\s*none/)
    assert.doesNotMatch(focusedInput, /border(?:-color|-width|-style)?:/)
  }
  assert.match(rule(settingsCss, '.account-settings__field'), /border:\s*1px solid #e5ebf0/)
  assert.match(rule(settingsCss, '.account-settings__field:has(input[aria-invalid="true"])'), /border-color:\s*#c96f7b/)
  assert.match(rule(dashboardCss, '.account-search input'), /border:\s*0/)
})

test('Profile and password-confirmation inputs retain resting and error borders during background-only focus', () => {
  for (const selector of [
    '.account-dashboard .account-profile-editor__field > input:is(:focus, :focus-visible)',
    '.account-profile-confirm .account-profile-confirm__password > input:is(:focus, :focus-visible)',
  ]) {
    const focused = rule(profileCss, selector)
    assert.match(focused, /outline:\s*none/)
    assert.match(focused, /box-shadow:\s*none/)
    assert.match(focused, /background:\s*#edf3f7/)
    assert.doesNotMatch(focused, /border(?:-color|-width|-style)?:/)
  }
  assert.match(rule(profileCss, '.account-profile-editor .account-profile-editor__field > input'), /border:\s*1px solid #e5ebf0/)
  assert.match(rule(profileCss, '.account-profile-confirm .account-profile-confirm__password > input'), /border:\s*1px solid #e0e7ec/)
  assert.match(rule(profileCss, '.account-profile-editor .account-profile-editor__field > input[aria-invalid="true"]'), /border-color:\s*#c96f7b/)
  assert.match(rule(profileCss, '.account-profile-editor__error'), /border-color:\s*#f0dce0/)
})

test('Comment editors use background-only focus while retaining the textarea border and resize behavior', () => {
  const focused = rule(commentsCss, ':is(.product-comments-dialog,.customer-comments) textarea:is(:focus, :focus-visible)')
  assert.match(focused, /outline:\s*none/)
  assert.match(focused, /box-shadow:\s*none/)
  assert.match(focused, /background:\s*#edf3f7/)
  assert.doesNotMatch(focused, /border(?:-color|-width|-style)?:/)
  const resting = rule(commentsCss, ':is(.product-comments-dialog,.customer-comments) textarea')
  assert.match(resting, /border:\s*1px solid #dce6ee/)
  assert.match(resting, /resize:\s*vertical/)
  assert.doesNotMatch(commentsCss, /:is\(button,textarea,a\):focus-visible/)
})

test('Cabinet action controls keep visible keyboard focus independently of text field styling', () => {
  assert.match(rule(dashboardCss, '.account-dashboard :is(button,a,input,select,summary):focus-visible'), /outline:\s*3px solid/)
  assert.match(rule(profileCss, '.account-profile-editor button:focus-visible'), /outline:\s*2px solid/)
  assert.match(rule(commentsCss, ':is(.product-comments-dialog,.customer-comments) :is(button,a):focus-visible'), /outline:\s*3px solid/)
  for (const css of [dashboardCss, profileCss, settingsCss, commentsCss]) {
    assert.doesNotMatch(css, /(?:\.account-dashboard|\.account-profile-editor|\.account-settings|\.customer-comments)\s+\*[^{}]*\{[^}]*outline:\s*(?:0|none)/)
  }
})
