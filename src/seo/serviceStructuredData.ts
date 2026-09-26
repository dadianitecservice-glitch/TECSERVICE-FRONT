import { computerBuildPrices, computerFaqs, computerPrices } from '../data/computerRepair'
import { serializeBlogStructuredData } from './blogStructuredData'
import { localeFromPath, localePath, stripLocale } from '../i18n/locale'
import { translateText } from '../i18n/translate'
import { consoleFaqs, consolePrices } from '../data/consoleRepair'
import { dataRecoveryFaqs, dataRecoveryPrices } from '../data/dataRecovery'
import { droneFaqs, dronePrices } from '../data/droneRepair'
import { laptopFaqs, laptopPrices } from '../data/laptopRepair'
import { mobileTabletFaqs, mobileTabletPrices } from '../data/mobileTabletRepair'
import { otherElectronicsFaqs, otherElectronicsPrices } from '../data/otherElectronicsRepair'
import {
  computerRepairPath,
  contactPath,
  consoleRepairPath,
  dataRecoveryPath,
  droneRepairPath,
  getRouteMetadata,
  getLegalPageKind,
  isAboutPath,
  isContactPath,
  laptopRepairPath,
  mobileTabletRepairPath,
  otherElectronicsPath,
} from '../utils/routes'

const siteUrl = 'https://tecservice.ge/'
const businessId = `${siteUrl}#business`
const websiteId = `${siteUrl}#website`

export const serviceStructuredDataAttribute = 'data-tecservice-route-schema'

type RouteMetadata = NonNullable<ReturnType<typeof getRouteMetadata>>
type FaqEntry = { question: string; answer: string }
type RawPrice = {
  id: string
  name: string
  category?: string
  fromPrice?: number
  priceKind?: 'from' | 'fixed'
  price?: string
  priceLabel?: string
  priceNote?: string
  duration: string
}

type ServiceDefinition = {
  path: string
  name: string
  breadcrumbName: string
  serviceType: string[]
  pricingAnchor: string
  faqAnchor: string
  prices: readonly RawPrice[]
  faqs: readonly FaqEntry[]
}

const computerAssemblyPrices: RawPrice[] = computerBuildPrices.map((item, index) => ({
  id: `assembly-${index + 1}`,
  name: item.name,
  category: 'assembly',
  price: item.price,
  duration: item.duration,
}))

const serviceDefinitions: ServiceDefinition[] = [
  {
    path: laptopRepairPath,
    name: 'ლეპტოპების შეკეთება',
    breadcrumbName: 'ლეპტოპები',
    serviceType: ['ლეპტოპების დიაგნოსტიკა', 'ლეპტოპების ტექნიკური შეკეთება', 'ლეპტოპების პროგრამული მომსახურება'],
    pricingAnchor: 'laptop-prices',
    faqAnchor: 'laptop-faq',
    prices: laptopPrices,
    faqs: laptopFaqs,
  },
  {
    path: computerRepairPath,
    name: 'კომპიუტერების შეკეთება და აწყობა',
    breadcrumbName: 'კომპიუტერები',
    serviceType: ['კომპიუტერების დიაგნოსტიკა', 'კომპიუტერების შეკეთება', 'კომპიუტერების აწყობა და განახლება'],
    pricingAnchor: 'computer-prices',
    faqAnchor: 'computer-faq',
    prices: [...computerPrices, ...computerAssemblyPrices],
    faqs: computerFaqs,
  },
  {
    path: dataRecoveryPath,
    name: 'ინფორმაციის აღდგენა',
    breadcrumbName: 'ინფორმაციის აღდგენა',
    serviceType: ['HDD-დან ინფორმაციის აღდგენა', 'SSD-დან ინფორმაციის აღდგენა', 'RAID, NAS, USB და SD მონაცემების აღდგენა'],
    pricingAnchor: 'data-recovery-prices',
    faqAnchor: 'data-recovery-faq',
    prices: dataRecoveryPrices,
    faqs: dataRecoveryFaqs,
  },
  {
    path: consoleRepairPath,
    name: 'კონსოლების შეკეთება',
    breadcrumbName: 'კონსოლები',
    serviceType: ['PlayStation-ის შეკეთება', 'Xbox-ის შეკეთება', 'Nintendo Switch-ის შეკეთება', 'კონტროლერების შეკეთება'],
    pricingAnchor: 'console-prices',
    faqAnchor: 'console-faq',
    prices: consolePrices,
    faqs: consoleFaqs,
  },
  {
    path: droneRepairPath,
    name: 'დრონების დიაგნოსტიკა და შეკეთება',
    breadcrumbName: 'დრონები',
    serviceType: ['DJI დრონების შეკეთება', 'FPV დრონების შეკეთება', 'დრონის გიმბალისა და კამერის შეკეთება'],
    pricingAnchor: 'drone-prices',
    faqAnchor: 'drone-faq',
    prices: dronePrices,
    faqs: droneFaqs,
  },
  {
    path: mobileTabletRepairPath,
    name: 'მობილურებისა და პლანშეტების შეკეთება',
    breadcrumbName: 'მობილურები და პლანშეტები',
    serviceType: ['მობილური ტელეფონების შეკეთება', 'პლანშეტების შეკეთება', 'ეკრანის, ბატარეისა და დამტენის პორტის შეკეთება'],
    pricingAnchor: 'mobile-tablet-prices',
    faqAnchor: 'mobile-tablet-faq',
    prices: mobileTabletPrices,
    faqs: mobileTabletFaqs,
  },
  {
    path: otherElectronicsPath,
    name: 'ელექტრონული პლატებისა და არასტანდარტული ტექნიკის შეკეთება',
    breadcrumbName: 'სხვა ელექტრონიკა',
    serviceType: [
      'ინდუსტრიული და იმპულსური კვების ბლოკების შეკეთება',
      'UPS-ის, ინვერტორისა და ძაბვის სტაბილიზატორის შეკეთება',
      'სამრეწველო დანადგარების მართვის პლატების შეკეთება',
      'CNC, ლაზერული და 3D პრინტერების პლატების შეკეთება',
      'დამტენი სადგურებისა და BMS პლატების შეკეთება',
      'პრინტერებისა და ასლგადამღები მოწყობილობების პლატების შეკეთება',
      'აუდიო აპარატურის ელექტრონული კვანძების შეკეთება',
      'მონიტორების, ტელევიზორებისა და LED ეკრანების პლატების შეკეთება',
      'ტელევიზორის LED განათების შეცვლა და შეკეთება',
      'ვიდეომეთვალყურეობის, დაშვების კონტროლისა და სიგნალიზაციის მოწყობილობების შეკეთება',
      'არასტანდარტული ელექტრონული მოწყობილობების კომპონენტური შეკეთება',
    ],
    pricingAnchor: 'other-electronics-prices',
    faqAnchor: 'other-electronics-faq',
    prices: otherElectronicsPrices,
    faqs: otherElectronicsFaqs,
  },
]

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function getDefinition(pathname: string) {
  const normalizedPath = normalizePath(stripLocale(pathname))
  return serviceDefinitions.find((definition) => definition.path === normalizedPath)
}

function parseDisplayedPrice(displayedPrice: string) {
  const match = displayedPrice.match(/(\d+(?:[.,]\d+)?)\s*₾\s*(-დან)?/)
  if (!match) return null
  return {
    amount: Number(match[1].replace(',', '.')),
    isFromPrice: Boolean(match[2]),
  }
}

function getDisplayedPrice(price: RawPrice) {
  if (price.price) return price.price
  if (price.priceLabel) return price.priceLabel
  if (typeof price.fromPrice === 'number') {
    return `${price.fromPrice} ₾${price.priceKind === 'from' ? '-დან' : ''}`
  }
  return 'დიაგნოსტიკის შემდეგ'
}

function categoryLabel(category?: string) {
  if (category === 'software') return 'პროგრამული მომსახურება'
  if (category === 'assembly') return 'კომპიუტერის აწყობა'
  return 'ტექნიკური მომსახურება'
}

function createOffer(price: RawPrice, canonical: string, pricingAnchor: string) {
  const displayedPrice = getDisplayedPrice(price)
  const parsedPrice = typeof price.fromPrice === 'number'
    ? { amount: price.fromPrice, isFromPrice: price.priceKind === 'from' }
    : parseDisplayedPrice(displayedPrice)
  const itemId = `${canonical}#priced-service-${price.id}`
  const common = {
    '@id': `${canonical}#offer-${price.id}`,
    url: `${canonical}#${pricingAnchor}`,
    name: price.name,
    category: categoryLabel(price.category),
    description: [
      `ფასი: ${displayedPrice}.`,
      `სავარაუდო ვადა: ${price.duration}.`,
      price.priceNote ? `${price.priceNote}.` : '',
    ].filter(Boolean).join(' '),
    seller: { '@id': businessId },
    itemOffered: {
      '@type': 'Service',
      '@id': itemId,
      name: price.name,
      provider: { '@id': businessId },
      areaServed: { '@type': 'City', name: 'თბილისი' },
    },
  }

  if (!parsedPrice) {
    return {
      '@type': 'Offer',
      ...common,
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'GEL',
        description: displayedPrice,
      },
    }
  }

  if (parsedPrice.isFromPrice) {
    return {
      '@type': 'Offer',
      ...common,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: parsedPrice.amount,
        priceCurrency: 'GEL',
        description: `საწყისი საორიენტაციო ფასი: ${displayedPrice}`,
      },
    }
  }

  return {
    '@type': 'Offer',
    ...common,
    price: parsedPrice.amount,
    priceCurrency: 'GEL',
  }
}

function localBusinessSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': businessId,
    name: 'TECSERVICE',
    alternateName: 'ტექსერვისი',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}assets/brand/tecservice-favicon-v2.png`,
      contentUrl: `${siteUrl}assets/brand/tecservice-favicon-v2.png`,
      width: 256,
      height: 256,
    },
    image: `${siteUrl}assets/blog/laptop-repair-figma.png`,
    description: 'ტექნიკის პროფესიონალური შეკეთება, დიაგნოსტიკა და ინფორმაციის აღდგენა თბილისში.',
    telephone: '+995591474040',
    areaServed: { '@type': 'City', name: 'თბილისი' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+995591474040',
      contactType: 'customer service',
      areaServed: 'GE',
      availableLanguage: ['ka'],
    },
    foundingDate: '2002',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ცოტნე დადიანის 7ბ/2',
      addressLocality: 'თბილისი',
      addressCountry: 'GE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.7188516,
      longitude: 44.8036156,
    },
    hasMap: 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '11:00',
        closes: '18:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/tecservice.ge/',
      'https://www.instagram.com/tecservice__/',
      'https://www.tiktok.com/@tec__service',
      'https://www.youtube.com/@techservicege',
    ],
  }
}

export function getServiceStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  const definition = getDefinition(pathname)
  if (!definition || !routeMetadata) return null

  const metadata = routeMetadata as RouteMetadata
  const canonical = metadata.canonical
  const webpageId = `${canonical}#webpage`
  const serviceId = `${canonical}#service`
  const breadcrumbId = `${canonical}#breadcrumb`
  const faqId = `${canonical}#faq`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      localBusinessSchema(),
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: 'TECSERVICE',
        alternateName: ['ტექსერვისი', 'tecservice.ge'],
        inLanguage: 'ka',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'WebPage',
        '@id': webpageId,
        url: canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: 'ka',
        isPartOf: { '@id': websiteId },
        about: { '@id': serviceId },
        mainEntity: { '@id': serviceId },
        breadcrumb: { '@id': breadcrumbId },
        hasPart: { '@id': faqId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: metadata.image,
          contentUrl: metadata.image,
          width: Number(metadata.imageWidth),
          height: Number(metadata.imageHeight),
          caption: metadata.imageAlt,
        },
      },
      {
        '@type': 'Service',
        '@id': serviceId,
        url: canonical,
        name: definition.name,
        description: metadata.description,
        serviceType: definition.serviceType,
        provider: { '@id': businessId },
        areaServed: { '@type': 'City', name: 'თბილისი' },
        mainEntityOfPage: { '@id': webpageId },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          '@id': `${canonical}#price-catalog`,
          name: `${definition.name} — ფასები და სავარაუდო ვადები`,
          url: `${canonical}#${definition.pricingAnchor}`,
          itemListElement: definition.prices.map((price) => createOffer(price, canonical, definition.pricingAnchor)),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'მთავარი', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: definition.breadcrumbName, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': faqId,
        url: `${canonical}#${definition.faqAnchor}`,
        name: `${definition.name} — ხშირად დასმული კითხვები`,
        inLanguage: 'ka',
        isPartOf: { '@id': webpageId },
        mainEntity: definition.faqs.map((faq, index) => ({
          '@type': 'Question',
          '@id': `${canonical}#faq-${index + 1}`,
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }
}

export function serializeServiceStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  const structuredData = getServiceStructuredData(pathname, routeMetadata)
  return structuredData ? JSON.stringify(localizeStructuredData(structuredData, pathname)).replace(/</g, '\\u003c') : null
}

export function getContactStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  if (!isContactPath(pathname) || !routeMetadata) return null

  const metadata = routeMetadata as RouteMetadata
  const canonical = metadata.canonical
  const webpageId = `${canonical}#contact-page`
  const breadcrumbId = `${canonical}#breadcrumb`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      localBusinessSchema(),
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: 'TECSERVICE',
        alternateName: ['ტექსერვისი', 'tecservice.ge'],
        inLanguage: 'ka',
        publisher: { '@id': businessId },
      },
      {
        '@type': 'ContactPage',
        '@id': webpageId,
        url: canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: 'ka',
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
        mainEntity: { '@id': businessId },
        breadcrumb: { '@id': breadcrumbId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: metadata.image,
          contentUrl: metadata.image,
          width: Number(metadata.imageWidth),
          height: Number(metadata.imageHeight),
          caption: metadata.imageAlt,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'მთავარი', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'კონტაქტი', item: `${siteUrl}${contactPath.slice(1)}/` },
        ],
      },
    ],
  }
}

export function serializeRouteStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  const blogSchema = serializeBlogStructuredData(pathname, routeMetadata)
  if (blogSchema) return blogSchema
  const structuredData = getServiceStructuredData(pathname, routeMetadata)
    ?? getContactStructuredData(pathname, routeMetadata)
    ?? getAboutStructuredData(pathname, routeMetadata)
    ?? getLegalStructuredData(pathname, routeMetadata)
    ?? (localeFromPath(pathname) === 'en' && stripLocale(pathname) === '/' && routeMetadata ? {
      '@context': 'https://schema.org',
      '@graph': [
        localBusinessSchema(),
        { '@type': 'WebSite', '@id': websiteId, url: siteUrl, name: 'TECSERVICE', inLanguage: 'en', publisher: { '@id': businessId } },
        { '@type': 'WebPage', '@id': `${routeMetadata.canonical}#webpage`, url: routeMetadata.canonical, name: routeMetadata.title, description: routeMetadata.description, inLanguage: 'en', isPartOf: { '@id': websiteId }, about: { '@id': businessId }, mainEntity: { '@id': `${routeMetadata.canonical}#services` } },
        {
          '@type': 'ItemList', '@id': `${routeMetadata.canonical}#services`,
          name: 'ჩვენი სერვისები', numberOfItems: serviceDefinitions.length,
          itemListElement: serviceDefinitions.map((service, index) => ({
            '@type': 'ListItem', position: index + 1,
            item: {
              '@type': 'Service',
              '@id': `${siteUrl.slice(0, -1)}${service.path}/#service`,
              name: service.name,
              url: `${siteUrl.slice(0, -1)}${service.path}/`,
              provider: { '@id': businessId },
            },
          })),
        },
      ],
    } : null)
  return structuredData ? JSON.stringify(localizeStructuredData(structuredData, pathname)).replace(/</g, '\\u003c') : null
}

export function getLegalStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  if (!getLegalPageKind(pathname) || !routeMetadata) return null
  const locale = localeFromPath(pathname)
  const canonical = routeMetadata.canonical
  return {
    '@context': 'https://schema.org',
    '@graph': [
      localBusinessSchema(),
      { '@type': 'WebSite', '@id': websiteId, url: siteUrl, name: 'TECSERVICE', inLanguage: locale, publisher: { '@id': businessId } },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: routeMetadata.title, description: routeMetadata.description, inLanguage: locale, isPartOf: { '@id': websiteId }, breadcrumb: { '@id': `${canonical}#breadcrumb` } },
      { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [
        { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'მთავარი', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: routeMetadata.title.replace(' | TECSERVICE', ''), item: canonical },
      ] },
    ],
  }
}

export function getAboutStructuredData(pathname: string, routeMetadata = getRouteMetadata(pathname)) {
  if (!isAboutPath(pathname) || !routeMetadata) return null

  const metadata = routeMetadata as RouteMetadata
  const canonical = metadata.canonical
  const webpageId = `${canonical}#about-page`
  const breadcrumbId = `${canonical}#breadcrumb`
  const locale = localeFromPath(pathname)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      localBusinessSchema(),
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: 'TECSERVICE',
        alternateName: ['ტექსერვისი', 'tecservice.ge'],
        inLanguage: locale,
        publisher: { '@id': businessId },
      },
      {
        '@type': 'AboutPage',
        '@id': webpageId,
        url: canonical,
        name: metadata.title,
        description: metadata.description,
        inLanguage: locale,
        isPartOf: { '@id': websiteId },
        about: { '@id': businessId },
        mainEntity: { '@id': businessId },
        breadcrumb: { '@id': breadcrumbId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: metadata.image,
          contentUrl: metadata.image,
          width: Number(metadata.imageWidth),
          height: Number(metadata.imageHeight),
          caption: metadata.imageAlt,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': breadcrumbId,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'მთავარი', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: locale === 'en' ? 'About us' : 'ჩვენს შესახებ', item: canonical },
        ],
      },
    ],
  }
}

function localizeStructuredData(value: unknown, pathname: string, key = ''): unknown {
  if (localeFromPath(pathname) !== 'en') return value
  if (typeof value === 'string') {
    if (key === 'inLanguage') return 'en'
    if (value.startsWith(siteUrl) && !value.includes('/assets/') && !value.endsWith('#business') && !value.endsWith('#website')) {
      return `${siteUrl.slice(0, -1)}${localePath(value.slice(siteUrl.length - 1), 'en')}`
    }
    return translateText(value, 'en')
  }
  if (Array.isArray(value)) return value.map(item => localizeStructuredData(item, pathname, key))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, localizeStructuredData(item, pathname, name)]))
  return value
}

export function applyServiceStructuredData(pathname: string) {
  document.querySelectorAll(`script[${serviceStructuredDataAttribute}]`).forEach((script) => script.remove())
  const json = serializeRouteStructuredData(pathname)
  if (!json) return

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.setAttribute(serviceStructuredDataAttribute, '')
  script.textContent = json
  document.head.append(script)
}
