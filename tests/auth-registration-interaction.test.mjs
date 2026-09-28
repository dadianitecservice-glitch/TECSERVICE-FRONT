import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'

const source = await readFile(new URL('../src/account/AuthDialog.tsx', import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const find = (node, predicate) => Array.isArray(node)
  ? node.flatMap(child => find(child, predicate))
  : node?.props ? [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)] : []
let instance = 0

// Exercise the component's real handlers and state transitions without a browser
// or an authentication server. The only API request remains an in-memory promise.
async function authDriver({ mode = 'register', locale = 'en' } = {}) {
  const id = ++instance
  const hooksUrl = moduleUrl(`/* hooks ${id} */
    const slots = [];
    let cursor = 0, dirty = false, pending = [];
    export const begin = () => { cursor = 0; dirty = false; pending = []; };
    export const flush = () => { for (const effect of pending) effect(); return dirty; };
    export function useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => {
        const next = typeof value === 'function' ? value(slots[index]) : value;
        if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; }
      }];
    }
    export function useRef(value) {
      const index = cursor++;
      return slots[index] ??= { current: value };
    }
    export function useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        pending.push(() => {
          previous?.cleanup?.();
          slots[index] = { deps, cleanup: effect() };
        });
      }
    }
  `)
  const contextUrl = moduleUrl(`/* auth ${id} */
    export const events = [];
    export const auth = {
      authMode: ${JSON.stringify(mode)},
      closeAuth: () => events.push('close'),
      openAuth: value => { auth.authMode = value; events.push('mode:' + value); },
      acceptUser: () => events.push('accept'),
    };
    export const useCustomerAuth = () => auth;
  `)
  const apiUrl = moduleUrl(`/* api ${id} */
    export const calls = [];
    let finish;
    export const settled = new Promise(resolve => { finish = resolve; });
    export const resolve = () => finish({ id: 1 });
    export const customerApi = {
      register: value => { calls.push({ method: 'register', value }); return settled; },
      login: (...value) => { calls.push({ method: 'login', value }); return settled; },
    };
    export const customerErrorMessage = () => 'Request failed';
  `)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({ locale: ${JSON.stringify(locale)}, href: value => value });`),
    '../components/LaptopIcon': moduleUrl('export const LaptopIcon = () => null;'),
    './CustomerAuthProvider': contextUrl,
    './customerApi': apiUrl,
    '../utils/validation': moduleUrl('export const normalizeGeorgianMobile = value => value;'),
    '../styles/account-auth.css': moduleUrl('export {};'),
  }
  let { code } = await transformWithOxc(source, '/AuthDialog.tsx', { jsx: { runtime: 'automatic' } })
  for (const [key, value] of Object.entries(replacements)) code = code.replaceAll(JSON.stringify(key), JSON.stringify(value))
  const { default: AuthDialog } = await import(moduleUrl(code))
  const hooks = await import(hooksUrl)
  const { auth, events } = await import(contextUrl)
  const api = await import(apiUrl)
  let tree
  const render = () => {
    for (let pass = 0; pass < 10; pass++) {
      hooks.begin()
      tree = AuthDialog()
      if (!hooks.flush()) return tree
    }
    throw new Error('The auth component did not settle after its effects')
  }
  render()
  return {
    events,
    api,
    render,
    nodes: predicate => find(tree, predicate),
    input: name => find(tree, node => node.type === 'input' && node.props.name === name)[0],
    visibility: name => {
      const group = find(tree, node => node.props.className === 'account-auth__password'
        && find(node.props.children, child => child.type === 'input' && child.props.name === name).length)[0]
      return find(group, node => node.type === 'button')[0]
    },
    setMode: value => { auth.authMode = value; render() },
    backdrop: () => { const target = {}; tree.props.onClick({ target, currentTarget: target }); render() },
    content: () => { tree.props.onClick({ target: {}, currentTarget: {} }); render() },
    cancel: () => {
      let prevented = false
      tree.props.onCancel({ preventDefault: () => { prevented = true } })
      render()
      return prevented
    },
    explicitClose: () => {
      const button = find(tree, node => node.props.className === 'account-auth__close')[0]
      // Match native disabled-button behavior; a disabled button emits no click.
      if (!button.props.disabled) button.props.onClick()
      render()
      return !!button.props.disabled
    },
    submit: () => {
      const form = find(tree, node => node.type === 'form')[0]
      const fields = new Map([
        ['full_name', 'Test Customer'], ['phone', '+995555123123'],
        ['password', 'Example123'], ['confirm', 'Example123'], ['terms', 'on'],
      ])
      const previousFormData = globalThis.FormData
      let resets = 0
      globalThis.FormData = class { get(name) { return fields.get(name) ?? null } }
      let promise
      try {
        promise = form.props.onSubmit({
          preventDefault() {},
          currentTarget: { reportValidity: () => true, reset: () => { resets++ }, querySelector: () => null },
        })
      } finally { globalThis.FormData = previousFormData }
      render()
      return { promise, resets: () => resets }
    },
  }
}

test('registration has separate, non-submitting visibility toggles for both password fields', async () => {
  const driver = await authDriver()
  for (const name of ['password', 'confirm']) {
    assert.equal(driver.input(name).props.type, 'password')
    assert.equal(driver.visibility(name).props.type, 'button')
    assert.equal(driver.visibility(name).props['aria-pressed'], false)
  }
  assert.equal(driver.visibility('confirm').props['aria-label'], 'Show confirmation password')
  driver.visibility('confirm').props.onClick()
  driver.render()
  assert.equal(driver.input('confirm').props.type, 'text')
  assert.equal(driver.input('password').props.type, 'password')
  assert.equal(driver.visibility('confirm').props['aria-label'], 'Hide confirmation password')
  assert.equal(driver.visibility('confirm').props['aria-pressed'], true)
  driver.visibility('password').props.onClick()
  driver.render()
  assert.equal(driver.input('password').props.type, 'text')
  assert.equal(driver.input('confirm').props.type, 'text')
  driver.visibility('confirm').props.onClick()
  driver.render()
  assert.equal(driver.input('confirm').props.type, 'password')
  assert.equal(driver.input('password').props.type, 'text')
  assert.deepEqual(driver.api.calls, [])
  assert.deepEqual(driver.events, [])
})

test('visibility changes retain the existing uncontrolled input identity and field configuration', async () => {
  const driver = await authDriver()
  const before = driver.input('confirm')
  driver.visibility('confirm').props.onClick()
  driver.render()
  const after = driver.input('confirm')
  assert.equal(after.type, before.type)
  assert.equal(after.key, before.key)
  for (const key of ['id', 'name', 'autoComplete', 'required', 'minLength', 'maxLength', 'value', 'defaultValue']) {
    assert.equal(after.props[key], before.props[key], key)
  }
  assert.equal(after.props.autoComplete, 'new-password')
  assert.equal(after.props.value, undefined)
})

test('Georgian confirmation visibility controls have translated show and hide labels', async () => {
  const driver = await authDriver({ locale: 'ka' })
  const showLabel = driver.visibility('confirm').props['aria-label']
  assert.match(showLabel, /[\u10d0-\u10fa]/u)
  assert.notEqual(showLabel, 'Show confirmation password')
  driver.visibility('confirm').props.onClick()
  driver.render()
  const hideLabel = driver.visibility('confirm').props['aria-label']
  assert.match(hideLabel, /[\u10d0-\u10fa]/u)
  assert.notEqual(hideLabel, showLabel)
})

test('switching account-access modes resets both password visibility states', async () => {
  const driver = await authDriver()
  for (const name of ['password', 'confirm']) {
    driver.visibility(name).props.onClick()
    driver.render()
  }
  driver.setMode('login')
  assert.equal(driver.input('password').props.type, 'password')
  assert.equal(driver.input('confirm'), undefined)
  driver.visibility('password').props.onClick()
  driver.render()
  driver.setMode('register')
  assert.equal(driver.input('password').props.type, 'password')
  assert.equal(driver.input('confirm').props.type, 'password')
})

test('registration ignores backdrop and native cancel but still permits explicit close', async () => {
  const driver = await authDriver()
  driver.backdrop()
  driver.content()
  assert.equal(driver.cancel(), true)
  assert.deepEqual(driver.events, [])
  assert.equal(driver.explicitClose(), false)
  assert.deepEqual(driver.events, ['close'])
})

test('sign-in and account-help retain backdrop and Escape dismissal without closing on content clicks', async () => {
  for (const mode of ['login', 'help']) {
    const driver = await authDriver({ mode })
    driver.content()
    assert.deepEqual(driver.events, [])
    driver.backdrop()
    assert.deepEqual(driver.events, ['close'])
    assert.equal(driver.cancel(), true)
    assert.deepEqual(driver.events, ['close', 'close'])
  }
})

test('a pending registration cannot dismiss or duplicate its request and unlocks on completion', async () => {
  const driver = await authDriver()
  const request = driver.submit()
  assert.equal(driver.api.calls.length, 1)
  assert.equal(driver.nodes(node => node.type === 'fieldset')[0].props.disabled, true)
  driver.backdrop()
  assert.equal(driver.cancel(), true)
  assert.equal(driver.explicitClose(), true)
  const duplicate = driver.submit()
  await duplicate.promise
  assert.equal(driver.api.calls.length, 1)
  assert.equal(request.resets(), 0)
  assert.deepEqual(driver.events, [])
  driver.api.resolve()
  await request.promise
  driver.render()
  assert.equal(request.resets(), 1)
  assert.equal(driver.nodes(node => node.type === 'form').length, 0)
  assert.equal(driver.explicitClose(), false)
  assert.deepEqual(driver.events, ['close'])
})
