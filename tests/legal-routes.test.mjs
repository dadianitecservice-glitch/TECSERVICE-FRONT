import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getLegalPageKind, getRouteMetadata, isKnownPublicPath } from '../src/utils/routes.ts'
import { legalDocuments, legalDocumentsApproved } from '../src/data/legalPages.ts'

const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const root = new URL('../', import.meta.url)
const sitemap = await readFile(new URL('dist/sitemap.xml', root), 'utf8')

test('legal routes accept only their exact KA/EN paths', () => {
  for (const prefix of ['', '/en']) for (const kind of ['terms', 'privacy']) {
    for (const suffix of ['', '/']) {
      assert.equal(getLegalPageKind(`${prefix}/${kind}${suffix}`), kind)
      assert.equal(isKnownPublicPath(`${prefix}/${kind}${suffix}`), true)
    }
  }
  for (const path of ['/terms/example/', '/privacy-policy/', '/en/terms//', '/about/']) {
    assert.equal(getLegalPageKind(path), null)
  }
})

for (const locale of ['ka', 'en']) for (const kind of ['terms', 'privacy']) {
  const path = `${locale === 'en' ? '/en' : ''}/${kind}/`
  const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
  const metadata = getRouteMetadata(path)
  const content = legalDocuments[locale][kind]

  function sectionTextVariants(id) {
    const section = content.sections.find(item => item.id === id)
    assert.ok(section, `${path} must include its ${id} section`)
    const rendered = html.match(new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`))?.[0]
    assert.ok(rendered, `${path} must prerender its ${id} section`)
    return [
      ['source', section.paragraphs.join(' ')],
      ['prerender', rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')],
    ]
  }

  test(`${path} has its own complete translated page and operator details`, () => {
    assert.equal((html.match(/<main\b/g) ?? []).length, 1)
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
    assert.match(html, /<header\b/)
    assert.match(html, /<footer\b/)
    assert.match(html, /427740000/)
    assert.equal((html.match(/class="legal-page__section"/g) ?? []).length, content.sections.length)
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    assert.equal(new Set(ids).size, ids.length)
    for (const section of content.sections) {
      assert.ok(html.includes(`href="#${section.id}"`))
      assert.ok(html.includes(`id="${section.id}"`))
      assert.ok(html.includes(`aria-labelledby="${section.id}-title"`))
    }
    if (locale === 'en') {
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      const head = html.match(/<head\b[\s\S]*?<\/head>/)?.[0]
      assert.ok(main)
      assert.ok(head)
      assert.doesNotMatch(main, georgian, 'English legal content must be fully translated')
      assert.doesNotMatch(head, georgian, 'English metadata and structured data must be fully translated')
      // The Georgian language switch intentionally retains its native-language label.
      assert.match(html, /hrefLang="ka" lang="ka" aria-label="ქართული"/)
      const withoutNativeLanguageLabel = html.replace(/aria-label="ქართული"/g, 'aria-label="Georgian"')
      assert.doesNotMatch(withoutNativeLanguageLabel, georgian, 'Shared English page content must also remain translated')
    }
    else assert.match(html, /შპს „სქაინეთ დისტრიბიუშენი“/)
  })

  test(`${path} has canonical, language alternates and matching structured data`, () => {
    assert.ok(html.includes(`<html lang="${locale}">`))
    assert.ok(html.includes(`<title>${metadata.title}</title>`))
    assert.ok(html.includes(`<link rel="canonical" href="https://tecservice.ge${path}"`))
    assert.ok(html.includes(`hreflang="ka" href="https://tecservice.ge/${kind}/"`))
    assert.ok(html.includes(`hreflang="en" href="https://tecservice.ge/en/${kind}/"`))
    const json = html.match(/<script type="application\/ld\+json" data-tecservice-route-schema>([\s\S]*?)<\/script>/)?.[1]
    assert.ok(json)
    const webpage = JSON.parse(json)['@graph'].find(item => item['@type'] === 'WebPage')
    assert.equal(webpage.url, metadata.canonical)
    assert.equal(webpage.inLanguage, locale)
  })

  test(`${path} keeps localized footer links and draft indexing without a public review banner`, () => {
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]
    for (const destination of ['terms', 'privacy']) {
      assert.ok(footer.includes(`href="${locale === 'en' ? '/en' : ''}/${destination}/"`))
    }
    assert.equal(legalDocumentsApproved, false)
    assert.doesNotMatch(html, /class="legal-page__draft"|Draft for review\.|სამუშაო ვერსია\. გამოქვეყნებამდე/)
    assert.match(html, /name="robots" content="noindex, follow"/)
    assert.equal(sitemap.includes(`https://tecservice.ge${path}`), false)
  })

  if (kind === 'privacy') {
    test(`${path} limits the contract and pre-contract processing basis to necessary service data`, () => {
      const expectedStatement = locale === 'ka'
        ? 'თქვენი მოთხოვნით მომსახურების შესათანხმებლად ან შეთანხმებული სამუშაოს შესასრულებლად აუცილებელი მონაცემების დამუშავების საფუძველია მომსახურების შეთანხმება ან თქვენთან დადებული გარიგების შესრულება.'
        : 'Where data is necessary to arrange service at your request or carry out agreed work, it is processed on the basis of taking steps to enter into a service agreement or performing that agreement with you.'
      const blanketConsent = locale === 'ka'
        ? /საიტის (?:გამოყენებით|მონახულებით)[^.]*თანხმდებით[^.]*ყველა (?:პერსონალური |პირადი )?მონაცემ/u
        : /by (?:using|visiting) (?:this|the) (?:website|site)[^.]*consent[^.]*all (?:personal )?data/iu
      for (const [variant, text] of sectionTextVariants('contact-data')) {
        assert.ok(text.includes(expectedStatement), `${path} ${variant} must limit the processing basis to data necessary for requested or agreed service`)
        assert.doesNotMatch(text, blanketConsent, `${path} ${variant} must not turn website use into blanket consent for all data`)
      }
    })

    test(`${path} distinguishes local trial questions from account cookies and hosting logs`, () => {
      for (const [variant, text] of sectionTextVariants('assistant')) {
        assert.match(text, locale === 'ka' ? /ბრაუზერში.*დროებით მეხსიერებაში/u : /in your browser.*temporary memory/iu, variant)
        assert.match(text, locale === 'ka' ? /არ (?:ეგზავნება|აგზავნის)/u : /does not send your question/iu, variant)
        assert.match(text, locale === 'ka' ? /ფოტოს ან სხვა ფაილის ატვირთვა ამ ვერსიაში არ არის/u : /Photo and other file uploads are unavailable/iu, variant)
        assert.doesNotMatch(text, /tecservice-ai-session/, variant)
      }
      for (const [variant, text] of sectionTextVariants('browser-storage')) {
        assert.match(text, /tecservice_session/, `${variant} must disclose the real authentication cookie`)
        assert.match(text, /HttpOnly/, variant)
        assert.match(text, locale === 'ka' ? /ტექნიკური ჟურნალები/u : /technical logs/iu, variant)
        assert.match(text, locale === 'ka' ? /ჯერ დადასტურებული არ არის/u : /not yet been confirmed/iu, variant)
        assert.doesNotMatch(text, /tecservice-ai-session/, variant)
      }
    })

    test(`${path} retains order history for five years from order completion and recovered files for one week from handover`, () => {
      const retention = content.sections.find(section => section.id === 'retention')
      assert.ok(retention, 'Privacy content must include its retention section')
      const expectedStatements = locale === 'ka'
        ? [
            'შეკვეთების ისტორია ინახება შეკვეთის დასრულებიდან 5 წლის განმავლობაში.',
            'ეს ვადა ეხება მხოლოდ შეკვეთების ისტორიას და არ ვრცელდება მოწყობილობიდან აღდგენილ პირად ფაილებზე.',
          ]
        : [
            'Order history is retained for 5 years after the order is completed.',
            'This period applies only to order history, not to personal files recovered from a device.',
          ]
      const sourceText = retention.paragraphs.join(' ')
      const renderedRetention = html.match(/<section\b(?=[^>]*\bid="retention")[^>]*>[\s\S]*?<\/section>/)?.[0]
      assert.ok(renderedRetention, 'The retention section must be present in the prerendered privacy page')
      for (const statement of expectedStatements) {
        assert.ok(sourceText.includes(statement), `Missing scoped retention statement in ${locale} source: ${statement}`)
        assert.ok(renderedRetention.includes(statement), `Missing scoped retention statement in ${path} prerender: ${statement}`)
      }
      const recoveredFilePeriod = locale === 'ka'
        ? /მოწყობილობიდან აღდგენილი პირადი ფაილები ინახება მომხმარებლისთვის გადაცემიდან 1 კვირის განმავლობაში\./u
        : /Personal files recovered from a device are retained for 1 week after they are handed over to the customer\./u
      assert.match(sourceText, recoveredFilePeriod, 'Recovered personal files must be retained for one week starting at handover to the customer in source')
      assert.match(renderedRetention, recoveredFilePeriod, 'The prerendered section must state one-week retention starting at handover to the customer')
    })

    test(`${path} limits order-system contact data by role without claiming technician access to full customer details`, () => {
      const expectedStatements = locale === 'ka'
        ? [
            'შეკვეთების სისტემაში მომხმარებლის სრულ საკონტაქტო მონაცემებზე წვდომა აქვთ მხოლოდ ფილიალის მენეჯერებსა და ხელმძღვანელს.',
            'ტექნიკოსებისთვის ხელმისაწვდომია მხოლოდ მომხმარებლის სახელი და მოწყობილობის დასახელება.',
          ]
        : [
            'Within the order-management system, full customer contact details are accessible only to branch managers and the head of the company.',
            'Technicians can see only the customer’s name and the device name.',
          ]
      for (const [variant, text] of sectionTextVariants('retention')) {
        for (const statement of expectedStatements) {
          assert.ok(text.includes(statement), `${path} ${variant} must retain the order-system role restriction: ${statement}`)
        }
      }
    })
  }

  if (kind === 'terms') {
    test(`${path} scopes the diagnostic fee to identified repairable faults and price-based refusal with costs agreed beforehand`, () => {
      const expectedStatements = locale === 'ka'
        ? [
            'დიაგნოსტიკის საფასური და მისი გადახდის პირობები მომხმარებელთან წინასწარ თანხმდება.',
            'თუ დაზიანების მიზეზი დადგენილია, შეკეთება შესაძლებელია და მომხმარებელი შეთავაზებული ღირებულების გამო შეკეთებაზე უარს ამბობს, დიაგნოსტიკის საფასური გადასახდელია.',
            'თუ დაზიანების მიზეზის დადგენა ვერ ხერხდება, დიაგნოსტიკა უფასოა.',
            'სხვა შემთხვევებში დიაგნოსტიკის გადახდის პირობები ინდივიდუალურად, სამუშაოს დაწყებამდე თანხმდება.',
          ]
        : [
            'The diagnostic fee and its payment conditions are agreed with the customer in advance.',
            'If the cause of the fault has been identified, repair is possible and the customer declines the repair because of the quoted price, the diagnostic fee is payable.',
            'If the cause of the fault cannot be identified, diagnostics are free of charge.',
            'In other cases, diagnostic payment conditions are agreed individually before work begins.',
          ]
      for (const [variant, text] of sectionTextVariants('diagnostics')) {
        for (const statement of expectedStatements) {
          assert.ok(text.includes(statement), `${path} ${variant} must retain the agreed diagnostic condition: ${statement}`)
        }
      }
    })

    test(`${path} communicates individual warranty terms before repair without restricting statutory rights`, () => {
      const expectedStatements = locale === 'ka'
        ? [
            'დამატებითი გარანტიის არსებობა, ვადა და პირობები განისაზღვრება ინდივიდუალურად, კონკრეტული სამუშაოსა და გამოყენებული ნაწილის მიხედვით.',
            'მომხმარებელს პირობები ეცნობება შეკეთების დაწყებამდე.',
            'დამატებითი გარანტიის არარსებობა არ ზღუდავს მომხმარებლის კანონით გათვალისწინებულ უფლებებს.',
          ]
        : [
            'The availability, duration and terms of any additional warranty are determined individually, depending on the particular work and parts used.',
            'Customers are informed of these terms before the repair begins.',
            'The absence of an additional warranty does not limit the customer’s statutory rights.',
          ]
      for (const [variant, text] of sectionTextVariants('handover')) {
        for (const statement of expectedStatements) {
          assert.ok(text.includes(statement), `${path} ${variant} must retain the individual warranty condition: ${statement}`)
        }
      }
    })
  }
}
