import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'

const root = new URL('../', import.meta.url)
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const source = await readFile(new URL('src/account/CustomerSettings.tsx', root), 'utf8')
const findAll = (node, predicate) => Array.isArray(node) ? node.flatMap(child => findAll(child, predicate)) : node?.props ? [...(predicate(node) ? [node] : []), ...findAll(node.props.children, predicate)] : []
const textContent = node => Array.isArray(node) ? node.map(textContent).join('') : node?.props ? textContent(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
const address = { id: 'synthetic-address-one', label: 'Synthetic home', city: 'Synthetic city', address: 'Synthetic street 1' }
const secondAddress = { ...address, id: 'synthetic-address-two', label: 'Synthetic office', address: 'Synthetic street 2' }
const submitEvent = () => ({ preventDefault() {} })
let instance = 0

// This tiny host runs the real component handlers, state and dependent effects.
// Refs use focus spies, so these tests check focus intent, not browser layout.
// All API calls are isolated promises: no server, cookie, real data or network.
async function settingsDriver({ kind = 'addresses', isPreview = false, locale = 'en', purchases = [] } = {}) {
  const id = ++instance
  const hooksUrl = moduleUrl(`
    // Isolated settings hooks ${id}
    let cells = [], cursor = 0, queued = [], dirty = false;
    export function begin() { cursor = 0; queued = []; dirty = false }
    export const changed = () => dirty;
    export function useState(initial) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial;
      return [cells[index], value => {
        const next = typeof value === 'function' ? value(cells[index]) : value;
        if (!Object.is(next, cells[index])) { cells[index] = next; dirty = true }
      }];
    }
    export function useRef(initial) { const index = cursor++; return cells[index] ??= { current: initial } }
    export function useEffect(callback, deps) {
      const index = cursor++;
      const previous = cells[index];
      if (!previous || deps.some((value, at) => !Object.is(value, previous.deps[at]))) {
        queued.push(() => {
          previous?.cleanup?.();
          cells[index] = { deps, cleanup: callback() };
        });
      }
    }
    export function flush() { for (const callback of queued) callback(); queued = [] }
  `)
  const apiUrl = moduleUrl(`
    // Isolated settings API ${id}
    export class CustomerApiError extends Error { constructor(status) { super('Synthetic failure'); this.status = status } }
    export const calls = [];
    const pending = [];
    const wait = result => new Promise((resolve, reject) => pending.push({ resolve: () => resolve(result), reject }));
    export const resolveNext = () => { const item = pending.shift(); if (!item) throw new Error('No pending write'); item.resolve() };
    export const rejectNext = () => { const item = pending.shift(); if (!item) throw new Error('No pending write'); item.reject(new CustomerApiError(500)) };
    export const customerApi = {
      addresses: async () => ${JSON.stringify([address, secondAddress])},
      saveAddress: (payload, id) => { calls.push({ action: 'save', payload, id }); return wait({ ...payload, id: id || 'synthetic-created-address' }) },
      deleteAddress: id => { calls.push({ action: 'delete', id }); return wait(undefined) },
      changePassword: (current, password) => { calls.push({ action: 'password', current, password }); return wait(undefined) },
    };
  `)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': moduleUrl(`export const useTranslation = () => ({ locale: ${JSON.stringify(locale)} })`),
    '../utils/text': new URL('src/utils/text.ts', root).href,
    './customerApi': apiUrl,
    './accountFormat': new URL('src/account/accountFormat.ts', root).href,
    './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href,
    './InvoiceButton': moduleUrl('export function InvoiceButton() { return null }'),
    './CustomerPurchaseCard': moduleUrl('export function PurchaseProducts() { return null }'),
  }
  const { code } = await transformWithOxc(source.replaceAll('import.meta.env.DEV', 'true'), '/CustomerSettings.tsx', { jsx: { runtime: 'automatic' } })
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, replacement] of Object.entries(replacements)) executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement))
  const hooks = await import(hooksUrl)
  const api = await import(apiUrl)
  const module = await import(moduleUrl(executable))
  const Component = kind === 'password' ? module.CustomerPassword : kind === 'payments' ? module.CustomerPayments : module.CustomerAddresses
  let changedCount = 0
  const props = { isPreview, active: true, purchases, onChanged() { changedCount++ } }
  const focused = []
  let tree, boundRefs = []
  const assign = (ref, value) => { if (typeof ref === 'function') ref(value); else ref.current = value }
  const render = () => {
    for (let pass = 0; pass < 10; pass++) {
      hooks.begin()
      tree = Component(props)
      for (const ref of boundRefs) assign(ref, null)
      boundRefs = []
      const nodes = findAll(tree, node => typeof node.type === 'string')
      const elements = new Map(nodes.map(node => [node, {
        focus() { focused.push(node) },
        querySelector(selector) {
          const name = selector.match(/^input\[name="([^"]+)"\]$/)?.[1]
          const field = findAll(node, child => child.type === 'input' && child.props.name === name)[0]
          return elements.get(field) ?? null
        },
      }]))
      for (const node of nodes) if (node.props.ref) { assign(node.props.ref, elements.get(node)); boundRefs.push(node.props.ref) }
      hooks.flush()
      if (!hooks.changed()) return tree
    }
    throw new Error('Settings effects did not settle')
  }
  const settle = async () => { for (let step = 0; step < 5; step++) { await Promise.resolve(); render() } }
  render()
  await settle()
  return {
    api, focused, render, settle,
    get tree() { return tree },
    get changedCount() { return changedCount },
    all(predicate) { return findAll(tree, predicate) },
    form() { return findAll(tree, node => node.type === 'form')[0] },
    click(node) { node.props.onClick(); render() },
    field(name) { return findAll(tree, node => node.type === 'input' && node.props.name === name)[0] },
    change(name, value) { this.field(name).props.onChange({ target: { value } }); render() },
    changePasswordField(index, value) { findAll(tree, node => node.type === 'input')[index].props.onChange({ target: { value } }); render() },
    async resolve() { api.resolveNext(); await settle() },
    async reject() { api.rejectNext(); await settle() },
  }
}

test('Whitespace-only address fields cannot create a fake preview save, in either locale', async () => {
  for (const locale of ['en', 'ka']) {
    const driver = await settingsDriver({ isPreview: true, locale })
    driver.click(driver.all(node => node.props.className === 'account-settings__add')[0])
    driver.change('label', '   ')
    driver.change('city', '   ')
    driver.change('address', '   ')
    driver.form().props.onSubmit(submitEvent())
    driver.render()
    assert.equal(driver.api.calls.length, 0)
    assert.equal(driver.all(node => node.props.role === 'status').length, 0)
    assert.equal(driver.all(node => node.props.className === 'account-address').length, 0)
    assert.equal(driver.all(node => node.props.role === 'alert').length, 1)
    assert.equal(driver.focused.at(-1).props.name, 'label')
    for (const field of ['label', 'city', 'address']) {
      assert.equal(driver.field(field).props['aria-invalid'], true)
      assert.equal(driver.field(field).props['aria-describedby'], 'customer-address-error')
    }
    assert.match(textContent(driver.tree), locale === 'en' ? /Complete all address fields/ : /შეავსეთ მისამართის ყველა ველი/)
  }
})

test('Address save and delete share a synchronous lock before another render, then release it', async () => {
  const driver = await settingsDriver()
  const inline = () => driver.all(node => node.props.className === 'account-settings__inline-actions')
  driver.click(findAll(inline()[0], node => node.type === 'button')[1])
  const previousRemove = driver.all(node => node.props.className === 'account-settings__confirmation')[0].props.children[1].props.onClick
  driver.click(findAll(inline()[0], node => node.type === 'button')[0])
  driver.change('label', '  Updated synthetic office  ')
  const submit = driver.form().props.onSubmit
  submit(submitEvent()); submit(submitEvent()); previousRemove()
  assert.equal(driver.api.calls.length, 1, 'Re-entrant save/delete must not start another write')
  assert.deepEqual(driver.api.calls[0], { action: 'save', id: secondAddress.id, payload: { label: 'Updated synthetic office', city: secondAddress.city, address: secondAddress.address } })
  driver.render()
  assert.equal(driver.form().props['aria-busy'], true)
  await driver.resolve()
  driver.click(findAll(inline()[0], node => node.type === 'button')[1])
  const confirm = driver.all(node => node.props.className === 'account-settings__confirmation')[0].props.children[1].props.onClick
  confirm(); confirm(); submit(submitEvent())
  assert.deepEqual(driver.api.calls.map(call => call.action), ['save', 'delete'])
  await driver.reject()
  assert.equal(driver.all(node => node.props.role === 'alert').length, 1)
  driver.all(node => node.props.className === 'account-settings__confirmation')[0].props.children[1].props.onClick()
  assert.equal(driver.api.calls.length, 3, 'A failed request must release the shared lock for retry')
  await driver.resolve()
})

test('Password changes suppress same-tick duplicate submissions and notify once after confirmed success', async () => {
  const driver = await settingsDriver({ kind: 'password' })
  driver.changePasswordField(0, 'SyntheticCurrent123')
  driver.changePasswordField(1, 'SyntheticNew123')
  driver.changePasswordField(2, 'SyntheticNew123')
  const submit = driver.form().props.onSubmit
  submit(submitEvent()); submit(submitEvent())
  assert.deepEqual(driver.api.calls, [{ action: 'password', current: 'SyntheticCurrent123', password: 'SyntheticNew123' }])
  assert.equal(driver.changedCount, 0)
  driver.render()
  assert.equal(driver.form().props['aria-busy'], true)
  assert.ok(driver.all(node => node.type === 'input').every(node => node.props.disabled))
  await driver.reject()
  assert.equal(driver.changedCount, 0)
  assert.equal(driver.form().props['aria-busy'], false)
  assert.equal(driver.all(node => node.type === 'input')[0].props.value, '')
  driver.changePasswordField(0, 'SyntheticCurrent123')
  driver.form().props.onSubmit(submitEvent())
  assert.equal(driver.api.calls.length, 2, 'The lock releases after failure')
  await driver.resolve()
  assert.equal(driver.changedCount, 1)
  assert.ok(driver.all(node => node.type === 'input').every(node => node.props.value === ''))
})

for (const locale of ['en', 'ka']) {
  test(`${locale} password changes accept Georgian letters under the existing account password policy`, async () => {
    const driver = await settingsDriver({ kind: 'password', locale })
    driver.changePasswordField(0, 'SyntheticCurrent123')
    driver.changePasswordField(1, 'ახალიპაროლი123')
    driver.changePasswordField(2, 'ახალიპაროლი123')
    driver.form().props.onSubmit(submitEvent())
    assert.deepEqual(driver.api.calls, [{ action: 'password', current: 'SyntheticCurrent123', password: 'ახალიპაროლი123' }])
    await driver.resolve()
    assert.equal(driver.changedCount, 1)
  })

  test(`${locale} password validation rejects unchanged, too-short Unicode and oversized passwords before sending`, async () => {
    for (const password of ['SyntheticCurrent123', '😀😀😀a1', `${'ა'.repeat(24)}1`]) {
      const driver = await settingsDriver({ kind: 'password', locale, isPreview: true })
      driver.changePasswordField(0, 'SyntheticCurrent123')
      driver.changePasswordField(1, password)
      driver.changePasswordField(2, password)
      driver.form().props.onSubmit(submitEvent())
      await driver.settle()
      assert.deepEqual(driver.api.calls, [])
      assert.equal(driver.changedCount, 0)
      assert.equal(driver.all(node => node.props.role === 'status').length, 0)
      const message = textContent(driver.all(node => node.props.role === 'alert')[0])
      assert.match(message, password === 'SyntheticCurrent123'
        ? locale === 'en' ? /differs from your current password/ : /მიმდინარე პაროლისგან უნდა განსხვავდებოდეს/
        : /72/)
    }
  })
}

test('Address removal focuses confirmation, restores the trigger on Cancel/Escape and Add after removal', async () => {
  const driver = await settingsDriver()
  const open = () => {
    const row = driver.all(node => node.props.className === 'account-settings__inline-actions')[0]
    driver.click(findAll(row, node => node.type === 'button')[1])
    const group = driver.all(node => node.props.className === 'account-settings__confirmation')[0]
    assert.equal(group.props.role, 'group')
    assert.match(group.props['aria-label'], /Confirm address removal: Synthetic home/)
    assert.equal(driver.focused.at(-1), group.props.children[1])
    return group
  }
  let group = open()
  driver.click(group.props.children[2])
  assert.equal(driver.all(node => node.props.className === 'account-settings__confirmation').length, 0)
  assert.equal(textContent(driver.focused.at(-1)), 'Remove')
  assert.equal(driver.api.calls.length, 0)
  group = open()
  let prevented = false
  group.props.onKeyDown({ key: 'Escape', preventDefault() { prevented = true } })
  driver.render()
  assert.equal(prevented, true)
  assert.equal(textContent(driver.focused.at(-1)), 'Remove')
  assert.equal(driver.api.calls.length, 0)
  group = open()
  driver.click(group.props.children[1])
  await driver.resolve()
  assert.equal(driver.focused.at(-1).props.className, 'account-settings__add')
  assert.equal(driver.all(node => node.props.className === 'account-address').length, 1)
  assert.match(textContent(driver.all(node => node.props.role === 'status')[0]), /Address removed/)
})

for (const locale of ['en', 'ka']) {
  test(`${locale} preview settings omit static demo banners without turning local interactions into API writes`, async t => {
    const network = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Preview settings must not transmit data') })
    const addresses = await settingsDriver({ isPreview: true, locale })
    assert.equal(addresses.all(node => node.props.className === 'account-settings__note').length, 0)
    assert.doesNotMatch(textContent(addresses.tree), /demo|preview|დემო|საცდელი/i)
    addresses.click(addresses.all(node => node.props.className === 'account-settings__add')[0])
    addresses.change('label', 'Synthetic local address')
    addresses.change('city', 'Synthetic city')
    addresses.change('address', 'Synthetic street')
    addresses.form().props.onSubmit(submitEvent())
    await addresses.settle()
    assert.equal(addresses.all(node => node.props.className === 'account-address').length, 1)
    assert.deepEqual(addresses.api.calls, [])
    assert.match(textContent(addresses.all(node => node.props.role === 'status')[0]), locale === 'en' ? /this page\. Nothing was saved to a real account/ : /ამ გვერდზე.*რეალურ ანგარიშში ცვლილება არ შენახულა/)
    const addressActions = addresses.all(node => node.props.className === 'account-settings__inline-actions')[0]
    addresses.click(findAll(addressActions, node => node.type === 'button')[1])
    const confirmation = addresses.all(node => node.props.className === 'account-settings__confirmation')[0]
    addresses.click(findAll(confirmation, node => node.type === 'button')[0])
    await addresses.settle()
    assert.equal(addresses.all(node => node.props.className === 'account-address').length, 0)
    assert.match(textContent(addresses.all(node => node.props.role === 'status')[0]), locale === 'en' ? /from this page\. No real account was changed/ : /ამ გვერდიდან.*რეალურ ანგარიშში ცვლილება არ შესრულებულა/)
    assert.deepEqual(addresses.api.calls, [])

    const password = await settingsDriver({ kind: 'password', isPreview: true, locale })
    assert.equal(password.all(node => node.props.className === 'account-settings__note').length, 0)
    assert.doesNotMatch(textContent(password.tree), /demo|preview|დემო|საცდელი/i)
    password.changePasswordField(0, 'SyntheticCurrent123')
    password.changePasswordField(1, 'SyntheticNew123')
    password.changePasswordField(2, 'SyntheticNew123')
    password.form().props.onSubmit(submitEvent())
    await password.settle()
    const statuses = password.all(node => node.props.role === 'status')
    assert.equal(statuses.length, 1)
    assert.match(textContent(statuses[0]), locale === 'en' ? /password was not changed.*not saved/ : /პაროლი არ შეცვლილა.*ცვლილება არ ინახება/)
    assert.doesNotMatch(textContent(statuses[0]), /demo|preview|დემო|საცდელი/i)
    assert.deepEqual(password.api.calls, [])
    assert.equal(password.changedCount, 0, 'Preview must not report a real password change to its parent')
    assert.ok(password.all(node => node.type === 'input').every(node => node.props.value === ''))
    assert.equal(network.mock.callCount(), 0)
  })

  test(`${locale} payment-provider choices display bank assets and keep visible accessible labels`, async () => {
    const driver = await settingsDriver({ kind: 'payments', locale })
    const choices = driver.all(node => node.type === 'label' && node.props.className?.startsWith('account-bank-option '))
    assert.equal(choices.length, 2)
    const expected = [
      { value: 'bog', src: '/assets/brand/bank-of-georgia.svg', label: locale === 'ka' ? 'საქართველოს ბანკი' : 'Bank of Georgia' },
      { value: 'tbc', src: '/assets/brand/tbc-bank.svg', label: locale === 'ka' ? 'თიბისი' : 'TBC Bank' },
    ]
    for (const [index, choice] of choices.entries()) {
      const radio = findAll(choice, node => node.type === 'input')[0]
      const images = findAll(choice, node => node.type === 'img')
      assert.equal(radio.props.value, expected[index].value)
      assert.equal(textContent(choice), expected[index].label, 'The visible label names the enclosed radio without repeated logo alt text')
      assert.equal(images.length, 1)
      assert.equal(images[0].props.src, expected[index].src)
      assert.equal(images[0].props.alt, '')
      assert.equal(Number(images[0].props.width), 40)
      assert.equal(Number(images[0].props.height), 40)
      const asset = await readFile(new URL(`public${expected[index].src}`, root), 'utf8')
      assert.match(asset, /<svg\b/)
      assert.match(asset, /<path\b/)
      assert.doesNotMatch(asset, /<script\b|<foreignObject\b/i)
    }
  })

  test(`${locale} payment history exposes exact payment states without treating unknown states as paid`, async () => {
    const states = ['paid', 'unpaid', 'partial', 'pending-review', '']
    const purchases = states.map((payment_status, index) => ({
      id: `synthetic-payment-${index}`, order_number: `SYNTH-${index}`, status: 'processing', payment_status,
      created_at: '2026-09-21T08:00:00Z', total: 100 + index, currency: 'GEL', items: [],
    }))
    const driver = await settingsDriver({ kind: 'payments', locale, purchases })
    const badges = driver.all(node => node.props.className === 'account-payment-row__status')
    assert.deepEqual(badges.map(node => node.props['data-payment-status']), states)
    assert.deepEqual(badges.map(textContent), locale === 'ka'
      ? ['გადახდილია', 'გადაუხდელია', 'ნაწილობრივ გადახდილია', 'pending-review', 'მითითებული არ არის']
      : ['Paid', 'Unpaid', 'Partially paid', 'pending-review', 'Not provided'])
    assert.deepEqual(driver.api.calls, [])
  })

  test(`${locale} payment rows disclose the exact purchased products and keep invoice actions outside the summary`, async () => {
    const purchases = [
      { id: 'synthetic-products', order_number: 'SYNTH-ITEMS', status: 'completed', payment_status: 'paid', created_at: '2026-09-21T08:00:00Z', total: 124, currency: 'GEL', items: [
        { name: 'Synthetic drive', quantity: 2, unit_price: 50, image_url: '/assets/products/kingston-nv3-figma.png' },
        { name: 'Synthetic cable', quantity: 1, unit_price: 24, image_url: null },
      ] },
      { id: 'synthetic-empty', order_number: 'SYNTH-EMPTY', status: 'processing', payment_status: 'unpaid', created_at: '2026-09-20T08:00:00Z', total: 0, currency: 'GEL', items: [] },
    ]
    const driver = await settingsDriver({ kind: 'payments', locale, purchases, isPreview: true })
    const rows = driver.all(node => node.props.className === 'account-payment-row')
    assert.equal(rows.length, purchases.length)
    rows.forEach((row, index) => {
      const disclosure = findAll(row, node => node.type === 'details')[0]
      assert.equal(disclosure.props.className, 'account-payment-disclosure')
      assert.equal(disclosure.props.open, undefined, 'Native disclosure starts collapsed')
      const summary = findAll(disclosure, node => node.type === 'summary')[0]
      assert.ok(summary.props['aria-label'].includes(purchases[index].order_number))
      assert.equal(findAll(summary, node => node.type === 'button' || node.type?.name === 'InvoiceButton' || node.type?.name === 'PurchaseProducts').length, 0, 'No nested controls or products in the closed summary')
      const products = findAll(disclosure, node => node.type?.name === 'PurchaseProducts')[0]
      assert.equal(products.props.purchase, purchases[index], 'The shared purchase renderer receives exactly this recorded order, including all images and quantities')
      assert.equal(products.props.locale, locale)
      const invoice = findAll(row, node => node.type?.name === 'InvoiceButton')[0]
      assert.equal(findAll(disclosure, node => node.type?.name === 'InvoiceButton').length, 0)
      assert.deepEqual(invoice.props.target, { kind: 'purchase', id: purchases[index].id, reference: purchases[index].order_number })
      assert.equal(invoice.props.isPreview, true)
    })
    assert.deepEqual(driver.api.calls, [], 'Expanding recorded history has no payment or account mutation')
  })

  test(`${locale} bank choice and card remembering remain an honest non-transmitting visual flow`, async t => {
    const network = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Card preview must not transmit data') })
    for (const isPreview of [false, true]) {
      const driver = await settingsDriver({ kind: 'payments', locale, isPreview })
      const radios = () => driver.all(node => node.type === 'input' && node.props.type === 'radio')
      const remember = () => driver.all(node => node.type === 'input' && node.props.type === 'checkbox')[0]
      const details = () => driver.all(node => node.type === 'details')[0]
      assert.equal(driver.all(node => node.props.className === 'account-payment').length, 0)
      assert.deepEqual(radios().map(node => [node.props.name, node.props.value, node.props.checked]), [
        ['payment-provider', 'bog', true], ['payment-provider', 'tbc', false],
      ])
      assert.equal(remember().props.checked, false, 'Remembering a payment card must always require opt-in')
      assert.equal(driver.all(node => node.type === 'input').length, 3)
      assert.ok(driver.all(node => node.type === 'input').every(node => ['radio', 'checkbox'].includes(node.props.type)), 'No card number, expiry or security code may be collected locally')
      assert.equal(driver.all(node => node.props.role === 'status').length, 0)
      assert.match(textContent(driver.tree), locale === 'en' ? /bank integration is not connected yet\. No card details are collected here/ : /ბანკთან კავშირი ჯერ არ არის ჩართული\. ბარათის მონაცემებს აქ არ ვაგროვებთ/)

      radios()[1].props.onChange()
      driver.render()
      assert.deepEqual(radios().map(node => node.props.checked), [false, true])
      remember().props.onChange({ target: { checked: true } })
      driver.render()
      assert.equal(remember().props.checked, true)
      let prevented = false
      driver.form().props.onSubmit({ preventDefault() { prevented = true } })
      driver.render()
      assert.equal(prevented, true)
      const notice = driver.all(node => node.props.role === 'status')
      assert.equal(notice.length, 1)
      assert.match(textContent(notice[0]), locale === 'en' ? /No card was added and no payment was made/ : /ბარათი არ დამატებულა და თანხა არ ჩამოჭრილა/)
      assert.deepEqual(driver.api.calls, [], 'Continue must not call a customer or payment API')
      assert.equal(network.mock.callCount(), 0)

      radios()[0].props.onChange()
      driver.render()
      assert.deepEqual(radios().map(node => node.props.checked), [true, false])
      assert.equal(driver.all(node => node.props.role === 'status').length, 0, 'Changing providers dismisses the stale notice')
      driver.form().props.onSubmit(submitEvent())
      driver.render()
      details().props.onToggle({ currentTarget: { open: false } })
      driver.render()
      assert.equal(remember().props.checked, false, 'Closing card setup clears the optional remembering choice')
      assert.equal(driver.all(node => node.props.role === 'status').length, 0)
      details().props.onToggle({ currentTarget: { open: true } })
      driver.render()
      assert.equal(remember().props.checked, false)
      assert.deepEqual(driver.api.calls, [])
      assert.equal(network.mock.callCount(), 0)
    }
  })
}

test('Cabinet settings keep centered fluid forms, full-width comments, and one visible field-focus treatment', async () => {
  const [settingsCss, profileCss, dashboardCss, commentsCss, dashboardSource] = await Promise.all([
    'src/styles/account-settings.css', 'src/styles/account-profile.css', 'src/styles/account-dashboard.css',
    'src/styles/customer-comments.css', 'src/account/CustomerDashboard.tsx',
  ].map(path => readFile(new URL(path, root), 'utf8')))
  const rule = (css, selector) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))
    assert.ok(match, `Missing scoped visual rule: ${selector}`)
    return match[1]
  }
  for (const [css, selector] of [[settingsCss, '.account-settings__form'], [profileCss, '.account-profile-editor']]) {
    const declarations = rule(css, selector)
    assert.match(declarations, /width:\s*100%/)
    assert.match(declarations, /max-width:\s*460px/)
    assert.match(declarations, /margin-inline:\s*auto/)
  }
  assert.match(dashboardSource, /className="account-panel"[^>]*data-section=\{section\}/)
  const heading = rule(dashboardCss, '.account-panel:is([data-section="profile"], [data-section="addresses"], [data-section="password"]) > .account-panel__heading')
  assert.match(heading, /max-width:\s*460px/)
  assert.match(heading, /margin-inline:\s*auto/)
  const addressWrapper = rule(dashboardCss, '.account-panel[data-section="addresses"] > div:not([hidden])')
  assert.match(addressWrapper, /margin-inline:\s*auto/)
  assert.doesNotMatch(addressWrapper, /display\s*:/, 'The styling must not override the mounted address wrapper hidden state')
  const comments = rule(commentsCss, '.customer-comments')
  assert.match(comments, /width:\s*100%/)
  assert.match(comments, /min-width:\s*0/)
  assert.doesNotMatch(comments, /max-width\s*:/)
  const activeField = rule(settingsCss, '.account-settings__field:focus-within')
  assert.match(activeField, /background:\s*#edf3f7/)
  assert.doesNotMatch(activeField, /border|outline|box-shadow/, 'Active fields keep the resting border and use background-only feedback')
  assert.match(rule(settingsCss, '.account-dashboard .account-settings__field input:is(:focus, :focus-visible)'), /outline:\s*none/)
  assert.match(rule(profileCss, '.account-dashboard .account-profile-editor__field > input:is(:focus, :focus-visible)'), /outline:\s*none;[^}]*background:\s*#edf3f7;[^}]*box-shadow:\s*none/)
  assert.match(rule(dashboardCss, '.account-dashboard :is(button,a,input,select,summary):focus-visible'), /outline:\s*3px solid/)
  assert.doesNotMatch(profileCss, /\.account-profile-editor__preview\b/)
})

test('Payment status colors are scoped to exact paid, unpaid and partial values; other states remain neutral', async () => {
  const css = await readFile(new URL('src/styles/account-settings.css', root), 'utf8')
  assert.match(css, /\.account-payment-row__status\s*\{[^}]*color:\s*#506a7c;[^}]*background:\s*#eaf0f4/)
  const styles = [...css.matchAll(/\.account-payment-row__status\[data-payment-status="([^"]+)"\]\s*\{\s*color:\s*(#[a-f\d]+);\s*background:\s*(#[a-f\d]+);\s*\}/gi)]
  assert.deepEqual(styles.map(([, state, color, background]) => ({ state, color, background })), [
    { state: 'paid', color: '#23744b', background: '#e6f3eb' },
    { state: 'unpaid', color: '#b23b48', background: '#fbeaec' },
    { state: 'partial', color: '#8a611e', background: '#fbf1dd' },
  ])
  assert.doesNotMatch(css, /data-payment-status\s*[*^$|~]=/, 'Substring selectors must not match unpaid as paid')
})
