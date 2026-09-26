import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { legalDocuments } from '../src/data/legalPages.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.toLowerCase().startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const visibleText = html => decode(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim()
const hasClass = (node, name) => (node.attributes.class ?? '').split(/\s+/).includes(name)
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

// Keep parent relationships so a second contact block, or a TOC nested in the
// legal body, cannot pass simply because the expected classes are present.
function elements(html) {
  const nodes = []
  const stack = []
  for (const match of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi)) {
    const tag = match[2].toLowerCase()
    if (match[1]) {
      assert.equal(stack.at(-1)?.tag, tag, `Expected properly nested ${tag} markup`)
      stack.pop().end = match.index + match[0].length
      continue
    }
    const opening = match[0].replace(/^<[^\s/>]+/, '').replace(/\/?\s*>$/, '')
    const attributes = Object.fromEntries([...opening.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [name.toLowerCase(), decode(value ?? '')]))
    const node = { tag, attributes, parent: stack.at(-1), children: [], start: match.index, end: match.index + match[0].length }
    node.parent?.children.push(node)
    nodes.push(node)
    if (!voidTags.has(tag) && !match[0].endsWith('/>')) stack.push(node)
  }
  assert.equal(stack.length, 0)
  return nodes
}

function inside(node, parent) {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (ancestor === parent) return true
  return false
}

for (const locale of ['ka', 'en']) for (const kind of ['terms', 'privacy']) {
  const prefix = locale === 'en' ? '/en' : ''
  const path = `${prefix}/${kind}/`
  const content = legalDocuments[locale][kind]
  const contentsLabel = locale === 'en' ? 'On this page' : 'ამ გვერდზე'
  const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
  const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
  assert.ok(main, `${path} has its own main content`)
  const nodes = elements(main)
  const text = node => visibleText(main.slice(node.start, node.end))
  const oneClass = name => {
    const matches = nodes.filter(node => hasClass(node, name))
    assert.equal(matches.length, 1, `${path} has one ${name}`)
    return matches[0]
  }

  test(`${path} places its contents and single contact card together beside the legal body`, () => {
    const layout = oneClass('legal-page__layout')
    const sidebar = oneClass('legal-page__sidebar')
    const body = oneClass('legal-page__body')
    assert.equal(sidebar.tag, 'aside')
    assert.deepEqual(layout.children, [sidebar, body])
    const contents = oneClass('legal-page__contents')
    const contact = oneClass('legal-page__contact')
    assert.equal(contents.parent, sidebar)
    assert.equal(contact.parent, sidebar)
    assert.ok(contents.end <= contact.start, 'Contact follows the contents in the sidebar')
    assert.equal(inside(contact, body), false)
    const contactHeading = nodes.find(node => node.attributes.id === contact.attributes['aria-labelledby'])
    assert.ok(contactHeading && inside(contactHeading, contact))
    assert.equal(contactHeading.tag, 'h2')
    assert.equal(text(contactHeading), locale === 'en' ? 'Have a question?' : 'გაქვთ შეკითხვა?')
    const contactParagraphs = contact.children.filter(node => node.tag === 'p')
    assert.deepEqual(contactParagraphs.map(text), [locale === 'en'
      ? 'Contact us to clarify service or data-related questions.'
      : 'მომსახურების ან მონაცემების შესახებ კითხვების დასაზუსტებლად დაგვიკავშირდით.'])
    const contactLink = oneClass('legal-page__button')
    assert.equal(contactLink.tag, 'a')
    assert.ok(inside(contactLink, contact))
    assert.equal(contactLink.attributes.href, `${prefix}/contact/`)
    assert.equal(text(contactLink), locale === 'en' ? 'Contact us' : 'დაგვიკავშირდით')
    const related = oneClass('legal-page__related')
    const otherKind = kind === 'terms' ? 'privacy' : 'terms'
    assert.ok(inside(related, body))
    assert.equal(related.attributes.href, `${prefix}/${otherKind}/`)
    assert.equal(text(related), legalDocuments[locale][otherKind].title)
  })

  test(`${path} renders a localized contents heading, count and accessible collapsed mobile control`, () => {
    const contents = oneClass('legal-page__contents')
    assert.equal(contents.attributes['data-open'], 'false')
    const heading = oneClass('legal-page__contents-heading')
    assert.ok(inside(heading, contents))
    const icon = oneClass('legal-page__contents-icon')
    assert.equal(icon.parent, heading)
    assert.equal(icon.attributes['aria-hidden'], 'true')
    assert.ok(icon.children.some(node => node.tag === 'svg'))
    const label = oneClass('legal-page__contents-label')
    assert.equal(label.parent, heading)
    assert.equal(label.tag, 'h2')
    const count = label.children.find(node => node.tag === 'small')
    assert.ok(count)
    assert.equal(text(count), `${content.sections.length} ${locale === 'en' ? 'sections' : 'საკითხი'}`)
    assert.equal(visibleText(main.slice(label.start, count.start)), contentsLabel)
    const toggle = oneClass('legal-page__contents-toggle')
    assert.equal(toggle.parent, heading)
    assert.equal(toggle.tag, 'button')
    assert.equal(toggle.attributes.type, 'button')
    assert.equal(toggle.attributes['aria-expanded'], 'false')
    assert.equal(toggle.attributes['aria-label'], locale === 'en' ? 'Open page contents' : 'სარჩევის გახსნა')
    assert.ok(toggle.attributes['aria-controls'])
    const controlled = nodes.filter(node => node.attributes.id === toggle.attributes['aria-controls'])
    assert.equal(controlled.length, 1)
    const navigation = controlled[0]
    assert.equal(navigation.tag, 'nav')
    assert.ok(inside(navigation, contents))
    assert.equal(navigation.attributes['aria-label'], contentsLabel)
    assert.equal(Object.hasOwn(navigation.attributes, 'hidden'), false, 'Desktop contents remain available without a viewport-independent hidden attribute')
    assert.notEqual(navigation.attributes['aria-hidden'], 'true')
    const links = nodes.filter(node => node.tag === 'a' && inside(node, navigation))
    assert.deepEqual(links.map(node => node.attributes.href), content.sections.map(section => `#${section.id}`))
    assert.equal(links.filter(node => node.attributes['aria-current'] === 'location').length, 1)
    assert.equal(links[0].attributes['aria-current'], 'location')
    for (const [index, link] of links.entries()) {
      const number = link.children.find(node => hasClass(node, 'legal-page__contents-number'))
      const sectionLabel = link.children.find(node => hasClass(node, 'legal-page__contents-text'))
      assert.ok(number && sectionLabel)
      assert.equal(number.attributes['aria-hidden'], 'true')
      assert.equal(text(number), String(index + 1).padStart(2, '0'))
      assert.equal(text(sectionLabel), content.sections[index].title)
    }
  })

  test(`${path} keeps every legal paragraph and unique focusable section target intact`, () => {
    const body = oneClass('legal-page__body')
    const ids = nodes.map(node => node.attributes.id).filter(Boolean)
    assert.equal(new Set(ids).size, ids.length, 'All page IDs remain unique')
    const sections = nodes.filter(node => hasClass(node, 'legal-page__section'))
    assert.deepEqual(sections.map(node => node.attributes.id), content.sections.map(section => section.id))
    for (const [index, section] of content.sections.entries()) {
      const target = sections[index]
      assert.equal(target.tag, 'section')
      assert.equal(target.parent, body)
      assert.equal(target.attributes.tabindex, '-1', `${section.id} receives focus after selecting a mobile contents link`)
      assert.equal(target.attributes['aria-labelledby'], `${section.id}-title`)
      const heading = target.children.find(node => node.tag === 'h2')
      assert.ok(heading)
      assert.equal(heading.attributes.id, `${section.id}-title`)
      assert.equal(text(heading), locale === 'en' ? section.title : toGeorgianMtavruli(section.title))
      assert.deepEqual(target.children.filter(node => node.tag === 'p').map(text), section.paragraphs)
    }
  })
}
