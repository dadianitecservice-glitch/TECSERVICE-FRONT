import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'
import { reviews, reviewSummary, googleReviewsUrl, getGoogleReviewUrl } from '../src/data/reviews.ts'
import { translateText } from '../src/i18n/translate.ts'

const recentNames = [
  'barbare goradze',
  'Natalia Strydom',
  'La Dio',
  'Tsotne Khutsishvili',
  'Nano Tenoshvili',
  'George Ediberidze',
  'Mariam Gogiberidze',
]
const textNames = recentNames.filter(name => name !== 'Tsotne Khutsishvili')
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const source = await readFile(new URL('../src/sections/ReviewsSection.tsx', import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const find = (node, predicate) => Array.isArray(node)
  ? node.flatMap(child => find(child, predicate))
  : node?.props ? [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)] : []
const text = node => Array.isArray(node) ? node.map(text).join('')
  : node?.props ? text(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
let instance = 0

// Exercise the actual selector and read-more handlers. Only browser-dependent
// hooks are replaced; review data and translations remain the real modules.
async function reviewDriver(locale = 'ka') {
  const id = ++instance
  const hooksUrl = moduleUrl(`/* reviews ${id} */
    const slots = [];
    let cursor = 0;
    export const begin = () => { cursor = 0; };
    export const useEffect = () => {};
    export const useMemo = factory => factory();
    export function useRef(value) {
      const index = cursor++;
      return slots[index] ??= { current: value };
    }
    export function useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    }
  `)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../components/CarouselControls': moduleUrl('export const CarouselControls = () => null;'),
    '../data/reviews': new URL('../src/data/reviews.ts', import.meta.url).href,
    '../utils/text': new URL('../src/utils/text.ts', import.meta.url).href,
    '../hooks/useViewportWidth': moduleUrl('export const useViewportWidth = () => 390;'),
    '../hooks/useResponsiveHome': moduleUrl('export const useResponsiveHome = () => true;'),
    '../hooks/useSwipeCarousel': moduleUrl('export const useSwipeCarousel = () => ({ref:{current:null},onScroll(){},move(){}});'),
    '../i18n/LocaleProvider': moduleUrl(`
      import { translateText } from ${JSON.stringify(new URL('../src/i18n/translate.ts', import.meta.url).href)};
      export const useTranslation = () => ({locale:${JSON.stringify(locale)},t:value=>translateText(value,${JSON.stringify(locale)})});
    `),
  }
  let { code } = await transformWithOxc(source, '/ReviewsSection.tsx', { jsx: { runtime: 'automatic' } })
  for (const [key, value] of Object.entries(replacements)) code = code.replaceAll(JSON.stringify(key), JSON.stringify(value))
  const { ReviewsSection } = await import(moduleUrl(code))
  const hooks = await import(hooksUrl)
  let tree
  const render = () => { hooks.begin(); tree = ReviewsSection(); return tree }
  render()
  return {
    render,
    nodes: predicate => find(tree, predicate),
    cards: () => find(tree, node => node.type === 'article' && node.props.className === 'review-card'),
  }
}

test('the verified Google summary is independent of the preserved local review archive', () => {
  assert.equal(reviewSummary.publicReviewCount, 149)
  assert.equal(reviewSummary.rating, 4.8)
  assert.equal(new Set(reviews.map(review => review.id)).size, reviews.length)
  assert.ok(reviews.every(review => typeof review.id === 'string' && review.id.trim()))
  assert.ok(reviews.length >= 149, 'Preserving earlier snapshots must not require inventing or deleting reviews to match the public total')
  assert.equal(new URL(googleReviewsUrl).hostname, 'www.google.com')
  assert.ok(new URL(googleReviewsUrl).pathname.startsWith('/maps/'))
})

test('all seven newly confirmed reviewers are included once with their real five-star rating', () => {
  for (const name of recentNames) {
    const matches = reviews.filter(review => review.customerName === name)
    assert.equal(matches.length, 1, name)
    const review = matches[0]
    assert.equal(review.rating, 5, name)
    assert.ok(review.date.trim(), `${name}: preserve the observed date label`)
    assert.match(review.sourceLabel, /Google Maps/)
  }
  assert.equal(reviews.find(review => review.customerName === 'Tsotne Khutsishvili').text, '')
  for (const name of textNames) assert.ok(reviews.find(review => review.customerName === name).text.trim(), name)
})

test('the six new written reviews translate fully in English without changing Georgian originals', () => {
  for (const name of textNames) {
    const review = reviews.find(item => item.customerName === name)
    assert.ok(review, name)
    for (const field of ['customerName', 'text', 'date', 'sourceLabel']) {
      assert.doesNotMatch(translateText(review[field], 'en'), georgian, `${name}: ${field}`)
      assert.equal(translateText(review[field], 'ka'), review[field], `${name}: ${field}`)
    }
  }
})

test('each archived review gets its own Google destination at the verified business in both languages', () => {
  const urls = new Set()
  for (const locale of ['ka', 'en']) {
    for (const review of reviews) {
      const href = getGoogleReviewUrl(review.id, locale)
      const url = new URL(href)
      assert.equal(url.origin, 'https://www.google.com')
      assert.equal(url.pathname, `/maps/reviews/data=!4m6!14m5!1m4!2m3!1s${review.id}!2m1!1s0x40440d318fe65ddd:0xc417758abd3c535c`)
      assert.deepEqual([...url.searchParams], [['hl', locale]])
      assert.equal(url.hash, '')
      assert.notEqual(href, googleReviewsUrl, 'An author must not simply open the general business listing')
      urls.add(href)
    }
  }
  assert.equal(urls.size, reviews.length * 2)
  assert.equal(getGoogleReviewUrl(reviews[0].id), getGoogleReviewUrl(reviews[0].id, 'ka'))
})

test('review identifiers stay one encoded Maps field and cannot inject path tokens or query parameters', () => {
  for (const id of [
    'review!2m1!1sother-business',
    'review?hl=en&redirect=https://example.com/#fragment',
    '../another/path\\with spaces',
    'review%21%3F%26%23',
    'შეფასება!ქართულად?hl=xx',
  ]) {
    for (const locale of ['ka', 'en']) {
      const url = new URL(getGoogleReviewUrl(id, locale))
      const fields = url.pathname.slice('/maps/reviews/data='.length).split('!')
      assert.equal(url.origin, 'https://www.google.com')
      assert.ok(url.pathname.startsWith('/maps/reviews/data='))
      assert.deepEqual(fields.slice(0, 5), ['', '4m6', '14m5', '1m4', '2m3'])
      assert.equal(fields.length, 8, id)
      assert.ok(fields[5].startsWith('1s'))
      assert.equal(decodeURIComponent(fields[5].slice(2)), id)
      assert.deepEqual(fields.slice(6), ['2m1', '1s0x40440d318fe65ddd:0xc417758abd3c535c'])
      assert.deepEqual([...url.searchParams], [['hl', locale]])
      assert.equal(url.hash, '')
    }
  }
})

for (const locale of ['ka', 'en']) {
  test(`${locale} every card and expanded-review author links safely to that specific Google review`, async () => {
    const driver = await reviewDriver(locale)
    const assertAuthor = (container, review) => {
      const links = find(container, node => node.type === 'a' && node.props.className === 'review-author-link')
      assert.equal(links.length, 1, review.customerName)
      const link = links[0]
      assert.equal(text(link), translateText(review.customerName, locale))
      assert.equal(link.props.href, getGoogleReviewUrl(review.id, locale))
      assert.equal(link.props.target, '_blank')
      const rel = new Set(link.props.rel.split(/\s+/))
      assert.ok(rel.has('noopener') && rel.has('noreferrer'))
      assert.equal(link.props.title, locale === 'en'
        ? 'Read this review on Google Maps — opens in a new tab'
        : 'ამ შეფასების ნახვა Google Maps-ზე — იხსნება ახალ ჩანართში')
      assert.equal(find(container, node => node.type === 'strong' && find(node, child => child === link).length).length, 1,
        'The author retains the original strong styling and the modal label remains intact')
      return link
    }
    for (const card of driver.cards()) {
      const review = reviews.find(item => item.id === card.key)
      assert.ok(review, card.key)
      const cardAuthor = assertAuthor(card, review)
      const opener = find(card, node => node.props.className === 'review-card__more')[0]
      if (!opener) continue
      opener.props.onClick({ currentTarget: {} })
      driver.render()
      const dialog = driver.nodes(node => node.props.role === 'dialog')[0]
      assert.ok(dialog)
      assert.equal(dialog.props['aria-labelledby'], 'review-modal-author')
      assert.equal(assertAuthor(dialog, review).props.href, cardAuthor.props.href)
      const label = find(dialog, node => node.props.id === 'review-modal-author')[0]
      assert.equal(text(label), translateText(review.customerName, locale))
      find(dialog, node => node.props.className === 'review-modal__close')[0].props.onClick()
      driver.render()
    }
  })

  test(`${locale} review carousel includes the six new written reviews and excludes the rating-only entry`, async () => {
    const driver = await reviewDriver(locale)
    const cards = driver.cards()
    assert.equal(cards.length, 45, 'Keep the previous 39 cards and add only the six confirmed new written reviews')
    assert.ok(!cards.some(card => text(card).includes('beka makadze')), 'Do not unexpectedly surface an older long review')
    for (const name of textNames) {
      assert.equal(cards.filter(card => text(card).includes(name)).length, 1, name)
    }
    assert.ok(!cards.some(card => text(card).includes('Tsotne Khutsishvili')))
    const summary = driver.nodes(node => node.props.className === 'reviews-google-summary')[0]
    assert.match(text(summary), /4\.8/)
    assert.match(text(summary), /149 Google/)
    assert.equal(summary.props.href, googleReviewsUrl)
  })

  test(`${locale} long Natalia and Nano reviews retain their full text in the existing read-more dialog`, async () => {
    const driver = await reviewDriver(locale)
    for (const name of ['Natalia Strydom', 'Nano Tenoshvili']) {
      const review = reviews.find(item => item.customerName === name)
      assert.ok(review.text.length > 420, `${name}: this regression must exercise the former length cutoff`)
      assert.equal(review.featured, true, `${name}: long new feedback is explicitly selected`)
      const card = driver.cards().find(node => text(node).includes(name))
      assert.ok(card, name)
      const opener = find(card, node => node.type === 'button' && node.props.className === 'review-card__more')[0]
      assert.ok(opener, `${name}: a clamped card keeps its full-text control`)
      assert.equal(opener.props.type, 'button')
      opener.props.onClick({ currentTarget: {} })
      driver.render()
      const dialog = driver.nodes(node => node.props.role === 'dialog')[0]
      assert.ok(dialog, name)
      assert.equal(dialog.props['aria-modal'], 'true')
      assert.equal(text(find(dialog, node => node.type === 'p')[0]), translateText(review.text, locale))
      assert.equal(text(find(dialog, node => node.props.id === 'review-modal-author')[0]), name)
      const close = find(dialog, node => node.type === 'button' && node.props.className === 'review-modal__close')[0]
      close.props.onClick()
      driver.render()
      assert.equal(driver.nodes(node => node.props.role === 'dialog').length, 0)
    }
  })
}
