import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from '../i18n/LocaleProvider'
import { useCustomerAuth } from '../account/CustomerAuthProvider'
import { CommentsApiError, commentsErrorMessage, customerCommentsApi, type PublicCommentsPage, type PublicProductComment } from '../account/customerCommentsApi'
import { commentDate, commentsCopy } from '../account/commentsCopy'
import { LaptopIcon } from './LaptopIcon'
import '../styles/customer-comments.css'

export type ProductCommentsDialogProps = { productSlug: string; productName: string; onClose: () => void; isPreview?: boolean; previewComment?: PublicProductComment }

export function ProductCommentsDialog({ productSlug, productName, onClose, isPreview = false, previewComment }: ProductCommentsDialogProps) {
  const { locale, href } = useTranslation()
  const copy = commentsCopy[locale]
  const auth = useCustomerAuth()
  const approved = !!auth.user && auth.user.role === 'customer' && auth.user.approval_status === 'approved' && auth.user.is_active
  const owner = approved ? auth.user!.id : ''
  const ownerRef = useRef(owner)
  ownerRef.current = owner
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const readRef = useRef<AbortController | null>(null)
  const writeRef = useRef<AbortController | null>(null)
  const readBusy = useRef(false)
  const writeBusy = useRef(false)
  const generation = useRef(0)
  const [page, setPage] = useState<PublicCommentsPage | null>(null)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reload, setReload] = useState(0)
  const [moreLoading, setMoreLoading] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const attempt = ++generation.current
    const controller = new AbortController()
    readRef.current?.abort(); readRef.current = controller; readBusy.current = true
    writeRef.current?.abort(); writeBusy.current = false
    setPage(null); setPhase('loading'); setError(''); setFormError(''); setDraft(''); setPosted(false); setPosting(false); setMoreLoading(false)
    const load = async (): Promise<PublicCommentsPage> => {
      if (isPreview) {
        if (!import.meta.env.DEV || !previewComment) throw new CommentsApiError(403)
        const { id, text, author_name, created_at, updated_at } = previewComment
        return { product: { id: 'preview', slug: productSlug, name: productName }, comments: [{ id, text, author_name, created_at, updated_at }], limit: 20, offset: 0, has_more: false }
      }
      return customerCommentsApi.publicList(productSlug, 0, controller.signal)
    }
    load().then(result => {
      if (!controller.signal.aborted && attempt === generation.current) { setPage(result); setPhase('ready') }
    }).catch(cause => {
      if (!controller.signal.aborted && attempt === generation.current) { setError(commentsErrorMessage(cause, locale)); setPhase('error') }
    }).finally(() => { if (attempt === generation.current) readBusy.current = false })
    return () => { generation.current++; controller.abort(); readRef.current?.abort(); writeRef.current?.abort(); writeBusy.current = false }
  }, [productSlug, productName, locale, reload, isPreview, previewComment])

  useEffect(() => {
    writeRef.current?.abort(); writeBusy.current = false
    setPosting(false); setPosted(false); setFormError(''); setDraft('')
  }, [owner])

  async function loadMore() {
    if (isPreview || !page?.has_more || readBusy.current || writeBusy.current) return
    const attempt = generation.current
    const controller = new AbortController()
    readRef.current = controller; readBusy.current = true; setMoreLoading(true); setError('')
    try {
      const result = await customerCommentsApi.publicList(productSlug, page.offset + page.limit, controller.signal)
      if (!controller.signal.aborted && attempt === generation.current) setPage(previous => previous ? { ...result, comments: [...previous.comments, ...result.comments.filter(comment => !previous.comments.some(existing => existing.id === comment.id))] } : result)
    } catch (cause) {
      if (!controller.signal.aborted && attempt === generation.current) setError(commentsErrorMessage(cause, locale))
    } finally {
      if (attempt === generation.current) { readBusy.current = false; setMoreLoading(false) }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPreview || !owner || ownerRef.current !== owner || writeBusy.current || readBusy.current || phase !== 'ready' || !event.currentTarget.reportValidity()) return
    const text = draft.trim()
    if (!text || text.length > 2000) { setFormError(commentsErrorMessage(new CommentsApiError(422), locale)); return }
    const attempt = generation.current
    const actor = owner
    const controller = new AbortController()
    writeRef.current = controller; writeBusy.current = true; setPosting(true); setFormError('')
    try {
      const result = await customerCommentsApi.create(productSlug, text, controller.signal)
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === actor) {
        setPage(previous => previous ? { ...previous, comments: [result, ...previous.comments.filter(comment => comment.id !== result.id)] } : previous)
        setDraft(''); setPosted(true)
      }
    } catch (cause) {
      if (!controller.signal.aborted && attempt === generation.current && ownerRef.current === actor) {
        setFormError(commentsErrorMessage(cause, locale, 'create'))
        if (cause instanceof CommentsApiError && cause.status === 401) auth.clearUser()
      }
    } finally {
      if (attempt === generation.current && ownerRef.current === actor) { writeBusy.current = false; setPosting(false) }
    }
  }

  const close = () => { if (!writeBusy.current) onClose() }
  const signIn = () => { close(); window.requestAnimationFrame(() => auth.openAuth('login')) }
  return <dialog ref={dialogRef} className="product-comments-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-product`} onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className="product-comments-dialog__panel">
      <header className="product-comments-dialog__heading"><div><h2 id={`${id}-title`}>{copy.title}</h2><p id={`${id}-product`}>{page?.product.name ?? productName}</p></div><button type="button" className="comments-close" onClick={close} disabled={posting} aria-label={copy.close}><LaptopIcon name="close" /></button></header>
      {phase === 'loading' && <p className="comments-state" role="status">{copy.loading}</p>}
      {error && <div className="comments-error"><p role="alert">{error}</p><button type="button" disabled={posting || moreLoading} onClick={() => setReload(value => value + 1)}>{copy.retry}</button></div>}
      {phase === 'ready' && <>
        {page?.comments.length ? <ol className="comments-list" aria-label={copy.title}>{page.comments.map(comment => <li className="comment-public" key={comment.id}>
          <div className="comment-public__heading"><strong>{comment.author_name}</strong><time dateTime={comment.created_at}>{commentDate(comment.created_at, locale)}</time></div>
          <p className="comment-text">{comment.text}</p>
          {comment.updated_at !== comment.created_at && <small>{copy.updated} · {commentDate(comment.updated_at, locale)}</small>}
        </li>)}</ol> : <div className="comments-empty"><h3>{copy.empty}</h3><p>{copy.emptyText}</p></div>}
        {page?.has_more && <button type="button" className="comments-more" disabled={moreLoading || posting} onClick={() => { void loadMore() }}>{moreLoading ? copy.loadingMore : copy.more}</button>}
        {!isPreview && <section className="comments-compose" aria-label={copy.add}>
          <p className="comments-notice">{copy.publicNotice}</p>
          {auth.checking ? <p role="status">{copy.checking}</p> : !auth.user ? <button className="comments-primary" type="button" onClick={signIn}>{copy.signIn}</button> : !approved ? <p className="comments-state">{copy.approval}</p> : posted ? <div><p className="comments-success" role="status">{copy.published}</p><a className="comments-text-link" href={href('/account/?section=comments')}>{copy.manage}<LaptopIcon name="arrow" /></a></div> : <form onSubmit={submit} aria-busy={posting}>
            <label htmlFor={`${id}-text`}>{copy.add}</label><textarea id={`${id}-text`} name="comment" value={draft} onChange={event => setDraft(event.target.value)} required maxLength={2000} rows={4} placeholder={copy.placeholder} disabled={posting} aria-describedby={`${id}-limit`} />
            <div className="comments-compose__footer"><small id={`${id}-limit`}>{draft.length} / 2 000 {copy.remaining}</small><button type="submit" className="comments-primary" disabled={posting || moreLoading || !draft.trim()}>{posting ? copy.publishing : copy.publish}</button></div>
            {formError && <p className="comments-error" role="alert">{formError}</p>}
            <a className="comments-text-link" href={href('/account/?section=comments')}>{copy.manage}</a>
          </form>}
        </section>}
      </>}
    </div>
  </dialog>
}

export default ProductCommentsDialog
