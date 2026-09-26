import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Children } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import { products } from '../src/data/products.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const source = await read('src/components/ProductCard.tsx')
const { code } = await transformWithOxc(source, '/ProductCard.tsx', { jsx: { runtime: 'automatic' } })

async function cardComponent(locale) {
  const localeModule = moduleUrl(`
    import { translateValue, localizedHref } from ${JSON.stringify(new URL('src/i18n/translate.ts', root).href)};
    export const useTranslation = () => ({
      locale: ${JSON.stringify(locale)},
      t: value => translateValue(value, ${JSON.stringify(locale)}),
      href: value => localizedHref(value, ${JSON.stringify(locale)})
    });
  `)
  const replacements = {
    react: moduleUrl('export const useState = initial => [initial, () => {}];'),
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': localeModule,
    '../utils/text': new URL('src/utils/text.ts', root).href,
    '../utils/formatPrice': new URL('src/utils/formatPrice.ts', root).href,
    './ProductCommentsDialog': moduleUrl('export function ProductCommentsDialog() { return null; }'),
  }
  let executable = code
  for (const [specifier, target] of Object.entries(replacements)) {
    executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(target))
  }
  return (await import(moduleUrl(executable))).ProductCard
}

function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return []
  return [
    ...(predicate(tree) ? [tree] : []),
    ...Children.toArray(tree.props?.children).flatMap(child => nodes(child, predicate)),
  ]
}

function content(tree) {
  if (tree == null || typeof tree === 'boolean') return ''
  if (typeof tree !== 'object') return String(tree)
  return Children.toArray(tree.props?.children).map(content).join('')
}

test('Homepage cards do not import or render the unsolicited comments trigger or dialog', async () => {
  assert.doesNotMatch(source, /ProductCommentsDialog|commentsOpen|setCommentsOpen|product-card__comments/)
  assert.doesNotMatch(await read('src/styles/customer-comments.css'), /\.product-card__comments\b/)
})

for (const locale of ['ka', 'en']) {
  const ProductCard = await cardComponent(locale)

  test(`Every ${locale} homepage product retains its purchase and compare controls in the original third grid row`, () => {
    assert.ok(products.length >= 12, 'Cover both desktop rows and carousel products')
    for (const product of products) {
      const tree = ProductCard({ product })
      const copy = nodes(tree, node => node.props.className === 'product-card__copy')[0]
      assert.ok(copy, product.id)
      assert.deepEqual(Children.toArray(copy.props.children).map(node => node.props.className), [
        `product-card__price${product.oldPrice ? ' is-sale' : ''}`,
        'product-card__name',
        'product-card__actions',
      ], `${product.id}: no extra row may displace the purchase controls`)

      const actions = Children.toArray(copy.props.children)[2]
      const actionChildren = Children.toArray(actions.props.children)
      assert.equal(actionChildren.length, 2, product.id)
      const [compare, buy] = actionChildren
      assert.equal(compare.type, 'button', product.id)
      assert.equal(compare.props.className, 'compare-button', product.id)
      assert.equal(compare.props.type, 'button', product.id)
      assert.equal(compare.props['aria-pressed'], false, product.id)
      assert.equal(typeof compare.props.onClick, 'function', product.id)
      assert.equal(buy.type, 'a', product.id)
      assert.equal(buy.props.className, 'add-cart-button', product.id)
      assert.equal(buy.props.href, `https://shop.tecservice.ge/product/${product.slug}/`, product.id)
      assert.equal(buy.props.target, '_blank', product.id)
      assert.equal(buy.props.rel, 'noreferrer', product.id)
      assert.equal(content(buy), locale === 'ka' ? toGeorgianMtavruli('ყიდვა') : 'Buy', product.id)
      assert.ok(compare.props['aria-label'].includes(product.name), product.id)
      assert.ok(buy.props['aria-label'].includes(product.name), product.id)
      if (locale === 'en') {
        assert.doesNotMatch(compare.props['aria-label'], /[\u10A0-\u10FF\u1C90-\u1CBF]/u, product.id)
        assert.doesNotMatch(buy.props['aria-label'], /[\u10A0-\u10FF\u1C90-\u1CBF]/u, product.id)
      }
      const html = renderToStaticMarkup(tree)
      assert.equal((html.match(/class="add-cart-button"/g) ?? []).length, 1, product.id)
      assert.equal((html.match(/class="compare-button"/g) ?? []).length, 1, product.id)
      assert.doesNotMatch(html, /product-card__comments|<dialog\b/, product.id)
    }
  })
}

test('The original three product rows fit inside the fixed card and retain a 40px action row', async () => {
  const css = await read('src/styles/global.css')
  const rule = selector => css.match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))?.[1] ?? ''
  const dimension = (value, property) => Number(value.match(new RegExp(`(?:^|[;\\s])${property}:\\s*([\\d.]+)px`))?.[1])
  const copy = rule('product-card__copy')
  const rows = copy.match(/grid-template-rows:\s*([^;]+)/)?.[1].trim().split(/\s+/).map(Number.parseFloat)
  assert.equal(rows?.length, 3)
  assert.equal(rows[2], 40)
  assert.equal(rows.reduce((sum, value) => sum + value, 0) + dimension(copy, 'gap') * 2, dimension(copy, 'height'))
  const card = rule('product-card')
  assert.equal(dimension(rule('product-card__image'), 'height') + dimension(card, 'gap') + dimension(copy, 'height'), dimension(card, 'height'))
})
