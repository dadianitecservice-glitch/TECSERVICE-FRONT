import test from 'node:test'
import assert from 'node:assert/strict'
import { getPurchaseCollection, filterCustomerPurchases } from '../src/account/purchaseCollections.ts'

const terminal = ['completed', 'delivered', 'cancelled', 'returned', 'partial_return']
const ongoing = ['new', 'processing', 'shipped', 'ready', 'paid', 'unpaid', 'partial', 'refund_pending', '', 'unknown', 'COMPLETED', 'completed ', '__proto__', 'constructor', 'toString']
const record = (status, payment_status, index) => ({ id: `synthetic-${index}`, order_number: `SYNTHETIC-${index}`, status, payment_status, total: index + 1, currency: 'GEL', created_at: '2026-09-24T08:00:00Z', items: [] })

test('Purchase completion comes from documented order states, never inferred payment or unknown states', () => {
  for (const status of terminal) assert.equal(getPurchaseCollection(status), 'completed', status)
  for (const status of ongoing) assert.equal(getPurchaseCollection(status), 'active', status)
})

test('Current and completed purchase tabs partition every record regardless of payment status', () => {
  const records = [...terminal, ...ongoing].flatMap((status, index) => ['paid', 'unpaid', 'partial', 'refunded'].map((payment, offset) => record(status, payment, index * 4 + offset)))
  const before = JSON.stringify(records)
  const active = filterCustomerPurchases(records, 'active')
  const completed = filterCustomerPurchases(records, 'completed')
  assert.equal(active.length + completed.length, records.length)
  assert.equal(new Set([...active, ...completed]).size, records.length)
  assert.ok(active.every(item => ongoing.includes(item.status)))
  assert.ok(completed.every(item => terminal.includes(item.status)))
  assert.equal(active.length, ongoing.length * 4)
  assert.equal(completed.length, terminal.length * 4)
  assert.equal(JSON.stringify(records), before, 'Filtering does not mutate API records')
  assert.ok([...active, ...completed].every(item => records.includes(item)), 'Filtering does not fabricate replacement records')
  assert.deepEqual(filterCustomerPurchases([], 'active'), [])
  assert.deepEqual(filterCustomerPurchases([], 'completed'), [])
})
