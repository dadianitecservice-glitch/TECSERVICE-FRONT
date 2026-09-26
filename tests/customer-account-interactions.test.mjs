import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import { dashboardCopy } from '../src/account/dashboardCopy.ts'
import { getServiceCollection, filterCustomerTickets } from '../src/account/serviceCollections.ts'
import { accountDate, accountDateTime, accountMoney } from '../src/account/accountFormat.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const apiSource = await read('src/account/customerApi.ts')
const apiModuleUrl = moduleUrl(stripTypeScriptTypes(apiSource.replaceAll('import.meta.env', '({})'), { mode: 'transform' }))
const { customerApi, CustomerApiError } = await import(apiModuleUrl)
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const user = { id: 'test-profile-customer', full_name: 'Updated customer', email: 'updated@example.invalid', phone: '+995599000000', contact_phone: '+995577123456', role: 'customer', approval_status: 'approved', is_active: true }
const findAll = (node, predicate) => Array.isArray(node) ? node.flatMap(child => findAll(child, predicate)) : node && typeof node === 'object' && node.props ? [...(predicate(node) ? [node] : []), ...findAll(node.props.children, predicate)] : []
const textContent = node => Array.isArray(node) ? node.map(textContent).join('') : node?.props ? textContent(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''

// Transform only the selected components in memory. No Vite server, environment
// files, browser, real customer session or network connection is involved.
async function compileComponent(path, replacements = {}) {
  const { code } = await transformWithOxc(await read(path), new URL(path, root).pathname, { jsx: { runtime: 'automatic' } })
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, url] of Object.entries({ react: import.meta.resolve('react'), 'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'), '../utils/text': new URL('src/utils/text.ts', root).href, './accountFormat': new URL('src/account/accountFormat.ts', root).href, './productImage': new URL('src/account/productImage.ts', root).href, './InvoiceButton': moduleUrl('export function InvoiceButton() { return null }'), ...replacements })) {
    executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(url))
  }
  return moduleUrl(executable)
}

const iconModuleUrl = await compileComponent('src/components/LaptopIcon.tsx')
const milestonesUrl = await compileComponent('src/components/TicketMilestones.tsx')
const progressUrl = await compileComponent('src/account/CustomerTicketProgress.tsx', {
  '../components/TicketMilestones': milestonesUrl,
  './serviceProgress': new URL('src/account/serviceProgress.ts', root).href,
})
const serviceCardUrl = await compileComponent('src/account/CustomerServiceCard.tsx', {
  '../components/LaptopIcon': iconModuleUrl,
  './CustomerTicketProgress': progressUrl,
  './accountFormat': new URL('src/account/accountFormat.ts', root).href,
})
const { CustomerServiceCard } = await import(serviceCardUrl)
const ticket = {
  ticket_code: 3001, device: 'ASUS ROG Strix G15', status: 'ready', cost_estimate: 185.75,
  issue_description: 'Synthetic issue for the expanded card', resolution: 'Synthetic recorded outcome',
  created_at: '2026-09-21T21:05:06Z', updated_at: '2026-09-22T07:08:09Z', items: [],
}

test('Only picked-up tickets are Collected; every other backend or unknown state remains Active', () => {
  const statuses = ['new', 'in_progress', 'waiting_for_part', 'ready', 'could_not_fix', 'picked_up', 'future_status', '', '__proto__']
  const records = statuses.map((status, index) => ({ ...ticket, ticket_code: index, status }))
  const before = JSON.stringify(records)
  for (const status of statuses) assert.equal(getServiceCollection(status), status === 'picked_up' ? 'collected' : 'active', status)
  const active = filterCustomerTickets(records, 'active')
  const collected = filterCustomerTickets(records, 'collected')
  assert.deepEqual(active.map(record => record.status), statuses.filter(status => status !== 'picked_up'))
  assert.deepEqual(collected.map(record => record.status), ['picked_up'])
  assert.equal(active.length + collected.length, records.length)
  assert.equal(JSON.stringify(records), before)
  assert.deepEqual(filterCustomerTickets([], 'active'), [])
})

test('Dashboard starts with Active services and exposes only Active and Collected collection filters', async () => {
  const source = await read('src/account/CustomerDashboard.tsx')
  assert.match(source, /useState<ServiceCollection>\('active'\)/)
  assert.match(source, /filterCustomerTickets\(/)
  const collectionGroup = source.match(/className="account-filters"[\s\S]*?<\/div>/)?.[0]
  assert.ok(collectionGroup)
  assert.match(collectionGroup, /\['active',/)
  assert.match(collectionGroup, /\['collected',/)
  assert.doesNotMatch(collectionGroup, /\['(?:all|open|history)',/)
  assert.doesNotMatch(source, /<select\b|<option\b/)
  assert.doesNotMatch(source, /<AccountSelect\b/, 'Collection tabs and search replace redundant status selectors')
})

for (const locale of ['ka', 'en']) {
  test(`${locale} service card is one closed accordion with useful summary and full details inside`, () => {
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket, copy: dashboardCopy[locale], locale }))
    assert.equal((html.match(/<details\b/g) ?? []).length, 1)
    assert.equal((html.match(/<summary\b/g) ?? []).length, 1)
    assert.doesNotMatch(html, /<details\b[^>]*\sopen(?:=|\s|>)/)
    const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0]
    assert.ok(summary)
    for (const value of ['#3001', ticket.device, accountMoney(ticket.cost_estimate, locale), accountDateTime(ticket.created_at), dashboardCopy[locale].statusLabels.ready]) assert.ok(summary.includes(value), value)
    assert.doesNotMatch(summary, /<button\b|<a\b|account-service-progress/)
    assert.ok(!summary.includes(ticket.issue_description))
    assert.ok(!summary.includes(ticket.resolution))
    assert.ok(html.includes(ticket.issue_description))
    assert.ok(html.includes(ticket.resolution))
    assert.match(html, /class="account-service-progress"/)
    assert.ok(html.includes('01:05:06'), 'Registration time converts across midnight to Georgia time')
    assert.ok(html.includes('11:08:09'), 'Updated time includes seconds in Georgia time')
    assert.ok(html.includes(dashboardCopy[locale].localTime))
    assert.doesNotMatch(html, /<details class="account-details"/)
  })
}

test('Service cards do not turn a category or missing fields into a fabricated model, date or price', () => {
  const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, ticket_code: null, device: 'laptop', cost_estimate: null }, copy: dashboardCopy.en, locale: 'en' }))
  const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0]
  assert.ok(summary.includes(dashboardCopy.en.noCode))
  assert.ok(summary.includes(dashboardCopy.en.missing))
  assert.ok(summary.includes('—'))
  assert.ok(html.includes(dashboardCopy.en.deviceLabels.laptop))
  assert.doesNotMatch(summary, /#null|#undefined|GEL 0/)
  assert.equal(accountDate('not-a-date', 'en', true), '—')
  assert.equal(accountMoney(undefined, 'en'), '—')
})

test('Expanded service details show a freeform model once while retaining distinct device categories', () => {
  for (const locale of ['ka', 'en']) {
    const copy = dashboardCopy[locale]
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket, copy, locale }))
    assert.ok(html.includes(`<dt>${copy.model}</dt><dd>${ticket.device}</dd>`))
    assert.ok(!html.includes(`<dt>${copy.device}</dt>`), 'The same device/model value is not repeated in the expanded fields')
    const categoryHtml = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, device: 'laptop' }, copy, locale }))
    assert.ok(categoryHtml.includes(`<dt>${copy.device}</dt><dd>${copy.deviceLabels.laptop}</dd>`))
    assert.ok(categoryHtml.includes(`<dt>${copy.model}</dt><dd>${copy.missing}</dd>`))
  }
})

test('Lean service cards show one price in the summary and keep progress, dates and notes separate', () => {
  for (const locale of ['ka', 'en']) {
    const copy = dashboardCopy[locale]
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, items: [{ position: 1, device: 'Test item', status: 'ready', issue_description: 'Test issue', updated_at: ticket.updated_at, cost_estimate: 92.37 }] }, copy, locale }))
    const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0]
    assert.equal(copy.price, locale === 'ka' ? 'ფასი' : 'Price')
    assert.ok(summary.includes(`<small>${copy.price}</small>`))
    assert.equal(html.split(accountMoney(ticket.cost_estimate, locale)).length - 1, 1)
    assert.ok(!html.includes(accountMoney(92.37, locale)), 'Nested device costs do not repeat price information')
    assert.ok(!html.includes(`<dt>${copy.estimate}</dt>`))
    assert.doesNotMatch(html, /account-service-summary__hint|account-service-expanded__grid/)
    const progress = html.indexOf('class="account-service-progress"')
    const metadata = html.indexOf('class="account-service-expanded__metadata"')
    const notes = html.indexOf('class="account-service-expanded__notes')
    assert.ok(progress > 0 && metadata > progress && notes > metadata, 'Progress precedes compact metadata and written notes')
  }
})

test('Expanded service cards replace the header Details action with a purchase-style invoice outside the summary', async () => {
  for (const locale of ['ka', 'en']) {
    const tree = CustomerServiceCard({ ticket, copy: dashboardCopy[locale], locale, isPreview: true })
    const summary = findAll(tree, node => node.type === 'summary')[0]
    const expanded = findAll(tree, node => node.props.className === 'account-service-expanded')[0]
    const invoicePredicate = node => typeof node.type === 'function' && node.type.name === 'InvoiceButton'
    assert.equal(findAll(summary, invoicePredicate).length, 0, 'Closed service cards have only the details disclosure')
    const invoices = findAll(expanded, invoicePredicate)
    assert.equal(invoices.length, 1)
    assert.deepEqual(invoices[0].props.target, { kind: 'service', id: ticket.ticket_code, reference: `${dashboardCopy[locale].service} #3001` })
    assert.equal(invoices[0].props.isPreview, true)
    const heading = findAll(expanded, node => node.props.className === 'account-service-expanded__heading')[0]
    const invoiceSlot = findAll(expanded, node => node.props.className === 'account-service-invoice')[0]
    assert.equal(findAll(invoiceSlot, invoicePredicate)[0], invoices[0], 'The expanded invoice gets its own positioned header slot')
    assert.equal(findAll(heading, invoicePredicate).length, 0, 'The invoice no longer appears below the order summary')
    assert.match(findAll(tree, node => node.type === 'details')[0].props.className, /\bhas-invoice\b/)
    const rows = summary.props.children.filter(child => child?.props).map(child => child.props.className)
    assert.deepEqual(rows, ['account-service-summary__header', 'account-service-summary__device', 'account-service-summary__footer'])
    const noCodeTree = CustomerServiceCard({ ticket: { ...ticket, ticket_code: null }, copy: dashboardCopy[locale], locale })
    assert.equal(findAll(noCodeTree, invoicePredicate).length, 0, 'A service without a reference never fabricates an invoice target')
    assert.doesNotMatch(findAll(noCodeTree, node => node.type === 'details')[0].props.className, /\bhas-invoice\b/)
  }
  const serviceCss = await read('src/styles/account-service-card.css')
  const invoiceCss = await read('src/styles/account-invoices.css')
  assert.match(serviceCss, /\.account-service-summary__device\s*\{[^}]*background:\s*#fff\s*;/)
  assert.match(serviceCss, /\.account-service-summary__footer\s*\{[^}]*justify-content:\s*space-between\s*;/)
  const sharedInvoice = invoiceCss.match(/\.account-invoice-trigger\s*\{([^}]*)\}/)?.[1]
  assert.ok(sharedInvoice)
  assert.match(sharedInvoice, /\bwidth:\s*40px\s*;/)
  assert.match(sharedInvoice, /\bheight:\s*40px\s*;/)
  assert.match(serviceCss, /\.account-service-disclosure\s*\{[^}]*position:\s*relative\s*;/)
  const slot = serviceCss.match(/\.account-service-invoice\s*\{([^}]*)\}/)?.[1]
  assert.ok(slot)
  assert.match(slot, /position:\s*absolute\s*;/)
  assert.match(slot, /top:\s*calc\(var\(--account-service-inset\) \+ 2px\)\s*;/)
  assert.match(slot, /right:\s*var\(--account-service-inset\)\s*;/)
  assert.match(serviceCss, /\.account-service-disclosure\.has-invoice\[open\] \.account-service-summary__toggle\s*\{[^}]*visibility:\s*hidden\s*;/)
  assert.match(serviceCss, /\.account-service-disclosure:not\(\[open\]\) \.account-service-invoice\s*\{[^}]*display:\s*none\s*;/)
  for (const [, rule] of serviceCss.matchAll(/\.account-service-invoice\s*>\s*\.account-invoice-trigger\s*\{([^}]*)\}/g)) {
    for (const [, pixels] of rule.matchAll(/\b(?:width|height|min-width|min-height):\s*(\d+)px/g)) assert.ok(Number(pixels) >= 40, 'Service CSS must not shrink the shared invoice target on mobile')
  }
})

test('Expanded service collapse action closes only its disclosure and restores summary focus', () => {
  for (const locale of ['ka', 'en']) {
    const tree = CustomerServiceCard({ ticket, copy: dashboardCopy[locale], locale })
    const button = findAll(tree, node => node.type === 'button' && node.props.className === 'account-service-collapse')[0]
    assert.ok(button)
    assert.equal(button.props.type, 'button')
    assert.ok(textContent(button).includes(locale === 'ka' ? 'დაკეცვა' : 'Collapse'))
    let focusOptions
    const disclosure = { open: true, querySelector(selector) { assert.equal(selector, 'summary'); return { focus(options) { focusOptions = options } } } }
    button.props.onClick({ currentTarget: { closest(selector) { assert.equal(selector, 'details'); return disclosure } } })
    assert.equal(disclosure.open, false)
    assert.deepEqual(focusOptions, { preventScroll: true })
    assert.doesNotThrow(() => button.props.onClick({ currentTarget: { closest() { return null } } }))
  }
})

test('Receipt date format is numeric and timezone-stable for both card types, including invalid data', () => {
  assert.equal(accountDateTime('2026-09-24T10:09:00Z'), '09/24/2026 14:09')
  assert.equal(accountDateTime('2026-09-21T21:05:06Z'), '09/22/2026 01:05')
  assert.equal(accountDateTime('2026-12-31T20:00:00Z'), '01/01/2027 00:00')
  assert.equal(accountDateTime('2026-09-24T14:09:00+04:00'), '09/24/2026 14:09')
  for (const value of ['', 'not-a-date']) assert.equal(accountDateTime(value), '—')
  const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, created_at: 'not-a-date' }, copy: dashboardCopy.en, locale: 'en' }))
  const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0]
  assert.match(summary, /<time>—<\/time>/)
})

test('Service Details pill retains readable contrast in closed, open and both hover states', async () => {
  const css = await read('src/styles/account-service-card.css')
  const selectors = [
    '.account-service-summary__toggle',
    '.account-service-disclosure:not([open]) > summary:hover .account-service-summary__toggle',
    '.account-service-disclosure[open] .account-service-summary__toggle',
    '.account-service-disclosure[open] > summary:hover .account-service-summary__toggle',
  ]
  assert.ok(!css.includes('.account-service-disclosure > summary:hover .account-service-summary__toggle'), 'The closed hover colors must never override an expanded card')
  const luminance = hex => {
    const rgb = hex.length === 3 ? [...hex].map(value => value + value).join('') : hex
    const channels = rgb.match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2]
  }
  for (const selector of selectors) {
    const rule = css.slice(css.indexOf(`${selector} {`) + selector.length + 2).split('}', 1)[0]
    const foreground = rule.match(/(?:^|;)\s*color:\s*#([a-f\d]+)/i)?.[1]
    const background = rule.match(/(?:^|;)\s*background:\s*#([a-f\d]+)/i)?.[1]
    assert.ok(foreground && background, selector)
    const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b)
    assert.ok((values[1] + .05) / (values[0] + .05) >= 4.5, `Readable normal-text contrast: ${selector}`)
  }
})

test('Service card headings stay sequential in both regular and compact rendering', () => {
  for (const compact of [false, true]) {
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket, copy: dashboardCopy.en, locale: 'en', compact }))
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map(([, level]) => Number(level))
    assert.equal(levels[0], compact ? 4 : 3)
    for (let index = 1; index < levels.length; index++) assert.ok(levels[index] <= levels[index - 1] + 1, levels.join(' → '))
  }
})

test('Service structural headings use real uppercase characters while device names and recorded notes retain their exact casing', () => {
  const device = 'MixedCase ქართული მოდელი'
  const issue = 'Preserve ქართული ჩანაწერი'
  for (const locale of ['ka', 'en']) {
    for (const compact of [false, true]) {
      const copy = dashboardCopy[locale]
      const tree = CustomerServiceCard({ ticket: { ...ticket, device, issue_description: issue, items: [{ position: 1, device, status: 'ready', issue_description: issue, updated_at: ticket.updated_at }] }, copy, locale, compact })
      const headings = findAll(tree, node => /^h[1-6]$/.test(node.type)).map(textContent)
      assert.equal(headings[0], device, 'Device/model headings are data, not structural labels')
      assert.ok(headings.includes(toGeorgianMtavruli(copy.serviceDetails)))
      assert.ok(headings.includes(`${toGeorgianMtavruli(copy.devices)}1`))
      assert.ok(textContent(tree).includes(issue))
      if (locale === 'ka') {
        const title = headings.find(value => value === toGeorgianMtavruli(copy.serviceDetails))
        assert.match(title, /[\u1c90-\u1cbf]/u)
        assert.doesNotMatch(title, /[\u10d0-\u10ff]/u)
      }
    }
  }
})

test('A single service disclosure contains every nested device and its complete recorded details', () => {
  const records = [
    { position: 1, device: 'Synthetic laptop', serial_number: 'SERIAL-ONE', issue_description: 'First complete issue', resolution: 'First complete outcome', status: 'ready', cost_estimate: 71.25, updated_at: '2026-09-22T07:08:09Z' },
    { position: 2, device: 'Synthetic console', serial_number: 'SERIAL-TWO', issue_description: 'Second complete issue', resolution: 'Second complete outcome', status: 'could_not_fix', cost_estimate: 29.75, updated_at: '2026-09-22T11:12:13Z' },
    { position: 3, device: 'Synthetic board', serial_number: 'SERIAL-THREE', issue_description: 'Third complete issue', resolution: null, status: 'waiting_for_part', cost_estimate: null, updated_at: '2026-09-22T15:16:17Z' },
  ]
  for (const locale of ['ka', 'en']) {
    const copy = dashboardCopy[locale]
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, items: records }, copy, locale }))
    assert.equal((html.match(/<details\b/g) ?? []).length, 1, 'Opening the ticket reveals all device details, without another nested disclosure')
    const expanded = html.slice(html.indexOf('</summary>'))
    for (const item of records) {
      for (const value of [item.device, item.serial_number, item.issue_description, item.resolution, copy.statusLabels[item.status], accountDate(item.updated_at, locale, true)].filter(Boolean)) {
        assert.ok(expanded.includes(value), `Missing nested field: ${value}`)
      }
      if (item.cost_estimate !== null) assert.ok(!expanded.includes(accountMoney(item.cost_estimate, locale)), 'Nested costs do not repeat the ticket price')
    }
  }
})

test('Service model, issue, serial and outcome text remains escaped in the redesigned disclosure', () => {
  const supplied = '<img src=x onerror=alert(1)>'
  const html = renderToStaticMarkup(createElement(CustomerServiceCard, {
    ticket: { ...ticket, device: supplied, issue_description: supplied, resolution: supplied, items: [{ position: 1, device: supplied, serial_number: supplied, issue_description: supplied, resolution: supplied, status: 'unknown', updated_at: ticket.updated_at }] },
    copy: dashboardCopy.en,
    locale: 'en',
  }))
  assert.doesNotMatch(html, /<img src=x|<script\b|onerror="alert/)
  assert.ok((html.match(/&lt;img src=x onerror=alert\(1\)&gt;/g) ?? []).length >= 7)
})

test('Freeform device and unexpected status values cannot resolve inherited dictionary properties', () => {
  for (const value of ['__proto__', 'constructor', 'toString']) {
    const html = renderToStaticMarkup(createElement(CustomerServiceCard, { ticket: { ...ticket, device: value, status: value, items: [{ position: 1, device: value, status: value, issue_description: 'Test', updated_at: ticket.updated_at }] }, copy: dashboardCopy.en, locale: 'en' }))
    assert.ok(html.includes(value))
    assert.doesNotMatch(html, /function Object|\[object Object\]/)
  }
})

test('Own profile updates send the current password in an uncached JSON body without an ownership selector', async t => {
  let request
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options }
    return jsonResponse(user)
  })
  const payload = { full_name: 'Updated customer', email: 'updated@example.invalid', current_password: 'SyntheticCurrentPassword9' }
  assert.deepEqual(await customerApi.updateProfile(payload), user)
  assert.equal(request.url, '/api/portal/profile')
  assert.equal(request.options.method, 'POST')
  assert.equal(request.options.credentials, 'include')
  assert.equal(request.options.cache, 'no-store')
  assert.equal(new Headers(request.options.headers).get('content-type'), 'application/json')
  assert.deepEqual(JSON.parse(request.options.body), payload)
  assert.doesNotMatch(request.url, /\?|test-profile-customer|updated@|599000000|SyntheticCurrentPassword9/)
  for (const field of ['phone', 'id', 'user_id', 'role', 'approval_status']) assert.equal(Object.hasOwn(JSON.parse(request.options.body), field), false, field)
})

test('Optional profile email can be removed while the unchanged phone comes only from the server response', async t => {
  const updated = { ...user, email: null }
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    const payload = JSON.parse(options.body)
    assert.equal(payload.email, null)
    assert.equal(Object.hasOwn(payload, 'phone'), false)
    return jsonResponse(updated)
  })
  assert.deepEqual(await customerApi.updateProfile({ full_name: user.full_name, email: null, current_password: 'SyntheticCurrentPassword9' }), updated)
})

test('Additional contact phone updates and clearing never send the registered ownership phone', async t => {
  for (const value of [undefined, null, '+995599123456']) {
    const fetch = t.mock.method(globalThis, 'fetch', async (_url, options) => {
      const payload = JSON.parse(options.body)
      assert.equal(Object.hasOwn(payload, 'contact_phone'), value !== undefined)
      if (value !== undefined) assert.equal(payload.contact_phone, value)
      assert.equal(Object.hasOwn(payload, 'phone'), false)
      return jsonResponse({ ...user, contact_phone: value ?? null })
    })
    await customerApi.updateProfile({ full_name: user.full_name, contact_phone: value, current_password: 'SyntheticCurrentPassword9', phone: '+995599111111' })
    fetch.mock.restore()
  }
})

test('Profile request allowlisting discards injected ownership and privilege fields', async t => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.deepEqual(Object.keys(JSON.parse(options.body)).sort(), ['current_password', 'email', 'full_name'])
    return jsonResponse(user)
  })
  await customerApi.updateProfile({ full_name: user.full_name, email: user.email, current_password: 'SyntheticCurrentPassword9', phone: '+995599111111', id: 'other-user', role: 'admin', approval_status: 'approved' })
})

test('Wrong password, duplicate email, invalid fields and unavailable profile updates remain failures', async t => {
  const payload = { full_name: user.full_name, email: user.email, current_password: 'SyntheticCurrentPassword9' }
  for (const [status, detail] of [[401, 'Session expired'], [403, 'Current password is incorrect'], [409, 'Duplicate email'], [422, 'Invalid profile fields'], [429, 'Too many profile attempts'], [500, 'Private internal detail']]) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => jsonResponse({ detail }, status))
    await assert.rejects(() => customerApi.updateProfile(payload), error => error instanceof CustomerApiError && error.status === status)
    fetch.mock.restore()
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network unavailable') })
  await assert.rejects(() => customerApi.updateProfile(payload), TypeError)
})

test('A malformed successful profile response cannot replace the authenticated user', async t => {
  t.mock.method(globalThis, 'fetch', async () => jsonResponse({ id: user.id, full_name: 'Incomplete user' }))
  await assert.rejects(() => customerApi.updateProfile({ full_name: user.full_name, current_password: 'SyntheticCurrentPassword9' }), error => error instanceof CustomerApiError && error.status === 502)
})

test('Malformed additional contact numbers cannot enter authenticated user state', async t => {
  t.mock.method(globalThis, 'fetch', async () => jsonResponse({ ...user, contact_phone: { value: '+995599123456' } }))
  await assert.rejects(() => customerApi.updateProfile({ full_name: user.full_name, current_password: 'SyntheticCurrentPassword9' }), error => error instanceof CustomerApiError && error.status === 502)
})

test('Nested serial numbers are retained as text and malformed values fail before card rendering', async t => {
  const item = { position: 1, device: 'Test model', status: 'ready', issue_description: 'Test issue', serial_number: 'TEST-SERIAL-001', updated_at: ticket.updated_at }
  let response = [{ ...ticket, items: [item] }]
  t.mock.method(globalThis, 'fetch', async () => jsonResponse(response))
  assert.deepEqual(await customerApi.tickets(), response)
  response = [{ ...ticket, items: [{ ...item, serial_number: {} }] }]
  await assert.rejects(() => customerApi.tickets(), error => error instanceof CustomerApiError && error.status === 502)
})

async function authMarkup(locale, mode, registered = false) {
  const url = await compileComponent('src/account/AuthDialog.tsx', {
    './CustomerAuthProvider': moduleUrl(`export const useCustomerAuth = () => ({authMode:${JSON.stringify(mode)}, openAuth(){}, closeAuth(){}, acceptUser(){}})`),
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)},href:path=>${locale === 'en' ? '"/en"+path' : 'path'}})`),
    '../components/LaptopIcon': iconModuleUrl,
    './customerApi': apiModuleUrl,
    '../utils/validation': new URL('src/utils/validation.ts', root).href,
    ...(registered ? { react: moduleUrl(`/* synthetic completed registration ${locale} */ let state = 0; export function useState(initial) { return [state++ === 2 ? true : initial, () => {}] } export const useRef = current => ({current}); export const useEffect = () => {};`) } : {}),
  })
  const { default: AuthDialog } = await import(url)
  return renderToStaticMarkup(createElement(AuthDialog))
}

function assertAuthDescriptionsResolve(html) {
  for (const [, references] of html.matchAll(/aria-describedby="([^"]+)"/g)) {
    for (const id of references.split(/\s+/)) assert.ok(html.includes(`id="${id}"`), `aria-describedby must resolve to a visible description: ${id}`)
  }
}

for (const locale of ['ka', 'en']) {
  test(`${locale} sign-in dialog displays the real logo and the Profile heading`, async () => {
    const auth = moduleUrl('export const useCustomerAuth = () => ({authMode:"login", openAuth(){}, closeAuth(){}, acceptUser(){}})')
    const translation = moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)},href:path=>${locale === 'en' ? '"/en"+path' : 'path'}})`)
    const url = await compileComponent('src/account/AuthDialog.tsx', {
      './CustomerAuthProvider': auth,
      '../i18n/LocaleProvider': translation,
      '../components/LaptopIcon': iconModuleUrl,
      './customerApi': apiModuleUrl,
      '../utils/validation': new URL('src/utils/validation.ts', root).href,
    })
    const { default: AuthDialog } = await import(url)
    const html = renderToStaticMarkup(createElement(AuthDialog))
    assert.match(html, /<img\b[^>]*src="\/assets\/brand\/tecservice-logo\.svg"[^>]*alt="TECSERVICE"/)
    assert.ok(html.includes(`<h2 id="account-auth-title">${locale === 'ka' ? 'პროფილი' : 'Profile'}</h2>`))
    assert.ok(!html.includes(locale === 'ka' ? 'გაიარე ავტორიზაცია სისტემაში' : 'Sign in to your account'))
    assert.match(html, /<dialog\b[^>]*aria-labelledby="account-auth-title"/)
    assert.doesNotMatch(html, /account-auth-intro|account-password-hint/)
    assertAuthDescriptionsResolve(html)
    const passwordInput = [...html.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag).find(tag => tag.includes('name="password"'))
    assert.ok(passwordInput)
    assert.match(passwordInput, /type="password"/)
    assert.match(passwordInput, /autoComplete="current-password"/i)
    assert.doesNotMatch(html, /<span>T<span>S<\/span><\/span>|Your personal space|თქვენი პირადი სივრცე/)
    await access(new URL('public/assets/brand/tecservice-logo.svg', root))
  })

  test(`${locale} registration omits the introductory sentence and static password hint without changing required fields`, async () => {
    const html = await authMarkup(locale, 'register')
    assert.ok(!html.includes(locale === 'ka' ? 'შეავსეთ მონაცემები ანგარიშის შესაქმნელად.' : 'Enter your details to create an account.'))
    assert.ok(!html.includes(locale === 'ka' ? 'მინიმუმ 8 სიმბოლო, ასოებითა და ციფრებით.' : 'At least 8 characters, including letters and numbers.'))
    assert.doesNotMatch(html, /account-auth-intro|account-password-hint/)
    const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag)
    for (const name of ['full_name', 'phone', 'password', 'confirm', 'terms']) assert.match(inputs.find(tag => tag.includes(`name="${name}"`)) ?? '', /\brequired(?:="")?/)
    for (const name of ['password', 'confirm']) {
      const input = inputs.find(tag => tag.includes(`name="${name}"`))
      assert.match(input, /type="password"/)
      assert.match(input, /minLength="8"/i)
      assert.match(input, /autoComplete="new-password"/i)
    }
    assert.ok(html.includes(locale === 'ka' ? 'უსაფრთხოებისთვის ანგარიშს ჩვენი გუნდი გადაამოწმებს და დაადასტურებს.' : 'For security, our team will verify and approve your account.'))
    assertAuthDescriptionsResolve(html)
  })

  test(`${locale} account recovery retains its guidance and registration success has one concise linked description`, async () => {
    const help = await authMarkup(locale, 'help')
    assert.ok(help.includes(locale === 'ka' ? 'ანგარიშის აღდგენისთვის დაუკავშირდით ჩვენს გუნდს. პაროლი არავის გაუზიაროთ.' : 'Contact our team to recover access to your account. Never share your password.'))
    assert.match(help, /aria-describedby="account-auth-intro"/)
    assert.match(help, /href="tel:\+995591474040"/)
    assertAuthDescriptionsResolve(help)
    const success = await authMarkup(locale, 'register', true)
    assert.ok(success.includes(`<h2 id="account-auth-title">${locale === 'ka' ? 'მოთხოვნა მიღებულია' : 'Request received'}</h2>`))
    const description = locale === 'ka' ? 'სერვისები და შესყიდვები ანგარიშის დადასტურების შემდეგ გამოჩნდება.' : 'Your services and purchases will appear after account approval.'
    assert.ok(success.includes(`<p id="account-auth-success-description">${description}</p>`))
    assert.equal(success.split(description).length - 1, 1)
    assert.ok(!success.includes(locale === 'ka' ? 'მონაცემების გადამოწმებისა და ანგარიშის დადასტურების შემდეგ შეძლებთ შესვლას.' : 'You can sign in once our team has verified your details and approved your account.'))
    assert.ok(!success.includes(locale === 'ka' ? 'თქვენი სერვისები და შესყიდვები მხოლოდ ანგარიშის დადასტურების შემდეგ გახდება ხელმისაწვდომი.' : 'Your services and purchases become available only after your account is approved.'))
    assert.doesNotMatch(success, /account-auth-intro/)
    assert.match(success, /aria-describedby="account-auth-success-description"/)
    assert.doesNotMatch(success, /<form\b|name="password"/)
    assertAuthDescriptionsResolve(success)
  })

  test(`${locale} profile is an editable five-row form but keeps the ownership phone protected`, async () => {
    const translation = moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)},href:path=>${locale === 'en' ? '"/en"+path' : 'path'}})`)
    const url = await compileComponent('src/account/CustomerProfile.tsx', {
      '../i18n/LocaleProvider': translation,
      '../components/LaptopIcon': iconModuleUrl,
      './customerApi': apiModuleUrl,
      '../utils/validation': new URL('src/utils/validation.ts', root).href,
    })
    const { CustomerProfile } = await import(url)
    const html = renderToStaticMarkup(createElement(CustomerProfile, { user, isPreview: false, onSave: async () => {} }))
    assert.match(html, /name="first_name"[^>]*value="Updated"/)
    assert.match(html, /name="last_name"[^>]*value="customer"/)
    assert.ok(html.includes(user.email))
    assert.ok(html.includes(user.phone))
    assert.ok(html.includes(locale === 'ka' ? 'რეგისტრაციის ნომერი დაცულია.' : 'Your registered number is protected.'))
    assert.equal((html.match(/class="account-profile-editor__pencil"/g) ?? []).length, 4)
    assert.doesNotMatch(html, /role="switch"|customer-profile-citizen/)
    assert.doesNotMatch(html, /<input\b[^>]*name="(?:phone|contact_phone|id|role|approval_status|current_password)"/)
    const editor = await profileDriver(false, locale)
    const grid = findAll(editor.tree, node => node.props.className === 'account-profile-editor__grid')[0]
    assert.equal(grid.props.children.length, 5)
    assert.equal(editor.field('personal_id').required, undefined)
    assert.equal(editor.field('first_name').required, true)
    assert.equal(findAll(editor.tree, node => node.props.role === 'switch').length, 0)
  })
}

test('Profile editing requires the current password, awaits confirmation and announces errors', async () => {
  const source = await read('src/account/CustomerProfile.tsx')
  assert.match(source, /name="current_password"[^>]*autoComplete="current-password"[^>]*required/)
  assert.match(source, /await onSave\(/)
  assert.match(source, /aria-busy=\{saving\}/)
  assert.match(source, /role="alert"/)
  assert.match(source, /role="status"/)
  assert.match(source, /cause\.status === 403/)
  assert.match(source, /cause\.status === 409/)
  assert.match(source, /cause\.status === 429/)
  assert.ok((source.match(/setPassword\(''\)/g) ?? []).length >= 3, 'Sensitive input clears on completion, cancellation and error')
  assert.doesNotMatch(source, /<input\b[^>]*name="(?:phone|id|role|approval_status)"/)
})

async function profileDriver(isPreview = false, locale = 'en', userOverrides = {}) {
  const hooksUrl = moduleUrl(`
    let cells = [], cursor = 0;
    export const reset = () => { cells = []; cursor = 0 };
    export const begin = () => { cursor = 0 };
    export const useEffect = () => {};
    export function useRef(initial) { const index = cursor++; return cells[index] ??= {current:initial} }
    export function useState(initial) { const index = cursor++; if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial; return [cells[index], next => { cells[index] = typeof next === 'function' ? next(cells[index]) : next }] }
  `)
  const hooks = await import(hooksUrl)
  hooks.reset()
  const url = await compileComponent('src/account/CustomerProfile.tsx', {
    react: hooksUrl,
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)},href:path=>path})`),
    '../components/LaptopIcon': iconModuleUrl,
    './customerApi': apiModuleUrl,
    '../utils/validation': new URL('src/utils/validation.ts', root).href,
  })
  const { CustomerProfile } = await import(url)
  const saves = []
  let resolveSave, rejectSave
  const props = { user: { ...user, ...userOverrides }, isPreview, onSave: payload => { saves.push(payload); return new Promise((resolve, reject) => { resolveSave = resolve; rejectSave = reject }) } }
  let tree
  const render = () => {
    hooks.begin()
    tree = CustomerProfile(props)
  }
  render()
  const field = name => findAll(tree, node => node.type === 'input' && node.props.name === name)[0]?.props
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); render() }
  return {
    saves, field, props, render,
    get tree() { return tree },
    change(name, value) { field(name).onChange({ target: { value } }); render() },
    submit() { findAll(tree, node => node.type === 'form' && node.props.className === 'account-profile-editor__form')[0].props.onSubmit({ preventDefault() {} }); render() },
    confirm() { const dialog = findAll(tree, node => node.type === 'dialog')[0]; findAll(dialog, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} }); render() },
    cancel() { findAll(tree, node => node.props.className === 'account-profile-confirm__cancel')[0].props.onClick(); render() },
    async complete() { resolveSave(); await flush() },
    async fail(cause) { rejectSave(cause); await flush() },
  }
}

test('Registered phone is the first profile row and has no editable input or pencil action', async () => {
  for (const locale of ['ka', 'en']) {
    const driver = await profileDriver(false, locale)
    const grid = findAll(driver.tree, node => node.props.className === 'account-profile-editor__grid')[0]
    const phone = grid.props.children[0]
    assert.equal(phone.props.className, 'account-profile-editor__phone')
    assert.ok(textContent(phone).includes(user.phone))
    assert.equal(findAll(phone, node => node.type === 'button' || node.type === 'input').length, 0)
    const value = findAll(phone, node => node.type === 'strong')[0]
    assert.equal(value.props['aria-describedby'], 'customer-profile-phone-note')
    assert.equal(driver.field('phone'), undefined)
    assert.equal(driver.field('contact_phone'), undefined, 'The simplified form does not duplicate the sign-in number with another phone row')
  }
})

test('Profile edits normalize names and email but save only after current-password confirmation', async () => {
  const driver = await profileDriver()
  driver.change('first_name', '  Synthetic  First  ')
  driver.change('last_name', '  Last  Name ')
  driver.change('email', '  TEST@example.invalid ')
  driver.submit()
  assert.equal(driver.saves.length, 0)
  assert.equal(driver.field('current_password').required, true)
  assert.equal(driver.field('email').disabled, true)
  driver.confirm()
  assert.equal(driver.saves.length, 0, 'A programmatic empty-password submit cannot bypass confirmation')
  driver.change('current_password', 'SyntheticCurrentPassword9')
  driver.confirm()
  assert.equal(driver.saves.length, 1)
  assert.deepEqual(driver.saves[0], { full_name: 'Synthetic First Last Name', email: 'test@example.invalid', personal_id: null, current_password: 'SyntheticCurrentPassword9' })
  driver.confirm()
  driver.cancel()
  assert.equal(driver.saves.length, 1, 'Pending confirmation is guarded against duplicate requests')
  assert.equal(driver.field('current_password').disabled, true)
  assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 1, 'Pending saves cannot be dismissed')
  await driver.complete()
  assert.equal(driver.field('current_password'), undefined)
  assert.equal(driver.field('email').disabled, false)
  assert.equal(findAll(driver.tree, node => node.props.role === 'status').length, 1)
})

test('Invalid names and stored-citizenship-specific optional IDs block confirmation with linked errors', async () => {
  const driver = await profileDriver(false, 'en', { is_georgian_citizen: true })
  driver.change('first_name', ' ')
  driver.submit()
  assert.equal(driver.saves.length, 0)
  assert.equal(driver.field('first_name')['aria-invalid'], true)
  assert.equal(driver.field('first_name')['aria-describedby'], 'customer-profile-error')
  assert.equal(findAll(driver.tree, node => node.props.id === 'customer-profile-error')[0].props.role, 'alert')
  driver.change('first_name', 'Synthetic')
  assert.equal(driver.field('first_name')['aria-invalid'], undefined)
  assert.equal(driver.field('personal_id').inputMode, 'numeric')
  driver.change('personal_id', 'SAMPLE-ID')
  driver.submit()
  assert.equal(driver.field('personal_id')['aria-invalid'], true)
  assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 0)
  driver.change('personal_id', ' ')
  driver.submit()
  assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 1, 'Personal ID remains optional when Georgian citizenship is stored')
  driver.cancel()
  const foreign = await profileDriver(false, 'en', { is_georgian_citizen: false })
  foreign.change('personal_id', '!!')
  foreign.submit()
  assert.equal(foreign.field('personal_id')['aria-invalid'], true)
})

test('Preview profile editing skips real password confirmation and does not overwrite stored citizenship', async () => {
  const driver = await profileDriver(true, 'en', { is_georgian_citizen: false })
  assert.equal(findAll(driver.tree, node => node.props.className === 'account-profile-editor__preview').length, 0)
  assert.doesNotMatch(textContent(driver.tree), /Preview mode|changes apply only to this page/)
  assert.equal(driver.field('current_password'), undefined)
  driver.change('personal_id', '  SAMPLE-ID  ')
  driver.change('email', ' ')
  driver.submit()
  assert.equal(Object.hasOwn(driver.saves[0], 'is_georgian_citizen'), false)
  assert.equal(driver.saves[0].personal_id, 'SAMPLE-ID')
  assert.equal(driver.saves[0].email, null)
  assert.equal(driver.saves[0].current_password, '')
  assert.equal(Object.hasOwn(driver.saves[0], 'phone'), false)
  assert.equal(Object.hasOwn(driver.saves[0], 'contact_phone'), false)
  assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 0)
  await driver.complete()
  assert.equal(textContent(findAll(driver.tree, node => node.props.role === 'status')[0]), 'The change applies only to this page.')
})

test('Cancelling profile confirmation does not save and reopening never restores the entered password', async () => {
  const driver = await profileDriver()
  driver.change('first_name', 'Synthetic')
  driver.submit()
  driver.change('current_password', 'SyntheticCurrentPassword9')
  driver.cancel()
  assert.equal(driver.saves.length, 0)
  assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 0)
  assert.equal(driver.field('first_name').value, 'Synthetic', 'Cancelling confirmation preserves the editable draft')
  driver.submit()
  assert.equal(driver.field('current_password').value, '')
  driver.confirm()
  assert.equal(driver.saves.length, 0)
})

test('Profile confirmation title renders uppercase text without changing editable names or email', async () => {
  for (const locale of ['ka', 'en']) {
    const driver = await profileDriver(false, locale, { full_name: 'ქართული MixedCase', email: 'MixedCase@example.invalid' })
    driver.submit()
    const title = textContent(findAll(driver.tree, node => node.props.id === 'customer-profile-confirm-title')[0])
    assert.equal(title, toGeorgianMtavruli(locale === 'ka' ? 'ცვლილებების დადასტურება' : 'Confirm your changes'))
    if (locale === 'ka') {
      assert.match(title, /[\u1c90-\u1cbf]/u)
      assert.doesNotMatch(title, /[\u10d0-\u10ff]/u)
    }
    assert.equal(driver.field('first_name').value, 'ქართული')
    assert.equal(driver.field('last_name').value, 'MixedCase')
    assert.equal(driver.field('email').value, 'MixedCase@example.invalid')
    assert.equal(driver.saves.length, 0)
  }
})

test('Profile confirmation failures clear secrets and announce safe messages without claiming a save', async t => {
  const previous = globalThis.window
  globalThis.window = { requestAnimationFrame: callback => callback() }
  t.after(() => { globalThis.window = previous })
  for (const [status, reason, expected] of [
    [401, 'Private session detail', /session has expired/i],
    [403, 'Current password is incorrect', /current password is incorrect/i],
    [403, 'Private account detail', /unavailable for this account/i],
    [409, 'Private duplicate detail', /Use another address/],
    [422, 'Private field detail', /check the information/i],
    [429, 'Private rate limit detail', /Too many attempts/],
    [500, 'Private server detail', /not confirmed as saved/],
  ]) {
    const driver = await profileDriver()
    driver.submit()
    driver.change('current_password', 'SyntheticCurrentPassword9')
    driver.confirm()
    await driver.fail(new CustomerApiError(status, reason))
    assert.equal(driver.saves.length, 1)
    assert.equal(driver.field('current_password').value, '')
    assert.equal(driver.field('current_password').disabled, false)
    const alert = findAll(driver.tree, node => node.props.role === 'alert')
    assert.equal(alert.length, 1)
    assert.match(textContent(alert[0]), expected)
    assert.doesNotMatch(textContent(driver.tree), /Private|SyntheticCurrentPassword9/)
    assert.equal(findAll(driver.tree, node => node.props.role === 'status').length, 0)
    driver.confirm()
    assert.equal(driver.saves.length, 1, 'A failed password is never silently reused')
    driver.cancel()
    assert.equal(findAll(driver.tree, node => node.type === 'dialog').length, 0)
  }
})

test('Stored citizenship and personal ID are preserved, and a blank ID explicitly clears only that optional field', async () => {
  for (const citizen of [null, false, true]) {
    const driver = await profileDriver(true, 'en', { is_georgian_citizen: citizen, personal_id: citizen === true ? '00000000000' : 'SAMPLE-ID' })
    assert.equal(findAll(driver.tree, node => node.props.role === 'switch').length, 0)
    driver.change('personal_id', ' ')
    driver.submit()
    assert.equal(Object.hasOwn(driver.saves[0], 'is_georgian_citizen'), false, 'Hidden citizenship is omitted, preserving its existing value on the server')
    assert.equal(driver.saves[0].personal_id, null)
    assert.equal(Object.hasOwn(driver.saves[0], 'phone'), false)
  }
  const driver = await profileDriver(true, 'en', { full_name: 'Synthetic Multi Part Surname', is_georgian_citizen: true, personal_id: '00000000000' })
  assert.equal(driver.field('first_name').value, 'Synthetic')
  assert.equal(driver.field('last_name').value, 'Multi Part Surname')
  driver.submit()
  assert.equal(driver.saves[0].full_name, 'Synthetic Multi Part Surname')
  assert.equal(driver.saves[0].personal_id, '00000000000')
})

test('Login, registration and editable profile all accept the same 254-character email limit', async () => {
  const auth = await read('src/account/AuthDialog.tsx')
  const profile = await read('src/account/CustomerProfile.tsx')
  for (const [source, id] of [[auth, 'account-identifier'], [auth, 'account-email'], [profile, 'customer-profile-email']]) {
    const input = [...source.matchAll(/<input\b[^>]*>/g)].map(([tag]) => tag).find(tag => tag.includes(`id="${id}"`))
    assert.ok(input, id)
    assert.equal(Number(input.match(/maxLength=\{(\d+)\}/)?.[1]), 254, id)
  }
})

test('Auth logo is left-aligned while heading and introductory copy remain centered', async () => {
  const css = await read('src/styles/account-auth.css')
  assert.match(css, /\.account-auth__brand\s*\{[^}]*justify-content:\s*flex-start/)
  assert.doesNotMatch(css, /\.account-auth__brand\s*\{[^}]*justify-content:\s*center/)
  assert.match(css, /\.account-auth h2\s*\{[^}]*text-align:\s*center/)
  assert.match(css, /\.account-auth #account-auth-intro\s*\{[^}]*text-align:\s*center/)
})

test('Purchase cards show real quantities and one total with native inline details for statuses and remaining products', async () => {
  const url = await compileComponent('src/account/CustomerPurchaseCard.tsx', {
    '../components/LaptopIcon': iconModuleUrl,
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
  })
  const { CustomerPurchaseCard } = await import(url)
  const purchase = {
    id: 'test-purchase', order_number: 'TEST-3001', status: 'processing', payment_status: 'partial', created_at: '2026-09-21T08:00:00Z', total: 179, currency: 'GEL',
    items: [{ name: 'Test product one', quantity: 2, unit_price: 50 }, { name: 'Test product two', quantity: 1, unit_price: 39 }, { name: 'Test product three', quantity: 1, unit_price: 40 }],
  }
  const html = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale: 'en' }))
  assert.match(html, /class="account-purchase-card"/)
  assert.ok(html.includes(purchase.order_number))
  for (const item of purchase.items) assert.ok(html.includes(item.name))
  const firstList = html.match(/<ul\b[^>]*class="account-purchase-card__products"[^>]*>[\s\S]*?<\/ul>/)?.[0]
  assert.equal((firstList?.match(/<li\b/g) ?? []).length, 2)
  assert.match(html, /<details class="account-purchase-disclosure"><summary /)
  assert.ok(html.includes(dashboardCopy.en.statusLabels.partial), 'Recorded payment status appears in the expanded details')
  const summary = html.match(/<summary\b[^>]*>[\s\S]*?<\/summary>/)?.[0]
  assert.ok(!summary.includes(dashboardCopy.en.statusLabels.partial), 'Extra status fields are not in the collapsed summary')
  assert.ok(!summary.includes('Test product three'), 'Remaining products appear only after expansion')
  assert.equal((html.match(/Test product three/g) ?? []).length, 1)
  assert.match(html, /class="account-purchase-card__total"[^>]*>[\s\S]*179/)
  assert.doesNotMatch(html, /<img\b|href="#"/)
})

for (const locale of ['ka', 'en']) {
  test(`${locale} simplified purchase receipt retains order, product amounts and one total without duplicate payment details`, async () => {
    const url = await compileComponent('src/account/CustomerPurchaseCard.tsx', {
      '../components/LaptopIcon': iconModuleUrl,
      './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
    })
    const { CustomerPurchaseCard } = await import(url)
    const copy = dashboardCopy[locale]
    const purchase = {
      id: 'synthetic-receipt', order_number: 'RECEIPT-7001', status: 'processing', payment_status: 'partial',
      created_at: '2026-09-21T08:00:00Z', total: 143.25, currency: 'GEL',
      items: [{ name: 'Synthetic photographed product', quantity: 3, unit_price: 47.75, image_url: '/assets/products/kingston-nv3-figma.png' }],
    }
    const html = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale }))
    assert.ok(html.includes('data-status="processing"'))
    assert.equal(html.split(`<dt>${copy.payment}</dt>`).length - 1, 1)
    assert.equal(html.split(copy.statusLabels.partial).length - 1, 1)
    assert.equal(html.split(`<dt>${locale === 'ka' ? 'შეკვეთის ღირებულება:' : 'Order total:'}</dt>`).length - 1, 1)
    assert.equal(html.split('143.25').length - 1, 1, 'Order total must not be repeated in the product list')
    assert.match(html, /src="\/assets\/products\/kingston-nv3-figma\.png"/)
    assert.ok(html.includes(purchase.order_number))
    assert.ok(html.includes(purchase.items[0].name))
    assert.ok(html.includes('09/21/2026 12:00'), 'Purchase time matches the numeric receipt format in Asia/Tbilisi')
    assert.doesNotMatch(html, /href="#"|checkout|Pay now/)
    assert.match(html, /<details class="account-purchase-disclosure">/)
  })
}

test('Purchase details expand inline with separate header invoice and accessible collapse without navigation or checkout', async () => {
  const url = await compileComponent('src/account/CustomerPurchaseCard.tsx', {
    '../components/LaptopIcon': iconModuleUrl,
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
  })
  const { CustomerPurchaseCard } = await import(url)
  const purchase = {
    id: 'synthetic-detail-order', order_number: 'DETAIL-7002', status: 'processing', payment_status: 'unpaid',
    created_at: '2026-09-21T21:05:06Z', total: 150, currency: 'GEL',
    items: Array.from({ length: 5 }, (_, index) => ({ name: `Synthetic detail product ${index + 1}`, quantity: index + 1, unit_price: 10 })),
  }
  for (const locale of ['ka', 'en']) {
    const listHtml = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale }))
    assert.equal((listHtml.match(/<li\b/g) ?? []).length, 5)
    assert.match(listHtml, /<details class="account-purchase-disclosure"><summary /)
    assert.ok(listHtml.includes(locale === 'ka' ? 'დეტალები' : 'Details'))
    const tree = CustomerPurchaseCard({ purchase, locale })
    const summary = findAll(tree, node => node.type === 'summary')[0]
    assert.ok(summary.props['aria-label'].includes(purchase.order_number))
    assert.equal(findAll(summary, node => node.type === 'button' || typeof node.type === 'function' && node.type.name === 'InvoiceButton').length, 0, 'Invoice and collapse must not be nested inside a native summary')
    const buttons = findAll(tree, node => node.type === 'button')
    assert.equal(buttons.length, 1)
    assert.equal(buttons[0].props.className, 'account-purchase-collapse')
    let focusOptions
    const disclosure = { open: true, querySelector: selector => { assert.equal(selector, 'summary'); return { focus: options => { focusOptions = options } } } }
    buttons[0].props.onClick({ currentTarget: { closest: selector => { assert.equal(selector, 'details'); return disclosure } } })
    assert.equal(disclosure.open, false)
    assert.deepEqual(focusOptions, { preventScroll: true })
    const detailHtml = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale, detail: true }))
    assert.equal((detailHtml.match(/<li\b/g) ?? []).length, 5)
    for (const item of purchase.items) assert.equal(detailHtml.split(item.name).length - 1, 1, 'Product rows are not duplicated between summary and details')
    assert.ok(detailHtml.includes('01:05'), 'The purchase date/time crosses midnight correctly for Georgia')
    assert.doesNotMatch(detailHtml, /href="#"|checkout|Pay now|გადაიხად/u)
    assert.match(detailHtml, /<details class="account-purchase-disclosure" open="">/)
    const detailTree = CustomerPurchaseCard({ purchase, locale, detail: true, isPreview: true })
    const invoice = findAll(detailTree, node => typeof node.type === 'function' && node.type.name === 'InvoiceButton')
    assert.equal(invoice.length, 1)
    assert.deepEqual(invoice[0].props.target, { kind: 'purchase', id: purchase.id, reference: purchase.order_number })
    assert.equal(invoice[0].props.locale, locale)
    assert.equal(invoice[0].props.isPreview, true)
    assert.equal(findAll(detailTree, node => node.type === 'button').length, 1, 'Expanded content has a single collapse action')
  }
  const css = await read('src/styles/account-purchases.css')
  assert.match(css, /\.account-purchase-disclosure\[open\] \.account-purchase-card__open\s*\{[^}]*visibility:\s*hidden/)
  assert.match(css, /\.account-purchase-disclosure:not\(\[open\]\) \.account-purchase-invoice\s*\{[^}]*display:\s*none/)
  assert.match(css, /\.account-purchase-invoice\s*\{[^}]*position:\s*absolute/)
})

test('Purchase unit price and quantity follow the product name in a single stacked content block', async () => {
  const url = await compileComponent('src/account/CustomerPurchaseCard.tsx', {
    '../components/LaptopIcon': iconModuleUrl,
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
  })
  const { PurchaseProducts } = await import(url)
  const purchase = {
    id: 'synthetic-price-placement', order_number: 'PRICE-7003', status: 'completed', payment_status: 'paid',
    created_at: '2026-09-21T08:00:00Z', total: 37.5, currency: 'GEL',
    items: [{ name: 'Synthetic named product', quantity: 3, unit_price: 12.5 }],
  }
  for (const locale of ['ka', 'en']) {
    const tree = PurchaseProducts({ purchase, locale })
    const content = findAll(tree, node => node.props.className === 'account-purchase-item__content')[0]
    const heading = findAll(content, node => node.type === 'h4')[0]
    const facts = findAll(content, node => node.type === 'dl')[0]
    assert.equal(textContent(heading), purchase.items[0].name)
    assert.ok(content.props.children.indexOf(heading) < content.props.children.indexOf(facts), 'Name precedes product amounts in reading order')
    const labels = findAll(facts, node => node.type === 'dt').map(textContent)
    assert.deepEqual(labels, [dashboardCopy[locale].quantity, dashboardCopy[locale].unitPrice])
    const values = findAll(facts, node => node.type === 'dd').map(textContent)
    assert.match(values[0], /^3/)
    assert.match(values[1], /12\.5/)
  }
  const css = await read('src/styles/account-purchases.css')
  const contentRules = [...css.matchAll(/\.account-purchase-item__content\s*\{([^}]*)\}/g)].map(([, rule]) => rule).join('\n')
  assert.match(contentRules, /flex-direction:\s*column/)
  assert.doesNotMatch(contentRules, /flex-direction:\s*row/, 'Product amounts must not switch to a detached side column at another breakpoint')
})

test('Purchase disclosures keep unknown statuses as text and preserve the empty-products state', async () => {
  const url = await compileComponent('src/account/CustomerPurchaseCard.tsx', {
    '../components/LaptopIcon': iconModuleUrl,
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
  })
  const { CustomerPurchaseCard, PurchaseProducts } = await import(url)
  for (const locale of ['ka', 'en']) {
    const purchase = { id: 'empty-synthetic-order', order_number: 'EMPTY', status: '__proto__', payment_status: '<unknown>', created_at: 'invalid', total: 0, currency: 'GEL', items: [] }
    const html = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale, compact: true }))
    assert.ok(html.includes('__proto__'))
    assert.ok(html.includes('&lt;unknown&gt;'))
    assert.doesNotMatch(html, /\[object Object\]|function Object|<unknown>|<ul\b|dateTime="invalid"/)
    assert.equal((html.match(/account-purchase-card__empty/g) ?? []).length, 1)
    assert.match(html, /<h4 aria-label=/)
    assert.match(html, /<h5>/)
    const shared = renderToStaticMarkup(createElement(PurchaseProducts, { purchase, locale }))
    assert.match(shared, /^<p class="account-purchase-card__empty">/)
  }
})

test('Separate Payments section shows recorded payment states and invoice targets without inferring a payment or offering checkout', async () => {
  const records = ['paid', 'unpaid', 'partial', 'refunded', '__proto__'].map((payment_status, index) => ({
    id: `synthetic-payment-${index}`, order_number: `PAYMENT-${index}`, status: 'delivered', payment_status,
    created_at: '2026-09-21T08:00:00Z', total: 123.45 + index, currency: 'GEL', items: [],
  }))
  for (const locale of ['ka', 'en']) {
    const invoiceModule = moduleUrl(`// Payment record invoice capture ${locale}\nexport const calls = []; export function InvoiceButton(props) { calls.push(props); return null }`)
    const invoiceCapture = await import(invoiceModule)
    const url = await compileComponent('src/account/CustomerSettings.tsx', {
      '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({locale:${JSON.stringify(locale)}})`),
      '../components/LaptopIcon': iconModuleUrl,
      './customerApi': apiModuleUrl,
      './accountFormat': new URL('src/account/accountFormat.ts', root).href,
      './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
      './InvoiceButton': invoiceModule,
      './CustomerPurchaseCard': moduleUrl('export function PurchaseProducts() { return null }'),
    })
    const { CustomerPayments } = await import(url)
    const html = renderToStaticMarkup(createElement(CustomerPayments, { purchases: records, isPreview: false }))
    const rows = [...html.matchAll(/<article class="account-payment-row">([\s\S]*?)<\/article>/g)].map(([, row]) => row)
    assert.equal(rows.length, records.length)
    for (const [index, row] of rows.entries()) {
      const record = records[index]
      const copy = dashboardCopy[locale]
      const status = row.match(/class="account-payment-row__status"([^>]*)>([^<]*)<\/span>/)
      assert.ok(status, 'Each payment record must show its status badge')
      assert.ok(status[1].includes(`data-payment-status="${record.payment_status}"`), 'The visual state must match the recorded payment status')
      assert.equal(status[2], Object.hasOwn(copy.statusLabels, record.payment_status) ? copy.statusLabels[record.payment_status] : record.payment_status)
      const invoice = invoiceCapture.calls[index]
      assert.deepEqual(invoice.target, { kind: 'purchase', id: record.id, reference: record.order_number })
      assert.equal(invoice.isPreview, false)
    }
    for (const record of records) assert.ok(html.includes(new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-GB', { maximumFractionDigits: 2 }).format(record.total)))
    assert.doesNotMatch(html, /checkout|Pay now|card_number|cvv|function Object|\[object Object\]|href="#"/)
    const empty = renderToStaticMarkup(createElement(CustomerPayments, { purchases: [], isPreview: false }))
    assert.ok(empty.includes(locale === 'ka' ? 'გადახდის ჩანაწერები ჯერ არ არის.' : 'There are no payment records yet.'))
    assert.doesNotMatch(empty, /account-payment-row/)
  }
})

const selectOptions = [{ value: 'all', label: 'All statuses' }, { value: 'ready', label: 'Ready' }, { value: 'picked_up', label: 'Collected' }]
const selectModuleUrl = await compileComponent('src/account/AccountSelect.tsx', { '../components/LaptopIcon': iconModuleUrl })
const { AccountSelect } = await import(selectModuleUrl)

test('Custom status selector renders a labelled collapsed combobox instead of a native select', () => {
  const html = renderToStaticMarkup(createElement(AccountSelect, { id: 'test-status', label: 'Status', value: 'ready', options: selectOptions, onChange() {}, controls: 'account-services-list' }))
  const trigger = html.match(/<button\b[^>]*>/)?.[0]
  assert.ok(trigger)
  for (const attribute of ['role="combobox"', 'aria-expanded="false"', 'aria-haspopup="listbox"', 'aria-labelledby="test-status-label test-status-value"']) assert.ok(trigger.includes(attribute), attribute)
  assert.match(trigger, /aria-controls="[^"]+"/)
  assert.match(html, /id="test-status-value">Ready<\/span>/)
  assert.doesNotMatch(html, /<select\b|<option\b|role="listbox"|aria-activedescendant=/)
})

// A minimal hook host exercises the component's actual event handlers and state
// transitions. Native focus behavior and click-away handling are checked in browser QA.
async function dropdownDriver() {
  const hooksUrl = moduleUrl(`
    let cells = [], cursor = 0;
    export const reset = () => { cells = []; cursor = 0 };
    export const begin = () => { cursor = 0 };
    export const useId = () => 'test-instance';
    export const useEffect = () => {};
    export function useRef(initial) { const index = cursor++; return cells[index] ??= {current:initial} }
    export function useState(initial) { const index = cursor++; if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial; return [cells[index], next => { cells[index] = typeof next === 'function' ? next(cells[index]) : next }] }
  `)
  const hooks = await import(hooksUrl)
  hooks.reset()
  const componentUrl = await compileComponent('src/account/AccountSelect.tsx', { react: hooksUrl, '../components/LaptopIcon': iconModuleUrl })
  const { AccountSelect: Select } = await import(componentUrl)
  const changes = []
  let focusCount = 0
  const props = { id: 'keyboard-status', label: 'Status', value: 'all', options: selectOptions, onChange: value => { changes.push(value); props.value = value } }
  let tree
  const render = () => {
    hooks.begin()
    tree = Select(props)
    const button = findAll(tree, node => node.type === 'button')[0]
    button.props.ref.current = { focus: () => { focusCount++ } }
    return button
  }
  let button = render()
  return {
    changes,
    get button() { return button.props },
    get options() { return findAll(tree, node => node.props.role === 'option').map(node => node.props) },
    get focusCount() { return focusCount },
    press(key, modifiers = {}) {
      let prevented = false
      button.props.onKeyDown({ key, ctrlKey: false, altKey: false, metaKey: false, preventDefault() { prevented = true }, ...modifiers })
      button = render()
      return prevented
    },
  }
}

test('Custom dropdown keyboard navigation selects real options and restores trigger focus', async () => {
  const driver = await dropdownDriver()
  assert.equal(driver.button['aria-expanded'], false)
  assert.equal(driver.press('ArrowDown'), true)
  assert.equal(driver.button['aria-expanded'], true)
  assert.equal(driver.options.length, 3)
  assert.equal(driver.options.filter(option => option['aria-selected']).length, 1)
  driver.press('End')
  assert.match(driver.button['aria-activedescendant'], /-2$/)
  driver.press('Home')
  assert.match(driver.button['aria-activedescendant'], /-0$/)
  driver.press('ArrowUp')
  assert.match(driver.button['aria-activedescendant'], /-2$/)
  driver.press('Enter')
  assert.deepEqual(driver.changes, ['picked_up'])
  assert.equal(driver.button['aria-expanded'], false)
  assert.equal(driver.focusCount, 1)
})

test('Dropdown Escape and Tab dismiss without committing, while typeahead can select a label', async () => {
  const driver = await dropdownDriver()
  driver.press(' ')
  driver.press('ArrowDown')
  assert.equal(driver.press('Escape'), true)
  assert.equal(driver.button['aria-expanded'], false)
  assert.deepEqual(driver.changes, [])
  driver.press('Home')
  assert.equal(driver.press('Tab'), false, 'Tab must retain native focus traversal')
  assert.equal(driver.button['aria-expanded'], false)
  driver.press('r')
  assert.match(driver.button['aria-activedescendant'], /-1$/)
  driver.press('Enter')
  assert.deepEqual(driver.changes, ['ready'])
  assert.equal(driver.press('r', { ctrlKey: true }), false, 'Browser shortcuts remain available')
})
