import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  installEnglishCatalogs, localizedHref, prepareTranslations, translateText, translateValue,
} from '../src/i18n/translateRuntime.ts'

test('Georgian needs no catalogs; English loads once before translating with the existing synchronous API', async () => {
  await prepareTranslations('ka')
  assert.equal(translateText('მთავარი', 'ka'), 'მთავარი')
  assert.equal(translateText('მთავარი', 'en'), 'მთავარი', 'English catalogs must not load for Georgian')
  assert.equal(localizedHref('/contact/', 'en'), '/en/contact/')

  const first = prepareTranslations('en')
  const concurrent = prepareTranslations('en')
  assert.equal(first, concurrent, 'Concurrent English pages share one catalog import')
  await first
  assert.equal(translateText('მთავარი', 'en'), 'Home')
  assert.equal(translateText('249 ₾-დან', 'en'), 'from 249 ₾')
  assert.deepEqual(translateValue(['მთავარი', ['249 ₾-დან']], 'en'), ['Home', ['from 249 ₾']])
  assert.equal(translateText('მთავარი\n249 ₾-დან', 'en'), 'Home\nfrom 249 ₾')
  const whatsapp = new URL(localizedHref('https://wa.me/995591474040?text=' + encodeURIComponent('მთავარი\n249 ₾-დან'), 'en'))
  assert.equal(whatsapp.searchParams.get('text'), 'Home\nfrom 249 ₾')

  const eager = await import('../src/i18n/translate.ts')
  assert.equal(eager.translateText, translateText)
  assert.equal(eager.translateValue, translateValue)
  assert.equal(eager.localizedHref, localizedHref)
  assert.equal(eager.prepareTranslations, prepareTranslations)
  installEnglishCatalogs([[{ heading: 'მთავარი' }, { heading: 'Wrong repeated catalog' }]])
  await prepareTranslations('en')
  assert.equal(translateText('მთავარი', 'en'), 'Home', 'Catalog installation is idempotent')
})

test('the browser translation runtime and provider never statically import the paired JSON catalogs', async () => {
  const runtime = await readFile(new URL('../src/i18n/translateRuntime.ts', import.meta.url), 'utf8')
  const imports = [...runtime.matchAll(/^import (?!type\b).*?from ['"]([^'"]+)['"]/gm)].map(([, path]) => path)
  assert.deepEqual(imports, ['./locale.ts'])
  assert.match(runtime, /import\('\.\/translate\.ts'\)/)
  assert.doesNotMatch(runtime, /from ['"][^'"]+\.json['"]/)
  const provider = await readFile(new URL('../src/i18n/LocaleProvider.tsx', import.meta.url), 'utf8')
  assert.match(provider, /from '\.\/translateRuntime'/)
  assert.doesNotMatch(provider, /from '\.\/translate'/)
})
