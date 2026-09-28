import test from 'node:test'
import assert from 'node:assert/strict'
import { legalDocuments, legalDocumentsApproved } from '../src/data/legalPages.ts'

function sectionText(locale, kind, id) {
  const section = legalDocuments[locale][kind].sections.find(item => item.id === id)
  assert.ok(section, `${locale}/${kind} must contain ${id}`)
  assert.ok(section.title.trim())
  assert.ok(section.paragraphs.length)
  assert.ok(section.paragraphs.every(paragraph => paragraph.trim()))
  return section.paragraphs.join(' ')
}

test('legal account additions keep translated section parity without changing publication approval', () => {
  assert.equal(legalDocumentsApproved, false)
  for (const kind of ['terms', 'privacy']) {
    const kaIds = legalDocuments.ka[kind].sections.map(section => section.id)
    const enIds = legalDocuments.en[kind].sections.map(section => section.id)
    assert.deepEqual(kaIds, enIds)
    assert.equal(new Set(kaIds).size, kaIds.length)
    for (const id of kaIds) {
      sectionText('ka', kind, id)
      assert.doesNotMatch(sectionText('en', kind, id), /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
    }
  }
})

for (const locale of ['ka', 'en']) {
  const ka = locale === 'ka'

  test(`${locale} legal titles, metadata and content omit demo/trial labels while retaining assistant limitations`, () => {
    for (const kind of ['terms', 'privacy']) {
      assert.doesNotMatch(JSON.stringify(legalDocuments[locale][kind]), /დემო|სატესტო|საცდელი|\b(?:demo|trial|preview)\b|test mode/iu)
    }
    const online = sectionText(locale, 'terms', 'online-tools')
    assert.match(online, ka ? /პასუხს ბრაუზერში ამზადებს/u : /prepares responses in your browser/)
    assert.match(online, ka ? /არა მოწყობილობის დიაგნოსტიკა, საბოლოო შეთავაზება ან შეკვეთის გაფორმება/u : /not a device diagnosis, a final quote or an order booking/)
    assert.match(online, ka ? /ფოტოს ატვირთვა.*ხელმისაწვდომი არ არის/u : /Photo upload is not available/)
    assert.match(sectionText(locale, 'privacy', 'browser-storage'), ka ? /ჯერ დადასტურებული არ არის/u : /not yet been confirmed/)
  })

  test(`${locale} account terms explain required phone, optional email, approval and primary-phone changes`, () => {
    const text = sectionText(locale, 'terms', 'customer-account')
    for (const pattern of ka
      ? [/მობილურის ნომერი აუცილებელია/u, /ელფოსტა კი არასავალდებულოა/u, /შემოწმებისა და დამტკიცების შემდეგ/u, /კაბინეტიდან არ იცვლება/u, /დაიცავით პაროლი/u]
      : [/mobile number is required/i, /email is optional/i, /checked and approved/i, /cannot be changed from your account/i, /Keep your password private/]) assert.match(text, pattern)
  })

  test(`${locale} service complaints give a usable contact without inventing a response deadline`, () => {
    const text = sectionText(locale, 'terms', 'handover')
    assert.match(text, /\+995 591 47 40 40/)
    assert.match(text, /WhatsApp/)
    assert.match(text, ka ? /პაროლებისა და პირადი ფაილების გამოგზავნა საჭირო არ არის/u : /do not need to send passwords or private files/)
    assert.match(text, ka ? /არ ზღუდავს მომხმარებლის კანონით გათვალისწინებულ უფლებებს/u : /does not limit the customer’s statutory rights/)
    assert.doesNotMatch(text, /24\s*(?:საათ|hours)|48\s*(?:საათ|hours)/iu)
  })

  test(`${locale} privacy explains conditional rights and the current complaint authority`, () => {
    const text = sectionText(locale, 'privacy', 'rights')
    for (const pattern of ka
      ? [/ასლის მიღება/u, /დამუშავების შეწყვეტა/u, /დაბლოკვა/u, /გადატანაც/u, /თანხმობა გამოიხმოთ/u, /ადამიანის მონაწილეობა/u, /პირობები ან გამონაკლისები/u, /სახელმწიფო აუდიტის სამსახურს ან სასამართლოს/u]
      : [/copy of your data/, /cessation of processing/, /blocking/, /transfer of your data/, /withdraw consent/, /human involvement/, /conditions or exceptions/, /State Audit Office of Georgia or a court/]) assert.match(text, pattern)
    assert.match(text, /\+995 591 47 40 40/)
    assert.match(text, /WhatsApp/)
    assert.doesNotMatch(text, /პერსონალურ მონაცემთა დაცვის სამსახურს|Personal Data Protection Service/iu)
    assert.doesNotMatch(text, /@|mailto:|within \d+ hours|\d+ საათში/iu, 'Do not invent an owner email or a complaint-response promise')
  })

  test(`${locale} terms cover account documents and public-comment conduct without promising automatic moderation`, () => {
    const records = sectionText(locale, 'terms', 'account-records')
    const comments = sectionText(locale, 'terms', 'product-comments')
    assert.match(records, ka ? /გაცემული ინვოისები/u : /issued invoices/)
    assert.match(records, ka ? /თავისთავად გადახდას არ ნიშნავს/u : /does not itself mean that payment has been made/)
    assert.match(records, ka ? /ამჟამად ბარათის შენახვა და გადახდა ხელმისაწვდომი არ არის/u : /storing cards and processing payments are currently unavailable/)
    assert.doesNotMatch(records, /მხოლოდ ვიზუალურია|visual only/iu)
    assert.match(comments, ka ? /შეცვლა ან წაშლა/u : /edit or delete/)
    assert.match(comments, ka ? /სპამი.*სხვისი პირადი ინფორმაცია/u : /spam.*another person’s private information/)
    assert.doesNotMatch(comments, ka ? /ავტომატურად (?:მოწმდება|იფილტრება)/u : /automatically (?:screened|moderated|filtered)/i)
  })

  test(`${locale} privacy identifies optional profile/address data and the password hash`, () => {
    const text = sectionText(locale, 'privacy', 'customer-account')
    for (const pattern of ka
      ? [/სახელი და გვარი/u, /მობილურის ნომერი/u, /ელფოსტა/u, /ჰეში და არა ღია ტექსტი/u, /პირადი ნომრის დამატება არასავალდებულოა/u, /დასახელება, ქალაქი და მისამართი/u]
      : [/full name/, /mobile number/, /email/, /password hash, not the plain text/, /identification number.*optional/, /address label, city and street address/]) assert.match(text, pattern)
  })

  test(`${locale} personal ID has the owner-confirmed invoice purpose without becoming required for registration`, () => {
    const privacy = sectionText(locale, 'privacy', 'customer-account')
    const terms = sectionText(locale, 'terms', 'account-records')
    for (const text of [privacy, terms]) {
      assert.match(text, ka ? /ინვოისებისა და შესაბამისი დოკუმენტების მოსამზადებლად/u : /for preparing invoices and related documents/)
      assert.doesNotMatch(text, ka ? /ყველა ინვოისისთვის.*სავალდებულო|კანონით სავალდებულოა/u : /required by law|mandatory for (?:every|all) invoices/iu)
    }
    assert.match(privacy, ka ? /არასავალდებულოა და რეგისტრაციისთვის საჭირო არ არის/u : /optional and is not required for registration/)
    assert.match(privacy, ka ? /კონკრეტული დოკუმენტისთვის მისი საჭიროება წინასწარ დააზუსტეთ/u : /Check in advance whether it is needed for a particular document/)
  })

  test(`${locale} privacy distinguishes public comments from private records and states deletion limits`, () => {
    const text = sectionText(locale, 'privacy', 'product-comments')
    assert.match(text, ka ? /ავტორიზაციის გარეშე/u : /without signing in/)
    assert.match(text, ka ? /სახელი.*თარიღი/u : /author name.*date/)
    assert.match(text, ka ? /საჯარო მონაცემებში არ შედის/u : /not included in public comment data/)
    assert.match(text, ka ? /თავად ტექსტში ჩაწერილი ინფორმაცია საჯაროდ გამოჩნდება/u : /information you enter in the comment text will be public/)
    assert.match(text, ka ? /ეკრანის სურათს/u : /screenshots/)
    assert.match(sectionText(locale, 'privacy', 'account-records'), ka ? /არ ინახავს საბანკო ბარათს/u : /does not collect card numbers.*store bank cards/)
    assert.match(sectionText(locale, 'privacy', 'account-records'), ka ? /არ აგროვებს ბარათის ნომერს, მოქმედების ვადას ან CVV-ს/u : /does not collect card numbers, expiry dates or CVVs/)
  })

  test(`${locale} local-assistant privacy is distinct from the sign-in cookie and does not invent retention periods`, () => {
    const assistant = sectionText(locale, 'privacy', 'assistant')
    const browser = sectionText(locale, 'privacy', 'browser-storage')
    assert.match(assistant, ka ? /მიმდინარე გვერდის დროებით მეხსიერებაში/u : /current page’s temporary memory/)
    assert.match(assistant, ka ? /სერვისების შვიდი გვერდის ფასებს/u : /prices and information from the seven service pages/)
    assert.match(assistant, ka ? /არც ჩვენს სერვერს და არც გარე AI მომწოდებელს არ ეგზავნება/u : /does not send your question or conversation to our server or an external AI provider/)
    assert.match(browser, /tecservice_session/)
    assert.match(browser, /HttpOnly/)
    assert.match(browser, ka ? /ტექნიკური ჟურნალები/u : /technical logs/)
    assert.doesNotMatch(assistant + browser, /tecservice-ai-session/)
    const retention = sectionText(locale, 'privacy', 'retention')
    assert.match(retention, ka ? /შეკვეთის დასრულებიდან 5 წლის/u : /5 years after the order is completed/)
    assert.match(retention, ka ? /გადაცემიდან 1 კვირის/u : /1 week after they are handed over/)
    assert.match(retention, ka ? /ავტომატურად არ ვრცელდება ანგარიშზე/u : /does not automatically apply to accounts/)
  })
}
