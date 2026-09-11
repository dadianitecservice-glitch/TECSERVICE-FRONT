import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { laptopPrices, laptopPriceDisclaimer, formatLaptopPrice } from '../src/data/laptopRepair.ts'

const approvedPrices = [
  ['diagnostics', 30, 'from', '1–2 სამუშაო დღე'],
  ['screen', 50, 'from', '1–2 სამუშაო დღე'],
  ['keyboard', 50, 'from', '1–2 სამუშაო დღე'],
  ['battery', 20, 'from', '1–2 საათი'],
  ['board', 150, 'from', '2–5 სამუშაო დღე'],
  ['cooling', 40, 'from', '4–6 საათი'],
  ['hinges', 80, 'from', '1–3 სამუშაო დღე'],
  ['ports', 60, 'from', '1–3 სამუშაო დღე'],
  ['ssd', 40, 'from', '1–2 საათი'],
  ['ram', 30, 'from', '30–60 წუთი'],
  ['bios', 80, 'from', '1–2 დღე'],
  ['fan', 50, 'from', '1–2 დღე'],
  ['touchpad', 50, 'from', '1–2 დღე'],
  ['wireless', 60, 'from', '1–2 დღე'],
  ['windows', 30, 'fixed', '2–3 საათი'],
  ['programs', 30, 'fixed', 'შეთანხმებით'],
  ['office', 10, 'fixed', '30–60 წუთი'],
  ['drivers', 10, 'from', '30–60 წუთი'],
  ['boot', 50, 'from', '1–2 სამუშაო დღე'],
  ['backup', 30, 'from', '1–3 საათი'],
]

test('laptop catalogue preserves twenty approved prices and durations across hardware and software', () => {
  const hardwareIds = ['diagnostics', 'screen', 'keyboard', 'battery', 'board', 'cooling', 'hinges', 'ports', 'ssd', 'ram', 'bios', 'fan', 'touchpad', 'wireless']
  const softwareIds = ['windows', 'programs', 'office', 'drivers', 'boot', 'backup']
  assert.deepEqual(laptopPrices.filter(price => price.category === 'hardware').map(price => price.id), hardwareIds)
  assert.deepEqual(laptopPrices.filter(price => price.category === 'software').map(price => price.id), softwareIds)
  assert.equal(new Set(laptopPrices.map(price => price.id)).size, 20)
  assert.equal(laptopPrices.length, 20)
  assert.deepEqual(laptopPrices.map(price => [price.id, price.fromPrice, price.priceKind, price.duration]), approvedPrices)
  assert.ok(!laptopPrices.some(price => ['screen-keyboard', 'malware'].includes(price.id)))
  assert.match(laptopPrices.find(price => price.id === 'screen').name, /ეკრან/)
  assert.match(laptopPrices.find(price => price.id === 'keyboard').name, /კლავიატურ/)
  assert.match(laptopPrices.find(price => price.id === 'windows').name, /Windows/i)
  assert.match(laptopPrices.find(price => price.id === 'programs').name, /პროგრამ/)
  assert.match(laptopPrices.find(price => price.id === 'office').name, /Office/i)
  assert.deepEqual(laptopPrices.find(price => price.id === 'programs').programs, ['Adobe Photoshop', 'Adobe Illustrator', 'Autodesk 3ds Max'])
  for (const price of laptopPrices) {
    assert.ok(Number.isFinite(price.fromPrice) && price.fromPrice > 0, `Invalid starting price: ${price.id}`)
    for (const key of ['name', 'priceNote', 'duration', 'detail']) {
      assert.ok(typeof price[key] === 'string' && price[key].trim().length > 0, `Missing ${key}: ${price.id}`)
    }
  }
  assert.doesNotMatch(laptopPriceDisclaimer, /სატესტო ფასები|დასადასტურებელი/)
  assert.match(laptopPriceDisclaimer, /ნაწილებ/)
  assert.match(laptopPriceDisclaimer, /ლიცენზი/)
  assert.match(laptopPriceDisclaimer, /ცალკე|არ შედის/)
})

test('fixed prices omit the starting-price suffix while starting prices retain it', () => {
  assert.equal(formatLaptopPrice({ fromPrice: 30, priceKind: 'fixed' }), '30 ₾')
  assert.equal(formatLaptopPrice({ fromPrice: 30, priceKind: 'from' }), '30 ₾-დან')
  for (const [id, amount, kind] of approvedPrices) {
    const price = laptopPrices.find(item => item.id === id)
    assert.equal(formatLaptopPrice(price), `${amount} ₾${kind === 'from' ? '-დან' : ''}`, id)
  }
})

test('built laptop prices show eight static technical rows and a plain action for the remaining six', async () => {
  const built = await readFile(new URL('../dist/services/laptop-repair/index.html', import.meta.url), 'utf8')
  const pricing = built.match(/<section\b[^>]*id="laptop-prices"[\s\S]*?<\/section>/)?.[0]
  assert.ok(pricing, 'Missing prerendered pricing section')
  assert.doesNotMatch(pricing, /სატესტო ფასები|დასადასტურებელი|price-detail-|lp-price-toggle|lp-price-detail/)
  assert.ok(pricing.includes(laptopPriceDisclaimer), 'Missing parts and license exclusions')
  const initialPrices = laptopPrices.filter(price => price.category === 'hardware').slice(0, 8)
  for (const price of initialPrices) {
    assert.ok(pricing.includes(price.name), `Missing service label: ${price.id}`)
  }
  for (const price of laptopPrices.filter(price => !initialPrices.includes(price))) {
    assert.ok(!pricing.includes(price.name), `Service rendered outside the default preview: ${price.id}`)
  }
  assert.match(pricing, /<button\b[^>]*aria-pressed="true"[^>]*>ტექნიკური<\/button>/)
  const rows = [...pricing.matchAll(/<div role="row" class="lp-price-row">([\s\S]*?)<\/div>([\s\S]*?)<\/div>/g)]
  assert.equal(rows.length, 8)
  assert.deepEqual(initialPrices.map(price => price.id), ['diagnostics', 'screen', 'keyboard', 'battery', 'board', 'cooling', 'hinges', 'ports'])
  initialPrices.forEach((price, index) => {
    const row = rows[index]
    assert.ok(row[1].includes(price.name), `Incorrect service order: ${price.id}`)
    assert.doesNotMatch(row[0], /<button\b|aria-expanded|<svg\b/, `Price row must be static: ${price.id}`)
    const amount = row[2].match(/<strong class="lp-price-amount">([\s\S]*?)<\/strong>/)?.[1].replace(/<!--[\s\S]*?-->/g, '')
    assert.equal(amount, formatLaptopPrice(price), `Incorrect displayed amount: ${price.id}`)
    assert.ok(row[2].includes(price.duration), `Incorrect displayed duration: ${price.id}`)
  })
  assert.doesNotMatch(pricing, /class="lp-price-entry is-expanded"/)
  const rowGroup = pricing.match(/<div\b[^>]*id="laptop-price-rows"[^>]*>/)?.[0]
  assert.ok(rowGroup, 'Missing stable pricing rowgroup')
  assert.match(rowGroup, /role="rowgroup"/)
  const more = pricing.match(/<button\b[^>]*class="[^"]*\blp-price-more\b[^"]*"[^>]*>[\s\S]*?<\/button>/)?.[0]
  assert.ok(more, 'Missing plain action for the remaining technical services')
  assert.match(more, /type="button"/)
  assert.match(more, /aria-controls="laptop-price-rows"/)
  assert.match(more, /aria-expanded="false"/)
  assert.doesNotMatch(more, /lp-button|<svg\b/)
  const moreText = more.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, '').trim()
  assert.equal(moreText, 'დანარჩენი 6 მომსახურების ნახვა →')
})
