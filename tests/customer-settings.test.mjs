import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const apiSource = await read('src/account/customerApi.ts')
const executable = stripTypeScriptTypes(apiSource.replaceAll('import.meta.env', '({})'), { mode: 'transform' })
const { customerApi, CustomerApiError } = await import(`data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`)
const address = { id: 'synthetic-address', label: 'Test home', city: 'Test city', address: 'Synthetic street 1' }
const user = { id: 'synthetic', full_name: 'Test Customer', role: 'customer', approval_status: 'approved', is_active: true }
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })

test('Addresses load from the signed-in portal without identity selectors', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/portal/addresses')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    return json([address])
  })
  assert.deepEqual(await customerApi.addresses(), [address])
})

test('Address create and update send only editable fields', async t => {
  const paths = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    paths.push(url)
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.deepEqual(JSON.parse(options.body), { label: address.label, city: address.city, address: address.address })
    return json(address)
  })
  await customerApi.saveAddress({ ...address, user_id: 'not-owner' })
  await customerApi.saveAddress(address, address.id)
  assert.deepEqual(paths, ['/api/portal/addresses', '/api/portal/addresses/synthetic-address'])
})

test('Address deletion uses a scoped encoded ID and accepts 204', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/portal/addresses/test%2Fid')
    assert.equal(options.method, 'DELETE')
    assert.equal(options.credentials, 'include')
    assert.equal(options.body, undefined)
    return new Response(null, { status: 204 })
  })
  assert.equal(await customerApi.deleteAddress('test/id'), undefined)
})

test('Password change sends current and new secrets only and handles empty success', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/portal/password')
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.deepEqual(JSON.parse(options.body), { current_password: 'SyntheticOld123', new_password: 'SyntheticNew123' })
    return new Response(null, { status: 204 })
  })
  assert.equal(await customerApi.changePassword('SyntheticOld123', 'SyntheticNew123'), undefined)
})

for (const status of [401, 403, 422, 429, 500]) {
  test(`Settings propagate ${status} instead of reporting a fake save`, async t => {
    t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ detail: 'Synthetic rejection' }), { status, headers: { 'Content-Type': 'application/json' } }))
    await assert.rejects(customerApi.changePassword('SyntheticOld123', 'SyntheticNew123'), cause => cause instanceof CustomerApiError && cause.status === status)
    await assert.rejects(customerApi.saveAddress(address), cause => cause instanceof CustomerApiError && cause.status === status)
  })
}

test('New optional profile fields preserve false and null, but cannot change primary phone', async t => {
  t.mock.method(globalThis, 'fetch', async (_, options) => {
    assert.deepEqual(JSON.parse(options.body), { full_name: user.full_name, is_georgian_citizen: false, personal_id: null, current_password: 'SyntheticOld123' })
    return json({ ...user, is_georgian_citizen: false, personal_id: null })
  })
  const updated = await customerApi.updateProfile({ full_name: user.full_name, is_georgian_citizen: false, personal_id: null, phone: '+995555000000', current_password: 'SyntheticOld123' })
  assert.equal(updated.is_georgian_citizen, false)
  assert.equal(updated.personal_id, null)
})

test('Malformed addresses and private profile fields fail closed', async t => {
  for (const data of [{ addresses: [] }, [{ ...address, id: 4 }], [{ ...address, city: null }]]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => json(data))
    await assert.rejects(customerApi.addresses(), cause => cause.status === 502)
    mock.mock.restore()
  }
  for (const data of [{ ...user, personal_id: 123 }, { ...user, is_georgian_citizen: 'true' }]) {
    const mock = t.mock.method(globalThis, 'fetch', async () => json(data))
    await assert.rejects(customerApi.me(), cause => cause.status === 502)
    mock.mock.restore()
  }
})

test('Password success clears the current user and prompts fresh authentication', async () => {
  const source = await read('src/pages/AccountPage.tsx')
  assert.match(source, /onPasswordChanged=\{\(\) => \{[^}]*setData\(null\); auth\.clearUser\(\); setPasswordChanged\(true\)/)
  assert.match(source, /if \(passwordGeneration !== profileGeneration\.current \|\| currentUser\.current\?\.id !== current\.user\.id\) return/)
  assert.match(source, /Your password was changed\. Sign in again with your new password/)
  const settings = await read('src/account/CustomerSettings.tsx')
  assert.match(settings, /await customerApi\.changePassword\(current, password\); onChanged\(\)/)
  assert.match(settings, /isPreview && import\.meta\.env\.DEV/)
  assert.doesNotMatch(settings, /localStorage|sessionStorage|payment-card|card_number|cvv/i)
})

test('Payment provider preview never stores card secrets, navigates to a bank or pretends to link a card', async () => {
  const settings = await read('src/account/CustomerSettings.tsx')
  const payments = settings.slice(settings.indexOf('export function CustomerPayments'))
  assert.match(payments, /useState<'bog' \| 'tbc'>\('bog'\)/)
  assert.match(payments, /\[remember, setRemember\] = useState\(false\)/)
  assert.match(payments, /onSubmit=\{event => \{ event\.preventDefault\(\); setShowNotice\(true\) \}\}/)
  assert.doesNotMatch(payments, /\bcustomerApi\.|\bfetch\s*\(|\bXMLHttpRequest\b|localStorage|sessionStorage|indexedDB|document\.cookie|window\.location|window\.open|<iframe|<script|card_number|cvv|cvc|cc-number|cc-exp|cc-csc/i)
  assert.match(payments, /No card details are collected here/)
  assert.match(payments, /No card was added and no payment was made/)
})
