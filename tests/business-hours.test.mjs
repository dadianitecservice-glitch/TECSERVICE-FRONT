import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { getBusinessHoursStatus } from '../src/utils/businessHours.ts'

function expectStatus(instant, isOpen, detail) {
  assert.deepEqual(getBusinessHoursStatus(new Date(instant)), {
    isOpen,
    label: isOpen ? 'ახლა ღიაა' : 'ახლა დაკეტილია',
    detail,
  }, instant)
}

test('every weekday opens at 10:00 Tbilisi, including the exact opening instant', () => {
  for (const day of ['14', '15', '16', '17', '18']) {
    expectStatus(`2026-09-${day}T05:59:59.999Z`, false, 'გაიხსნება დღეს 10:00-ზე')
    expectStatus(`2026-09-${day}T06:00:00.000Z`, true, 'ღიაა 19:00-მდე')
    expectStatus(`2026-09-${day}T14:59:59.999Z`, true, 'ღიაა 19:00-მდე')
  }
})

test('weekday closing at 19:00 is exclusive and announces the next opening', () => {
  for (const day of ['14', '15', '16', '17']) {
    expectStatus(`2026-09-${day}T15:00:00.000Z`, false, 'გაიხსნება ხვალ 10:00-ზე')
  }
  expectStatus('2026-09-18T15:00:00.000Z', false, 'გაიხსნება ხვალ 11:00-ზე')
})

test('Saturday opens at 11:00 and closes at 18:00 with Monday next', () => {
  expectStatus('2026-09-19T06:59:59.999Z', false, 'გაიხსნება დღეს 11:00-ზე')
  expectStatus('2026-09-19T07:00:00.000Z', true, 'ღიაა 18:00-მდე')
  expectStatus('2026-09-19T13:00:00.000Z', true, 'ღიაა 18:00-მდე')
  expectStatus('2026-09-19T13:59:59.999Z', true, 'ღიაა 18:00-მდე')
  expectStatus('2026-09-19T14:00:00.000Z', false, 'გაიხსნება ორშაბათს 10:00-ზე')
})

test('Sunday has no opening window', () => {
  for (const instant of ['2026-09-19T20:00:00.000Z', '2026-09-20T08:00:00.000Z', '2026-09-20T19:59:59.999Z']) {
    expectStatus(instant, false, 'გაიხსნება ხვალ 10:00-ზე')
  }
})

test('today and tomorrow follow Tbilisi midnight even when UTC is on the previous day', () => {
  expectStatus('2026-09-18T19:59:59.999Z', false, 'გაიხსნება ხვალ 11:00-ზე')
  expectStatus('2026-09-18T20:00:00.000Z', false, 'გაიხსნება დღეს 11:00-ზე')
  expectStatus('2026-09-20T19:59:59.999Z', false, 'გაიხსნება ხვალ 10:00-ზე')
  expectStatus('2026-09-20T20:00:00.000Z', false, 'გაიხსნება დღეს 10:00-ზე')
})

test('next opening remains correct across month and year boundaries', () => {
  expectStatus('2026-10-31T14:00:00.000Z', false, 'გაიხსნება ორშაბათს 10:00-ზე')
  expectStatus('2026-11-01T20:00:00.000Z', false, 'გაიხსნება დღეს 10:00-ზე')
  expectStatus('2026-12-31T15:00:00.000Z', false, 'გაიხსნება ხვალ 10:00-ზე')
  expectStatus('2026-12-31T20:00:00.000Z', false, 'გაიხსნება დღეს 10:00-ზე')
  expectStatus('2022-12-31T14:00:00.000Z', false, 'გაიხსნება ორშაბათს 10:00-ზე')
  expectStatus('2023-01-02T06:00:00.000Z', true, 'ღიაა 19:00-მდე')
})

test('visitor time zone does not alter the business status', () => {
  const moduleUrl = new URL('../src/utils/businessHours.ts', import.meta.url).href
  const instants = ['2026-09-18T20:00:00.000Z', '2026-09-19T07:00:00.000Z', '2026-09-19T13:00:00.000Z', '2026-09-19T14:00:00.000Z']
  const expected = instants.map(instant => getBusinessHoursStatus(new Date(instant)))
  const script = `import { getBusinessHoursStatus } from ${JSON.stringify(moduleUrl)};
    console.log(JSON.stringify(${JSON.stringify(instants)}.map(instant => getBusinessHoursStatus(new Date(instant)))));`

  for (const timeZone of ['UTC', 'America/Los_Angeles', 'Asia/Tokyo']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      encoding: 'utf8',
      env: { ...process.env, TZ: timeZone },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.deepEqual(JSON.parse(result.stdout), expected, timeZone)
  }
})
