import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'
import { dashboardCopy } from '../src/account/dashboardCopy.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('src/account/CustomerDashboard.tsx', root), 'utf8')
const { code } = await transformWithOxc(source, 'CustomerDashboard.tsx', { jsx: { runtime: 'automatic' } })
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const findAll = (node, predicate) => Array.isArray(node) ? node.flatMap(child => findAll(child, predicate)) : node && typeof node === 'object' && node.props ? [...(predicate(node) ? [node] : []), ...findAll(node.props.children, predicate)] : []
const nodeText = node => Array.isArray(node) ? node.map(nodeText).join('') : node?.props ? nodeText(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
const accessibleText = node => Array.isArray(node) ? node.map(accessibleText).join('') : node?.props ? node.props['aria-hidden'] === true || node.props['aria-hidden'] === 'true' ? '' : node.props['aria-label'] ?? accessibleText(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
const typeName = node => typeof node.type === 'function' ? node.type.name : node.type
const user = { id: 'synthetic-workspace-customer', full_name: 'Synthetic Customer', role: 'customer', approval_status: 'approved', is_active: true }
const ticket = (code, status, date, device = `Synthetic device ${code}`) => ({ ticket_code: code, status, created_at: `${date}T08:00:00Z`, updated_at: `${date}T10:00:00Z`, device, issue_description: `Synthetic issue ${code}`, items: [], cost_estimate: 50 })
const tickets = [ticket(101, 'ready', '2026-09-21'), ticket(102, 'picked_up', '2026-09-24'), ticket(103, 'could_not_fix', '2026-09-23'), { ...ticket(104, 'waiting_for_part', '2026-09-22'), items: [{ position: 1, device: 'Nested test console', status: 'waiting_for_part', issue_description: 'Synthetic nested issue', updated_at: '2026-09-22T10:00:00Z' }] }]
const purchase = (id, status, date, name) => ({ id, order_number: `ORDER-${id}`, status, payment_status: 'paid', created_at: `${date}T08:00:00Z`, total: 50, currency: 'GEL', items: [{ name, quantity: 1, unit_price: 50 }] })
const purchases = [purchase('ONE', 'completed', '2026-09-21', 'Synthetic keyboard'), purchase('TWO', 'processing', '2026-09-23', 'Synthetic storage'), purchase('THREE', 'delivered', '2026-09-22', 'Synthetic adapter')]
const sections = ['profile', 'services', 'purchases', 'comments', 'addresses', 'payments', 'password']
let instance = 0

// The actual dashboard handlers run against a tiny hook host. Child components
// are replaced with named inert components; no browser, server, network, private
// data, auth state or environment files are involved.
async function dashboardDriver(locale = 'en', overrides = {}) {
  const hooksUrl = moduleUrl(`
    const instance = ${++instance}; let cells = [], cursor = 0;
    export const begin = () => { cursor = 0 };
    export const useMemo = compute => compute();
    export function useState(initial) { const index = cursor++; if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial; return [cells[index], next => { cells[index] = typeof next === 'function' ? next(cells[index]) : next }] }
  `)
  const hooks = await import(hooksUrl)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)},href:path=>${locale === 'en' ? '"/en"+path' : 'path'}})`),
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
    './serviceCollections': new URL('src/account/serviceCollections.ts', root).href,
    './purchaseCollections': new URL('src/account/purchaseCollections.ts', root).href,
    '../utils/text': new URL('src/utils/text.ts', root).href,
    './CustomerSettings': moduleUrl('export function CustomerAddresses() { return null }; export function CustomerPayments() { return null }; export function CustomerPassword() { return null }'),
    ...Object.fromEntries(['LaptopIcon', 'CustomerServiceCard', 'CustomerPurchaseCard', 'CustomerProfile', 'CustomerComments'].map(name => [name === 'LaptopIcon' ? '../components/LaptopIcon' : `./${name}`, moduleUrl(`export function ${name}() { return null }`)])),
  }
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, url] of Object.entries(replacements)) executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(url))
  const { CustomerDashboard } = await import(moduleUrl(executable))
  const props = { user, tickets, purchases, isPreview: false, onLogout() {}, async onSaveProfile() {}, onPasswordChanged() {}, ...overrides }
  let tree
  const render = () => { hooks.begin(); tree = CustomerDashboard(props) }
  const nodes = predicate => findAll(tree, predicate)
  const component = name => nodes(node => typeName(node) === name)
  const input = id => nodes(node => node.type === 'input' && node.props.id === id)[0]
  const click = node => { assert.ok(node, 'Expected clickable node'); assert.notEqual(node.props.disabled, true, 'Disabled controls cannot be activated'); node.props.onClick(); render() }
  const navigate = section => {
    const nav = nodes(node => node.type === 'nav' && node.props['aria-label'] === dashboardCopy[locale].navigation)[0]
    const label = section === 'profile' ? dashboardCopy[locale].editProfile : dashboardCopy[locale][section]
    const button = findAll(nav, node => node.type === 'button').find(node => accessibleText(node) === toGeorgianMtavruli(label))
    click(button)
  }
  render()
  return {
    props, render, nodes, component, click, navigate,
    get tree() { return tree },
    get serviceCodes() { return component('CustomerServiceCard').map(node => node.props.ticket.ticket_code) },
    get purchaseIds() { return component('CustomerPurchaseCard').map(node => node.props.purchase.id) },
    get empty() { return component('EmptyState')[0]?.props },
    search(kind, value) { input(`account-${kind}-search`).props.onChange({ target: { value } }); render() },
    searchValue(kind) { return input(`account-${kind}-search`).props.value },
    collection(value, kind = 'service') {
      const copy = dashboardCopy[locale]
      const group = nodes(node => node.props.role === 'group' && node.props['aria-label'] === (kind === 'service' ? copy.services : copy.purchases))[0]
      const label = kind === 'service' ? value === 'active' ? copy.currentServices : copy.completedServices : value === 'active' ? copy.currentPurchases : copy.completedPurchases
      click(findAll(group, node => node.type === 'button').find(node => nodeText(node).startsWith(toGeorgianMtavruli(label))))
    },
  }
}

for (const locale of ['ka', 'en']) {
  test(`${locale} sidebar has seven accessible sections without secondary policy links or overview`, async () => {
    const driver = await dashboardDriver(locale)
    const copy = dashboardCopy[locale]
    assert.equal(driver.nodes(node => node.type === 'h1').length, 1)
    assert.equal(nodeText(driver.nodes(node => node.type === 'h1')[0]), `${toGeorgianMtavruli(copy.greeting)} ${toGeorgianMtavruli(user.full_name)}`)
    const nav = driver.nodes(node => node.type === 'nav')[0]
    assert.equal(nav.props['aria-label'], copy.navigation)
    const buttons = findAll(nav, node => node.type === 'button')
    assert.equal(buttons.length, 7)
    assert.equal(buttons.filter(node => node.props['aria-pressed']).length, 1)
    assert.ok(buttons.every(node => node.props['aria-controls'] === 'account-panel'))
    assert.ok(!buttons.some(node => accessibleText(node) === toGeorgianMtavruli(copy.overview)))
    assert.equal(driver.nodes(node => node.props.className === 'account-metrics').length, 0)
    const sidebar = driver.nodes(node => node.type === 'aside')[0]
    assert.equal(findAll(sidebar, node => node.type === 'a').length, 0)
    driver.navigate('comments')
    assert.equal(driver.component('CustomerComments').length, 1)
    assert.equal(driver.component('CustomerComments')[0].props.isPreview, false)
    assert.equal(nodeText(driver.nodes(node => node.props.id === 'account-panel-title')[0]), toGeorgianMtavruli(copy.comments))
    driver.navigate('profile')
    assert.equal(driver.component('CustomerProfile')[0].props.user, user)
    assert.equal(driver.component('CustomerProfile')[0].props.onSave, driver.props.onSaveProfile)
    assert.equal(nodeText(driver.nodes(node => node.props.id === 'account-panel-title')[0]), toGeorgianMtavruli(copy.editProfile))
    driver.navigate('addresses')
    assert.equal(driver.component('CustomerAddresses')[0].props.active, true)
    assert.equal(driver.component('CustomerAddresses')[0].props.isPreview, false)
    driver.navigate('payments')
    assert.deepEqual(driver.component('CustomerPayments')[0].props.purchases.map(item => item.id), ['TWO', 'THREE', 'ONE'])
    assert.equal(driver.component('CustomerPayments')[0].props.isPreview, false)
    driver.navigate('password')
    assert.equal(driver.component('CustomerPassword')[0].props.onChanged, driver.props.onPasswordChanged)
    assert.equal(driver.component('CustomerPassword')[0].props.isPreview, false)
    assert.equal(driver.component('CustomerAddresses')[0].props.active, false)
  })

  test(`${locale} navigation retains clear accessible names and a single active section with decorative numbering`, async () => {
    const driver = await dashboardDriver(locale)
    const copy = dashboardCopy[locale]
    const card = driver.nodes(node => node.props.className === 'account-nav-card')[0]
    assert.ok(card, 'The section navigation is grouped in its own card')
    assert.equal(findAll(card, node => node.type === 'h2' || node.props.className === 'account-nav-card__heading').length, 0)
    const nav = findAll(card, node => node.type === 'nav')[0]
    assert.ok(nav)
    const buttons = findAll(nav, node => node.type === 'button')
    const labels = sections.map(section => toGeorgianMtavruli(section === 'profile' ? copy.editProfile : copy[section]))
    assert.deepEqual(buttons.map(accessibleText), labels)
    for (const [index, button] of buttons.entries()) {
      const numbers = findAll(button, node => node.props.className === 'account-nav__number')
      assert.equal(numbers.length, 1)
      assert.equal(String(numbers[0].props['aria-hidden']), 'true', 'Numbering is decorative and must not change the accessible section name')
      assert.equal(nodeText(numbers[0]), String(index + 1).padStart(2, '0'))
      const label = findAll(button, node => node.props.className === 'account-nav__label')[0]
      assert.ok(label)
      assert.equal(nodeText(label), accessibleText(button))
      assert.equal(button.props.type, 'button')
      assert.equal(button.props['aria-controls'], 'account-panel')
    }
    assert.equal(findAll(card, node => node.props.className === 'account-signout').length, 0)
    assert.equal(driver.nodes(node => node.props.className === 'account-signout').length, 1)
    for (const [index, section] of sections.entries()) {
      driver.navigate(section)
      const currentNav = driver.nodes(node => node.type === 'nav' && node.props['aria-label'] === copy.navigation)[0]
      const currentButtons = findAll(currentNav, node => node.type === 'button')
      assert.deepEqual(currentButtons.map(button => button.props['aria-pressed']), labels.map((_, position) => position === index))
      assert.equal(driver.nodes(node => node.props.id === 'account-panel').length, 1)
    }
  })

  test(`${locale} the greeting has no Demo badge while preview mode still reaches every cabinet section`, async () => {
    const preview = await dashboardDriver(locale, { isPreview: true })
    const greeting = preview.nodes(node => node.type === 'header' && node.props.className === 'account-greeting')[0]
    assert.equal(preview.nodes(node => node.props.className === 'account-preview').length, 0)
    assert.equal(nodeText(greeting), `${toGeorgianMtavruli(dashboardCopy[locale].greeting)} ${toGeorgianMtavruli(user.full_name)}`)
    assert.doesNotMatch(nodeText(greeting), /დემო|Demo/)
    assert.doesNotMatch(nodeText(preview.tree), /ქვემოთ ნაჩვენებია გამოგონილი|ეს არ არის თქვენი რეალური შეკვეთები|fictional records|not your real orders/i)
    const sectionComponents = { profile: 'CustomerProfile', services: 'CustomerServiceCard', purchases: 'CustomerPurchaseCard', comments: 'CustomerComments', addresses: 'CustomerAddresses', payments: 'CustomerPayments', password: 'CustomerPassword' }
    for (const isPreview of [true, false]) {
      const driver = isPreview ? preview : await dashboardDriver(locale)
      for (const section of sections) {
        driver.navigate(section)
        assert.equal(driver.nodes(node => node.props.className === 'account-preview').length, 0)
        assert.equal(driver.nodes(node => node.type === 'button' && (node.props.className === 'account-refresh' || /^(?:Refresh|განახლება)$/.test(nodeText(node)))).length, 0)
        const components = driver.component(sectionComponents[section])
        assert.ok(components.length, section)
        assert.ok(components.every(node => node.props.isPreview === isPreview), `${section} keeps its explicit preview boundary after the decorative badge is removed`)
      }
      driver.navigate('purchases')
      assert.equal(driver.component('CustomerPurchaseCard')[0].props.isPreview, isPreview)
    }
  })
}

test('Cabinet starts with all current services and sorts both histories without mutating the API arrays', async () => {
  const beforeTickets = JSON.stringify(tickets)
  const beforePurchases = JSON.stringify(purchases)
  const driver = await dashboardDriver()
  assert.deepEqual(driver.serviceCodes, [103, 104, 101])
  assert.deepEqual(driver.purchaseIds, [])
  driver.navigate('purchases')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  driver.collection('completed', 'purchase')
  assert.deepEqual(driver.purchaseIds, ['THREE', 'ONE'])
  assert.equal(JSON.stringify(tickets), beforeTickets)
  assert.equal(JSON.stringify(purchases), beforePurchases)
})

test('Only allowlisted section deep links change the initial section and preserve the preview query', async t => {
  const previous=globalThis.window
  t.after(()=>{globalThis.window=previous})
  for (const section of sections) {
    for (const prefix of ['?', '?preview=1&']) {
      const search = `${prefix}section=${section}`
      globalThis.window={location:{search}}
      const driver=await dashboardDriver('en',{isPreview:search.includes('preview')})
      assert.equal(nodeText(driver.nodes(node => node.props.id === 'account-panel-title')[0]), toGeorgianMtavruli(section === 'profile' ? dashboardCopy.en.editProfile : dashboardCopy.en[section]))
      assert.equal(globalThis.window.location.search,search)
    }
  }
  for(const search of ['?section=unknown','?section=__proto__','?section=constructor','']) {
    globalThis.window={location:{search}}
    const driver=await dashboardDriver()
    assert.equal(driver.component('CustomerComments').length,0)
    assert.deepEqual(driver.serviceCodes,[103,104,101])
  }
})

test('Service search matches codes and nested devices and resets when the collection changes', async () => {
  const driver = await dashboardDriver()
  driver.navigate('services')
  assert.deepEqual(driver.serviceCodes, [103, 104, 101])
  driver.search('service', '  NESTED TEST CONSOLE  ')
  assert.deepEqual(driver.serviceCodes, [104])
  driver.search('service', 'no such service')
  assert.deepEqual(driver.serviceCodes, [])
  assert.equal(driver.empty.title, dashboardCopy.en.noResults)
  driver.click(driver.empty.action)
  assert.deepEqual(driver.serviceCodes, [103, 104, 101])
  assert.equal(driver.searchValue('service'), '')
  driver.search('service', '101')
  assert.deepEqual(driver.serviceCodes, [101])
  driver.collection('collected')
  assert.deepEqual(driver.serviceCodes, [102])
  assert.equal(driver.searchValue('service'), '')
  driver.collection('active')
  assert.deepEqual(driver.serviceCodes, [103, 104, 101], 'Unrepairable is still Active, not silently hidden as collected')
})

test('Purchase search matches order numbers and products; changing collection or resetting restores actual records', async () => {
  const driver = await dashboardDriver()
  driver.navigate('purchases')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  driver.search('purchase', 'ORDER-two')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  driver.collection('completed', 'purchase')
  assert.deepEqual(driver.purchaseIds, ['THREE', 'ONE'])
  assert.equal(driver.searchValue('purchase'), '')
  driver.search('purchase', '  KEYBOARD  ')
  assert.deepEqual(driver.purchaseIds, ['ONE'])
  driver.search('purchase', 'order-THREE')
  assert.deepEqual(driver.purchaseIds, ['THREE'])
  driver.search('purchase', 'no such product')
  assert.deepEqual(driver.purchaseIds, [])
  assert.equal(driver.empty.title, dashboardCopy.en.noResults)
  driver.click(driver.empty.action)
  assert.deepEqual(driver.purchaseIds, ['THREE', 'ONE'])
  assert.equal(driver.searchValue('purchase'), '')
})

test('Empty accounts do not invent services or purchases and retain an honest no-record state', async () => {
  const driver = await dashboardDriver('en', { tickets: [], purchases: [] })
  assert.deepEqual(driver.serviceCodes, [])
  assert.deepEqual(driver.purchaseIds, [])
  driver.navigate('services')
  assert.equal(driver.empty.title, dashboardCopy.en.noActiveServices)
  driver.navigate('purchases')
  assert.equal(driver.empty.title, dashboardCopy.en.noCurrentPurchases)
  assert.equal(driver.empty.action, undefined)
  driver.collection('completed', 'purchase')
  assert.equal(driver.empty.title, dashboardCopy.en.noCompletedPurchases)
})

test('Pending logout prevents repeated requests, and failure is announced without exposing error details', async () => {
  let rejectLogout
  let logoutCalls = 0
  const driver = await dashboardDriver('en', { onLogout: () => { logoutCalls++; return new Promise((_resolve, reject) => { rejectLogout = reject }) } })
  const action = className => driver.nodes(node => node.type === 'button' && node.props.className === className)[0]
  driver.click(action('account-signout'))
  assert.equal(logoutCalls, 1)
  assert.equal(action('account-signout').props.disabled, true)
  assert.equal(nodeText(action('account-signout')), dashboardCopy.en.loggingOut)
  // Even a stale/programmatic call into a current disabled handler is guarded.
  action('account-signout').props.onClick()
  assert.equal(logoutCalls, 1)
  rejectLogout(new Error('Private diagnostic detail'))
  await Promise.resolve()
  await Promise.resolve()
  driver.render()
  assert.equal(action('account-signout').props.disabled, false)
  assert.equal(nodeText(action('account-signout')), dashboardCopy.en.logout)
  assert.equal(nodeText(driver.nodes(node => node.props.role === 'alert')[0]), dashboardCopy.en.actionError)
  assert.doesNotMatch(nodeText(driver.tree), /Private diagnostic detail/)
})

test('Data revalidation still guards logout after the manual refresh control is removed', async () => {
  let logoutCalls = 0
  const driver = await dashboardDriver('en', { refreshing: true, onLogout: () => { logoutCalls++ } })
  const signout = () => driver.nodes(node => node.type === 'button' && node.props.className === 'account-signout')[0]
  assert.equal(signout().props.disabled, true)
  signout().props.onClick()
  assert.equal(logoutCalls, 0)
  driver.props.refreshing = false
  driver.render()
  assert.equal(signout().props.disabled, false)
})

test('Profile save prevents leaving the profile through section navigation or logout', async () => {
  const driver = await dashboardDriver('en', { savingProfile: true })
  const nav = driver.nodes(node => node.type === 'nav')[0]
  assert.ok(findAll(nav, node => node.type === 'button').every(node => node.props.disabled))
  assert.equal(driver.nodes(node => node.type === 'button' && node.props.className === 'account-signout')[0].props.disabled, true)
})

test('Service and purchase collections each have exactly two labelled stateful tabs', async () => {
  const driver = await dashboardDriver()
  for (const section of ['services', 'purchases']) {
    driver.navigate(section)
    const groups = driver.nodes(node => node.props.role === 'group')
    assert.equal(groups.length, 1)
    assert.equal(groups[0].props['aria-label'], dashboardCopy.en[section])
    const tabs = findAll(groups[0], node => node.type === 'button')
    assert.equal(tabs.length, 2)
    assert.deepEqual(tabs.map(node => node.props['aria-pressed']), [true, false])
    const collectionHeader = driver.nodes(node => node.props.className === 'account-collection-header')[0]
    assert.equal(findAll(collectionHeader, node => node.type === 'input' && node.props.type === 'search').length, 1, 'The labelled search is grouped beside the collection tabs')
    assert.equal(driver.nodes(node => node.type === 'select' || typeName(node) === 'AccountSelect').length, 0, 'The simplified panel has no second status selector')
    driver.click(tabs[1])
    const changed = findAll(driver.nodes(node => node.props.role === 'group')[0], node => node.type === 'button')
    assert.deepEqual(changed.map(node => node.props['aria-pressed']), [false, true])
  }
})

test('Purchase list retains search and collection tabs while each order owns its inline details', async () => {
  const driver = await dashboardDriver()
  driver.navigate('purchases')
  driver.search('purchase', 'storage')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  assert.equal(driver.component('CustomerPurchaseCard')[0].props.detail, undefined)
  assert.equal(driver.component('CustomerPurchaseCard')[0].props.onOpen, undefined)
  assert.equal(driver.nodes(node => node.type === 'input' && node.props.type === 'search').length, 1)
  assert.equal(driver.nodes(node => node.props.className === 'account-back' || node.props.className === 'account-purchase-detail').length, 0)
  driver.render()
  assert.equal(driver.searchValue('purchase'), 'storage')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  driver.collection('completed', 'purchase')
  assert.deepEqual(driver.purchaseIds, ['THREE', 'ONE'])
  assert.ok(driver.component('CustomerPurchaseCard').every(node => !node.props.detail))
  assert.equal(driver.searchValue('purchase'), '')
  driver.navigate('profile')
  assert.deepEqual(driver.purchaseIds, [])
  driver.navigate('purchases')
  assert.deepEqual(driver.purchaseIds, ['TWO'])
  assert.equal(driver.component('CustomerPurchaseCard')[0].props.detail, undefined)
})

test('Refreshing away an order removes its entire inline card without a stale detail page', async () => {
  const driver = await dashboardDriver()
  driver.navigate('purchases')
  driver.props.purchases = purchases.filter(item => item.id !== 'TWO')
  driver.render()
  assert.deepEqual(driver.purchaseIds, [])
  assert.equal(driver.empty.title, dashboardCopy.en.noCurrentPurchases)
  assert.equal(driver.nodes(node => node.props.className === 'account-back').length, 0)
})

test('Medium and narrow cabinet layouts keep the panel full-width with compact two-column navigation', async () => {
  const css = await readFile(new URL('src/styles/account-dashboard.css', root), 'utf8')
  const medium = css.match(/@media\s*\(min-width:\s*601px\)\s*and\s*\(max-width:\s*900px\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(medium, '601–900px needs a dedicated stacking rule to avoid squeezing ticket identities beside the widened sidebar')
  assert.match(medium[1], /\.account-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(medium[1], /\.account-nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  assert.ok(medium.index > css.indexOf('@media (max-width: 800px)'), 'The medium stacking rule must override the earlier two-column sidebar layout')
  const mobile = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(mobile)
  assert.match(mobile[1], /\.account-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/)
  assert.match(mobile[1], /\.account-nav\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
})

test('Cabinet content remains aligned with the site container and shared responsive gutters', async () => {
  const css = await readFile(new URL('src/styles/account-dashboard.css', root), 'utf8')
  const container = css.match(/\.account-dashboard \.account-container\s*\{([^}]+)\}/)?.[1]
  const layout = css.match(/\.account-layout\s*\{([^}]+)\}/)?.[1]
  const panel = css.match(/\.account-panel\s*\{([^}]+)\}/)?.[1]
  assert.ok(container && layout && panel)
  assert.match(container, /max-width:\s*var\(--container\);/)
  assert.match(container, /width:\s*min\(var\(--container\),\s*calc\(100% - 2 \* var\(--page-gutter,\s*64px\)\)\);/)
  assert.match(layout, /grid-template-columns:\s*270px minmax\(0,\s*1fr\);/)
  assert.match(layout, /column-gap:\s*40px;/)
  assert.match(panel, /width:\s*100%;/)
  assert.match(panel, /max-width:\s*none;/)
  assert.match(panel, /min-width:\s*0;/)
  const tablet = css.match(/@media\s*\(max-width:\s*800px\)\s*\{([\s\S]*?)\n\}/)?.[1]
  const mobile = css.match(/@media\s*\(max-width:\s*600px\)\s*\{([\s\S]*?)\n\}/)?.[1]
  assert.ok(tablet && mobile)
  assert.doesNotMatch(tablet, /\.account-container\b/, 'Tablet cabinet must inherit the same gutter token as the header and footer')
  assert.doesNotMatch(mobile, /\.account-container\b/, 'Mobile cabinet must inherit the same gutter token as the header and footer')
  const containerRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) => selector.includes('.account-container'))
  assert.equal(containerRules.length, 1, 'A single scoped cabinet container follows shared gutter tokens at every breakpoint')
  assert.equal(containerRules[0][1].trim(), '.account-dashboard .account-container', 'Two-class specificity must preserve the shared site alignment regardless of stylesheet loading order')
  assert.doesNotMatch(css, /--(?:container|page-gutter)\s*:/, 'Cabinet must not override the global width or gutter tokens')
  const responsive = await readFile(new URL('src/styles/responsive.css', root), 'utf8')
  assert.match(responsive, /\.site-container\s*\{[^}]*width:\s*min\(var\(--container\),\s*calc\(100% - 2 \* var\(--page-gutter\)\)\)/)
})

test('Cabinet preserves uppercase Unicode in structural headings without CSS recasing or customer-data conversion', async () => {
  const css = (await readFile(new URL('src/styles/account-dashboard.css', root), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  const headingRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) => selector.includes('.account-dashboard :is(.account-greeting h1'))
  assert.equal(headingRules.length, 1, 'One explicit structural rule protects the rendered Mtavruli characters')
  assert.match(headingRules[0][2], /text-transform:\s*none\s*;/, 'Chromium Georgian casing must not reverse the already-uppercase Unicode text')
  assert.doesNotMatch(css, /text-transform:\s*(?:uppercase|lowercase|capitalize)\s*;/, 'Cabinet casing is applied to structural text in rendering, never to customer-entered or product text in CSS')
  const selectors = headingRules.flatMap(([, selector]) => selector
    .replace(/\.account-dashboard\s+:is\(([^)]+)\)/g, (_, group) => group.split(',').map(part => `.account-dashboard ${part.trim()}`).join(','))
    .split(',').map(part => part.trim().replace(/\s+/g, ' ')))
  const permitted = [
    '.account-greeting h1', '.account-panel__heading h2', '.account-empty h3', '.comments-empty h3',
    '.account-service-expanded__heading h4', '.account-service-expanded__heading h5',
    '.account-service-devices > h4', '.account-service-devices > h5', '.account-profile-confirm h3',
    '.account-nav__label', '.account-filters button',
  ].map(selector => `.account-dashboard ${selector}`)
  assert.deepEqual([...new Set(selectors)].sort(), permitted.sort(), 'Only explicit structural headings, navigation labels and collection tabs need the Unicode-preserving rule')
  assert.match(css, /\.account-greeting h1\s*>\s*span\s*\{[^}]*text-transform:\s*none\s*;/, 'The displayed uppercase name must retain its actual Mtavruli characters')
  assert.match(css, /\.account-dashboard\s+:is\(button,\s*input,\s*select\)\s*\{[^}]*text-transform:\s*none\s*;/, 'Ordinary inputs and controls retain their text casing')
  assert.doesNotMatch(css, /\.account-preview\b/, 'The removed greeting badge has no leftover presentation rules')
  for (const locale of ['ka', 'en']) {
    const driver = await dashboardDriver(locale)
    const greeting = driver.nodes(node => node.type === 'h1')[0]
    assert.equal(nodeText(findAll(greeting, node => node.type === 'span')[0]), toGeorgianMtavruli(user.full_name))
  }
})

test('The current cabinet section has a subtle blue background and left indicator without affecting keyboard focus', async () => {
  const css = await readFile(new URL('src/styles/account-dashboard.css', root), 'utf8')
  assert.match(css, /\.account-nav button\s*\{[^}]*border-left:\s*2px solid transparent/)
  assert.match(css, /\.account-nav button\[aria-pressed="true"\]\s*\{[^}]*background:\s*#eaf4fc;[^}]*border-left-color:\s*#3397ec/)
  assert.match(css, /\.account-nav button:focus-visible\s*\{[^}]*outline-offset:\s*-2px/)
})

test('Cabinet headings and greeting name render uppercase Unicode without rewriting profile data or source copy', async () => {
  const originalCopy = JSON.stringify(dashboardCopy)
  const suppliedName = 'თესტი MixedCase Customer'
  for (const locale of ['ka', 'en']) {
    const suppliedUser = Object.freeze({ ...user, full_name: suppliedName })
    const driver = await dashboardDriver(locale, { user: suppliedUser, tickets: [], purchases: [] })
    const greeting = driver.nodes(node => node.type === 'h1')[0]
    assert.equal(nodeText(greeting), `${toGeorgianMtavruli(dashboardCopy[locale].greeting)} ${toGeorgianMtavruli(suppliedName)}`)
    assert.equal(nodeText(findAll(greeting, node => node.type === 'span')[0]), toGeorgianMtavruli(suppliedName))
    const navLabels = driver.nodes(node => node.props.className === 'account-nav__label').map(nodeText)
    const panelTitle = nodeText(driver.nodes(node => node.props.id === 'account-panel-title')[0])
    const tabs = findAll(driver.nodes(node => node.props.role === 'group')[0], node => node.type === 'button').map(nodeText)
    const emptyNode = driver.component('EmptyState')[0]
    const emptyTitle = nodeText(findAll(emptyNode.type(emptyNode.props), node => node.type === 'h3')[0])
    assert.equal(emptyTitle, toGeorgianMtavruli(dashboardCopy[locale].noActiveServices))
    for (const label of [...navLabels, panelTitle, ...tabs, emptyTitle]) {
      assert.equal(label, toGeorgianMtavruli(label))
      if (locale === 'ka') {
        assert.match(label, /[\u1c90-\u1cbf]/u, 'Georgian structural text must contain actual Mtavruli characters')
        assert.doesNotMatch(label, /[\u10d0-\u10ff]/u)
      }
    }
    driver.navigate('profile')
    assert.equal(driver.component('CustomerProfile')[0].props.user, suppliedUser)
    assert.equal(driver.component('CustomerProfile')[0].props.user.full_name, suppliedName)
    assert.equal(suppliedUser.full_name, suppliedName, 'The greeting changes display casing only, never saved customer information')
  }
  assert.equal(JSON.stringify(dashboardCopy), originalCopy)
})
