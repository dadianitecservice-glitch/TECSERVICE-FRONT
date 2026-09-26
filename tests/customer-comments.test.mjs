import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import { commentDate, commentsCopy } from '../src/account/commentsCopy.ts'
import { toGeorgianMtavruli } from '../src/utils/text.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const imageUrl = new URL('src/account/productImage.ts', root).href
const apiUrl = moduleUrl(stripTypeScriptTypes((await read('src/account/customerCommentsApi.ts')).replaceAll('import.meta.env', '({})').replace("'./productImage'", JSON.stringify(imageUrl)), { mode: 'transform' }))
const { customerCommentsApi: api, CommentsApiError, commentsErrorMessage } = await import(apiUrl)
const product = { id: 'synthetic-product', slug: 'synthetic-product', name: 'Synthetic product', image_url: null }
const comment = { id: 'synthetic-comment', text: 'A useful product.', author_name: 'Synthetic', created_at: '2026-09-25T08:00:00Z', updated_at: '2026-09-25T08:00:00Z' }
const ownComment = { ...comment, version: 1, product, product_available: true }
const publicPage = (comments = [comment], offset = 0, has_more = false) => ({ product, comments, limit: 20, offset, has_more })
const ownPage = (comments = [ownComment], offset = 0, has_more = false) => ({ comments, limit: 20, offset, has_more })
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
const isStatus = status => error => error instanceof CommentsApiError && error.status === status

test('Public comments use an exact product slug without cookies and project only public fields', async t => {
  let request
  t.mock.method(globalThis, 'fetch', async (url, options) => { request = { url, options }; return json(publicPage([{ ...comment, customer_id: 'never-public', email: 'private@example.invalid', phone: 'private-phone', full_name: 'Private full name', version: 3 }])) })
  const result = await api.publicList(product.slug)
  assert.equal(request.url, '/api/shop/products/synthetic-product/comments?limit=20&offset=0')
  assert.equal(request.options.credentials, 'omit')
  assert.equal(request.options.cache, 'no-store')
  assert.equal(request.options.method, 'GET')
  assert.deepEqual(result.comments, [comment])
  assert.doesNotMatch(JSON.stringify(result), /never-public|private@example|private-phone|Private full name/)
})

test('Own comments use cookie authentication with no owner selector and preserve hidden product snapshots', async t => {
  let request
  const hidden = { ...ownComment, product_available: false }
  t.mock.method(globalThis, 'fetch', async (url, options) => { request = { url, options }; return json(ownPage([hidden], 20)) })
  assert.deepEqual(await api.ownList(20), ownPage([hidden], 20))
  assert.equal(request.url, '/api/portal/comments?limit=20&offset=20')
  assert.equal(request.options.credentials, 'include')
  assert.equal(request.options.cache, 'no-store')
})

test('Comment product photos accept catalog URLs only, never private or unavailable product images', async t => {
  let response
  t.mock.method(globalThis, 'fetch', async () => json(response))
  for (const image of ['/assets/products/kingston-nv3-figma.png', 'https://cdn.example.com/product.jpg']) {
    response = ownPage([{ ...ownComment, product: { ...product, image_url: image } }])
    assert.equal((await api.ownList()).comments[0].product.image_url, image)
  }
  for (const image of [undefined, null, 123, '', 'javascript:alert(1)', 'data:image/png;base64,abc', 'file:///secret.jpg', '/api/private', '//example.com/image.jpg', 'http://localhost/photo.png', 'http://127.0.0.1/photo.png', 'https://user:password@example.com/photo.png']) {
    response = ownPage([{ ...ownComment, product: { ...product, image_url: image } }])
    assert.equal((await api.ownList()).comments[0].product.image_url, null)
  }
  response = ownPage([{ ...ownComment, product_available: false, product: { ...product, image_url: '/assets/products/kingston-nv3-figma.png', supplier_cost: 'PRIVATE' } }])
  const hidden = (await api.ownList()).comments[0]
  assert.equal(hidden.product.image_url, null)
  assert.equal(hidden.product.name, product.name)
  assert.equal(Object.hasOwn(hidden.product, 'supplier_cost'), false)
})

test('Comment mutations send only trimmed text and optimistic version, never customer or product IDs', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url, options }); return url.endsWith('/delete') ? new Response(null, { status: 204 }) : json(ownComment) })
  await api.create(product.slug, '  A useful product.  ')
  await api.update(comment.id, '  Edited plain text  ', 7)
  await api.remove(comment.id, 7)
  assert.deepEqual(calls.map(call => JSON.parse(call.options.body)), [{ text: 'A useful product.' }, { text: 'Edited plain text', version: 7 }, { version: 7 }])
  assert.deepEqual(calls.map(call => call.url), ['/api/shop/products/synthetic-product/comments', '/api/portal/comments/synthetic-comment', '/api/portal/comments/synthetic-comment/delete'])
  assert.ok(calls.every(call => call.options.method === 'POST' && call.options.credentials === 'include' && call.options.cache === 'no-store'))
})

test('Invalid slugs, traversal IDs, blank or oversized text and invalid versions fail before fetch', async t => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => { calls++; return json(ownComment) })
  for (const slug of ['../private', 'device?owner=1', 'https://example.invalid', '', 'a'.repeat(201)]) await assert.rejects(api.publicList(slug), isStatus(422))
  for (const id of ['../other', 'id/delete', '', '?customer=other']) await assert.rejects(api.remove(id, 1), isStatus(422))
  for (const text of ['', '   ', 'a'.repeat(2001)]) await assert.rejects(api.create(product.slug, text), isStatus(422))
  for (const version of [0, -1, 1.5, null, undefined]) await assert.rejects(api.update(comment.id, 'Text', version), isStatus(422))
  await assert.rejects(api.ownList(-1), isStatus(422))
  assert.equal(calls, 0)
})

test('Malformed comment DTOs, pagination, wrong product and mismatched updated IDs fail closed', async t => {
  let response
  t.mock.method(globalThis, 'fetch', async () => json(response))
  for (response of [null, {}, { ...publicPage(), offset: 20 }, { ...publicPage(), limit: 0 }, { ...publicPage(), product: { ...product, slug: 'other-product' } }, publicPage([{ ...comment, author_name: null }]), publicPage([{ ...comment, text: {} }]), publicPage([{ ...comment, created_at: 'invalid' }])]) await assert.rejects(api.publicList(product.slug), isStatus(502))
  for (response of [ownPage([{ ...ownComment, version: 0 }]), ownPage([{ ...ownComment, product_available: 'true' }]), ownPage([{ ...ownComment, product: { ...product, slug: '../private' } }])]) await assert.rejects(api.ownList(), isStatus(502))
  response = { ...ownComment, id: 'other-comment' }
  await assert.rejects(api.update(comment.id, 'Text', 1), isStatus(502))
  response = ownComment
  await assert.rejects(api.remove(comment.id, 1), isStatus(502))
})

test('Unavailable APIs and conflict responses remain errors rather than empty or demo successes', async t => {
  let status = 503
  t.mock.method(globalThis, 'fetch', async () => json({ detail: 'PRIVATE INTERNAL ERROR' }, status))
  for (status of [401, 403, 404, 409, 422, 429, 503]) {
    await assert.rejects(api.ownList(), error => { assert.ok(isStatus(status)(error)); for (const locale of ['ka', 'en']) assert.doesNotMatch(commentsErrorMessage(error, locale), /PRIVATE INTERNAL ERROR|demo|დემო/); return true })
  }
  assert.match(commentsErrorMessage(new CommentsApiError(409), 'en', 'create'), /already have a comment/)
  assert.match(commentsErrorMessage(new CommentsApiError(409), 'en', 'change'), /Reload/)
})

test('Comments require JSON responses and propagate caller cancellation', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Not an API</html>'))
  await assert.rejects(api.publicList(product.slug), isStatus(502))
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })))
  const controller = new AbortController()
  const pending = api.ownList(0, controller.signal)
  controller.abort()
  await assert.rejects(pending, error => error.name === 'AbortError')
})

test('Comment dates use Georgian month labels and the business timezone in both languages', () => {
  assert.equal(commentDate('2026-09-25T22:30:00Z', 'ka'), '26 სექტემბერი, 2026')
  assert.equal(commentDate('2026-09-25T22:30:00Z', 'en'), '26 Sept 2026')
  assert.equal(commentDate('not a date', 'ka'), '—')
})

const nodes = (node, predicate) => Array.isArray(node) ? node.flatMap(child => nodes(child, predicate)) : node?.props ? [...(predicate(node) ? [node] : []), ...nodes(node.props.children, predicate)] : []
const text = node => Array.isArray(node) ? node.map(text).join('') : node?.props ? text(node.props.children) : typeof node === 'string' || typeof node === 'number' ? String(node) : ''
let instance = 0
// Actual component event handlers/effects run in an in-memory hook host. It uses
// synthetic DTOs and a small dialog/focus stub; no browser or private API is read.
async function driver(kind, options = {}) {
  const locale = options.locale ?? 'en'
  const hooksUrl = moduleUrl(`
    const instance = ${++instance}; let cells = [], cursor = 0, pending = [];
    export const begin = () => { cursor = 0 };
    export const useId = () => 'comments-synthetic-id';
    export function useState(initial) { const i=cursor++; if (!(i in cells)) cells[i]=typeof initial==='function'?initial():initial; return [cells[i],next=>{cells[i]=typeof next==='function'?next(cells[i]):next}] }
    export function useRef(initial) { const i=cursor++; return cells[i]??=( {current:initial} ) }
    export function useEffect(effect,deps) { const i=cursor++; const old=cells[i]; if(!old||deps.some((value,index)=>!Object.is(value,old.deps[index]))) {cells[i]={deps,cleanup:old?.cleanup};pending.push(()=>{cells[i].cleanup?.();cells[i].cleanup=effect()})} }
    export const flush = () => { const callbacks=pending;pending=[];callbacks.forEach(callback=>callback()) };
    export const cleanup = () => { cells.forEach(cell=>cell?.cleanup?.()) };
    export const auth={user:null,checking:false,openAuth(){},clearUser(){this.user=null}};
    export const useCustomerAuth=()=>auth;
  `)
  const hooks = await import(hooksUrl)
  Object.assign(hooks.auth, { user: options.user === undefined ? { id: 'synthetic-customer', role: 'customer', approval_status: 'approved', is_active: true } : options.user, ...options.auth })
  const stubApiUrl = moduleUrl(`export {CommentsApiError,commentsErrorMessage} from ${JSON.stringify(apiUrl)};export const customerCommentsApi={};export const configure=value=>Object.assign(customerCommentsApi,value);`)
  const stubApi = await import(stubApiUrl)
  stubApi.configure({ publicList: async () => publicPage(), ownList: async () => ownPage(), create: async () => ownComment, update: async () => ownComment, remove: async () => {}, ...options.api })
  const path = kind === 'public' ? 'src/components/ProductCommentsDialog.tsx' : 'src/account/CustomerComments.tsx'
  const { code } = await transformWithOxc((await read(path)).replaceAll('import.meta.env', `({DEV:${!!options.dev}})`), path, { jsx: { runtime: 'automatic' } })
  const replacements = { react: hooksUrl, 'react/jsx-runtime': import.meta.resolve('react/jsx-runtime'), '../i18n/LocaleProvider': moduleUrl(`export const useTranslation=()=>({locale:${JSON.stringify(locale)},href:path=>path})`), '../account/CustomerAuthProvider': hooksUrl, './CustomerAuthProvider': hooksUrl, '../account/customerCommentsApi': stubApiUrl, './customerCommentsApi': stubApiUrl, '../account/commentsCopy': new URL('src/account/commentsCopy.ts', root).href, './commentsCopy': new URL('src/account/commentsCopy.ts', root).href, './LaptopIcon': moduleUrl('export function LaptopIcon(){return null}'), '../components/ProductCommentsDialog': moduleUrl('export function ProductCommentsDialog(){return null}'), './demoComments': moduleUrl(stripTypeScriptTypes(await read('src/account/demoComments.ts'), { mode: 'transform' })) }
  replacements['../utils/text'] = new URL('src/utils/text.ts', root).href
  replacements['./productImage'] = imageUrl
  let executable = code.replace(/import\s+(['"])[^'"]+\.css\1;?/g, '')
  for (const [specifier, url] of Object.entries(replacements)) executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(url))
  const component = (await import(moduleUrl(executable)))[kind === 'public' ? 'ProductCommentsDialog' : 'CustomerComments']
  let closes = 0
  const props = kind === 'public' ? { productSlug: product.slug, productName: product.name, onClose: () => { closes++ }, ...(options.isPreview ? { isPreview:true, previewComment:options.previewComment } : {}) } : { isPreview: !!options.isPreview }
  const dialog = { open: false, showModal() { this.open = true }, close() { this.open = false }, focus() {} }
  let tree
  const render = () => { hooks.begin(); tree = component(props); for (const node of nodes(tree, node => node.props.ref)) node.props.ref.current = node.type === 'dialog' ? dialog : { focus() {} }; hooks.flush() }
  const settle = async () => { for(let i=0;i<8;i++){await Promise.resolve();render()} }
  render(); await settle()
  if (options.dev && options.isPreview && kind === 'own') { await new Promise(setImmediate); await settle() }
  return { get tree(){return tree}, get content(){return text(tree)}, get closes(){return closes}, auth:hooks.auth, props, dialog, render, settle, unmount:hooks.cleanup, find:predicate=>nodes(tree,predicate), buttons:label=>nodes(tree,node=>node.type==='button'&&text(node)===label), click(node){assert.ok(node);assert.notEqual(node.props.disabled,true);node.props.onClick();render()}, change(value){const node=nodes(tree,node=>node.type==='textarea')[0];assert.ok(node);node.props.onChange({target:{value}});render()}, submit(){const form=nodes(tree,node=>node.type==='form')[0];assert.ok(form);const promise=form.props.onSubmit({preventDefault(){},currentTarget:{reportValidity:()=>true}});render();return promise} }
}

function dialogEnvironment(t) {
  const previousDocument = globalThis.document
  const previousWindow = globalThis.window
  let focused = 0
  const body = { style: { overflow: 'auto' } }
  globalThis.document = { activeElement: { isConnected:true, focus(){focused++} }, body }
  globalThis.window = { requestAnimationFrame(callback){callback()} }
  t.after(()=>{globalThis.document=previousDocument;globalThis.window=previousWindow})
  return { body, get focused(){return focused} }
}

test('Own-comments empty heading renders Mtavruli while product headings retain their supplied casing', async t => {
  dialogEnvironment(t)
  const name = 'MixedCase ქართული პროდუქტი'
  for (const locale of ['ka', 'en']) {
    const empty = await driver('own', { locale, api: { ownList: async () => ownPage([]) } })
    const heading = text(empty.find(node => node.type === 'h3')[0])
    assert.equal(heading, toGeorgianMtavruli(commentsCopy[locale].ownEmpty))
    if (locale === 'ka') {
      assert.match(heading, /[\u1c90-\u1cbf]/u)
      assert.doesNotMatch(heading, /[\u10d0-\u10ff]/u)
    }
    empty.unmount()
    const populated = await driver('own', { locale, api: { ownList: async () => ownPage([{ ...ownComment, product: { ...product, name } }]) } })
    assert.equal(text(populated.find(node => node.type === 'h3')[0]), name)
    populated.unmount()
  }
})

test('Own comments pair each supplied product name with its photo and retain a safe image fallback', async () => {
  const source = '/assets/products/kingston-nv3-figma.png'
  const view = await driver('own', { api: { ownList: async () => ownPage([{ ...ownComment, product: { ...product, image_url: source } }]) } })
  const html = renderToStaticMarkup(view.tree)
  assert.match(html, /class="comment-own__photo"/)
  assert.match(html, /src="\/assets\/products\/kingston-nv3-figma\.png"/)
  assert.match(html, /alt=""[^>]*width="64"[^>]*height="64"[^>]*loading="lazy"[^>]*decoding="async"[^>]*referrerPolicy="no-referrer"/)
  assert.equal(view.buttons(product.name).length, 1)
  view.unmount()
  for (const [available, image] of [[true, undefined], [true, 'javascript:alert(1)'], [false, source]]) {
    const unavailable = await driver('own', { api: { ownList: async () => ownPage([{ ...ownComment, product_available: available, product: { ...product, image_url: image } }]) } })
    const markup = renderToStaticMarkup(unavailable.tree)
    assert.doesNotMatch(markup, /<img\b/)
    assert.ok(markup.includes(product.name))
    unavailable.unmount()
  }
})

test('Public comments escape plain text, gate writing, and restore modal scrolling and focus', async t => {
  const environment = dialogEnvironment(t)
  let mode
  const value = '<img src=x onerror=alert(1)>'
  const view = await driver('public', { user:null, auth:{openAuth:next=>{mode=next}}, api:{publicList:async()=>publicPage([{...comment,text:value}])} })
  assert.equal(view.dialog.open,true)
  assert.equal(environment.body.style.overflow,'hidden')
  const html = renderToStaticMarkup(view.tree)
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(html,/<img src=x/)
  assert.equal(view.find(node=>node.type==='textarea').length,0)
  assert.match(view.content,/first name|first name/i)
  view.click(view.buttons('Sign in to add a comment')[0])
  assert.equal(mode,'login')
  assert.equal(view.closes,1)
  view.unmount()
  assert.equal(environment.body.style.overflow,'auto')
  assert.equal(environment.focused,1)
})

test('Public comment publication prevents duplicate submissions and modal dismissal while pending', async t => {
  dialogEnvironment(t)
  let resolve, calls=0
  const view=await driver('public',{api:{create:()=>{calls++;return new Promise(done=>{resolve=done})}}})
  view.change(' New comment ')
  const pending=view.submit()
  view.submit()
  assert.equal(calls,1)
  const dialog=view.find(node=>node.type==='dialog')[0]
  dialog.props.onCancel({preventDefault(){}})
  assert.equal(view.closes,0)
  resolve({...ownComment,text:'New comment'})
  await pending;await view.settle()
  assert.match(view.content,/New comment/)
  assert.equal(view.find(node=>node.type==='textarea').length,0)
  view.unmount()
})

test('Changing auth identity cancels a pending public mutation and ignores its late success', async t => {
  dialogEnvironment(t)
  let resolve, signal
  const view=await driver('public',{api:{create:(_slug,_text,cancel)=>{signal=cancel;return new Promise(done=>{resolve=done})}}})
  view.change('Old owner draft')
  const pending=view.submit()
  view.auth.user=null;view.render()
  assert.equal(signal.aborted,true)
  resolve({...ownComment,text:'Old owner draft'})
  await pending;await view.settle()
  assert.doesNotMatch(view.content,/Old owner draft/)
  assert.equal(view.find(node=>node.type==='textarea').length,0)
  view.unmount()
})

test('Public pagination prevents simultaneous publication and manage link opens the comments section', async t => {
  dialogEnvironment(t)
  let finish, writes=0
  const view=await driver('public',{api:{publicList:async(_slug,offset)=>offset===0?publicPage([comment],0,true):new Promise(resolve=>{finish=resolve}),create:async()=>{writes++;return ownComment}}})
  view.change('A new comment')
  view.click(view.buttons('Load more')[0])
  assert.equal(view.find(node=>node.type==='button'&&node.props.type==='submit')[0].props.disabled,true)
  await view.submit()
  assert.equal(writes,0)
  assert.equal(view.find(node=>node.type==='a'&&node.props.href==='/account/?section=comments').length,1)
  finish(publicPage([],20));await view.settle()
  assert.equal(view.find(node=>node.type==='button'&&node.props.type==='submit')[0].props.disabled,false)
  view.unmount()
})

test('Unapproved accounts cannot write and inaccessible products show an error, not an empty list', async t => {
  dialogEnvironment(t)
  for(const locale of ['ka','en']) {
    const unapproved=await driver('public',{locale,user:{id:'pending-customer',role:'customer',approval_status:'pending',is_active:true}})
    assert.equal(unapproved.find(node=>node.type==='textarea').length,0)
    unapproved.unmount()
    const unavailable=await driver('public',{locale,api:{publicList:async()=>{throw new CommentsApiError(404)}}})
    assert.equal(unavailable.find(node=>node.props.role==='alert').length,1)
    assert.equal(unavailable.find(node=>node.type==='textarea'||node.props.className==='comments-empty').length,0)
    unavailable.unmount()
  }
})

test('Own comments edit with the stored version and require explicit confirmation before deletion', async () => {
  const calls=[]
  const view=await driver('own',{api:{update:async(id,value,version)=>{calls.push(['edit',id,value,version]);return {...ownComment,text:value,version:2}},remove:async(id,version)=>{calls.push(['delete',id,version])}}})
  view.click(view.buttons('Edit')[0]);view.change('Edited safely');await view.submit();await view.settle()
  assert.deepEqual(calls,[['edit',comment.id,'Edited safely',1]])
  assert.match(view.content,/Edited safely/)
  view.click(view.buttons('Delete')[0])
  assert.equal(calls.length,1)
  assert.equal(view.find(node=>node.props.role==='group').length,1)
  view.click(view.buttons('Yes, delete')[0]);await view.settle()
  assert.deepEqual(calls[1],['delete',comment.id,2])
  assert.doesNotMatch(view.content,/Edited safely/)
  view.unmount()
})

test('Product tiles and existing footer actions open the same exact product comment dialog in both languages', async () => {
  for (const locale of ['ka', 'en']) {
    const view = await driver('own', { locale })
    const name = view.buttons(product.name)[0]
    assert.ok(name)
    assert.equal(name.props.className, 'comment-product-link')
    assert.equal(name.props.type, 'button')
    assert.equal(name.props['aria-haspopup'], 'dialog')
    assert.equal(name.props['aria-label'], `${commentsCopy[locale].viewProduct}: ${product.name}`)
    assert.equal(view.find(node => node.type === 'h3' && nodes(node, child => child === name).length === 1).length, 1)
    const tile = view.find(node => node.props.className === 'comment-own__heading')[0]
    assert.equal(nodes(tile, node => node.type === 'button').length, 1)
    assert.equal(nodes(tile, node => node.type === 'time').length, 1)
    assert.equal(nodes(tile, node => node.type === 'a' || node.type === 'input').length, 0)
    const dialog = () => view.find(node => typeof node.type === 'function' && node.type.name === 'ProductCommentsDialog')[0]
    view.click(name)
    assert.equal(dialog().props.productSlug, product.slug)
    assert.equal(dialog().props.productName, product.name)
    assert.equal(dialog().props.isPreview, false)
    assert.equal(dialog().props.previewComment, undefined)
    dialog().props.onClose(); view.render()
    assert.equal(dialog(), undefined)
    view.click(view.buttons(locale === 'ka' ? 'პროდუქტის კომენტარების ნახვა' : 'View product comments')[0])
    assert.equal(dialog().props.productSlug, product.slug)
    assert.equal(dialog().props.productName, product.name)
    view.unmount()
  }
})

test('Product-tile navigation is disabled while an own comment save or next page is pending', async () => {
  let finishSave, finishPage
  const view = await driver('own', { api: {
    ownList: async offset => offset === 0 ? ownPage([ownComment], 0, true) : new Promise(resolve => { finishPage = resolve }),
    update: async () => new Promise(resolve => { finishSave = resolve }),
  } })
  view.click(view.buttons('Edit')[0]); view.change('Pending edit'); view.submit()
  assert.equal(view.buttons(product.name)[0].props.disabled, true)
  finishSave({ ...ownComment, text:'Pending edit', version:2 }); await view.settle()
  assert.equal(view.buttons(product.name)[0].props.disabled, false)
  view.click(view.buttons('Load more')[0])
  assert.equal(view.buttons(product.name)[0].props.disabled, true)
  assert.equal(view.buttons('View product comments')[0].props.disabled, true)
  finishPage(ownPage([], 20)); await view.settle()
  assert.equal(view.buttons(product.name)[0].props.disabled, false)
  view.unmount()
})

test('The product action spans the entire white comment tile without extending over edit or delete actions', async () => {
  const css = await read('src/styles/customer-comments.css')
  const heading = css.match(/^\.comment-own__heading\s*\{([^}]+)\}/m)?.[1] ?? ''
  const hitArea = css.match(/\.comment-product-link::after\s*\{([^}]+)\}/)?.[1] ?? ''
  assert.match(heading, /position:\s*relative/)
  assert.match(hitArea, /position:\s*absolute/)
  assert.match(hitArea, /inset:\s*0/)
  assert.match(css, /\.comment-product-link:focus-visible::after\s*\{[^}]*outline:\s*3px solid/)
  const view = await driver('own')
  const tile = view.find(node => node.props.className === 'comment-own__heading')[0]
  assert.equal(nodes(tile, node => node === view.buttons('Edit')[0] || node === view.buttons('Delete')[0]).length, 0)
  view.unmount()
})

test('DEV preview opens the selected demo product with its current edited comment without private API requests', async () => {
  let calls = 0
  const api = Object.fromEntries(['publicList','ownList','create','update','remove'].map(name => [name, async () => { calls++; throw new Error('Preview must not request an API') }]))
  const view = await driver('own', { dev:true, isPreview:true, api })
  assert.equal(view.find(node => node.props.className === 'comments-notice').length, 0)
  assert.doesNotMatch(view.content, /Demo · changes apply only/)
  const name = view.find(node => node.type === 'button' && node.props.className === 'comment-product-link')[0]
  assert.ok(name)
  const productName = text(name)
  view.click(view.buttons('Edit')[0]); view.change('Current in-memory preview edit'); view.submit(); await view.settle()
  assert.equal(text(view.find(node => node.props.role === 'status')[0]), commentsCopy.en.localChanged)
  view.click(view.buttons(productName)[0])
  const dialog = view.find(node => typeof node.type === 'function' && node.type.name === 'ProductCommentsDialog')[0]
  assert.ok(dialog)
  assert.equal(dialog.props.isPreview, true)
  assert.equal(dialog.props.productName, productName)
  assert.equal(dialog.props.productSlug, dialog.props.previewComment.product.slug)
  assert.equal(dialog.props.previewComment.text, 'Current in-memory preview edit')
  assert.equal(calls, 0)
  view.unmount()
})

test('Product comment previews remain read-only in DEV and fail closed in production without any API call', async t => {
  dialogEnvironment(t)
  let calls = 0
  const api = Object.fromEntries(['publicList','ownList','create','update','remove'].map(name => [name, async () => { calls++; throw new Error('Preview must not request an API') }]))
  for (const dev of [true, false]) {
    const view = await driver('public', { dev, isPreview:true, previewComment:ownComment, api })
    assert.equal(view.find(node => node.type === 'form' || node.type === 'textarea').length, 0)
    if (dev) {
      assert.match(view.content, /A useful product/)
      assert.doesNotMatch(view.content, /Demo/i)
      assert.equal(view.find(node => node.props.className?.includes('comments-preview-notice')).length, 0)
      assert.equal(view.find(node => node.props.role === 'alert').length, 0)
    } else {
      assert.doesNotMatch(view.content, /A useful product/)
      assert.equal(view.find(node => node.props.role === 'alert').length, 1)
    }
    view.unmount()
  }
  assert.equal(calls, 0)
})

test('Preview comment deletion stays page-local while real comments retain their public notice', async () => {
  for (const locale of ['ka', 'en']) {
    const preview = await driver('own', { dev: true, isPreview: true, locale })
    assert.equal(preview.find(node => node.props.className === 'comments-notice').length, 0)
    preview.click(preview.buttons(commentsCopy[locale].remove)[0])
    assert.ok(preview.content.includes(commentsCopy[locale].localDeleteText))
    assert.ok(!preview.content.includes(commentsCopy[locale].deleteText))
    preview.click(preview.buttons(commentsCopy[locale].confirmDelete)[0]); await preview.settle()
    assert.equal(text(preview.find(node => node.props.role === 'status')[0]), commentsCopy[locale].localChanged)
    preview.unmount()
    const real = await driver('own', { locale })
    assert.equal(text(real.find(node => node.props.className === 'comments-notice')[0]), commentsCopy[locale].publicNotice)
    real.unmount()
  }
})

test('Cabinet comments use the available panel width without a narrower fixed cap', async () => {
  const css = await read('src/styles/customer-comments.css')
  const rule = css.match(/\.customer-comments\s*\{([^}]+)\}/)?.[1] ?? ''
  assert.match(rule, /width:\s*100%/)
  assert.match(rule, /min-width:\s*0/)
  assert.doesNotMatch(rule, /max-width/)
  assert.doesNotMatch(css, /\.comments-preview-notice/)
})

test('Conflicted own edits retain the existing record and hidden products cannot open a public dialog', async () => {
  const view=await driver('own',{api:{ownList:async()=>ownPage([{...ownComment,product_available:false}]),update:async()=>{throw new CommentsApiError(409)}}})
  assert.equal(view.buttons('View product comments').length,0)
  assert.equal(view.buttons(product.name).length,0)
  assert.equal(text(view.find(node=>node.type==='h3')[0]),product.name)
  view.click(view.buttons('Edit')[0]);view.change('Unconfirmed draft');await view.submit();await view.settle()
  assert.match(view.content,/Reload the list/)
  view.click(view.buttons('Cancel')[0])
  assert.match(view.content,/A useful product/)
  assert.doesNotMatch(view.content,/Unconfirmed draft/)
  view.unmount()
})

test('Deletion adjusts the next page offset so remaining own comments are not skipped', async () => {
  const offsets=[]
  const view=await driver('own',{api:{ownList:async offset=>{offsets.push(offset);return ownPage([ownComment],offset,offset===0)}}})
  view.click(view.buttons('Delete')[0]);view.click(view.buttons('Yes, delete')[0]);await view.settle()
  view.click(view.buttons('Load more')[0]);await view.settle()
  assert.deepEqual(offsets,[0,19])
  view.unmount()
})

test('Own comments production preview and unauthenticated states never fetch or inject fictional records', async () => {
  let calls=0
  for(const options of [{isPreview:true},{user:null}]) {
    const view=await driver('own',{...options,api:{ownList:async()=>{calls++;return ownPage()}}})
    assert.equal(view.find(node=>node.props.role==='alert').length,1)
    assert.equal(view.find(node=>node.type==='li').length,0)
    view.unmount()
  }
  assert.equal(calls,0)
})

test('Comment preview fixture is absent from all production JavaScript assets', async () => {
  const assets=await readdir(new URL('dist/assets/',root))
  const scripts=assets.filter(name=>name.endsWith('.js'))
  assert.ok(scripts.length)
  assert.ok(!scripts.some(name=>/demoComments/i.test(name)))
  for(const name of scripts) assert.doesNotMatch(await read(`dist/assets/${name}`),/demo-comment-preview-only/)
})
