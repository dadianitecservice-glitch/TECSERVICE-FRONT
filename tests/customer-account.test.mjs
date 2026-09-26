import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { accountPath, getRouteMetadata, isAccountPath, isKnownPublicPath } from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const accountApiSource = await read('src/account/customerApi.ts')
// Import the browser adapter with a fixed test origin, without loading Vite or environment files.
const accountApiCode = stripTypeScriptTypes(accountApiSource.replaceAll('import.meta.env', '({})'), { mode: 'transform' })
const { customerApi, CustomerApiError, customerErrorMessage } = await import(`data:text/javascript;base64,${Buffer.from(accountApiCode).toString('base64')}`)
const approvedCustomer = { id: 'test-customer', full_name: 'Test customer', role: 'customer', approval_status: 'approved', is_active: true }
const validTicket = {
  ticket_code: 2001, device: 'laptop', issue_description: 'Synthetic test issue', cost_estimate: 90.5,
  status: 'ready', resolution: 'Synthetic test resolution', created_at: '2026-09-20T08:00:00Z', updated_at: '2026-09-21T10:30:00Z', last_login_at: null,
  items: [{ position: 1, device: 'laptop', serial_number: '', issue_description: 'Synthetic test item', cost_estimate: 90.5, status: 'ready', resolution: 'Synthetic test resolution', updated_at: '2026-09-21T10:30:00Z' }],
}
const validPurchase = {
  id: 'test-purchase', order_number: 'TEST-2001', status: 'completed', payment_status: 'paid', created_at: '2026-09-21T08:00:00Z',
  total: 149.5, currency: 'GEL', items: [{ name: 'Synthetic product', quantity: 2, unit_price: 74.75 }],
}
const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const demoRecordMarkers = /demo-customer-preview|(?:demo|customer)@example\.invalid|DEMO-100[12]|demo-purchase-(?:one|two)/

test('Account routing accepts only the exact Georgian and English account paths', () => {
  assert.equal(accountPath, '/account')
  for (const prefix of ['', '/en']) {
    for (const suffix of ['', '/']) {
      const path = `${prefix}/account${suffix}`
      assert.equal(isAccountPath(path), true, path)
      assert.equal(isKnownPublicPath(path), true, path)
      assert.deepEqual(getRouteMetadata(path), getRouteMetadata(`${prefix}/account/`))
      assert.equal(getRouteMetadata(path).canonical, `https://tecservice.ge${prefix}/account/`)
      assert.match(getRouteMetadata(path).robots, /\bnoindex\b/)
    }
  }
  for (const path of ['/', '/accounts', '/account/settings', '/account//', '/en/accounts', '/en/account/profile', '/en/en/account/', '/english/account/', '/Account', '/accounting']) {
    assert.equal(isAccountPath(path), false, path)
  }
})

for (const prefix of ['', '/en']) {
  test(`Account ${prefix}/account/ prerenders a private sign-in shell without customer records`, async () => {
    const html = await read(`dist${prefix}/account/index.html`)
    const metadata = getRouteMetadata(`${prefix}/account/`)
    assert.ok(html.includes(`<title>${metadata.title}</title>`))
    assert.match(html, /<meta name="robots" content="noindex, nofollow"\s*\/>/)
    assert.ok(html.includes(`<link rel="canonical" href="${metadata.canonical}"`))
    assert.match(html, new RegExp(`<html lang="${prefix ? 'en' : 'ka'}">`))
    assert.equal((html.match(/<main\b/g) ?? []).length, 1)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.match(html, /account-page--entry/)
    assert.doesNotMatch(html, /id="not-found-title"|<div id="root"><\/div>/)
    assert.doesNotMatch(html, /account-page__preview|preview=1|Preview the account design/)
    assert.doesNotMatch(html, demoRecordMarkers)
    assert.doesNotMatch(html, /"(?:password|access_token|session_token|ticket_code|approval_status)"\s*:/)
    if (prefix) assert.doesNotMatch(html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '', /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
  })

  test(`Account links stay navigable in the ${prefix || 'Georgian'} header and footer`, async () => {
    for (const page of ['/', '/account/']) {
      const html = await read(`dist${prefix}${page}index.html`)
      for (const element of ['header', 'footer']) {
        const content = html.match(new RegExp(`<${element}\\b[\\s\\S]*?<\\/${element}>`))?.[0]
        assert.ok(content, `Missing ${element} on ${prefix}${page}`)
        const links = [...content.matchAll(/<a\b[^>]*>/g)].map(([tag]) => tag)
        const link = links.find(tag => tag.includes(`href="${prefix}/account/"`))
        assert.ok(link, `Missing account link in ${element} on ${prefix}${page}`)
        assert.doesNotMatch(link, /aria-disabled="true"|tabindex="-1"|\sdisabled(?:[\s=>])/)
      }
    }
  })
}

test('Account routes are excluded from public and generated sitemaps', async () => {
  for (const path of ['public/sitemap.xml', 'dist/sitemap.xml']) {
    assert.doesNotMatch(await read(path), /<loc>[^<]*\/(?:account|cabinet)(?:[/?#<])/)
  }
})

test('Nginx serves both account shells with no-store and noindex response headers', async () => {
  const config = await read('docs/nginx-seo-routes.conf')
  for (const path of ['/account', '/en/account']) {
    assert.ok(config.includes(`location = ${path} { return 308 ${path}/$is_args$args; }`))
    const location = config.match(new RegExp(`location\\s+=\\s+${path}/\\s*\\{([\\s\\S]*?)\\}`))?.[1]
    assert.ok(location, `Missing exact ${path}/ location`)
    assert.ok(location.includes(`try_files ${path}/index.html =404;`))
    assert.match(location, /Cache-Control\s+"private, no-store"\s+always;/)
    assert.match(location, /X-Robots-Tag\s+"noindex, nofollow"\s+always;/)
  }
})

test('Production JavaScript omits the development account fixture module and records', async () => {
  const assets = await readdir(new URL('dist/assets/', root))
  const scripts = assets.filter(name => name.endsWith('.js'))
  assert.ok(scripts.length > 0)
  assert.ok(!scripts.some(name => /demoAccount/i.test(name)), 'The development fixture must not become a production chunk')
  for (const name of scripts) {
    const code = await read(`dist/assets/${name}`)
    assert.doesNotMatch(code, demoRecordMarkers, name)
    assert.doesNotMatch(code, /getDemoAccount/, name)
  }
})

test('Customer requests use cookies and uncached requests, with no phone or ID selector', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    return jsonResponse(url.endsWith('/auth/me') ? approvedCustomer : [])
  })
  assert.deepEqual(await customerApi.me(), approvedCustomer)
  assert.deepEqual(await customerApi.tickets(), [])
  assert.deepEqual(await customerApi.purchases(), [])
  assert.deepEqual(calls.map(call => call.url), ['/api/auth/me', '/api/portal/tickets', '/api/portal/purchases'])
  for (const { options } of calls) {
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    assert.equal(options.body, undefined)
    assert.ok(options.signal instanceof AbortSignal)
    assert.equal(new Headers(options.headers).get('authorization'), null)
  }
})

test('Login and registration send credentials only in JSON request bodies', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    return jsonResponse(approvedCustomer)
  })
  await customerApi.login('customer@example.invalid', 'SyntheticPassword9')
  await customerApi.register({ full_name: 'Test customer', phone: '+995599000000', password: 'SyntheticPassword9' })
  assert.deepEqual(calls.map(call => call.url), ['/api/auth/login', '/api/auth/register'])
  for (const { url, options } of calls) {
    assert.equal(options.method, 'POST')
    assert.equal(options.credentials, 'include')
    assert.equal(options.cache, 'no-store')
    assert.equal(new Headers(options.headers).get('content-type'), 'application/json')
    assert.doesNotMatch(url, /SyntheticPassword9|customer@|599000000|\?/)
  }
  assert.deepEqual(JSON.parse(calls[0].options.body), { identifier: 'customer@example.invalid', password: 'SyntheticPassword9' })
  assert.equal(JSON.parse(calls[1].options.body).account_type, 'physical')
})

test('Logout accepts an empty 204 response and invalidates the server session via POST', async t => {
  let request
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options }
    return new Response(null, { status: 204 })
  })
  assert.equal(await customerApi.logout(), undefined)
  assert.equal(request.url, '/api/auth/logout')
  assert.equal(request.options.method, 'POST')
  assert.equal(request.options.credentials, 'include')
})

test('Complete backend customer, ticket and purchase records survive validation unchanged', async t => {
  const user = {
    ...approvedCustomer, email: 'test@example.invalid', phone: '+995599000000', company_name: '', tax_id: null,
    is_primary_admin: false, registration_method: 'password', picture_url: null,
    created_at: '2026-09-01T08:00:00Z', updated_at: '2026-09-21T08:00:00Z', last_login_at: null,
  }
  const tickets = [validTicket, {
    ...validTicket, ticket_code: null, device: null, cost_estimate: null, resolution: null,
    items: [{ ...validTicket.items[0], device: null, cost_estimate: null, resolution: null }],
  }, { ...validTicket, ticket_code: 2002, items: [] }]
  const purchases = [validPurchase, { ...validPurchase, id: 'test-empty-purchase', total: 0, items: [] }]
  const responses = { '/api/auth/me': user, '/api/portal/tickets': tickets, '/api/portal/purchases': purchases }
  t.mock.method(globalThis, 'fetch', async url => jsonResponse(responses[url]))
  assert.deepEqual(await customerApi.me(), user)
  assert.deepEqual(await customerApi.tickets(), tickets)
  assert.deepEqual(await customerApi.purchases(), purchases)
})

test('Null nested items and invalid rendered values are rejected before reaching the dashboard', async t => {
  const cases = [
    ['null ticket item', () => customerApi.tickets(), [{ ...validTicket, items: [null] }]],
    ['null purchase item', () => customerApi.purchases(), [{ ...validPurchase, items: [null] }]],
    ['object ticket description', () => customerApi.tickets(), [{ ...validTicket, items: [{ ...validTicket.items[0], issue_description: {} }] }]],
    ['object product name', () => customerApi.purchases(), [{ ...validPurchase, items: [{ ...validPurchase.items[0], name: {} }] }]],
    ['string item position', () => customerApi.tickets(), [{ ...validTicket, items: [{ ...validTicket.items[0], position: '1' }] }]],
    ['string product quantity', () => customerApi.purchases(), [{ ...validPurchase, items: [{ ...validPurchase.items[0], quantity: '2' }] }]],
    ['string estimate', () => customerApi.tickets(), [{ ...validTicket, cost_estimate: '90.5' }]],
    ['null order total', () => customerApi.purchases(), [{ ...validPurchase, total: null }]],
    ['object profile email', () => customerApi.me(), { ...approvedCustomer, email: {} }],
    ['array profile phone', () => customerApi.me(), { ...approvedCustomer, phone: [] }],
  ]
  for (const [label, action, payload] of cases) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => jsonResponse(payload))
    await assert.rejects(action, error => error instanceof CustomerApiError && error.status === 502, label)
    fetch.mock.restore()
  }
})

test('Malformed account payloads and HTML fallbacks fail closed', async t => {
  const cases = [
    [() => customerApi.me(), () => jsonResponse({ id: 'test-customer' })],
    [() => customerApi.tickets(), () => jsonResponse({ tickets: [] })],
    [() => customerApi.tickets(), () => jsonResponse([{ status: 'new', items: null }])],
    [() => customerApi.purchases(), () => jsonResponse([{ id: 'order', items: [], total: '149' }])],
    [() => customerApi.me(), () => new Response('<html>Home page</html>', { headers: { 'content-type': 'text/html' } })],
  ]
  for (const [action, response] of cases) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => response())
    await assert.rejects(action, error => error instanceof CustomerApiError && error.status === 502)
    fetch.mock.restore()
  }
})

test('Rejected and unavailable requests never become successful empty account data', async t => {
  for (const status of [401, 403, 409, 422, 429, 500]) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => jsonResponse({ detail: 'Private backend detail' }, status))
    await assert.rejects(() => customerApi.tickets(), error => error instanceof CustomerApiError && error.status === status)
    fetch.mock.restore()
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network unavailable') })
  await assert.rejects(() => customerApi.purchases(), TypeError)
})

test('Leaving an account request aborts its fetch instead of accepting a late response', async t => {
  const controller = new AbortController()
  let requestSignal
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    requestSignal = options.signal
    return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }))
  })
  const pending = customerApi.tickets(controller.signal)
  controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
  assert.equal(requestSignal.aborted, true)
})

test('Account errors are localized without displaying arbitrary backend details', () => {
  for (const status of [401, 403, 409, 422, 429, 500]) {
    const error = new CustomerApiError(status, 'Private backend detail')
    const english = customerErrorMessage(error, true)
    const georgian = customerErrorMessage(error, false)
    assert.ok(english.length > 20)
    assert.ok(georgian.length > 20)
    assert.notEqual(english, georgian)
    assert.doesNotMatch(english + georgian, /Private backend detail/)
  }
  assert.match(customerErrorMessage(new CustomerApiError(403, 'pending approval'), true), /verification|approval|awaiting/i)
})

test('Account authentication has a labelled modal, safe password fields and announced errors', async () => {
  const source = await read('src/account/AuthDialog.tsx')
  assert.match(source, /<dialog\b[^>]*aria-labelledby="account-auth-title"/)
  assert.match(source, /aria-describedby=\{mode === 'help' \? 'account-auth-intro' : registered \? 'account-auth-success-description' : undefined\}/)
  assert.match(source, /\.showModal\(/)
  assert.match(source, /onCancel=/)
  assert.match(source, /\.focus\(/)
  assert.match(source, /current-password/)
  assert.match(source, /new-password/)
  assert.match(source, /htmlFor="account-confirm"/)
  assert.match(source, /password\s*!==\s*fields\.get\('confirm'\)/)
  assert.match(source, /password\.length\s*<\s*8/)
  assert.match(source, /new TextEncoder\(\)\.encode\(password\)\.length\s*>\s*72/)
  assert.match(source, /role="alert"/)
  assert.match(source, /aria-busy=\{busy\}/)
  assert.match(source, /<fieldset disabled=\{busy\}/)
  assert.match(source, /href\('\/terms\/'\)/)
  assert.match(source, /href\('\/privacy\/'\)/)
})

test('Account code does not persist passwords or bearer tokens, or reuse public phone lookup as authorization', async () => {
  const files = (await readdir(new URL('src/account/', root))).filter(name => /\.tsx?$/.test(name))
  for (const path of [...files.map(name => `src/account/${name}`), 'src/pages/AccountPage.tsx']) {
    const source = await read(path)
    assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage)\b|document\.cookie|Bearer\s|findTicketsByPhone|DEMO_OTP/, path)
  }
  const lookup = await read('src/sections/TicketLookup.tsx')
  assert.doesNotMatch(lookup, /customerApi\.(?:tickets|purchases)|\/api\/portal\//)
  const page = await read('src/pages/AccountPage.tsx')
  assert.match(page, /auth\.user\.role\s*!==\s*'customer'/)
  assert.match(page, /auth\.user\.approval_status\s*!==\s*'approved'/)
  assert.match(page, /!auth\.user\.is_active/)
  assert.match(page, /controller\.abort\(/)
  assert.match(page, /auth\.clearUser\(/)
})
