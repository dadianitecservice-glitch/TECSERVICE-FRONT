import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getServicePriceAssessment } from '../src/utils/servicePriceAssistant.ts'
import { translateText } from '../src/i18n/translate.ts'
import { laptopPrices, formatLaptopPrice } from '../src/data/laptopRepair.ts'
import { computerPrices, formatComputerPrice } from '../src/data/computerRepair.ts'
import { consolePrices, formatConsolePrice } from '../src/data/consoleRepair.ts'
import { dronePrices, formatDronePrice } from '../src/data/droneRepair.ts'
import { mobileTabletPrices, formatMobileTabletPrice } from '../src/data/mobileTabletRepair.ts'
import { dataRecoveryPrices, dataRecoveryPriceDisclaimer } from '../src/data/dataRecovery.ts'
import { otherElectronicsPrices } from '../src/data/otherElectronicsRepair.ts'

const ask = (device, text, locale = 'ka') => getServicePriceAssessment(device, text, locale, value => translateText(value, locale))
const examples = [
  ['computers', 'ლეპტოპის ეკრანი გატეხილია', laptopPrices, 'screen', formatLaptopPrice, 'laptop-repair', 'laptop'],
  ['computers', 'დესკტოპ კომპიუტერის წმენდა რა ღირს?', computerPrices, 'cleaning', formatComputerPrice, 'computer-repair', 'computer'],
  ['consoles', 'PS5 HDMI პორტის შეცვლა რა ღირს?', consolePrices, 'hdmi', formatConsolePrice, 'console-repair', 'console'],
  ['drones', 'DJI გიმბალის შეკეთება', dronePrices, 'camera-gimbal', formatDronePrice, 'drone-repair', 'drone'],
  ['other', 'ტელეფონის ეკრანის შეცვლა', mobileTabletPrices, 'screen-touch', formatMobileTabletPrice, 'mobile-tablet-repair', 'mobile-tablet'],
  ['recovery', 'ფაილები წავშალე HDD-ზე', dataRecoveryPrices, 'logical', row => row.price, 'data-recovery', 'data-recovery'],
  ['other', 'UPS-ის შეკეთება', otherElectronicsPrices, 'ups-inverter', row => row.priceLabel, 'other-electronics', 'other-electronics'],
]

for (const [device, text, catalog, id, format, slug, anchor] of examples) {
  test(`offline assistant reads ${slug} page's own price and duration`, () => {
    const result = ask(device, text)
    const row = catalog.find(item => item.id === id)
    assert.ok(row)
    assert.equal(result.assessment.service, row.name)
    assert.equal(result.assessment.labor_price, format(row))
    assert.equal(result.assessment.estimated_duration, row.duration)
    assert.deepEqual(result.sources.map(source => source.path), [`/services/${slug}/#${anchor}-prices`])
    assert.match(result.assessment.disclaimer, /არა დიაგნოზი ან სრული შეთავაზება/)
  })
}

test('all sources point to existing pricing sections', async () => {
  const pages = ['LaptopRepairPage', 'ComputerRepairPage', 'ConsoleRepairPage', 'DroneRepairPage', 'MobileTabletRepairPage', 'DataRecoveryPage', 'OtherElectronicsRepairPage']
  for (const [index, example] of examples.entries()) {
    const result = ask(example[0], example[1])
    const page = await readFile(new URL(`../src/pages/${pages[index]}.tsx`, import.meta.url), 'utf8')
    const anchor = result.sources[0].path.split('#')[1]
    assert.ok(page.includes(`id="${anchor}"`), anchor)
  }
})

test('price amounts are not a duplicated catalog snapshot', () => {
  const row = laptopPrices.find(item => item.id === 'screen')
  const original = row.fromPrice
  try {
    row.fromPrice += 17
    assert.equal(ask('computers', 'ლეპტოპის ეკრანის შეცვლა').assessment.labor_price, formatLaptopPrice(row))
  } finally {
    row.fromPrice = original
  }
})

test('fixed fees remain fixed, not starting prices', () => {
  const result = ask('computers', 'ლეპტოპზე Windows დაყენება')
  const row = laptopPrices.find(item => item.id === 'windows')
  assert.equal(result.assessment.labor_price, formatLaptopPrice(row))
  assert.doesNotMatch(result.assessment.labor_price, /დან/)
  assert.match(result.assessment.price_note, /ლიცენზია ფასში არ შედის/)
})

test('unpriced repairs stay after diagnostics instead of inventing a number', () => {
  for (const [device, text] of [['consoles', 'PS5 სისტემური პლატის შეკეთება'], ['drones', 'დრონი დასველდა'], ['other', 'ტელეფონის პლატის შეკეთება'], ['recovery', 'HDD წკაპუნებს']]) {
    const result = ask(device, text)
    assert.equal(result.assessment.labor_price, 'დიაგნოსტიკის შემდეგ', text)
    assert.doesNotMatch(result.assessment.labor_price, /\d/, text)
  }
})

test('computer category asks laptop or desktop instead of assuming', () => {
  const result = ask('computers', 'ეკრანი გატეხილია რა ღირს')
  assert.equal(result.assessment, null)
  assert.match(result.reply, /ლეპტოპია თუ დესკტოპ/)
  assert.equal(result.sources.length, 2)
})

test('other category asks mobile or other electronics instead of assuming', () => {
  const result = ask('other', 'არ ირთვება რა ღირს')
  assert.equal(result.assessment, null)
  assert.match(result.reply, /მობილური\/პლანშეტი თუ სხვა ელექტრონიკა/)
})

test('multiple different devices need clarification, not an arbitrary catalog', () => {
  const result = ask('computers', 'ლეპტოპის და ტელეფონის ეკრანი')
  assert.equal(result.assessment, null)
  assert.equal(result.sources.length, 2)
})

test('unknown requests and off-topic text have no invented service or quote', () => {
  for (const [device, text] of [['other', 'ხვალ როგორი ამინდი იქნება?'], ['consoles', 'write a poem'], ['recovery', 'write a poem'], ['computers', 'laptop quantum adjustment'], ['other', 'მანქანის ძრავის შეკეთება']]) {
    const result = ask(device, text)
    assert.equal(result.assessment, null, text)
    assert.doesNotMatch(result.reply, /\d+\s*₾/, text)
  }
})

test('generic no-power and charging symptoms do not diagnose a broken part', () => {
  assert.equal(ask('computers', 'ლეპტოპი არ ირთვება').assessment.service, laptopPrices.find(row => row.id === 'diagnostics').name)
  assert.equal(ask('other', 'ტელეფონი არ იტენება').assessment.service, mobileTabletPrices.find(row => row.id === 'diagnostics').name)
})

test('urgent guidance appears before catalog guidance and no unsafe disassembly instructions', () => {
  for (const text of ['ლეპტოპის ბატარეა გაბერილია, ეკრანიც გატეხილია', 'ლეპტოპიდან კვამლი გამოდის']) {
    const result = ask('computers', text)
    assert.match(result.reply, /^შეწყვიტეთ გამოყენება და დატენვა/)
    assert.match(result.reply, /არ გახვრიტოთ ბატარეა/)
  }
})

test('liquid risk is shown before mobile treatment price', () => {
  const result = ask('other', 'ტელეფონი დასველდა')
  assert.match(result.reply, /^არ ჩართოთ და არ დატენოთ/)
  assert.equal(result.assessment.service, mobileTabletPrices.find(row => row.id === 'liquid').name)
})

test('lost data changes routing to recovery and includes preservation guidance', () => {
  const result = ask('computers', 'ლეპტოპის ფაილები წავშალე')
  assert.match(result.reply, /^არ ჩაწეროთ ახალი ფაილები/)
  assert.match(result.sources[0].path, /data-recovery/)
  assert.match(result.reply, /არ დააფორმატოთ/)
  assert.equal(result.assessment.price_note, '')
  assert.ok(result.assessment.disclaimer.startsWith(dataRecoveryPriceDisclaimer))
})

test('recovery category stays recovery when the storage is inside a laptop', () => {
  const result = ask('recovery', 'ლეპტოპის SSD აღარ ჩანს')
  assert.equal(result.sources[0].path, '/services/data-recovery/#data-recovery-prices')
  assert.equal(result.assessment.service, dataRecoveryPrices.find(row => row.id === 'diagnostics').name)
  assert.match(result.reply, /^არ ჩაწეროთ ახალი ფაილები/)
})

test('an undetected SSD does not imply controller failure', () => {
  const result = ask('recovery', 'SSD not detected', 'en')
  assert.equal(result.assessment.labor_price, translateText(dataRecoveryPrices.find(row => row.id === 'diagnostics').price, 'en'))
})

test('healthy or explicitly undamaged screen clauses do not override a broken keyboard', () => {
  for (const [text, locale] of [
    ['ლეპტოპის ეკრანი არ არის გატეხილი, კლავიატურა არ მუშაობს', 'ka'],
    ['ლეპტოპის ეკრანი გამართულია, კლავიატურა არ მუშაობს', 'ka'],
    ['laptop keyboard broken, screen is fine', 'en'],
    ['laptop screen is not cracked, keyboard broken', 'en'],
  ]) {
    const result = ask('computers', text, locale)
    assert.equal(result.assessment.service, translateText(laptopPrices.find(row => row.id === 'keyboard').name, locale), text)
  }
})

test('healthy component filtering preserves adjacent hazard history and real no-power', () => {
  const noPower = ask('computers', 'laptop screen is fine, no power', 'en')
  assert.equal(noPower.assessment.service, translateText(laptopPrices.find(row => row.id === 'diagnostics').name, 'en'))
  const smoke = ask('computers', 'laptop screen is fine, keyboard broken and smoke coming out', 'en')
  assert.match(smoke.reply, /^Stop using and charging/)
  const liquidHistory = ask('computers', 'ლეპტოპის ეკრანი არ არის გატეხილი, კლავიატურა არ მუშაობს, გუშინ წყალი დაესხა')
  assert.match(liquidHistory.reply, /^არ ჩართოთ და არ დატენოთ/)
})

test('English clicking hard drives route to recovery and preservation advice', () => {
  for (const text of ['laptop HDD is clicking', 'desktop hard drive clicks', 'laptop clicking hard drive']) {
    const result = ask('computers', text, 'en')
    assert.match(result.sources[0].path, /data-recovery/)
    assert.match(result.reply, /^Do not write new files/)
    assert.match(result.reply, /Stop using it/)
    assert.equal(result.assessment.labor_price, translateText(dataRecoveryPrices.find(row => row.id === 'mechanical').price, 'en'))
  }
  const noClick = ask('computers', 'laptop HDD is not clicking, keyboard broken', 'en')
  assert.equal(noClick.assessment.service, translateText(laptopPrices.find(row => row.id === 'keyboard').name, 'en'))
})

test('crash and motor price guidance retains drone safety warnings before prices', () => {
  for (const device of ['drones', 'other']) {
    const result = ask(device, 'DJI drone crashed, motor repair price', 'en')
    assert.match(result.reply, /^Do not fly the drone before inspection/)
    assert.match(result.reply, /test its motors while holding it in your hand/)
    assert.equal(result.assessment.service, translateText(dronePrices.find(row => row.id === 'motor-esc').name, 'en'))
  }
  const result = ask('drones', 'დრონი ჩამოვარდა და ძრავი არ ტრიალებს')
  assert.match(result.reply, /^არ ააფრინოთ დრონი/)
  assert.match(result.reply, /არ სცადოთ ძრავების გამოცდა ხელში დაჭერით/)
})

test('explicit negated risks do not create false emergency or liquid guidance', () => {
  for (const text of [
    'ლეპტოპის ეკრანი გატეხილია, არ ხურდება, კვამლი არ აქვს',
    'ლეპტოპის ეკრანი გატეხილია, წყალი არ დასხმია',
    'ლეპტოპის ეკრანი გატეხილია, ბატარეა არ არის გაბერილი',
    'laptop screen cracked, no smoke, not swollen, not wet',
    'laptop screen cracked, no smoke or sparks, no water was spilled',
    'ლეპტოპის ეკრანი გატეხილია, კვამლი და ნაპერწკალი არ აქვს',
  ]) {
    const result = ask('computers', text)
    assert.doesNotMatch(result.reply, /112|არ ჩართოთ და არ დატენოთ|არ გახვრიტოთ/, text)
    assert.equal(result.assessment.service, laptopPrices.find(row => row.id === 'screen').name)
  }
})

test('English replies, warnings, assessment and sources use English catalog translations', () => {
  for (const [device, text] of [['computers', 'laptop cracked screen'], ['consoles', 'PS5 HDMI repair'], ['drones', 'DJI gimbal repair'], ['other', 'phone screen replacement'], ['other', 'UPS repair'], ['recovery', 'deleted files'], ['computers', 'desktop Windows install'], ['computers', 'laptop battery swollen']]) {
    const result = ask(device, text, 'en')
    assert.doesNotMatch(JSON.stringify(result), /[\u10A0-\u10FF\u1C90-\u1CBF]/u, text)
    assert.ok(result.assessment, text)
    assert.match(result.assessment.disclaimer, /not a diagnosis or a full quotation/)
  }
})

test('English clarification is also localized without an invented price', () => {
  const result = ask('computers', 'how much to repair the screen?', 'en')
  assert.equal(result.assessment, null)
  assert.match(result.reply, /laptop or a desktop/)
  assert.doesNotMatch(JSON.stringify(result), /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
})

test('local assistant has no network, model, credential or storage dependency', async () => {
  const source = await readFile(new URL('../src/utils/servicePriceAssistant.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|assistantApi|process\.env|import\.meta\.env|localStorage|sessionStorage/)
  assert.doesNotMatch(source, /(?:fromPrice|price)\s*:\s*\d/)
})

test('both languages omit trial labels while retaining indicative-price and inspection limitations', () => {
  for (const locale of ['ka', 'en']) for (const [device, description] of examples) {
    const result = ask(device, description, locale)
    assert.doesNotMatch(JSON.stringify(result), /დემო|სატესტო|საცდელი|\b(?:demo|trial|preview)\b|test mode/iu)
    assert.match(result.assessment.disclaimer, locale === 'ka'
      ? /საორიენტაციო პასუხია, არა დიაგნოზი ან სრული შეთავაზება/u
      : /guidance from the assistant, not a diagnosis or a full quotation/)
    assert.match(result.assessment.disclaimer, locale === 'ka'
      ? /საბოლოო ფასი და ვადა შემოწმების შემდეგ თანხმდება/u
      : /final cost and timing must be agreed after inspection/)
  }
})
