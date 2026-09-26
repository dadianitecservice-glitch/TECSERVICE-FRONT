import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'

const url = value => `data:text/javascript;base64,${Buffer.from(value).toString('base64')}`
const source = await readFile(new URL('../src/account/customerInvoiceApi.ts', import.meta.url), 'utf8')
const dependency = url('export class CustomerApiError extends Error { constructor(status) { super("Request failed"); this.status=status } }')
const { code } = await transformWithOxc(source.replaceAll('import.meta.env', '{}'), 'customerInvoiceApi.ts')
const { customerInvoiceApi, validateServiceInvoice } = await import(url(code.replaceAll('"./customerApi"', JSON.stringify(dependency))))
const invoice = {
  id: 'issued-one', number: 'INV-1', issued_at: '2026-09-25T10:00:00Z', document_date: '2026-09-25', currency: 'GEL',
  seller: { name: 'Fixture seller', tax_id: '', phone: '', address: '', representative: '' },
  buyer: { name: 'Fixture buyer', phone: '', tax_id: '', company_name: '' },
  lines: [{ description: 'Repair', device: 'Fixture', quantity: 1, unit_price: 90, amount: 90 }],
  total: 90, payment_status: 'unconfirmed', paid_at: null,
}
const target = { kind: 'purchase', id: 'order-one', reference: 'Order one' }

test('Issued service projections validate known fields without inventing payment confirmation', () => {
  assert.equal(validateServiceInvoice(invoice).payment_status, 'unconfirmed')
  for (const patch of [{ total: Infinity }, { total: -1 }, { total: true }, { currency: 'USD' }, { seller: null }, { lines: null }, { lines: [] }, { payment_status: 'unknown' }, { paid_at: 12 }]) {
    assert.throws(() => validateServiceInvoice({ ...invoice, ...patch }), error => error.status === 502)
  }
  for (const patch of [{ quantity: -1 }, { quantity: 0 }, { quantity: 1.5 }, { unit_price: '90' }, { amount: NaN }, { device: null }]) {
    assert.throws(() => validateServiceInvoice({ ...invoice, lines: [{ ...invoice.lines[0], ...patch }] }), error => error.status === 502)
  }
})

test('Customer invoice reads use fixed own-record routes, cookie credentials, no-store and an abort signal', async () => {
  const original = globalThis.fetch
  const signal = new AbortController().signal
  const calls = []
  globalThis.fetch = async (path, options) => { calls.push({ path, options }); return new Response(JSON.stringify([{ id: invoice.id, number: invoice.number, issued_at: invoice.issued_at }]), { headers: { 'content-type': 'application/json' } }) }
  try {
    assert.equal((await customerInvoiceApi.list(target, signal))[0].id, invoice.id)
    assert.equal(calls[0].path, '/api/portal/purchases/order-one/invoices')
    assert.equal(calls[0].options.credentials, 'include')
    assert.equal(calls[0].options.cache, 'no-store')
    assert.equal(calls[0].options.signal, signal)
    for (const id of ['../other', 'order/other', '%2e%2e', 'https://example.com', '', 'x'.repeat(161)]) {
      await assert.rejects(customerInvoiceApi.list({ ...target, id }, signal), error => error.status === 422)
    }
    assert.equal(calls.length, 1, 'Unsafe identifiers never issue a request')
  } finally { globalThis.fetch = original }
})

test('Invoice lists and service responses reject malformed payloads and HTML success responses', async () => {
  const original = globalThis.fetch
  const signal = new AbortController().signal
  try {
    for (const payload of [{}, [null], [{ id: '../other', number: 'One', issued_at: '' }], Array(201).fill(invoice)]) {
      globalThis.fetch = async () => new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json' } })
      await assert.rejects(customerInvoiceApi.list(target, signal), error => error.status === 502)
    }
    globalThis.fetch = async () => new Response('<html>Sign in</html>', { headers: { 'content-type': 'text/html' } })
    await assert.rejects(customerInvoiceApi.list(target, signal), error => error.status === 502)
    globalThis.fetch = async () => new Response('{}', { status: 403, headers: { 'content-type': 'application/json' } })
    await assert.rejects(customerInvoiceApi.service({ ...target, kind: 'service', id: 990001 }, invoice.id, signal), error => error.status === 403)
  } finally { globalThis.fetch = original }
})

test('Invoice downloads require PDF content type and magic bytes, never an HTML or JSON fallback', async () => {
  const original = globalThis.fetch
  const signal = new AbortController().signal
  try {
    globalThis.fetch = async (path, options) => {
      assert.equal(path, '/api/portal/purchases/order-one/invoices/issued-one.pdf')
      assert.equal(options.credentials, 'include')
      assert.equal(options.cache, 'no-store')
      return new Response('%PDF-fixture', { headers: { 'content-type': 'application/pdf' } })
    }
    assert.equal(await (await customerInvoiceApi.pdf(target, invoice.id, signal)).text(), '%PDF-fixture')
    for (const [body, type] of [['<html>private login</html>', 'application/pdf'], ['%PDF-wrong-type', 'text/html'], ['{}', 'application/json']]) {
      globalThis.fetch = async () => new Response(body, { headers: { 'content-type': type } })
      await assert.rejects(customerInvoiceApi.pdf(target, invoice.id, signal), error => error.status === 502)
    }
  } finally { globalThis.fetch = original }
})

test('Invoice preview fixtures are explicitly development-gated and real empty/error states stay honest', async () => {
  const component = await readFile(new URL('../src/account/InvoiceButton.tsx', import.meta.url), 'utf8')
  assert.match(component, /isPreview && import\.meta\.env\.DEV/)
  assert.match(component, /import\('\.\/demoInvoice'\)/)
  assert.match(component, /No invoice has been issued yet/)
  assert.match(component, /not a payment document/)
  assert.match(component, /createPortal/)
  assert.match(component, /opener\.focus/)
  assert.doesNotMatch(component, /localStorage|sessionStorage|dangerouslySetInnerHTML/)
  assert.match(component, /!isPreview && <button[^>]+account-invoice-print/)
})
