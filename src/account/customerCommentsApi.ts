import { getProductImageUrl } from './productImage'

const apiBase = (import.meta.env.VITE_TECSERVICE_API_BASE ?? '').replace(/\/$/, '')

export type CommentProduct = { id: string; slug: string; name: string; image_url?: string | null }
export type PublicProductComment = { id: string; text: string; author_name: string; created_at: string; updated_at: string }
export type CustomerComment = PublicProductComment & { version: number; product: CommentProduct; product_available: boolean }
export type PublicCommentsPage = { product: CommentProduct; comments: PublicProductComment[]; limit: number; offset: number; has_more: boolean }
export type CustomerCommentsPage = { comments: CustomerComment[]; limit: number; offset: number; has_more: boolean }

export class CommentsApiError extends Error {
  constructor(public status: number) { super('Comment request failed') }
}

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const textValue = (value: unknown, max: number): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max
export const validCommentSlug = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 200
const safeId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value)
const dateValue = (value: unknown): value is string => typeof value === 'string' && value.length <= 64 && Number.isFinite(Date.parse(value))
const positiveInteger = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0

function product(value: unknown): CommentProduct {
  if (!isObject(value) || !safeId(value.id) || !validCommentSlug(value.slug) || !textValue(value.name, 500)) throw new CommentsApiError(502)
  return { id: value.id, slug: value.slug, name: value.name, image_url: getProductImageUrl(typeof value.image_url === 'string' ? value.image_url : null) }
}
function publicComment(value: unknown): PublicProductComment {
  if (!isObject(value) || !safeId(value.id) || !textValue(value.text, 2000) || !textValue(value.author_name, 160) || !dateValue(value.created_at) || !dateValue(value.updated_at)) throw new CommentsApiError(502)
  // Project only public fields, never pass accidental private response fields to UI.
  return { id: value.id, text: value.text, author_name: value.author_name, created_at: value.created_at, updated_at: value.updated_at }
}
function ownComment(value: unknown): CustomerComment {
  const comment = publicComment(value)
  if (!isObject(value) || !positiveInteger(value.version) || typeof value.product_available !== 'boolean') throw new CommentsApiError(502)
  const commentProduct = product(value.product)
  return { ...comment, version: value.version, product: { ...commentProduct, image_url: value.product_available ? commentProduct.image_url : null }, product_available: value.product_available }
}
function pagination(value: unknown) {
  if (!isObject(value) || !positiveInteger(value.limit) || value.limit > 100 || !Number.isSafeInteger(value.offset) || Number(value.offset) < 0 || typeof value.has_more !== 'boolean' || !Array.isArray(value.comments) || value.comments.length > value.limit) throw new CommentsApiError(502)
  return { limit: value.limit, offset: value.offset as number, has_more: value.has_more, comments: value.comments }
}
function offsetQuery(offset: number) {
  if (!Number.isSafeInteger(offset) || offset < 0) throw new CommentsApiError(422)
  return `?limit=20&offset=${offset}`
}
function commentPath(id: string) {
  if (!safeId(id)) throw new CommentsApiError(422)
  return `/portal/comments/${encodeURIComponent(id)}`
}
function productPath(slug: string) {
  if (!validCommentSlug(slug)) throw new CommentsApiError(422)
  return `/shop/products/${encodeURIComponent(slug)}/comments`
}
function commentBody(text: string) {
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 2000) throw new CommentsApiError(422)
  return { text: text.trim() }
}
function versionBody(version: number) {
  if (!positiveInteger(version)) throw new CommentsApiError(422)
  return { version }
}

async function request(path: string, options: { body?: unknown; signal?: AbortSignal; publicRead?: boolean } = {}): Promise<unknown> {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  options.signal?.addEventListener('abort', cancel, { once: true })
  if (options.signal?.aborted) controller.abort()
  const timeout = setTimeout(cancel, 15000)
  try {
    const response = await fetch(`${apiBase}/api${path}`, {
      method: options.body === undefined ? 'GET' : 'POST',
      credentials: options.publicRead ? 'omit' : 'include',
      cache: 'no-store', signal: controller.signal,
      headers: { Accept: 'application/json', ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    })
    if (!response.ok) throw new CommentsApiError(response.status)
    if (response.status === 204) return undefined
    if (!response.headers.get('content-type')?.includes('application/json')) throw new CommentsApiError(502)
    try { return await response.json() } catch { throw new CommentsApiError(502) }
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', cancel)
  }
}

export const customerCommentsApi = {
  publicList: async (slug: string, offset = 0, signal?: AbortSignal): Promise<PublicCommentsPage> => {
    const data = await request(`${productPath(slug)}${offsetQuery(offset)}`, { signal, publicRead: true })
    const page = pagination(data)
    const result = { ...page, product: product((data as Record<string, unknown>).product), comments: page.comments.map(publicComment) }
    if (result.product.slug !== slug || result.offset !== offset) throw new CommentsApiError(502)
    return result
  },
  ownList: async (offset = 0, signal?: AbortSignal): Promise<CustomerCommentsPage> => {
    const data = await request(`/portal/comments${offsetQuery(offset)}`, { signal })
    const page = pagination(data)
    if (page.offset !== offset) throw new CommentsApiError(502)
    return { ...page, comments: page.comments.map(ownComment) }
  },
  create: async (slug: string, text: string, signal?: AbortSignal) => {
    const result = ownComment(await request(productPath(slug), { body: commentBody(text), signal }))
    if (result.product.slug !== slug) throw new CommentsApiError(502)
    return result
  },
  update: async (id: string, text: string, version: number, signal?: AbortSignal) => {
    const result = ownComment(await request(commentPath(id), { body: { ...commentBody(text), ...versionBody(version) }, signal }))
    if (result.id !== id) throw new CommentsApiError(502)
    return result
  },
  remove: async (id: string, version: number, signal?: AbortSignal): Promise<void> => {
    const result = await request(`${commentPath(id)}/delete`, { body: versionBody(version), signal })
    if (result !== undefined) throw new CommentsApiError(502)
  },
}

export function commentsErrorMessage(error: unknown, locale: 'ka' | 'en', action: 'read' | 'create' | 'change' = 'read') {
  const en = locale === 'en'
  if (error instanceof CommentsApiError) {
    if (error.status === 401) return en ? 'Your session has expired. Please sign in again.' : 'სესია დასრულდა. გთხოვთ, ხელახლა შეხვიდეთ.'
    if (error.status === 403) return en ? 'This action requires an approved customer account.' : 'ამ მოქმედებისთვის საჭიროა დადასტურებული მომხმარებლის ანგარიში.'
    if (error.status === 404) return en ? 'This product or comment is no longer available.' : 'ეს პროდუქტი ან კომენტარი აღარ არის ხელმისაწვდომი.'
    if (error.status === 409) return action === 'create' ? en ? 'You already have a comment on this product. You can edit it in your account.' : 'ამ პროდუქტზე კომენტარი უკვე გაქვთ. მისი შეცვლა პირადი კაბინეტიდან შეგიძლიათ.' : en ? 'This comment has changed. Reload the list before trying again.' : 'კომენტარი შეცვლილია. ხელახლა ჩატვირთეთ სია და სცადეთ თავიდან.'
    if (error.status === 422) return en ? 'Enter a comment between 1 and 2,000 characters.' : 'შეიყვანეთ კომენტარი 1-დან 2 000 სიმბოლომდე.'
    if (error.status === 429) return en ? 'Too many attempts. Please wait and try again.' : 'დაფიქსირდა ბევრი მცდელობა. ცოტა ხანში სცადეთ ხელახლა.'
  }
  return en ? 'Comments are temporarily unavailable. The action was not confirmed. Please try again.' : 'კომენტარები დროებით მიუწვდომელია. მოქმედება არ დადასტურებულა. სცადეთ ხელახლა.'
}
