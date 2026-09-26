import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { Children } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import { legalDocuments } from '../src/data/legalPages.ts'
import { products } from '../src/data/products.ts'
import { getServicePriceAssessment } from '../src/utils/servicePriceAssistant.ts'
import { assessDevice } from '../src/utils/assessment.ts'
import { translateText } from '../src/i18n/translate.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`

// Match labels about this site's unfinished mode, not legitimate repair tests,
// safe drone test flights, official software trials or file-preview lists.
const unwantedNotice = /დემო|სატესტო|საცდელ[ი\s]+(?:ასისტენტ|მონაცემ)|საცდელი ვერსია(?:$|[\s.,:;!])|ვიზუალური ვერსია|(?:სტატია|კაბინეტი) მზადდება|კაბინეტი მალე დაემატება|\bdemo\b|\b(?:trial[-\s]+(?:assistant|mode)|test(?:ing)?[-\s]+mode|visual preview|account preview|sample data|(?:article|(?:customer )?accounts?) (?:are )?coming soon)\b|\bAI is in testing\b/iu

function checkText(value, location) {
  assert.doesNotMatch(value.toLocaleLowerCase(), unwantedNotice, location)
}

function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return []
  return [...(predicate(tree) ? [tree] : []), ...Children.toArray(tree.props?.children).flatMap(child => nodes(child, predicate))]
}

const compiled = new Map()
let instance = 0
async function componentDriver(name, locale, { mode = 'code', state = 'default' } = {}) {
  const hooksUrl = moduleUrl(`
    // Independent state store ${instance++}
    let cursor = 0; const slots = [];
    export const begin = () => { cursor = 0; };
    export function useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial === 'code' ? ${JSON.stringify(mode)} : initial === 'default' ? ${JSON.stringify(state)} : typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    }
    export const useRef = current => ({ current });
    export const useEffect = () => {};
    export const useLayoutEffect = () => {};
  `)
  const localeUrl = moduleUrl(`
    import { translateValue, localizedHref } from ${JSON.stringify(new URL('src/i18n/translate.ts', root).href)};
    export const useTranslation = () => ({ locale: ${JSON.stringify(locale)}, t: value => translateValue(value, ${JSON.stringify(locale)}), href: value => localizedHref(value, ${JSON.stringify(locale)}) });
  `)
  const dependencies = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../i18n/LocaleProvider': localeUrl,
    '../utils/text': new URL('src/utils/text.ts', root).href,
    '../utils/validation': new URL('src/utils/validation.ts', root).href,
    '../data/tickets': new URL('src/data/tickets.ts', root).href,
    '../components/SectionHeader': moduleUrl('export function SectionHeader() { return null; }'),
    '../components/TicketResult': moduleUrl('export function TicketResult() { return null; }'),
    '../hooks/useResponsiveHome': moduleUrl('export const useResponsiveHome = () => false;'),
    '../account/CustomerAuthProvider': moduleUrl('export const useCustomerAuth = () => ({ user: null, openAuth() {} });'),
  }
  async function load(component) {
    if (!compiled.has(component)) {
      const path = component === 'TicketLookup' ? `src/sections/${component}.tsx` : `src/components/${component}.tsx`
      compiled.set(component, (await transformWithOxc(await read(path), `/${component}.tsx`, { jsx: { runtime: 'automatic' } })).code)
    }
    let code = compiled.get(component)
    for (const [specifier, target] of Object.entries(dependencies)) code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(target))
    return moduleUrl(code)
  }
  dependencies['../components/OtpVerification'] = await load('OtpVerification')
  const Component = (await import(await load(name)))[name]
  const hooks = await import(hooksUrl)
  return props => { hooks.begin(); return Component(props) }
}

async function htmlPaths(directory = 'dist') {
  const entries = await readdir(new URL(`${directory}/`, root), { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const path = `${directory}/${entry.name}`
    return entry.isDirectory() ? htmlPaths(path) : entry.name.endsWith('.html') ? [path] : []
  }))
  return nested.flat().sort()
}

test('Every built Georgian and English page omits demo-mode notices from visible content and metadata', async () => {
  const pages = await htmlPaths()
  assert.ok(pages.length >= 50, 'Build and prerender all public routes before running this audit')
  for (const path of pages) {
    const html = await read(path)
    // Script names and implementation identifiers are not user-facing copy.
    const documentCopy = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    checkText(documentCopy, path)
  }
})

test('All translation catalogs omit stale demo and coming-soon notices', async () => {
  const files = (await readdir(new URL('src/i18n/catalogs/', root))).filter(name => /\.(?:ka|en)\.json$/.test(name))
  assert.ok(files.length > 0)
  for (const name of files) {
    const catalog = JSON.parse(await read(`src/i18n/catalogs/${name}`))
    for (const [key, value] of Object.entries(catalog)) checkText(value, `${name}:${key}`)
  }
})

for (const locale of ['ka', 'en']) {
  test(`${locale} code, phone and OTP lookup states use neutral copy in Home and Contact`, async () => {
    for (const variant of ['default', 'embedded']) {
      for (const mode of ['code', 'phone']) {
        const render = await componentDriver('TicketLookup', locale, { mode })
        const tree = render({ variant, id: 'lookup-copy-test' })
        const html = renderToStaticMarkup(tree)
        checkText(html, `${locale}:${variant}:${mode}`)
        assert.doesNotMatch(html, /123456|591 47 40 40|placeholder="1001"/)
        const hint = mode === 'code' ? 'კოდი მითითებულია სერვისის მიღების დოკუმენტზე.' : 'მიუთითეთ სერვისის გაფორმებისას გამოყენებული ნომერი.'
        assert.ok(html.includes(translateText(hint, locale)))
        if (locale === 'en') assert.doesNotMatch(html, /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
        for (const input of nodes(tree, node => node.type === 'input')) {
          for (const id of (input.props['aria-describedby'] ?? '').split(/\s+/).filter(Boolean)) assert.ok(html.includes(`id="${id}"`), `${id} resolves`)
        }
      }
      const render = await componentDriver('TicketLookup', locale, { mode: 'phone', state: 'otp' })
      const html = renderToStaticMarkup(render({ variant }))
      checkText(html, `${locale}:${variant}:otp`)
      assert.doesNotMatch(html, /123456|DEMO_OTP/)
      assert.equal((html.match(/inputmode="numeric"/gi) ?? []).length, 6)
      assert.match(html, /id="otp-help"/)
    }
  })

  test(`${locale} the six-digit verification still accepts a full code and can clear it`, async () => {
    const render = await componentDriver('OtpVerification', locale)
    const submitted = []
    let changes = 0
    const props = { phone: '+995 555 00 00 00', errorMessage: '', onCodeChange() { changes++ }, onConfirm(code) { submitted.push(code) }, onBack() {} }
    let tree = render(props)
    let inputs = nodes(tree, node => node.type === 'input')
    assert.equal(inputs.length, 6)
    assert.ok(inputs.every(input => input.props['aria-describedby'] === 'otp-help'))
    inputs[0].props.onChange({ target: { value: '654321' } })
    tree = render(props)
    inputs = nodes(tree, node => node.type === 'input')
    assert.equal(inputs.map(input => input.props.value).join(''), '654321')
    tree.props.onSubmit({ preventDefault() {} })
    assert.deepEqual(submitted, ['654321'])
    const links = nodes(tree, node => node.props.className === 'otp-panel__links')[0]
    Children.toArray(links.props.children)[0].props.onClick()
    tree = render(props)
    assert.ok(nodes(tree, node => node.type === 'input').every(input => input.props.value === ''))
    assert.equal(changes, 2)
    const html = renderToStaticMarkup(tree)
    checkText(html, `${locale}:verification`)
    assert.doesNotMatch(html, /123456|DEMO_OTP|კოდის ხელახლა გაგზავნა|Resend code/)
    assert.match(html, /id="otp-help"/)
    if (locale === 'en') assert.doesNotMatch(html, /[\u10A0-\u10FF\u1C90-\u1CBF]/u)
  })

  test(`${locale} the cart keeps truthful payment availability without a demo-mode label`, async () => {
    const render = await componentDriver('CartDrawer', locale)
    for (const lines of [[], [{ product: products[0], quantity: 1 }]]) {
      const html = renderToStaticMarkup(render({ open: true, lines, onClose() {}, onQuantityChange() {}, onRemove() {} }))
      checkText(html, `${locale}:cart`)
      if (lines.length) assert.ok(html.includes(locale === 'ka' ? 'ონლაინ გადახდა ჯერ არ არის ჩართული.' : 'Online payment is not yet available.'))
    }
  })

  test(`${locale} legal headings, privacy descriptions and body copy contain no demo branding`, () => {
    checkText(JSON.stringify(legalDocuments[locale]), `legalDocuments.${locale}`)
  })

  test(`${locale} interactive assistant replies do not reintroduce a trial notice`, () => {
    const examples = [
      ['computers', 'ლეპტოპის ეკრანი გატეხილია'],
      ['computers', 'დესკტოპ კომპიუტერის წმენდა რა ღირს?'],
      ['consoles', 'PS5 HDMI პორტის შეცვლა რა ღირს?'],
      ['drones', 'DJI გიმბალის შეკეთება'],
      ['other', 'ტელეფონის ეკრანის შეცვლა'],
      ['recovery', 'ფაილები წავშალე HDD-ზე'],
      ['other', 'UPS-ის შეკეთება'],
      ['other', 'გაურკვეველი პრობლემა რა ღირს?'],
      ['other', 'ბატარეა გაბერილია'],
    ]
    for (const [device, description] of examples) {
      const response = getServicePriceAssessment(device, description, locale, value => translateText(value, locale))
      checkText(JSON.stringify(response), `${locale}:${device}:${description}`)
    }
  })
}

test('Legacy symptom guidance omits demo copy without removing actual service limitations', () => {
  for (const description of ['გაურკვეველი პრობლემა', 'შეკეთება რა ღირს?']) {
    const result = assessDevice('other', description)
    checkText(JSON.stringify(result), description)
  }
  assert.match(JSON.stringify(assessDevice('other', 'შეკეთება რა ღირს?')), /შემოწმებ/)
})
