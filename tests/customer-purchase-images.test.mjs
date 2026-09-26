import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`

// Compile only the selected component in memory; no dev server, environment
// loading, network requests or real customer records are used by these tests.
async function compile(path, replacements = {}, append = '') {
  const { code } = await transformWithOxc(`${await read(path)}\n${append}`, new URL(path, root).pathname, { jsx: { runtime: 'automatic' } })
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, target] of Object.entries({ react: import.meta.resolve('react'), 'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'), './InvoiceButton': moduleUrl('export function InvoiceButton() { return null }'), ...replacements })) {
    executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(target))
  }
  return moduleUrl(executable)
}

const iconUrl = await compile('src/components/LaptopIcon.tsx')
const dependencies = { '../components/LaptopIcon': iconUrl, './dashboardCopy': new URL('src/account/dashboardCopy.ts', root).href, './accountFormat': new URL('src/account/accountFormat.ts', root).href, './productImage': new URL('src/account/productImage.ts', root).href, '../utils/text': new URL('src/utils/text.ts', root).href }
const componentUrl = await compile('src/account/CustomerPurchaseCard.tsx', dependencies)
const { getPurchaseImageUrl, CustomerPurchaseCard } = await import(componentUrl)

test('Product-image paths are limited to existing public asset directory and safe image filenames', () => {
  for (const value of [
    '/assets/products/kingston-nv3-figma.png', '/assets/products/ssd/photo_1.webp',
    '/assets/products/device.jpg', '/assets/products/device.jpeg', '/assets/products/device.avif',
    '/assets/products/device.gif', '/assets/products/PHOTO.PNG',
  ]) assert.equal(getPurchaseImageUrl(value), value, value)
})

test('API paths, traversal, encodings and protocol-relative local sources fail closed', () => {
  for (const value of [
    '/', '/api/auth/me', '/uploads/photo.jpg', '/assets/product/photo.png',
    '/assets/products/../private.png', '/assets/products/a/../../private.jpg',
    '/assets/products/%2e%2e/private.png', '/assets/products/a%2fb.png',
    '/assets/products/%252e%252e/private.png', '/assets/products/a%5cb.png',
    '//cdn.example.com/photo.png', '///cdn.example.com/photo.png', '/\\cdn.example.com/photo.png',
    '/assets/products/photo.svg', '/assets/products/photo.html', '/assets/products/photo.png?x=1',
    '/assets/products/photo.png#fragment', '/assets/products/.hidden.png',
  ]) assert.equal(getPurchaseImageUrl(value), null, value)
})

test('Public HTTP(S) hostnames and normal CDN queries are accepted without fetching them', () => {
  for (const [value, expected] of [
    ['https://cdn.example.com/item.jpg', 'https://cdn.example.com/item.jpg'],
    ['http://cdn.example.com/image.jpg?size=200', 'http://cdn.example.com/image.jpg?size=200'],
    ['https://cdn.example.com:443/image.jpg', 'https://cdn.example.com/image.jpg'],
    ['http://cdn.example.com:80/image.jpg', 'http://cdn.example.com/image.jpg'],
    ['  https://cdn.example.com/image.jpg  ', 'https://cdn.example.com/image.jpg'],
  ]) assert.equal(getPurchaseImageUrl(value), expected, value)
})

test('Credentials, fragments, unexpected ports and non-HTTP schemes are rejected', () => {
  for (const value of [
    'https://user:password@cdn.example.com/photo.png', 'https://user@cdn.example.com/photo.png',
    'https://@cdn.example.com/photo.png', 'https://user%40name@cdn.example.com/photo.png',
    'https://cdn.example.com/image.png#fragment', 'https://cdn.example.com/image.png#',
    'https://cdn.example.com:8080/photo.png', 'https://cdn.example.com:3000/photo.png',
    'https://cdn.example.com:99999/photo.png', 'https:cdn.example.com/photo.png',
    'javascript:alert(1)', 'data:image/png;base64,abc', 'file:///C:/photo.png',
    'blob:https://cdn.example.com/photo', 'ftp://cdn.example.com/photo.png',
  ]) assert.equal(getPurchaseImageUrl(value), null, value)
})

test('All literal IPs are rejected, including private, public and alternate IPv4 representations', () => {
  for (const host of [
    '127.0.0.1', '127.1', '10.1.2.3', '192.168.1.1', '172.16.0.1', '169.254.169.254',
    '0.0.0.0', '2130706433', '0x7f000001', '0177.0.0.01', '127.0.0x0.1',
    '8.8.8.8', '[::1]', '[::ffff:127.0.0.1]', '[2001:4860:4860::8888]',
  ]) assert.equal(getPurchaseImageUrl(`http://${host}/photo.png`), null, host)
})

test('Reserved local DNS names and malformed hostnames are rejected', () => {
  for (const host of [
    'localhost', 'printer', 'printer.local', 'photo.localhost', 'store.internal', 'files.lan',
    'photos.home', 'device.home.arpa', 'image.localdomain', 'LOCALHOST.',
    'cdn..example.com', '-cdn.example.com', 'cdn-.example.com',
    '%31%32%37.0.0.1',
  ]) assert.equal(getPurchaseImageUrl(`https://${host}/photo.png`), null, host)
})

test('Control characters, quotes, backslashes and excessive or non-text values are rejected', () => {
  for (const value of [
    undefined, null, 123, {}, [], '', '   ', 'x'.repeat(1001),
    'https://cdn.example.com/\nimage.png', 'https://cdn.example.com/\u0000image.png',
    'https://cdn.example.com/\u007fimage.png', 'https://cdn.example.com/a b.png',
    'https://cdn.example.com/a"b.png', "https://cdn.example.com/a'b.png",
    'https://cdn.example.com/<image>.png', 'https://cdn.example.com\\@localhost/photo.png',
  ]) assert.equal(getPurchaseImageUrl(value), null, String(value))
})

for (const locale of ['ka', 'en']) {
  test(`${locale} purchased-product photos retain actual names, amounts and private referrer policy`, () => {
    const purchase = {
      id: 'image-test-order', order_number: 'IMAGE-TEST', status: 'completed', payment_status: 'paid',
      created_at: '2026-09-23T10:00:00Z', total: 149, currency: 'GEL',
      items: [{ name: 'Synthetic exact product name', quantity: 1, unit_price: 149, image_url: '/assets/products/kingston-nv3-figma.png' }],
    }
    const html = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale }))
    assert.match(html, /<img\b[^>]*src="\/assets\/products\/kingston-nv3-figma\.png"/)
    assert.match(html, /alt="Synthetic exact product name"/)
    assert.match(html, /loading="lazy"/)
    assert.match(html, /decoding="async"/)
    assert.match(html, /referrerPolicy="no-referrer"/i)
    assert.match(html, /data-has-image="true"/)
    assert.match(html, /account-purchase-card__total[\s\S]*149/)
    assert.doesNotMatch(html, /href="#"|account-purchase-item__total/)
    assert.match(html, /class="account-purchase-collapse"/)
  })
}

test('Missing and rejected product image URLs render neutral icons, never guessed photos', () => {
  for (const image_url of [undefined, null, 'data:image/png;base64,abc', '/api/auth/me', 'http://127.0.0.1/image.png']) {
    const purchase = {
      id: 'missing-image-order', order_number: 'NO-IMAGE', status: 'new', payment_status: 'unpaid',
      created_at: '2026-09-23T10:00:00Z', total: 1, currency: 'GEL',
      items: [{ name: 'Kingston NV3', quantity: 1, unit_price: 1, image_url }],
    }
    const html = renderToStaticMarkup(createElement(CustomerPurchaseCard, { purchase, locale: 'en' }))
    assert.doesNotMatch(html, /<img\b/)
    assert.match(html, /data-has-image="false"/)
    assert.ok(html.includes('Kingston NV3'))
  }
})

test('A broken image falls back without layout loss; a changed safe source can load again', async () => {
  const hooksUrl = moduleUrl('let value=null; export function useState(){return [value, next=>{value=next}]}')
  const thumbnailUrl = await compile('src/account/CustomerPurchaseCard.tsx', { ...dependencies, react: hooksUrl }, 'export { PurchaseThumbnail }')
  const { PurchaseThumbnail } = await import(thumbnailUrl)
  const props = { source: '/assets/products/first.png', name: 'Exact product' }
  const initial = PurchaseThumbnail(props)
  assert.equal(initial.props.children.type, 'img')
  assert.equal(initial.props['data-has-image'], true)
  initial.props.children.props.onError()
  const failed = PurchaseThumbnail(props)
  assert.equal(failed.props['data-has-image'], false)
  assert.equal(failed.props['aria-hidden'], true)
  assert.notEqual(failed.props.children.type, 'img')
  assert.equal(failed.props.className, initial.props.className)
  const replacement = PurchaseThumbnail({ ...props, source: '/assets/products/second.png' })
  assert.equal(replacement.props.children.type, 'img')
})

test('Actual product photos use two-pixel padding while preserving aspect ratio and mobile tile sizes', async () => {
  const css = await read('src/styles/account-purchases.css')
  assert.match(css, /\.account-purchase-item__tile\[data-has-image="true"\]\s*\{[^}]*padding:\s*2px/)
  assert.match(css, /\.account-purchase-item__tile img\s*\{[^}]*object-fit:\s*contain/)
  assert.match(css, /@media\s*\(max-width:\s*380px\)/)
})
