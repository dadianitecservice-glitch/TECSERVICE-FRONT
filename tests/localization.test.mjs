import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { localeFromPath, localePath, stripLocale } from '../src/i18n/locale.ts'
import { localizedHref, translateText, translateValue } from '../src/i18n/translate.ts'
import { getBusinessHoursStatus } from '../src/utils/businessHours.ts'
import { getRouteMetadata, isKnownPublicPath } from '../src/utils/routes.ts'
import { laptopProblems, laptopProblemRequestUrl } from '../src/data/laptopRepair.ts'

const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const catalogNames = ['common', 'devices', 'recovery', 'equipment']
const catalogs = await Promise.all(catalogNames.map(async name => {
  const [source, english] = await Promise.all(['ka', 'en'].map(async locale => {
    const content = await readFile(new URL(`../src/i18n/catalogs/${name}.${locale}.json`, import.meta.url), 'utf8')
    return JSON.parse(content)
  }))
  return { name, source, english }
}))

for (const { name, source, english } of catalogs) {
  test(`${name} catalog has exactly the source IDs and nonempty English translations`, () => {
    assert.deepEqual(Object.keys(english).sort(), Object.keys(source).sort())
    for (const [id, value] of Object.entries(english)) {
      assert.equal(typeof value, 'string', id)
      assert.ok(value.trim(), `${id} must not be empty`)
      assert.doesNotMatch(value, georgian, id)
      assert.doesNotMatch(translateText(source[id], 'en'), georgian, `${id} must resolve at runtime`)
      assert.equal(translateText(source[id], 'ka'), source[id], `${id} must retain Georgian source text`)
    }
  })
}

test('locale detection recognizes only the exact leading /en path segment', () => {
  for (const path of ['/en', '/en/', '/en/contact', '/en/services/laptop-repair/', '/en/unknown']) {
    assert.equal(localeFromPath(path), 'en', path)
  }
  for (const path of ['', '/', '/contact', '/english', '/enough/contact', '/EN/contact', '/services/en', '/fr/contact']) {
    assert.equal(localeFromPath(path), 'ka', path)
    assert.equal(stripLocale(path), path)
  }
  assert.equal(stripLocale('/en'), '/')
  assert.equal(stripLocale('/en/'), '/')
  assert.equal(stripLocale('/en/contact/'), '/contact/')
  assert.equal(stripLocale('/en/unknown/deep-path'), '/unknown/deep-path')
})

test('locale paths switch language without adding a second /en prefix', () => {
  for (const path of ['/', '/contact', '/services/laptop-repair/', '/unknown/deep-path']) {
    const english = localePath(path, 'en')
    assert.equal(english, `/en${path}`)
    assert.equal(localePath(english, 'en'), english, 'Repeated localization must be idempotent')
    assert.equal(localePath(english, 'ka'), path)
    assert.equal(localePath(path, 'ka'), path)
  }
  assert.equal(localePath('', 'en'), '/en/')
  assert.equal(localePath('/en', 'ka'), '/')
  assert.equal(localePath('/en', 'en'), '/en/')
})

test('unknown routes remain unknown in both languages instead of resolving to a service', () => {
  for (const path of ['/no-such-page', '/en/no-such-page', '/en/services/not-a-service', '/english/contact']) {
    assert.equal(isKnownPublicPath(path), false, path)
    assert.equal(getRouteMetadata(path), null, path)
  }
  for (const path of ['/contact', '/en/contact', '/services/laptop-repair/', '/en/services/laptop-repair/']) {
    assert.equal(isKnownPublicPath(path), true, path)
  }
})

test('a repeated locale segment cannot give an unknown route valid service metadata', () => {
  for (const path of ['/en/en/contact', '/en/en/services/laptop-repair', '/en/en/services/data-recovery']) {
    assert.equal(isKnownPublicPath(path), false, path)
    assert.equal(getRouteMetadata(path), null, path)
  }
})

test('English translation recognizes Georgian case and spacing while Georgian remains unchanged', () => {
  for (const source of ['კომპიუტერის დიაგნოსტიკა', 'კომპიუტერის დიაგნოსტიკა'.toLocaleUpperCase('ka-GE'), '  კომპიუტერის\n დიაგნოსტიკა  ']) {
    assert.equal(translateText(source, 'en'), 'Computer diagnostics')
    assert.equal(translateText(source, 'ka'), source)
  }
  assert.equal(translateText('მთავარი', 'en'), 'Home')
  assert.equal(translateText('Choose a model: HP 15 G5', 'en'), 'Choose a model: HP 15 G5')
})

test('rendered text arrays translate recursively while React elements and data objects retain identity', () => {
  const inputValue = 'კლავიატურა არ მუშაობს'
  const input = createElement('input', { value: inputValue, name: 'description', onChange: () => {} })
  const element = createElement('span', { id: 'unchanged' }, 'მთავარი')
  const userData = Object.freeze({ description: inputValue, serviceCode: 'TE-1234', quantity: 2 })
  const source = ['მთავარი', ['კომპიუტერის დიაგნოსტიკა', input, element], userData, 0, false, null, undefined]
  const result = translateValue(source, 'en')

  assert.equal(result[0], 'Home')
  assert.equal(result[1][0], 'Computer diagnostics')
  assert.strictEqual(result[1][1], input)
  assert.strictEqual(result[1][2], element)
  assert.strictEqual(result[2], userData)
  assert.equal(result[1][1].props.value, inputValue)
  assert.equal(result[1][2].props.children, 'მთავარი')
  assert.equal(result[2].description, inputValue)
  assert.deepEqual(result.slice(3), [0, false, null, undefined])
  assert.equal(source[0], 'მთავარი', 'Translation must not mutate the source array')
  assert.deepEqual(translateValue(source, 'ka'), source)
  assert.strictEqual(translateValue(userData, 'en'), userData)
})

test('dynamic business status retains Saturday closing at 18:00 and the next opening', () => {
  const cases = [
    ['2026-09-19T06:59:59.999Z', false, 'Opens today at 11:00'],
    ['2026-09-19T13:00:00.000Z', true, 'Open until 18:00'],
    ['2026-09-19T13:59:59.999Z', true, 'Open until 18:00'],
    ['2026-09-19T14:00:00.000Z', false, 'Opens Monday at 10:00'],
    ['2026-09-20T08:00:00.000Z', false, 'Opens tomorrow at 10:00'],
    ['2026-09-21T06:00:00.000Z', true, 'Open until 19:00'],
  ]
  for (const [instant, isOpen, detail] of cases) {
    const status = getBusinessHoursStatus(new Date(instant))
    assert.equal(status.isOpen, isOpen, instant)
    assert.equal(translateText(status.label, 'en'), isOpen ? 'Open now' : 'Closed now', instant)
    assert.equal(translateText(status.detail, 'en'), detail, instant)
    assert.equal(translateText(status.detail, 'ka'), status.detail, instant)
  }
})

test('dynamic starting prices translate without changing numeric amounts or fixed prices', () => {
  for (const amount of ['249', '249.50', '249,50']) {
    const translated = translateText(`${amount} ₾-დან`, 'en')
    assert.doesNotMatch(translated, georgian)
    assert.ok(translated.includes(`${amount} ₾`))
    assert.match(translated, /from|and up/i)
  }
  assert.equal(translateText('30 ₾', 'en'), '30 ₾')
  assert.equal(translateText('249 ₾-დან', 'ka'), '249 ₾-დან')
})

test('internal links retain English routing, query values, and section fragments', () => {
  const source = '/services/laptop-repair/?ref=header&code=TE-1234#laptop-prices'
  const expected = '/en/services/laptop-repair/?ref=header&code=TE-1234#laptop-prices'
  assert.equal(localizedHref(source, 'en'), expected)
  assert.equal(localizedHref(expected, 'en'), expected)
  assert.equal(localizedHref(expected, 'ka'), source)
  assert.equal(localizedHref('/contact?message=მთავარი#contact-hours', 'en'), '/en/contact?message=მთავარი#contact-hours')
})

test('English home links with query strings and hashes never acquire /en/en', () => {
  for (const suffix of ['?ref=header#hours', '#hours']) {
    const english = new URL(localizedHref(`/en${suffix}`, 'en'), 'https://tecservice.ge')
    assert.ok(['/en', '/en/'].includes(english.pathname), english.pathname)
    const georgianUrl = new URL(localizedHref(`/en${suffix}`, 'ka'), 'https://tecservice.ge')
    assert.equal(georgianUrl.pathname, '/')
    const original = new URL(`/en${suffix}`, 'https://tecservice.ge')
    for (const url of [english, georgianUrl]) {
      assert.equal(url.search, original.search)
      assert.equal(url.hash, original.hash)
    }
  }
})

test('asset, API, external, contact, and fragment-only links remain intact', () => {
  for (const value of [
    undefined,
    '',
    '/assets/map/tecservice-map.jpg?size=2#preview',
    '/api/tickets?code=TE-1234',
    'https://example.com/en/contact?q=მთავარი#hours',
    'https://www.google.com/maps?query=Tbilisi',
    '//cdn.example.com/assets/image.webp',
    'tel:+995591474040',
    'mailto:info@example.com',
    '#laptop-prices',
    '?search=მთავარი',
  ]) {
    assert.equal(localizedHref(value, 'en'), value)
    assert.equal(localizedHref(value, 'ka'), value)
  }
})

test('all laptop WhatsApp drafts translate their selected problem and prompts', () => {
  for (const problem of laptopProblems) {
    const source = laptopProblemRequestUrl(problem)
    const translated = new URL(localizedHref(source, 'en'))
    assert.equal(translated.origin, 'https://wa.me')
    assert.equal(translated.pathname, '/995591474040')
    assert.deepEqual([...translated.searchParams.keys()], ['text'])
    assert.equal(translated.hash, '')
    const message = translated.searchParams.get('text')
    assert.doesNotMatch(message, georgian, problem.id)
    assert.ok(message.includes(translateText(problem.label, 'en')), problem.id)
    assert.equal((message.match(/\[please specify\]/g) ?? []).length, 3, problem.id)
    assert.equal(localizedHref(source, 'ka'), source)
  }
})

test('WhatsApp localization retains draft paragraphs and unrelated URL parameters', () => {
  const source = new URL(laptopProblemRequestUrl(laptopProblems[0]))
  source.searchParams.set('ref', 'A&B? #1 + 50%')
  const translated = new URL(localizedHref(source.href, 'en'))
  assert.equal(translated.searchParams.get('ref'), source.searchParams.get('ref'))
  assert.equal(translated.searchParams.get('text').split('\n').length, source.searchParams.get('text').split('\n').length)
  assert.equal((translated.searchParams.get('text').match(/\n\n/g) ?? []).length, (source.searchParams.get('text').match(/\n\n/g) ?? []).length)
})
