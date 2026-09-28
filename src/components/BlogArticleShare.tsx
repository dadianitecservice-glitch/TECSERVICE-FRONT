import { useEffect, useState } from 'react'
import { blogPageCopy } from '../data/blogPageCopy'
import { copyArticleLink, getArticleShareLinks, shareArticle } from '../utils/articleSharing'
import { LaptopIcon } from './LaptopIcon'

type ShareIconName = 'facebook' | 'telegram' | 'copy' | 'more'

function ShareIcon({ name }: { name: ShareIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'facebook' && <path fill="currentColor" stroke="none" d="M13.8 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.4-.2-2.4 0-4 1.5-4 4.2v2.4H8v3.2h2.7V21h3.1Z" />}
    {name === 'telegram' && <><path d="m21 3-4 18-6-5-4 3v-6L3 11 21 3Z" /><path d="m7 13 14-10-10 13" /></>}
    {name === 'copy' && <><path d="m10 13 4-4M8 16l-1 1a4.2 4.2 0 0 1-6-6l4-4a4.2 4.2 0 0 1 6 0M16 8l1-1a4.2 4.2 0 0 1 6 6l-4 4a4.2 4.2 0 0 1-6 0" transform="translate(1 0) scale(.9 1)" /></>}
    {name === 'more' && <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>}
  </svg>
}

export function BlogArticleShare({ url, title, locale }: { url: string; title: string; locale: 'ka' | 'en' }) {
  const copy = blogPageCopy[locale]
  const links = getArticleShareLinks(url, title)
  const [nativeAvailable, setNativeAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [manualCopy, setManualCopy] = useState(false)

  useEffect(() => { setNativeAvailable(typeof navigator.share === 'function') }, [])

  const copyLink = async () => {
    if (busy) return
    setBusy(true)
    setStatus('')
    setManualCopy(false)
    const copied = await copyArticleLink(url, navigator.clipboard)
    setManualCopy(!copied)
    setStatus(copied ? copy.copied : copy.shareCopyFailed)
    setBusy(false)
  }
  const openShareMenu = async () => {
    setBusy(true)
    setStatus('')
    setManualCopy(false)
    const result = await shareArticle(url, title, navigator)
    if (result === 'unavailable' || result === 'failed') {
      setStatus(copy.shareUnavailable)
      setManualCopy(true)
    }
    setBusy(false)
  }

  return <section className="journal-share" aria-labelledby="article-share-title">
    <div className="journal-share__heading">
      <h2 id="article-share-title">{copy.shareArticle}</h2>
      {nativeAvailable && <button type="button" className="journal-share__more" data-share="native" onClick={openShareMenu} disabled={busy} title={copy.shareMore} aria-label={copy.shareMore}><ShareIcon name="more" /></button>}
    </div>
    <div className="journal-share__links">
      <a className="journal-share__item journal-share-link" data-share="facebook" href={links.facebook} target="_blank" rel="noopener noreferrer" title={copy.facebookShareLabel} aria-label={copy.facebookShareLabel}><ShareIcon name="facebook" /></a>
      <a className="journal-share__item" data-share="whatsapp" href={links.whatsapp} target="_blank" rel="noopener noreferrer" title={copy.whatsappShareLabel} aria-label={copy.whatsappShareLabel}><LaptopIcon name="whatsapp" /></a>
      <a className="journal-share__item" data-share="telegram" href={links.telegram} target="_blank" rel="noopener noreferrer" title={copy.telegramShareLabel} aria-label={copy.telegramShareLabel}><ShareIcon name="telegram" /></a>
      <button className="journal-share__item" type="button" data-share="copy" onClick={() => void copyLink()} disabled={busy} title={copy.copy} aria-label={copy.copy}><ShareIcon name="copy" /></button>
    </div>
    <p className="journal-share__status" role="status" aria-atomic="true">{status}</p>
    {manualCopy && <label className="journal-share__manual">{copy.copy}<input aria-label={copy.articleLink} value={url} readOnly onFocus={event => event.currentTarget.select()} /></label>}
  </section>
}
