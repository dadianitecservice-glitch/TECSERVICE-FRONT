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
    for (const id of ['customer-account', 'account-records', 'product-comments']) {
      sectionText('ka', kind, id)
      assert.doesNotMatch(sectionText('en', kind, id), /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
    }
  }
})

for (const locale of ['ka', 'en']) {
  const ka = locale === 'ka'

  test(`${locale} account terms explain required phone, optional email, approval and primary-phone changes`, () => {
    const text = sectionText(locale, 'terms', 'customer-account')
    for (const pattern of ka
      ? [/მობილურის ნომერი აუცილებელია/u, /ელფოსტა კი არასავალდებულოა/u, /შემოწმებისა და დამტკიცების შემდეგ/u, /კაბინეტიდან არ იცვლება/u, /დაიცავით პაროლი/u]
      : [/mobile number is required/i, /email is optional/i, /checked and approved/i, /cannot be changed from your account/i, /Keep your password private/]) assert.match(text, pattern)
  })

  test(`${locale} terms cover account documents and public-comment conduct without promising automatic moderation`, () => {
    const records = sectionText(locale, 'terms', 'account-records')
    const comments = sectionText(locale, 'terms', 'product-comments')
    assert.match(records, ka ? /გაცემული ინვოისები/u : /issued invoices/)
    assert.match(records, ka ? /თავისთავად გადახდას არ ნიშნავს/u : /does not itself mean that payment has been made/)
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

  test(`${locale} privacy distinguishes public comments from private records and states deletion limits`, () => {
    const text = sectionText(locale, 'privacy', 'product-comments')
    assert.match(text, ka ? /ავტორიზაციის გარეშე/u : /without signing in/)
    assert.match(text, ka ? /სახელი.*თარიღი/u : /author name.*date/)
    assert.match(text, ka ? /საჯარო მონაცემებში არ შედის/u : /not included in public comment data/)
    assert.match(text, ka ? /თავად ტექსტში ჩაწერილი ინფორმაცია საჯაროდ გამოჩნდება/u : /information you enter in the comment text will be public/)
    assert.match(text, ka ? /ეკრანის სურათს/u : /screenshots/)
    assert.match(sectionText(locale, 'privacy', 'account-records'), ka ? /არ ინახავს საბანკო ბარათს/u : /does not collect card numbers.*store bank cards/)
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
