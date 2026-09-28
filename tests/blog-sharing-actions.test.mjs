import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'
import { blogPageCopy } from '../src/data/blogPageCopy.ts'
import { copyArticleLink, getArticleShareLinks, shareArticle } from '../src/utils/articleSharing.ts'

const articleUrl = 'https://tecservice.ge/en/blog/sd-card-photo-recovery-for-photographers/'
const articleTitle = 'SD ბარათი: RAW & JPEG — “My photos” #1?'

test('article share URLs encode one complete canonical URL and preserve Unicode titles as single parameters', () => {
  const links = getArticleShareLinks(articleUrl, articleTitle)
  assert.deepEqual(Object.keys(links).sort(), ['facebook', 'telegram', 'whatsapp'])
  const facebook = new URL(links.facebook)
  assert.equal(facebook.origin, 'https://www.facebook.com')
  assert.equal(facebook.pathname, '/sharer/sharer.php')
  assert.deepEqual([...facebook.searchParams], [['u', articleUrl]])
  const whatsapp = new URL(links.whatsapp)
  assert.equal(whatsapp.origin, 'https://wa.me')
  assert.deepEqual([...whatsapp.searchParams.keys()], ['text'])
  assert.ok(whatsapp.searchParams.get('text').includes(articleTitle))
  assert.ok(whatsapp.searchParams.get('text').includes(articleUrl))
  const telegram = new URL(links.telegram)
  assert.equal(telegram.origin, 'https://t.me')
  assert.equal(telegram.pathname, '/share/url')
  assert.deepEqual([...telegram.searchParams.keys()].sort(), ['text', 'url'])
  assert.equal(telegram.searchParams.get('url'), articleUrl)
  assert.equal(telegram.searchParams.get('text'), articleTitle)
  for (const link of Object.values(links)) {
    assert.equal(new URL(link).hash, '', 'A title containing # must not become an external fragment')
    assert.ok(link.includes(encodeURIComponent(articleUrl)))
    assert.doesNotMatch(link, /localhost|127\.0\.0\.1/)
  }
})

test('clipboard writes the public canonical link once and confirms only successful completion', async () => {
  const writes = []
  const clipboard = { async writeText(value) { assert.equal(this, clipboard); writes.push(value) } }
  assert.equal(await copyArticleLink(articleUrl, clipboard), true)
  assert.deepEqual(writes, [articleUrl])
})

test('clipboard denial, synchronous errors and an unavailable API return failure instead of a false success', async () => {
  assert.equal(await copyArticleLink(articleUrl, { async writeText() { throw new DOMException('Denied', 'NotAllowedError') } }), false)
  assert.equal(await copyArticleLink(articleUrl, { writeText() { throw new Error('Clipboard unavailable') } }), false)
  assert.equal(await copyArticleLink(articleUrl, {}), false)
})

test('native sharing sends the current article title and canonical URL with the navigator receiver intact', async () => {
  const calls = []
  const navigatorLike = { async share(data) { assert.equal(this, navigatorLike); calls.push(data) } }
  assert.equal(await shareArticle(articleUrl, articleTitle, navigatorLike), 'shared')
  assert.deepEqual(calls, [{ title: articleTitle, url: articleUrl }])
})

test('native sharing distinguishes a user cancellation from denial and an unavailable browser API', async () => {
  assert.equal(await shareArticle(articleUrl, articleTitle, {}), 'unavailable')
  assert.equal(await shareArticle(articleUrl, articleTitle, { async share() { throw new DOMException('Dismissed', 'AbortError') } }), 'cancelled')
  assert.equal(await shareArticle(articleUrl, articleTitle, { async share() { throw new DOMException('Denied', 'NotAllowedError') } }), 'failed')
  assert.equal(await shareArticle(articleUrl, articleTitle, { share() { throw new TypeError('Unsupported') } }), 'failed')
})

const componentSource = await readFile(new URL('../src/components/BlogArticleShare.tsx', import.meta.url), 'utf8')
const moduleUrl = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
const find = (node, predicate) => Array.isArray(node)
  ? node.flatMap(child => find(child, predicate))
  : node?.props ? [...(predicate(node) ? [node] : []), ...find(node.props.children, predicate)] : []
const text = node => Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : typeof node === 'string' ? node : ''
let instances = 0

// Run the component's own event handlers against isolated in-memory browser APIs.
// No real clipboard, share sheet, external tab, or browser global is changed.
async function sharingDriver(locale, browserApis = {}) {
  const id = ++instances
  const environmentUrl = moduleUrl(`/* environment ${id} */ export const navigator = {};`)
  Object.assign((await import(environmentUrl)).navigator, browserApis)
  const hooksUrl = moduleUrl(`/* hooks ${id} */
    const slots = []; let cursor = 0, dirty = false, pending = [];
    export function begin() { cursor = 0; dirty = false; pending = []; }
    export function flush() { for (const effect of pending) effect(); return dirty; }
    export function useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => {
        const next = typeof value === 'function' ? value(slots[index]) : value;
        if (!Object.is(next, slots[index])) { slots[index] = next; dirty = true; }
      }];
    }
    export function useEffect(effect, deps) {
      const index = cursor++; const before = slots[index];
      if (!before || deps.some((value, i) => !Object.is(value, before[i]))) {
        pending.push(effect); slots[index] = deps;
      }
    }
  `)
  const replacements = {
    react: hooksUrl,
    'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'),
    '../data/blogPageCopy': new URL('../src/data/blogPageCopy.ts', import.meta.url).href,
    '../utils/articleSharing': new URL('../src/utils/articleSharing.ts', import.meta.url).href,
    './LaptopIcon': moduleUrl('export const LaptopIcon = () => null;'),
  }
  let { code } = await transformWithOxc(componentSource, '/BlogArticleShare.tsx', { jsx: { runtime: 'automatic' } })
  for (const [specifier, url] of Object.entries(replacements)) code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(url))
  const { BlogArticleShare } = await import(moduleUrl(`import { navigator } from ${JSON.stringify(environmentUrl)};\n${code}`))
  const hooks = await import(hooksUrl)
  let tree
  const render = () => {
    for (let pass = 0; pass < 10; pass++) {
      hooks.begin()
      tree = BlogArticleShare({ url: articleUrl, title: articleTitle, locale })
      if (!hooks.flush()) return
    }
    throw new Error('Share component effects did not settle')
  }
  render()
  const action = value => find(tree, node => node.props['data-share'] === value)[0]
  return {
    action,
    nodes: predicate => find(tree, predicate),
    status: () => text(find(tree, node => node.props.role === 'status')[0]),
    async click(value) {
      const control = action(value)
      assert.ok(control && !control.props.disabled)
      let defaultPrevented = false
      const pending = control.props.onClick({ preventDefault() { defaultPrevented = true } })
      render()
      await pending
      await new Promise(setImmediate)
      render()
      return { defaultPrevented }
    },
  }
}

test('article sharing contains no Instagram control, icon or link in either language', async () => {
  assert.doesNotMatch(componentSource, /instagram/i)
  for (const locale of ['ka', 'en']) {
    for (const browserApis of [{}, { async share() {} }]) {
      const driver = await sharingDriver(locale, browserApis)
      assert.equal(driver.action('instagram'), undefined)
      assert.equal(driver.action('instagram-copy'), undefined)
      assert.equal(driver.nodes(node => /instagram/i.test(node.props.href ?? '')).length, 0)
      const actions = driver.nodes(node => node.props['data-share']).map(node => node.props['data-share']).sort()
      assert.deepEqual(actions, ['copy', 'facebook', ...(browserApis.share ? ['native'] : []), 'telegram', 'whatsapp'])
    }
  }
})

test('the copy button writes the canonical article URL and confirms success in either language without native sharing', async () => {
  for (const locale of ['ka', 'en']) {
    for (const nativeMode of ['unavailable', 'available', 'rejecting']) {
      let nativeCalls = 0
      const writes = []
      const browserApis = { clipboard: { async writeText(value) { writes.push(value) } } }
      if (nativeMode !== 'unavailable') browserApis.share = async () => {
        nativeCalls++
        if (nativeMode === 'rejecting') throw new DOMException('Blocked', 'NotAllowedError')
      }
      const driver = await sharingDriver(locale, browserApis)
      const copyButton = driver.action('copy')
      assert.equal(copyButton.type, 'button')
      assert.equal(copyButton.props.type, 'button')
      assert.equal(copyButton.props['aria-label'], blogPageCopy[locale].copy)
      await driver.click('copy')
      assert.equal(nativeCalls, 0, `Copying must not invoke native sharing when it is ${nativeMode}`)
      assert.deepEqual(writes, [articleUrl])
      assert.equal(driver.status(), blogPageCopy[locale].copied)
      assert.equal(driver.nodes(node => node.type === 'input').length, 0)
      assert.equal(driver.action('copy').props.disabled, false)
      await driver.click('copy')
      assert.equal(driver.status(), blogPageCopy[locale].copied)
      assert.deepEqual(writes, [articleUrl, articleUrl])
      assert.equal(nativeCalls, 0)
    }
  }
})

test('copying disables repeat clipboard and native-share requests until completion in either language', async () => {
  for (const locale of ['ka', 'en']) {
    let finishCopy
    let nativeCalls = 0
    const writes = []
    const driver = await sharingDriver(locale, {
      async share() { nativeCalls++ },
      clipboard: { writeText(value) { writes.push(value); return new Promise(resolve => { finishCopy = resolve }) } },
    })
    const pending = driver.click('copy')
    assert.deepEqual(writes, [articleUrl])
    assert.equal(driver.status(), '', 'Do not claim success before clipboard completion')
    assert.equal(nativeCalls, 0)
    for (const action of ['copy', 'native']) {
      assert.equal(driver.action(action).props.disabled, true)
      await assert.rejects(() => driver.click(action))
    }
    assert.deepEqual(writes, [articleUrl])
    finishCopy()
    await pending
    assert.equal(driver.status(), blogPageCopy[locale].copied)
    assert.equal(nativeCalls, 0)
    for (const action of ['copy', 'native']) assert.equal(driver.action(action).props.disabled, false)
  }
})

test('Facebook, WhatsApp and Telegram remain direct safe links to their original share endpoints', async () => {
  const links = getArticleShareLinks(articleUrl, articleTitle)
  for (const locale of ['ka', 'en']) {
    const driver = await sharingDriver(locale)
    for (const name of ['facebook', 'whatsapp', 'telegram']) {
      const control = driver.action(name)
      assert.equal(control.type, 'a')
      assert.equal(control.props.href, links[name])
      assert.equal(control.props.target, '_blank')
      assert.match(control.props.rel, /noopener/)
      assert.match(control.props.rel, /noreferrer/)
      assert.equal(control.props.onClick, undefined)
    }
  }
})

test('absent or denied clipboard offers an honest manual canonical URL in either language', async () => {
  for (const locale of ['ka', 'en']) {
    for (const clipboard of [undefined, { async writeText() { throw new Error('Denied') } }, { writeText() { throw new Error('Unavailable') } }]) {
      let nativeCalls = 0
      const driver = await sharingDriver(locale, { clipboard, async share() { nativeCalls++; throw new Error('Must not be called') } })
      await driver.click('copy')
      assert.equal(nativeCalls, 0)
      assert.equal(driver.status(), blogPageCopy[locale].shareCopyFailed)
      assert.notEqual(driver.status(), blogPageCopy[locale].copied)
      const inputs = driver.nodes(node => node.type === 'input')
      assert.equal(inputs.length, 1)
      assert.equal(inputs[0].props.value, articleUrl)
      assert.equal(inputs[0].props.readOnly, true)
      assert.equal(inputs[0].props['aria-label'], blogPageCopy[locale].articleLink)
      let selected = false
      inputs[0].props.onFocus({ currentTarget: { select() { selected = true } } })
      assert.equal(selected, true)
      assert.equal(driver.action('copy').props.disabled, false)
    }
  }
})

test('native sharing is offered only with browser support and user cancellation stays quiet', async () => {
  const unsupported = await sharingDriver('en')
  assert.equal(unsupported.action('native'), undefined)
  const calls = []
  const driver = await sharingDriver('en', { async share(data) { calls.push(data); throw new DOMException('Dismissed', 'AbortError') } })
  assert.ok(driver.action('native'))
  await driver.click('native')
  assert.deepEqual(calls, [{ title: articleTitle, url: articleUrl }])
  assert.equal(driver.status(), '')
  assert.equal(driver.nodes(node => node.type === 'input').length, 0)
  assert.equal(driver.action('native').props.disabled, false)
})

test('native-share failure provides localized recovery and a manual-copy link', async () => {
  for (const locale of ['ka', 'en']) {
    const driver = await sharingDriver(locale, { async share() { throw new DOMException('Denied', 'NotAllowedError') } })
    await driver.click('native')
    assert.equal(driver.status(), blogPageCopy[locale].shareUnavailable)
    assert.equal(driver.nodes(node => node.type === 'input')[0].props.value, articleUrl)
    assert.equal(driver.action('native').props.disabled, false)
  }
})
