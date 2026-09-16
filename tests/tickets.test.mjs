import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEMO_TICKET_CODE,
  demoTicket,
  findTicketByCode,
  normalizeTicketCode,
} from '../src/data/tickets.ts'

test('frontend demo ticket 1001 can be found with or without the visual hash prefix', () => {
  assert.equal(DEMO_TICKET_CODE, '1001')
  assert.equal(normalizeTicketCode('  # 1001 '), '1001')
  assert.equal(findTicketByCode('1001'), demoTicket)
  assert.equal(findTicketByCode('#1001'), demoTicket)
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
