import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import { useCustomerAuth } from './CustomerAuthProvider'
import { commentsCopy, commentDate } from './commentsCopy'
import { CommentsApiError, commentsErrorMessage, customerCommentsApi, type CustomerComment } from './customerCommentsApi'
import { ProductCommentsDialog } from '../components/ProductCommentsDialog'
import { getProductImageUrl } from './productImage'
import '../styles/customer-comments.css'

function CommentProductPhoto({ source }: { source?: string | null }) {
  const imageUrl = getProductImageUrl(source)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  return <span className="comment-own__photo" aria-hidden="true">
    {imageUrl && imageUrl !== failedSource
      ? <img src={imageUrl} alt="" width="64" height="64" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedSource(imageUrl)} />
      : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5" /></svg>}
  </span>
}

export function CustomerComments({ isPreview }: { isPreview: boolean }) {
  const { locale } = useTranslation()
  const copy = commentsCopy[locale]
  const auth = useCustomerAuth()
  const owner = auth.user?.role === 'customer' && auth.user.approval_status === 'approved' && auth.user.is_active ? auth.user.id : ''
  const ownerRef = useRef(owner)
  ownerRef.current = owner
  const id = useId()
  const generation = useRef(0)
  const readRef = useRef<AbortController | null>(null)
  const writeRef = useRef<AbortController | null>(null)
  const writeBusy = useRef(false)
  const readBusy = useRef(false)
  const [comments, setComments] = useState<CustomerComment[]>([])
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [viewProduct, setViewProduct] = useState<CustomerComment | null>(null)
  const draftRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const attempt = ++generation.current
    const controller = new AbortController()
    readRef.current = controller; readBusy.current = true; writeBusy.current = false
    setComments([]); setPhase('loading'); setError(''); setSuccess(''); setNextOffset(null); setEditing(null); setDeleting(null); setDraft(''); setBusy(false); setLoadingMore(false); setViewProduct(null)
    const load = async () => {
      try {
        if (isPreview) {
          if (!import.meta.env.DEV) throw new CommentsApiError(403)
          const demo = await import('./demoComments')
          if (!controller.signal.aborted && attempt === generation.current) { setComments(demo.getDemoComments(locale)); setPhase('ready') }
        } else {
          if (!owner) throw new CommentsApiError(403)
          const result = await customerCommentsApi.ownList(0, controller.signal)
          if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === owner) {
            setComments(result.comments); setNextOffset(result.has_more ? result.offset + result.limit : null); setPhase('ready')
          }
        }
      } catch (cause) {
        if (!controller.signal.aborted && attempt === generation.current) { setError(commentsErrorMessage(cause, locale)); setPhase('error') }
      } finally { if (attempt === generation.current) readBusy.current = false }
    }
    void load()
    return () => { generation.current++; controller.abort(); readRef.current?.abort(); writeRef.current?.abort(); writeBusy.current = false }
  }, [owner, isPreview, locale, reload])

  useEffect(() => { if (editing) draftRef.current?.focus() }, [editing])

  async function loadMore() {
    if (isPreview || !owner || nextOffset === null || readBusy.current || writeBusy.current) return
    const attempt = generation.current
    const controller = new AbortController()
    readRef.current = controller; readBusy.current = true; setLoadingMore(true); setError('')
    try {
      const result = await customerCommentsApi.ownList(nextOffset, controller.signal)
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === owner) {
        setComments(previous => [...previous, ...result.comments.filter(comment => !previous.some(existing => existing.id === comment.id))]); setNextOffset(result.has_more ? result.offset + result.limit : null)
      }
    } catch (cause) {
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === owner) setError(commentsErrorMessage(cause, locale))
    } finally { if (attempt === generation.current) { readBusy.current = false; setLoadingMore(false) } }
  }

  async function mutate(comment: CustomerComment, remove = false) {
    if (writeBusy.current || readBusy.current || (!isPreview && !owner)) return
    if (!remove && (!draft.trim() || draft.trim().length > 2000)) { setError(commentsErrorMessage(new CommentsApiError(422), locale)); return }
    const attempt = generation.current
    const actor = owner
    const controller = new AbortController()
    writeRef.current = controller; writeBusy.current = true; setBusy(true); setError(''); setSuccess('')
    try {
      let updated: CustomerComment | undefined
      if (isPreview && import.meta.env.DEV) {
        if (!remove) updated = { ...comment, text: draft.trim(), version: comment.version + 1, updated_at: new Date().toISOString() }
      } else if (isPreview) throw new CommentsApiError(403)
      else if (remove) await customerCommentsApi.remove(comment.id, comment.version, controller.signal)
      else updated = await customerCommentsApi.update(comment.id, draft, comment.version, controller.signal)
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === actor) {
        setComments(previous => remove ? previous.filter(item => item.id !== comment.id) : previous.map(item => item.id === comment.id ? updated! : item))
        if (remove) setNextOffset(previous => previous === null ? null : Math.max(0, previous - 1))
        setEditing(null); setDeleting(null); setDraft(''); setSuccess(isPreview ? copy.localChanged : remove ? copy.removed : copy.saved)
      }
    } catch (cause) {
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === actor) {
        setError(commentsErrorMessage(cause, locale, 'change'))
        if (cause instanceof CommentsApiError && cause.status === 401) auth.clearUser()
      }
    } finally { if (attempt === generation.current && ownerRef.current === actor) { writeBusy.current = false; setBusy(false) } }
  }

  const submit = (event: FormEvent<HTMLFormElement>, comment: CustomerComment) => { event.preventDefault(); if (event.currentTarget.reportValidity()) void mutate(comment) }
  return <div className="customer-comments" aria-busy={busy}>
    {!isPreview && <p className="comments-notice">{copy.publicNotice}</p>}
    {phase === 'loading' && <p className="comments-state" role="status">{copy.loading}</p>}
    {error && <div className="comments-error"><p role="alert">{error}</p><button type="button" disabled={busy || loadingMore} onClick={() => setReload(value => value + 1)}>{copy.reload}</button></div>}
    {success && <p className="comments-success" role="status">{success}</p>}
    {phase === 'ready' && (comments.length ? <ol className="comments-list" aria-label={copy.ownTitle}>{comments.map(comment => <li className="comment-own" key={comment.id}>
      <div className="comment-own__heading">
        <CommentProductPhoto source={comment.product_available ? comment.product.image_url : null} />
        <div className="comment-own__product"><h3>{comment.product_available ? <button type="button" className="comment-product-link" aria-label={`${copy.viewProduct}: ${comment.product.name}`} aria-haspopup="dialog" disabled={busy || loadingMore} onClick={() => setViewProduct(comment)}>{comment.product.name}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></button> : comment.product.name}</h3><time dateTime={comment.created_at}>{commentDate(comment.created_at, locale)}</time></div>
      </div>
      {editing === comment.id ? <form onSubmit={event => submit(event, comment)} aria-busy={busy}>
        <label className="comments-sr-only" htmlFor={`${id}-edit`}>{copy.edit}</label><textarea ref={draftRef} id={`${id}-edit`} value={draft} onChange={event => setDraft(event.target.value)} rows={4} maxLength={2000} required disabled={busy} />
        <div className="comments-actions"><button className="comments-primary" type="submit" disabled={busy || !draft.trim()}>{busy ? copy.saving : copy.save}</button><button className="comments-secondary" type="button" disabled={busy} onClick={() => { setEditing(null); setDraft('') }}>{copy.cancel}</button></div>
      </form> : <p className="comment-text">{comment.text}</p>}
      {comment.updated_at !== comment.created_at && <small>{copy.updated} · {commentDate(comment.updated_at, locale)}</small>}
      {deleting === comment.id ? <div className="comment-delete" role="group" aria-label={copy.deleteQuestion}><strong>{copy.deleteQuestion}</strong><p>{isPreview ? copy.localDeleteText : copy.deleteText}</p><div className="comments-actions"><button className="comments-danger" type="button" disabled={busy} onClick={() => { void mutate(comment, true) }}>{busy ? copy.deleting : copy.confirmDelete}</button><button className="comments-secondary" type="button" disabled={busy} onClick={() => setDeleting(null)}>{copy.cancel}</button></div></div> : editing !== comment.id && <div className="comment-own__footer"><div className="comments-actions"><button type="button" className="comments-secondary" disabled={busy || loadingMore} onClick={() => { setEditing(comment.id); setDeleting(null); setDraft(comment.text); setError(''); setSuccess('') }}>{copy.edit}</button><button type="button" className="comments-delete-link" disabled={busy || loadingMore} onClick={() => { setDeleting(comment.id); setEditing(null); setError(''); setSuccess('') }}>{copy.remove}</button></div>{comment.product_available && !isPreview && <button type="button" className="comments-text-link" disabled={busy || loadingMore} onClick={() => setViewProduct(comment)}>{copy.viewProduct}</button>}</div>}
      {!comment.product_available && <p className="comments-unavailable">{copy.unavailable}</p>}
    </li>)}</ol> : <div className="comments-empty"><h3>{toGeorgianMtavruli(copy.ownEmpty)}</h3><p>{copy.ownEmptyText}</p></div>)}
    {nextOffset !== null && <button type="button" className="comments-more" disabled={busy || loadingMore} onClick={() => { void loadMore() }}>{loadingMore ? copy.loadingMore : copy.more}</button>}
    {viewProduct && <ProductCommentsDialog productSlug={viewProduct.product.slug} productName={viewProduct.product.name} isPreview={isPreview} previewComment={isPreview ? viewProduct : undefined} onClose={() => setViewProduct(null)} />}
  </div>
}

export default CustomerComments
