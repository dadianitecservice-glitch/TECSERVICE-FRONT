import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeGeorgianMobile, updateOtpDigits } from '../src/utils/validation.ts'

for (const value of ['591474040', '+995591474040', '995591474040', '+995 591 47 40 40', '(591) 47-40-40', '+995\u00a0591\u00a047 40 40']) {
  test(`normalizes mobile number ${value}`, () => {
    assert.equal(normalizeGeorgianMobile(value), '+995591474040')
  })
}

for (const value of ['', '   ', 'abc', '+995abc591474040', '+995 591 47 40', '+995 591 47 40 400', '+995 291 47 40 40', '+44 7911 123456', '++995591474040', '+591474040', '995+591474040']) {
  test(`rejects invalid mobile number ${JSON.stringify(value)}`, () => {
    assert.equal(normalizeGeorgianMobile(value), null)
  })
}

test('full pasted OTP fills all fields even when pasted into a later field', () => {
  for (let index = 0; index < 6; index += 1) {
    const result = updateOtpDigits(['9', '9', '9', '9', '9', '9'], index, '123456')
    assert.deepEqual(result.digits, ['1', '2', '3', '4', '5', '6'])
    assert.equal(result.focusIndex, 5)
  }
})

test('formatted pasted OTP is distributed without losing digits', () => {
  assert.deepEqual(updateOtpDigits(['', '', '', '', '', ''], 0, '123 456').digits, ['1', '2', '3', '4', '5', '6'])
})

test('single-digit correction preserves the other digits and the original array', () => {
  const original = ['1', '2', '3', '4', '5', '6']
  assert.deepEqual(updateOtpDigits(original, 2, '9'), { digits: ['1', '2', '9', '4', '5', '6'], focusIndex: 3 })
  assert.deepEqual(original, ['1', '2', '3', '4', '5', '6'])
})

test('deleting a digit clears only the active field', () => {
  assert.deepEqual(updateOtpDigits(['1', '2', '3', '4', '5', '6'], 3, ''), { digits: ['1', '2', '3', '', '5', '6'], focusIndex: 3 })
})

test('non-numeric input cannot replace an existing digit', () => {
  assert.deepEqual(updateOtpDigits(['1', '2', '3', '4', '5', '6'], 0, 'abc').digits, ['1', '2', '3', '4', '5', '6'])
})

test('partial paste respects the remaining field count', () => {
  assert.deepEqual(updateOtpDigits(['1', '2', '3', '4', '', ''], 4, '567'), { digits: ['1', '2', '3', '4', '5', '6'], focusIndex: 5 })
})
