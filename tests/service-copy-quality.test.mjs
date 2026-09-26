import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from '@babel/parser'
import { translateText, localizedHref } from '../src/i18n/translate.ts'

const serviceNames = [
  'laptopRepair', 'computerRepair', 'dataRecovery', 'consoleRepair',
  'droneRepair', 'mobileTabletRepair', 'otherElectronicsRepair',
]
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const untranslatedTerms = /\b(?:firmware|compass|flight controller|failsafe|bench test|hover test|service area|head stack|write blocker|chip-off|rebuild|recovery key|translator|retimer|encoder|southbridge|stick drift|safe mode|touch|fingerprint|backlight)\b/iu
const normalize = value => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('ka-GE')

function strings(value, path = '') {
  if (typeof value === 'string') return [[path, value]]
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}.${key}`))
}

for (const name of serviceNames) {
  const service = await import(`../src/data/${name}.ts`)
  const copy = strings(service).filter(([, value]) => georgian.test(value))

  test(`${name}: all Georgian service details resolve fully in English`, () => {
    assert.ok(copy.length > 100, 'Includes problems, pricing, process, FAQs and descriptions')
    for (const [path, value] of copy) {
      const english = translateText(value, 'en')
      assert.doesNotMatch(english, georgian, `${path}: ${english}`)
      assert.equal(translateText(value, 'ka'), value, path)
      assert.doesNotMatch(value, untranslatedTerms, `${path}: generic terms should be in Georgian`)
    }
  })

  test(`${name}: every WhatsApp problem draft keeps its selected context in both languages`, () => {
    const problems = Object.entries(service).find(([key]) => key.endsWith('Problems'))?.[1]
    const request = Object.entries(service).find(([key]) => key.endsWith('ProblemRequestUrl'))?.[1]
    assert.ok(Array.isArray(problems))
    assert.equal(typeof request, 'function')
    for (const problem of problems) {
      const source = request(problem)
      const original = new URL(source)
      const translated = new URL(localizedHref(source, 'en'))
      const message = translated.searchParams.get('text')
      const originalMessage = original.searchParams.get('text')
      assert.equal(translated.origin, 'https://wa.me')
      assert.equal(translated.pathname, original.pathname)
      assert.equal(localizedHref(source, 'ka'), source)
      assert.doesNotMatch(message, georgian, problem.id)
      assert.ok(message.includes(translateText(problem.label, 'en')), problem.id)
      assert.equal(message.split('\n').length, originalMessage.split('\n').length, problem.id)
      assert.equal((message.match(/\[please specify\]/g) ?? []).length, (originalMessage.match(/\[მიუთითეთ\]/g) ?? []).length, problem.id)
    }
  })
}

test('shared source phrases cannot silently override each other with conflicting English translations', async () => {
  const targets = new Map()
  for (const name of ['common', 'devices', 'recovery', 'equipment']) {
    const [ka, en] = await Promise.all(['ka', 'en'].map(async locale => JSON.parse(await readFile(new URL(`../src/i18n/catalogs/${name}.${locale}.json`, import.meta.url), 'utf8'))))
    assert.deepEqual(Object.keys(en), Object.keys(ka), name)
    for (const [id, source] of Object.entries(ka)) {
      const key = normalize(source)
      const existing = targets.get(key)
      if (existing) assert.equal(en[id], existing.value, `${id} conflicts with ${existing.id} for ${source}`)
      targets.set(key, { id, value: en[id] })
    }
  }
})

for (const name of serviceNames) {
  const page = `${name[0].toUpperCase()}${name.slice(1)}Page`
  test(`${page}: literal page text and image descriptions stay synchronized with the catalogs`, async () => {
    const source = await readFile(new URL(`../src/pages/${page}.tsx`, import.meta.url), 'utf8')
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    const copy = []
    function inspect(node) {
      if (!node || typeof node !== 'object') return
      if (node.type === 'CallExpression' && node.callee?.type === 'MemberExpression'
        && node.callee.object?.name === 'l10n' && node.callee.property?.name === 't'
        && node.arguments[0]?.type === 'StringLiteral' && georgian.test(node.arguments[0].value)) {
        copy.push(node.arguments[0].value)
      }
      for (const child of Object.values(node)) {
        if (Array.isArray(child)) child.forEach(inspect)
        else if (child && typeof child === 'object') inspect(child)
      }
    }
    inspect(ast)
    assert.ok(copy.length > 10, 'Includes page headings, descriptions, labels and image alt text')
    for (const value of copy) {
      assert.doesNotMatch(value, untranslatedTerms, value)
      assert.doesNotMatch(translateText(value, 'en'), georgian, value)
    }
  })
}
