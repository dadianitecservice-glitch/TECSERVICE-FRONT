import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import { blogPageCopy } from '../src/data/blogPageCopy.ts'
import { getRouteMetadata } from '../src/utils/routes.ts'

const root = new URL('../', import.meta.url)
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), decode(value)]))
const visibleText = html => decode(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim()
const hasClass = (node, name) => (node.attributes.class ?? '').split(/\s+/).includes(name)
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

// Parse the prerendered main into a small element tree so that nesting is verified,
// not inferred from the order of class names in the document string.
function elements(html) {
  const nodes = []
  const stack = []
  for (const match of html.matchAll(/<(\/?)(([a-z][a-z0-9]*))\b[^>]*>/gi)) {
    const tag = match[2].toLowerCase()
    if (match[1]) {
      assert.equal(stack.at(-1)?.tag, tag, `Expected properly nested ${tag} markup`)
      stack.pop().end = match.index + match[0].length
      continue
    }
    const node = { tag, attributes: attributes(match[0]), parent: stack.at(-1), children: [], start: match.index, end: match.index + match[0].length }
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

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  const copy = blogPageCopy[locale]
  for (const post of getBlogPosts(locale)) {
    const path = `${prefix}/blog/${post.slug}/`

    test(`${path} keeps the sidebar beside heading, hero image and prose in one article grid with intact TOC targets`, async () => {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      assert.ok(main)
      const nodes = elements(main)
      const layouts = nodes.filter(node => hasClass(node, 'journal-article-layout'))
      assert.equal(layouts.length, 1)
      const layout = layouts[0]
      const childClasses = ['journal-article-heading', 'journal-article-image', 'journal-sidebar', 'journal-prose']
      const children = childClasses.map(name => {
        const matches = nodes.filter(node => hasClass(node, name))
        assert.equal(matches.length, 1, `${path}: one ${name}`)
        assert.equal(matches[0].parent, layout, `${path}: ${name} is a direct grid child`)
        return matches[0]
      })
      const [heading, hero, sidebar, prose] = children
      assert.equal(sidebar.tag, 'aside')
      assert.equal(heading.tag, 'header')
      assert.deepEqual(layout.children, children, `${path}: desktop grid items retain an intelligible source order`)
      const h1s = nodes.filter(node => node.tag === 'h1')
      assert.equal(h1s.length, 1)
      assert.equal(h1s[0].parent, heading)
      assert.equal(visibleText(main.slice(h1s[0].start, h1s[0].end)), post.title)
      const metadataRows = nodes.filter(node => hasClass(node, 'journal-article-meta'))
      assert.equal(metadataRows.length, 1)
      const articleDetails = metadataRows[0]
      assert.deepEqual(heading.children, [h1s[0], articleDetails], 'The article header contains H1 followed by its date and share row')
      assert.ok(articleDetails.end < hero.start, 'Date and sharing appear before the hero image')
      const headingHtml = main.slice(heading.start, heading.end)
      assert.doesNotMatch(headingHtml, /<p\b|journal-card__meta|journal-byline/)
      assert.equal(visibleText(headingHtml).includes(post.excerpt), false)
      assert.equal(visibleText(headingHtml).includes(copy.minutes(post.readMinutes)), false)
      assert.equal(nodes.some(node => hasClass(node, 'journal-author-mark')), false, 'The team avatar remains removed')
      assert.equal(visibleText(main.slice(layout.start, layout.end)).includes(copy.team), false, 'The article does not restore the team byline')
      const images = nodes.filter(node => node.tag === 'img' && inside(node, hero))
      assert.equal(images.length, 1)
      assert.equal(images[0].attributes.src, post.image)
      assert.equal(images[0].attributes.alt, post.imageAlt)

      const dates = nodes.filter(node => node.tag === 'time' && inside(node, articleDetails))
      assert.equal(dates.length, 1)
      assert.equal(dates[0].attributes.datetime, post.dateTime)
      assert.equal(visibleText(main.slice(dates[0].start, dates[0].end)), post.date)
      assert.ok(nodes.some(node => hasClass(node, 'journal-share-link') && inside(node, articleDetails)), 'Share stays beside the date above the image')
      assert.equal(inside(articleDetails, prose), false, 'Date and sharing no longer sit below the image in prose')

      const toc = nodes.find(node => hasClass(node, 'journal-toc'))
      assert.ok(toc && inside(toc, sidebar))
      const tocNavigation = nodes.find(node => node.tag === 'nav' && inside(node, toc))
      assert.ok(tocNavigation)
      assert.equal(tocNavigation.attributes['aria-label'], copy.inArticle)
      const links = nodes.filter(node => node.tag === 'a' && inside(node, tocNavigation))
      assert.deepEqual(links.map(link => link.attributes.href), post.sections.map(section => `#${section.id}`))
      assert.equal(links.filter(link => link.attributes['aria-current'] === 'location').length, 1)
      assert.equal(links[0].attributes['aria-current'], 'location', 'The initial TOC state points to the first section')
      for (const section of post.sections) {
        const targets = nodes.filter(node => node.attributes.id === section.id)
        assert.equal(targets.length, 1, `${path}: the TOC target ${section.id} is unique`)
        assert.equal(targets[0].tag, 'section')
        assert.ok(inside(targets[0], prose))
        const sectionHeading = targets[0].children.find(node => node.tag === 'h2')
        assert.ok(sectionHeading)
        assert.equal(visibleText(main.slice(sectionHeading.start, sectionHeading.end)), section.title)
      }
    })

    test(`${path} prerenders a localized collapsed mobile contents toggle controlling the existing accessible section navigation`, async () => {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      assert.ok(main)
      const nodes = elements(main)
      const toc = nodes.find(node => hasClass(node, 'journal-toc'))
      assert.ok(toc)
      assert.equal(toc.tag, 'div')
      assert.equal(toc.attributes['data-open'], 'false')
      const heading = nodes.find(node => hasClass(node, 'journal-toc__heading') && inside(node, toc))
      assert.ok(heading)
      const title = heading.children.find(node => node.tag === 'h2')
      assert.ok(title, 'The desktop contents heading remains a real heading')
      assert.ok(visibleText(main.slice(title.start, title.end)).includes(copy.inArticle))
      const toggles = nodes.filter(node => hasClass(node, 'journal-toc__toggle') && inside(node, toc))
      assert.equal(toggles.length, 1)
      const toggle = toggles[0]
      assert.equal(toggle.parent, heading)
      assert.equal(toggle.tag, 'button')
      assert.equal(toggle.attributes.type, 'button')
      assert.equal(toggle.attributes['aria-expanded'], 'false')
      assert.equal(toggle.attributes['aria-label'], copy.openContents)
      assert.equal(toggle.attributes['aria-controls'], 'article-contents')
      const controlled = nodes.filter(node => node.attributes.id === toggle.attributes['aria-controls'])
      assert.equal(controlled.length, 1, 'The toggle refers to one existing contents navigation')
      const navigation = controlled[0]
      assert.equal(navigation.tag, 'nav')
      assert.ok(inside(navigation, toc))
      assert.equal(navigation.attributes['aria-label'], copy.inArticle)
      assert.equal(navigation.attributes.hidden, undefined, 'Desktop contents stay available without a viewport-independent hidden attribute')
      assert.notEqual(navigation.attributes['aria-hidden'], 'true')
      const links = nodes.filter(node => node.tag === 'a' && inside(node, navigation))
      assert.deepEqual(links.map(node => node.attributes.href), post.sections.map(section => `#${section.id}`))
      for (const section of post.sections) {
        const target = nodes.find(node => node.attributes.id === section.id)
        assert.ok(target)
        assert.equal(target.attributes.tabindex, '-1', `${section.id} can receive focus after the mobile panel closes`)
      }
      assert.equal(nodes.some(node => inside(node, toc) && ['details', 'summary', 'select'].includes(node.tag)), false)
    })

    test(`${path} shares only its encoded public canonical article URL on Facebook with a localized accessible label`, async () => {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      assert.ok(main)
      const canonical = `https://tecservice.ge${path}`
      assert.equal(getRouteMetadata(path).canonical, canonical)
      const shares = elements(main).filter(node => hasClass(node, 'journal-share-link'))
      assert.ok(shares.length > 0)
      for (const share of shares) {
        assert.equal(share.tag, 'a')
        const { href, target, rel } = share.attributes
        const destination = new URL(href)
        assert.equal(destination.origin, 'https://www.facebook.com')
        assert.equal(destination.pathname, '/sharer/sharer.php')
        assert.equal(destination.searchParams.get('u'), canonical)
        assert.ok(href.includes(encodeURIComponent(canonical)), 'Public URL is safely encoded as a single share parameter')
        assert.equal(new URL(destination.searchParams.get('u')).hash, '')
        assert.equal(new URL(destination.searchParams.get('u')).search, '')
        assert.doesNotMatch(href, /localhost|127\.0\.0\.1|%23|#|%3F/i)
        assert.equal(target, '_blank')
        const relations = new Set((rel ?? '').split(/\s+/))
        assert.ok(relations.has('noopener'))
        assert.ok(relations.has('noreferrer'))
        const label = share.attributes['aria-label']
        assert.ok(label)
        assert.equal(label, copy.facebookShareLabel)
        assert.match(label, /Facebook/i)
        assert.match(label, locale === 'en' ? /share/i : /გაზიარ/)
        if (locale === 'en') assert.doesNotMatch(label, /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
        assert.ok(visibleText(main.slice(share.start, share.end)).length > 0, 'The share action is also visibly labelled')
      }
    })
  }
}
