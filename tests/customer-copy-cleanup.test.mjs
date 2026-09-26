import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const loadFixture = async path => import(`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(await read(path), { mode: 'transform' })).toString('base64')}`)
const { getDemoAccount } = await loadFixture('src/account/demoAccount.ts')
const { getDemoComments } = await loadFixture('src/account/demoComments.ts')
const { demoInvoice } = await loadFixture('src/account/demoInvoice.ts')
const unwantedLabel = /დემო|სატესტო|საცდელი|გამოგონილი|\bdemo\b|\bpreview\b|\bsample\b|\bfictional\b|test mode|trial mode/i

for (const locale of ['ka', 'en']) {
  test(`${locale} account display fixtures omit demo labels while lookup IDs remain isolated`, () => {
    const account = getDemoAccount(locale)
    assert.equal(account.user.id, 'demo-customer-preview')
    assert.equal(account.user.full_name, locale === 'ka' ? 'მომხმარებელი' : 'Customer')
    assert.equal(account.user.email, 'customer@example.invalid')
    assert.deepEqual(account.purchases.map(purchase => purchase.id), ['demo-purchase-one', 'demo-purchase-two'])
    assert.deepEqual(account.purchases.map(purchase => purchase.order_number), ['1001', '1002'])
    const displayed = [account.user.full_name, account.user.email,
      ...account.tickets.flatMap(ticket => [ticket.device, ticket.issue_description, ticket.resolution, ...ticket.items.flatMap(item => [item.issue_description, item.resolution])]),
      ...account.purchases.flatMap(purchase => [purchase.order_number, ...purchase.items.map(item => item.name)]),
    ]
    for (const value of displayed) if (value) assert.doesNotMatch(value, unwantedLabel)
  })

  test(`${locale} comment and invoice display fixtures have neutral copy without altering invoice lookup IDs`, () => {
    for (const comment of getDemoComments(locale)) {
      assert.equal(comment.id, 'demo-comment-preview-only')
      for (const value of [comment.author_name, comment.text, comment.product.name]) assert.doesNotMatch(value, unwantedLabel)
    }
    for (const target of [
      { kind: 'purchase', id: 'demo-purchase-one', reference: '1001' },
      { kind: 'purchase', id: 'demo-purchase-two', reference: '1002' },
      { kind: 'service', id: 990001, reference: '990001' },
      { kind: 'service', id: 990002, reference: '990002' },
    ]) {
      const invoice = demoInvoice(target, locale)
      assert.equal(invoice.id, 'sample-invoice')
      assert.equal(invoice.payment_status, 'unconfirmed')
      assert.equal(invoice.number, target.id === 'demo-purchase-two' || target.id === 990002 ? 'INV-1002' : 'INV-1001')
      for (const value of [invoice.number, invoice.seller.name, invoice.buyer.name, ...invoice.lines.map(line => line.description)]) assert.doesNotMatch(value, unwantedLabel)
    }
  })
}

test('Removing account display labels retains explicit development gates and honest unavailable-action notices', async () => {
  const page = await read('src/pages/AccountPage.tsx')
  assert.match(page, /if \(import\.meta\.env\.DEV\)/)
  assert.match(page, /get\('preview'\) === '1'/)
  assert.doesNotMatch(page, /საცდელი მონაცემები|Preview the account design · sample data/)
  const settings = await read('src/account/CustomerSettings.tsx')
  assert.match(settings, /isPreview && import\.meta\.env\.DEV/)
  assert.doesNotMatch(settings, /ვიზუალური ვერსია|Visual preview/)
  assert.match(settings, /Bank integration is not connected yet/)
  assert.match(settings, /No card details are collected here/)
  assert.match(settings, /No card was added and no payment was made/)
  assert.match(settings, /Your password was not changed/)
  const invoice = await read('src/account/InvoiceButton.tsx')
  assert.match(invoice, /isPreview && import\.meta\.env\.DEV/)
  assert.match(invoice, /არ არის გადახდის დოკუმენტი/)
  assert.match(invoice, /Not a payment document/)
})
