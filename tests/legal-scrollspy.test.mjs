import test from 'node:test'
import assert from 'node:assert/strict'
import { getActiveSectionId } from '../src/utils/sectionNavigation.ts'
import { legalDocuments } from '../src/data/legalPages.ts'

const sections = Object.freeze([
  Object.freeze({ id: 'scope', top: 100 }),
  Object.freeze({ id: 'diagnostics', top: 600 }),
  Object.freeze({ id: 'prices', top: 1100 }),
  Object.freeze({ id: 'device-data', top: 1600 }),
])

test('legal scrollspy returns an empty id when no sections exist, including at page end', () => {
  assert.equal(getActiveSectionId([], 132), '')
  assert.equal(getActiveSectionId([], 132, true), '')
})

test('legal scrollspy selects the first section before content reaches the activation line', () => {
  assert.equal(getActiveSectionId(sections, -200), 'scope')
  assert.equal(getActiveSectionId(sections, 0), 'scope')
  assert.equal(getActiveSectionId(sections, 99), 'scope')
  assert.equal(getActiveSectionId(sections, 100), 'scope')
})

test('legal scrollspy switches exactly at each section activation threshold', () => {
  for (let index = 1; index < sections.length; index++) {
    const section = sections[index]
    assert.equal(getActiveSectionId(sections, section.top - 0.01), sections[index - 1].id)
    assert.equal(getActiveSectionId(sections, section.top), section.id)
    assert.equal(getActiveSectionId(sections, section.top + 0.01), section.id)
  }
})

test('legal scrollspy retains the latest section between headings and after the final heading', () => {
  assert.equal(getActiveSectionId(sections, 350), 'scope')
  assert.equal(getActiveSectionId(sections, 850), 'diagnostics')
  assert.equal(getActiveSectionId(sections, 1350), 'prices')
  assert.equal(getActiveSectionId(sections, 2200), 'device-data')
})

test('legal scrollspy matches direct anchor geometry below the sticky header', () => {
  const activationTop = 132
  for (const target of sections) {
    const anchored = sections.map(section => ({
      id: section.id,
      top: section.top - target.top + activationTop,
    }))
    assert.equal(getActiveSectionId(anchored, activationTop), target.id)
  }
})

test('legal scrollspy selects the final section at page end even when its heading cannot reach the activation line', () => {
  assert.equal(getActiveSectionId(sections, 132, true), 'device-data')
  assert.equal(getActiveSectionId(sections, 132, false), 'scope')
  assert.equal(getActiveSectionId(sections, 2400, true), 'device-data')
  assert.equal(getActiveSectionId([{ id: 'only', top: 800 }], 132, true), 'only')
})

test('legal scrollspy updates deterministically while scrolling down and back up without mutating sections', () => {
  const cases = [
    [0, 'scope'], [550, 'diagnostics'], [1050, 'prices'], [1550, 'device-data'],
    [1050, 'prices'], [550, 'diagnostics'], [0, 'scope'],
  ]
  for (const [scrollY, expected] of cases) {
    const visible = Object.freeze(sections.map(section => Object.freeze({ id: section.id, top: section.top - scrollY })))
    const before = JSON.stringify(visible)
    assert.equal(getActiveSectionId(visible, 132), expected)
    assert.equal(getActiveSectionId(visible, 132), expected)
    assert.equal(JSON.stringify(visible), before)
  }
})

for (const locale of ['ka', 'en']) {
  test(`${locale} online-feature and privacy copy stays neutral about backend integration`, () => {
    const online = legalDocuments[locale].terms.sections.find(section => section.id === 'online-tools')
    const privacy = legalDocuments[locale].privacy.sections.find(section => section.id === 'service-status')
    assert.ok(online)
    assert.ok(privacy)
    assert.ok(online.paragraphs.length >= 2)
    assert.ok(online.paragraphs.every(paragraph => paragraph.trim().length > 40))
    const onlineText = online.paragraphs.join(' ')
    assert.doesNotMatch(onlineText, /demo(?:nstration)?|database|დემო|ბაზა|ბაზასთან|ბაზის/iu)
    const privacyText = privacy.paragraphs.join(' ')
    assert.doesNotMatch(`${privacy.title} ${privacyText}`, /demo(?:nstration)?|database|დემო|ბაზასთან|SMS/iu)
    assert.equal(privacy.paragraphs.length, 2)
    if (locale === 'ka') {
      assert.match(onlineText, /სტატუს|შეკვეთ/)
      assert.match(privacyText, /კოდი ან ტელეფონის ნომერი/)
      assert.match(privacyText, /შეიყვანეთ მხოლოდ თქვენი/)
      assert.match(privacyText, /არ გაუზიაროთ სხვა პირებს/)
      assert.match(privacyText, /დაგვიკავშირდით/)
    } else {
      assert.match(onlineText, /status|order/i)
      assert.match(privacyText, /service code or phone number/i)
      assert.match(privacyText, /Enter only your own/i)
      assert.match(privacyText, /Do not share/i)
      assert.match(privacyText, /Contact us/i)
    }
  })
}
