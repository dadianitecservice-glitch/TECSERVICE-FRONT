import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { computerBuildPrices, computerFaqs, computerPrices } from '../src/data/computerRepair.ts'
import { consoleFaqs, consolePrices } from '../src/data/consoleRepair.ts'
import { dataRecoveryFaqs, dataRecoveryPrices } from '../src/data/dataRecovery.ts'
import { droneFaqs, dronePrices } from '../src/data/droneRepair.ts'
import { laptopFaqs, laptopPrices } from '../src/data/laptopRepair.ts'
import { mobileTabletFaqs, mobileTabletPrices } from '../src/data/mobileTabletRepair.ts'
import { otherElectronicsFaqs, otherElectronicsPrices } from '../src/data/otherElectronicsRepair.ts'
import {
  computerRepairPath,
  consoleRepairPath,
  dataRecoveryPath,
  droneRepairPath,
  getRouteMetadata,
  laptopRepairPath,
  mobileTabletRepairPath,
  otherElectronicsPath,
} from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)
const businessId = 'https://tecservice.ge/#business'
const websiteId = 'https://tecservice.ge/#website'

const computerAssemblyPrices = computerBuildPrices.map((item, index) => ({
  id: `assembly-${index + 1}`,
  name: item.name,
  price: item.price,
  duration: item.duration,
}))

const pages = [
  { path: laptopRepairPath, prices: laptopPrices, faqs: laptopFaqs },
  { path: computerRepairPath, prices: [...computerPrices, ...computerAssemblyPrices], faqs: computerFaqs },
  { path: dataRecoveryPath, prices: dataRecoveryPrices, faqs: dataRecoveryFaqs },
  { path: consoleRepairPath, prices: consolePrices, faqs: consoleFaqs },
  { path: droneRepairPath, prices: dronePrices, faqs: droneFaqs },
  { path: mobileTabletRepairPath, prices: mobileTabletPrices, faqs: mobileTabletFaqs },
  { path: otherElectronicsPath, prices: otherElectronicsPrices, faqs: otherElectronicsFaqs },
]

function extractStructuredData(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1, 'Each service HTML document must have exactly one JSON-LD graph')
  return JSON.parse(scripts[0][1])
}

function findByType(graph, type) {
  return graph.find((item) => item['@type'] === type)
}

async function readRouteStructuredData(path) {
  const html = await readFile(new URL(`dist${path}/index.html`, root), 'utf8')
  return { html, structuredData: extractStructuredData(html) }
}

function parsedVisiblePrice(item) {
  const displayed = item.price
    ?? item.priceLabel
    ?? `${item.fromPrice} ₾${item.priceKind === 'from' ? '-დან' : ''}`
  const match = displayed.match(/(\d+(?:[.,]\d+)?)\s*₾\s*(-დან)?/)
  return match
    ? { amount: Number(match[1].replace(',', '.')), isFrom: Boolean(match[2]) || item.priceKind === 'from' }
    : null
}

test('all seven completed service routes prerender their page-specific JSON-LD graph', async () => {
  for (const page of pages) {
    const metadata = getRouteMetadata(page.path)
    assert.ok(metadata)
    const { html, structuredData } = await readRouteStructuredData(page.path)
    assert.match(html, /<script type="application\/ld\+json" data-tecservice-route-schema>/)
    assert.equal(structuredData['@context'], 'https://schema.org')

    const graph = structuredData['@graph']
    const business = findByType(graph, 'LocalBusiness')
    const website = findByType(graph, 'WebSite')
    const webpage = findByType(graph, 'WebPage')
    const service = findByType(graph, 'Service')
    const breadcrumb = findByType(graph, 'BreadcrumbList')
    const faqPage = findByType(graph, 'FAQPage')

    for (const entity of [business, website, webpage, service, breadcrumb, faqPage]) assert.ok(entity)
    assert.equal(business['@id'], businessId)
    assert.equal(business.telephone, '+995591474040')
    assert.deepEqual(business.address, {
      '@type': 'PostalAddress',
      streetAddress: 'ცოტნე დადიანის 7ბ/2',
      addressLocality: 'თბილისი',
      addressCountry: 'GE',
    })
    assert.equal(business.openingHoursSpecification[0].opens, '10:00')
    assert.equal(business.openingHoursSpecification[0].closes, '19:00')
    assert.deepEqual(business.openingHoursSpecification[1].dayOfWeek, ['Saturday'])
    assert.equal(business.openingHoursSpecification[1].opens, '11:00')
    assert.equal(business.openingHoursSpecification[1].closes, '17:00')

    assert.equal(website['@id'], websiteId)
    assert.deepEqual(website.publisher, { '@id': businessId })
    assert.equal(webpage['@id'], `${metadata.canonical}#webpage`)
    assert.equal(webpage.url, metadata.canonical)
    assert.equal(webpage.description, metadata.description)
    assert.deepEqual(webpage.mainEntity, { '@id': `${metadata.canonical}#service` })
    assert.deepEqual(webpage.breadcrumb, { '@id': `${metadata.canonical}#breadcrumb` })
    assert.deepEqual(webpage.hasPart, { '@id': `${metadata.canonical}#faq` })

    assert.equal(service['@id'], `${metadata.canonical}#service`)
    assert.equal(service.url, metadata.canonical)
    assert.deepEqual(service.provider, { '@id': businessId })
    assert.equal(service.areaServed.name, 'თბილისი')
    assert.ok(service.serviceType.length >= 3)

    assert.deepEqual(
      breadcrumb.itemListElement.map(({ position, item }) => ({ position, item })),
      [
        { position: 1, item: 'https://tecservice.ge/' },
        { position: 2, item: metadata.canonical },
      ],
    )

    assert.equal(faqPage.mainEntity.length, page.faqs.length)
    faqPage.mainEntity.forEach((question, index) => {
      assert.equal(question.name, page.faqs[index].question)
      assert.equal(question.acceptedAnswer.text, page.faqs[index].answer)
      assert.ok(html.includes(page.faqs[index].question))
      assert.ok(html.includes(page.faqs[index].answer))
    })
  }
})

test('service OfferCatalog data matches every visible price without turning from-prices into fixed prices', async () => {
  for (const page of pages) {
    const { structuredData } = await readRouteStructuredData(page.path)
    const service = findByType(structuredData['@graph'], 'Service')
    const offers = service.hasOfferCatalog.itemListElement

    assert.equal(offers.length, page.prices.length)
    page.prices.forEach((priceItem, index) => {
      const offer = offers[index]
      const parsedPrice = parsedVisiblePrice(priceItem)
      assert.equal(offer.name, priceItem.name)
      assert.equal(offer.seller['@id'], businessId)
      assert.equal(offer.itemOffered.name, priceItem.name)
      assert.equal(offer.itemOffered.provider['@id'], businessId)
      assert.ok(offer.description.includes(priceItem.duration))

      if (!parsedPrice) {
        assert.equal(offer['@type'], 'Offer')
        assert.equal('price' in offer, false)
        assert.equal('lowPrice' in offer, false)
        assert.equal(offer.priceSpecification.priceCurrency, 'GEL')
      } else if (parsedPrice.isFrom) {
        assert.equal(offer['@type'], 'Offer')
        assert.equal(offer.priceSpecification['@type'], 'PriceSpecification')
        assert.equal(offer.priceSpecification.minPrice, parsedPrice.amount)
        assert.equal(offer.priceSpecification.priceCurrency, 'GEL')
        assert.equal('price' in offer, false, `${priceItem.name} must remain a from-price`)
      } else {
        assert.equal(offer['@type'], 'Offer')
        assert.equal(offer.price, parsedPrice.amount)
        assert.equal(offer.priceCurrency, 'GEL')
        assert.equal('lowPrice' in offer, false)
      }
    })
  }
})

test('service graphs do not invent ratings, price ranges or unavailable high prices', async () => {
  for (const page of pages) {
    const { structuredData } = await readRouteStructuredData(page.path)
    const json = JSON.stringify(structuredData)
    assert.doesNotMatch(json, /aggregateRating|reviewRating|priceRange|highPrice/)
  }
})
