import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_PHONE,
  DEMO_TICKET_CODE,
  demoTicket,
  findTicketByCode,
  findTicketsByPhone,
  normalizeTicketCode,
} from '../src/data/tickets.ts'

test('frontend demo ticket 1001 can be found with or without the visual hash prefix', () => {
  assert.equal(DEMO_TICKET_CODE, '1001')
  assert.equal(normalizeTicketCode('  # 1001 '), '1001')
  assert.equal(findTicketByCode('1001'), demoTicket)
  assert.equal(findTicketByCode('#1001'), demoTicket)
})

test('frontend demo order is associated with the exported demo phone', () => {
  assert.equal(demoTicket.phone, DEMO_PHONE)
  assert.deepEqual(findTicketsByPhone(DEMO_PHONE), [demoTicket])
})

test('phone lookup finds the same order for supported Georgian formats', () => {
  for (const phone of [
    '591474040',
    '995591474040',
    '+995591474040',
    '  +995 591 47 40 40  ',
    '(591) 47-40-40',
    '+995\u00a0591\u00a047 40 40',
  ]) {
    assert.deepEqual(findTicketsByPhone(phone), [demoTicket], phone)
  }
})

test('phone lookup never returns the demo order for an unrelated valid number', () => {
  for (const phone of ['599123456', '+995 599 12 34 56', '(591) 47-40-41']) {
    assert.deepEqual(findTicketsByPhone(phone), [], phone)
  }
})

test('phone lookup rejects malformed inputs even when their digits match the demo phone', () => {
  for (const phone of [
    '',
    '   ',
    'abc',
    '+995abc591474040',
    '++995591474040',
    '+591474040',
    '995+591474040',
    '+995 591 47 40',
    '+995 591 47 40 400',
    '+995 291 47 40 40',
    '+44 7911 123456',
  ]) {
    assert.deepEqual(findTicketsByPhone(phone), [], JSON.stringify(phone))
  }
})

test('unknown or empty order codes do not return the demo order', () => {
  for (const code of ['', '   ', '#', '1002', 'unknown']) {
    assert.equal(findTicketByCode(code), undefined, JSON.stringify(code))
  }
})

test('frontend demo ticket contains a complete visible repair status', () => {
  assert.equal(demoTicket.code, '1001')
  assert.equal(demoTicket.statusKey, 'repairing')
  assert.equal(demoTicket.milestones.length, 4)
  assert.equal(demoTicket.milestones.filter(item => item.current).length, 1)
  assert.ok(demoTicket.device.length > 0)
  assert.ok(demoTicket.model.length > 0)
  assert.ok(demoTicket.update.length > 0)
})
