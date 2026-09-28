import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'

const source = await readFile(new URL('../src/components/Header.tsx', import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const find = (node, predicate) => Array.isArray(node) ? node.flatMap(child => find(child, predicate)) : node?.props ? [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)] : []
let instance = 0

async function headerDriver({ mobile = true, signedIn = false } = {}) {
  const id = ++instance
  const contextUrl = moduleUrl(`/* ${id} */ export const events = []; export const useCustomerAuth = () => ({ user: ${signedIn ? '{}' : 'null'}, openAuth: mode => events.push('open:' + mode) });`)
  const replacements = {
    react: moduleUrl('export const useEffect = () => {}; export const useRef = value => ({current:value}); export const useState = value => [value, () => {}];'),
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': moduleUrl("export const useTranslation = () => ({locale:'en',pathname:'/', t:value=>value, href:value=>value});"),
    '../i18n/locale': moduleUrl('export const localePath = (path,locale) => locale === "en" ? "/en" + path : path;'),
    '../data/services': moduleUrl('export const services = [];'),
    '../utils/text': moduleUrl('export const toGeorgianMtavruli = value => value;'),
    '../utils/navigation': moduleUrl('export const getPrimaryLinkCurrent = () => undefined;'),
    '../account/CustomerAuthProvider': contextUrl,
  }
  let { code } = await transformWithOxc(source, '/Header.tsx', { jsx: { runtime: 'automatic' } })
  for (const [key, value] of Object.entries(replacements)) code = code.replaceAll(JSON.stringify(key), JSON.stringify(value))
  const { Header } = await import(moduleUrl(code))
  const { events } = await import(contextUrl)
  const tree = Header({})
  const toggle = find(tree, node => node.type === 'button' && node.props['aria-controls'] === 'site-primary-navigation')[0]
  toggle.props.ref.current = { getClientRects: () => mobile ? [{}] : [], focus: options => { assert.deepEqual(options, { preventScroll: true }); events.push('focus:menu') } }
  const link = find(tree, node => node.props.className === 'site-header__cabinet-action')[0]
  return { events, click: overrides => link.props.onClick({ button: 0, preventDefault: () => events.push('prevent'), currentTarget: { focus: options => { assert.deepEqual(options, { preventScroll: true }); events.push('focus:link') } }, ...overrides }) }
}

test('mobile account dialog opens with the visible menu toggle as its return focus target', async () => {
  const driver = await headerDriver()
  driver.click()
  assert.deepEqual(driver.events, ['prevent', 'focus:menu', 'open:login'])
})

test('desktop account dialog returns to sign-in even when the browser does not focus clicked links', async () => {
  const driver = await headerDriver({ mobile: false })
  driver.click()
  assert.deepEqual(driver.events, ['prevent', 'focus:link', 'open:login'])
})

test('modified account links and authenticated navigation retain normal browser behavior', async () => {
  for (const override of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
    const driver = await headerDriver()
    driver.click(override)
    assert.deepEqual(driver.events, [])
  }
  const driver = await headerDriver({ signedIn: true })
  driver.click()
  assert.deepEqual(driver.events, [])
})
