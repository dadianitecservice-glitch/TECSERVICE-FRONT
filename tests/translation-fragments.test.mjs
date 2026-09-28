import test from 'node:test'
import assert from 'node:assert/strict'
import { installEnglishCatalogs, translateText, translateValue } from '../src/i18n/translateRuntime.ts'

installEnglishCatalogs([[
  {
    short: 'ქართული',
    phrase: 'ქართული ფრაზა',
    device: 'მოწყობილობა',
    escaped: 'ტესტი [SSD] (1.0)',
    mixed: 'ქართული SS',
    latin: 'SS',
    greek: 'ΣΣ',
  },
  {
    short: 'Georgian',
    phrase: 'Georgian phrase',
    device: 'Device',
    escaped: 'Test [SSD] (1.0)',
    mixed: 'Georgian pair',
    latin: 'Pair',
    greek: 'Sigma pair',
  },
]])

test('lazy translation fragments retain longest-first matching and Georgian uppercase support', () => {
  assert.equal(translateText('◆ ქართული ფრაზა — ქართული ◆', 'en'), '◆ Georgian phrase — Georgian ◆')
  assert.equal(translateText('◆ ᲥᲐᲠᲗᲣᲚᲘ ᲤᲠᲐᲖᲐ ◆', 'en'), '◆ Georgian phrase ◆')
  assert.equal(translateText('◆ ᲛᲝᲬᲧᲝᲑᲘᲚᲝᲑᲐ ◆', 'en'), '◆ Device ◆')
})

test('fragment prefilter does not weaken Unicode letter boundaries or escaped punctuation', () => {
  assert.equal(translateText('ქართულია აქართული', 'en'), 'ქართულია აქართული')
  assert.equal(translateText('ქართული_ქართული', 'en'), 'Georgian_Georgian')
  assert.equal(translateText('◆ ტესტი [SSD] (1.0) ◆', 'en'), '◆ Test [SSD] (1.0) ◆')
  assert.equal(translateText('◆ ტესტი SSD 1x0 ◆', 'en'), '◆ ტესტი SSD 1x0 ◆')
})

test('case-fold equivalences not captured by lowercased includes still use the original Unicode regex', () => {
  assert.equal(translateText('◆ ქართული ſſ ◆', 'en'), '◆ Georgian pair ◆')
  assert.equal(translateText('უცნობი ſſ', 'en'), 'უცნობი Pair')
  assert.equal(translateText('უცნობი σς', 'en'), 'უცნობი Sigma pair')
})

test('cached global fragments replace repeated occurrences and work across distinct input strings', () => {
  assert.equal(translateText('◆ ქართული / ქართული ◆', 'en'), '◆ Georgian / Georgian ◆')
  assert.equal(translateText('◆ ქართული / ქართული ◆', 'en'), '◆ Georgian / Georgian ◆')
  assert.equal(translateText('ქართული, ქართული!', 'en'), 'Georgian, Georgian!')
  assert.equal(translateText('ძალიან უცნობი ტექსტია', 'en'), 'ძალიან უცნობი ტექსტია')
})

test('dynamic prices, line breaks, arrays and untouched Georgian mode retain their behavior', () => {
  assert.equal(translateText('249 ₾-დან', 'en'), 'from 249 ₾')
  assert.equal(translateText('ღიაა 18:00-მდე', 'en'), 'Open until 18:00')
  assert.equal(translateText('ქართული\r\n249 ₾-დან', 'en'), 'Georgian\r\nfrom 249 ₾')
  assert.equal(translateText('ქართული ფრაზა', 'ka'), 'ქართული ფრაზა')
  assert.deepEqual(translateValue(['ქართული', ['მოწყობილობა']], 'en'), ['Georgian', ['Device']])
})
