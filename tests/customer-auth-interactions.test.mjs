import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('src/account/AuthDialog.tsx', root), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const findAll = (node, predicate) => Array.isArray(node) ? node.flatMap(child => findAll(child, predicate)) : node?.props ? [...(predicate(node) ? [node] : []), ...findAll(node.props.children, predicate)] : []
const textContent = node => Array.isArray(node) ? node.map(textContent).join('') : node?.props ? textContent(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
let instance = 0

// Actual form handlers with isolated hook state and deferred API promises.
// No browser, authentication cookies, account service or network is used.
async function authDriver(t, { locale = 'en', mode = 'register' } = {}) {
  const id = ++instance
  const hooksUrl = moduleUrl(`
    // Auth hooks ${id}
    let cells = [], cursor = 0, queued = [], dirty = false;
    export function begin() { cursor = 0; queued = []; dirty = false }
    export const changed = () => dirty;
    export function useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial;
      return [cells[index], value => { const next = typeof value === 'function' ? value(cells[index]) : value; if (!Object.is(next, cells[index])) { cells[index] = next; dirty = true } }];
    }
    export function useRef(initial) { const index = cursor++; return cells[index] ??= { current: initial } }
    export function useEffect(callback, deps) {
      const index = cursor++, previous = cells[index];
      if (!previous || deps.some((value, at) => !Object.is(value, previous.deps[at]))) queued.push(() => { previous?.cleanup?.(); cells[index] = { deps, cleanup: callback() } });
    }
    export function flush() { for (const callback of queued) callback(); queued = [] }
  `)
  const authUrl = moduleUrl(`
    // Auth context ${id}
    export const accepted = [];
    export const auth = { authMode: ${JSON.stringify(mode)}, openAuth(mode) { this.authMode = mode }, closeAuth() { this.authMode = null }, acceptUser(user) { accepted.push(user) } };
    export const useCustomerAuth = () => auth;
  `)
  const apiUrl = moduleUrl(`
    // Deferred auth API ${id}
    export const calls = [], pending = [];
    const request = (kind, payload) => { calls.push({ kind, payload }); return new Promise((resolve, reject) => pending.push({ resolve, reject })) };
    export const customerApi = { register: payload => request('register', payload), login: (identifier, password) => request('login', { identifier, password }) };
    export const customerErrorMessage = (_error, english) => english ? 'Synthetic request failed.' : 'სინთეზური მოთხოვნა ვერ შესრულდა.';
  `)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({ locale: ${JSON.stringify(locale)}, href: path => ${locale === 'en' ? '"/en" + path' : 'path'} })`),
    '../components/LaptopIcon': moduleUrl('export function LaptopIcon() { return null }'),
    './CustomerAuthProvider': authUrl,
    './customerApi': apiUrl,
    '../utils/validation': new URL('src/utils/validation.ts', root).href,
  }
  const { code } = await transformWithOxc(source, '/AuthDialog.tsx', { jsx: { runtime: 'automatic' } })
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, replacement] of Object.entries(replacements)) executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement))
  const hooks = await import(hooksUrl)
  const api = await import(apiUrl)
  const context = await import(authUrl)
  const { default: AuthDialog } = await import(moduleUrl(executable))
  const focus = [], redirects = []
  const previousDocument = globalThis.document, previousWindow = globalThis.window
  globalThis.document = { activeElement: null, body: { style: { overflow: '' } } }
  globalThis.window = { location: { assign(path) { redirects.push(path) } } }
  t.after(() => { globalThis.document = previousDocument; globalThis.window = previousWindow })
  t.mock.method(globalThis, 'FormData', function (form) { return { get: name => form.values[name] ?? null } })
  const dialog = { open: false, showModal() { this.open = true }, close() { this.open = false } }
  let tree
  const render = () => {
    for (let pass = 0; pass < 10; pass++) {
      hooks.begin(); tree = AuthDialog()
      const element = findAll(tree, node => node.type === 'dialog')[0]
      if (element) element.props.ref.current = dialog
      hooks.flush()
      if (!hooks.changed()) return
    }
    throw new Error('Auth effects did not settle')
  }
  render()
  return {
    api, context, focus, redirects, render,
    get tree() { return tree },
    submit(values) {
      const form = { values, reportValidity: () => true, reset() {}, querySelector(selector) { return { focus() { focus.push(selector) } } } }
      return findAll(tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {}, currentTarget: form })
    },
    alerts() { return findAll(tree, node => node.props.role === 'alert').map(textContent) },
  }
}

const validRegistration = { full_name: 'Synthetic Customer', phone: '+995599000000', email: 'customer@example.invalid', password: 'SyntheticPassword9', confirm: 'SyntheticPassword9' }

for (const locale of ['en', 'ka']) {
  test(`${locale} registration rejects blank or one-character normalized names locally`, async t => {
    const driver = await authDriver(t, { locale })
    for (const full_name of ['   ', ' A ']) {
      await driver.submit({ ...validRegistration, full_name }); driver.render()
      assert.deepEqual(driver.api.calls, [])
      assert.match(driver.alerts()[0], /2–160/)
      assert.equal(driver.focus.at(-1), '[name="full_name"]')
    }
  })

  test(`${locale} sign-in rejects a whitespace-only identifier before sending`, async t => {
    const driver = await authDriver(t, { locale, mode: 'login' })
    await driver.submit({ identifier: '   ', password: 'SyntheticPassword9' }); driver.render()
    assert.deepEqual(driver.api.calls, [])
    assert.match(driver.alerts()[0], locale === 'en' ? /Enter your mobile number or email/ : /მიუთითეთ მობილურის ნომერი ან ელფოსტა/)
    assert.equal(driver.focus.at(-1), '[name="identifier"]')
  })
}

test('Registration normalizes the name and permits only one pending submission, with retry after failure', async t => {
  const driver = await authDriver(t)
  const values = { ...validRegistration, full_name: '  Synthetic   Customer  ' }
  const first = driver.submit(values)
  await driver.submit(values)
  assert.equal(driver.api.calls.length, 1)
  assert.equal(driver.api.calls[0].payload.full_name, 'Synthetic Customer')
  driver.api.pending.shift().reject(new Error('Synthetic failure'))
  await first; driver.render()
  assert.equal(driver.alerts().length, 1)
  const retry = driver.submit(values)
  assert.equal(driver.api.calls.length, 2)
  driver.api.pending.shift().resolve({ id: 'synthetic-customer' })
  await retry; driver.render()
  assert.match(textContent(driver.tree), /Request received/)
  assert.deepEqual(driver.context.accepted, [], 'Registration must never authenticate an unapproved account')
  assert.deepEqual(driver.redirects, [])
})

test('Registration rejects passwords shorter than eight Unicode characters and accepts Georgian letters', async t => {
  const driver = await authDriver(t)
  await driver.submit({ ...validRegistration, password: '😀😀😀a1', confirm: '😀😀😀a1' }); driver.render()
  assert.deepEqual(driver.api.calls, [])
  assert.match(driver.alerts()[0], /at least 8 characters/)
  const password = 'ახალიპაროლი123'
  const pending = driver.submit({ ...validRegistration, password, confirm: password })
  assert.equal(driver.api.calls.length, 1)
  assert.equal(driver.api.calls[0].payload.password, password)
  driver.api.pending.shift().resolve({ id: 'synthetic-customer' })
  await pending
})

test('Sign-in suppresses duplicate submissions and redirects to the localized account after success', async t => {
  const driver = await authDriver(t, { locale: 'en', mode: 'login' })
  const values = { identifier: '  customer@example.invalid  ', password: 'SyntheticPassword9' }
  const pending = driver.submit(values)
  await driver.submit(values)
  assert.deepEqual(driver.api.calls, [{ kind: 'login', payload: { identifier: 'customer@example.invalid', password: values.password } }])
  const user = { id: 'synthetic-customer' }
  driver.api.pending.shift().resolve(user)
  await pending
  assert.deepEqual(driver.context.accepted, [user])
  assert.deepEqual(driver.redirects, ['/en/account/'])
})
