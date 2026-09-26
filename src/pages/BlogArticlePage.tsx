import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { BlogArticleCard } from '../components/BlogArticleCard'
import { LaptopIcon } from '../components/LaptopIcon'
import { getBlogPost, getBlogPosts } from '../data/blogPosts'
import { blogPageCopy } from '../data/blogPageCopy'
import { useTranslation } from '../i18n/LocaleProvider'
import { getActiveSectionId } from '../utils/sectionNavigation'
import NotFoundPage from './NotFoundPage'
import '../styles/blog-page.css'

export default function BlogArticlePage({ slug }: { slug: string }) {
  const l10n = useTranslation()
  const copy = blogPageCopy[l10n.locale]
  const post = useMemo(() => getBlogPost(slug, l10n.locale), [slug, l10n.locale])
  const [activeId, setActiveId] = useState(post?.sections[0]?.id ?? '')
  const [copyStatus, setCopyStatus] = useState('')
  const [tocOpen, setTocOpen] = useState(false)
  const tocToggleRef = useRef<HTMLButtonElement>(null)
  const closeContents = () => {
    setTocOpen(false)
    if (tocToggleRef.current?.getClientRects().length) tocToggleRef.current.focus()
  }
  const jumpToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!window.matchMedia('(max-width: 1100px)').matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setTocOpen(false)
    // Collapse first, then use the final section position for native hash scrolling.
    window.requestAnimationFrame(() => {
      const target = document.getElementById(id)
      if (window.location.hash === `#${id}`) target?.scrollIntoView({ block: 'start' })
      else window.location.hash = id
      target?.focus({ preventScroll: true })
    })
  }

  useEffect(() => {
    if (!post) return
    let frame = 0
    let disposed = false
    const sections = post.sections.flatMap(section => {
      const element = document.getElementById(section.id)
      return element ? [element] : []
    })
    const update = () => {
      frame = 0
      const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      const sectionMargin = sections[0] ? Number.parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0 : 0
      setActiveId(getActiveSectionId(
        sections.map(element => ({ id: element.id, top: element.getBoundingClientRect().top })),
        scrollPadding + sectionMargin + 8,
      ))
    }
    const scheduleUpdate = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(update)
    }
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    sections.forEach(section => observer.observe(section))
    void document.fonts.ready.then(scheduleUpdate)
    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [post])

  if (!post) return <NotFoundPage />
  const remaining = getBlogPosts(l10n.locale).filter(item => item.id !== post.id)
  const related = [...remaining.filter(item => item.categoryId === post.categoryId), ...remaining.filter(item => item.categoryId !== post.categoryId)].slice(0, 3)
  const publicUrl = `https://tecservice.ge${l10n.href(`/blog/${post.slug}/`)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(publicUrl); setCopyStatus(copy.copied) }
    catch { setCopyStatus(copy.copyFailed) }
  }

  return <main className="journal-page journal-article-page">
    <div className="site-container">
      <nav className="journal-breadcrumb" aria-label={l10n.locale === 'en' ? 'Breadcrumb' : 'ნავიგაციის გზა'}><a href={l10n.href('/')}>{copy.home}</a><span aria-hidden="true">/</span><a href={l10n.href('/blog/')}>{copy.title}</a><span aria-hidden="true">/</span><span className="journal-breadcrumb__article" aria-current="page">{post.title}</span></nav>
      <article className="journal-article-layout">
        <header className="journal-article-heading">
          <h1>{post.title}</h1>
          <div className="journal-article-meta">
            <time className="journal-article-date" dateTime={post.dateTime}>{post.date}</time>
            <a className="journal-share-link" href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label={copy.facebookShareLabel}>
              <span className="journal-share-link__icon" aria-hidden="true"><img src="/assets/icons/facebook.svg" alt="" width="20" height="20" /></span>{copy.facebookShare}
            </a>
          </div>
        </header>
        <div className="journal-article-image"><img src={post.image} alt={post.imageAlt} width={post.imageWidth} height={post.imageHeight} fetchPriority="high" decoding="async" /></div>
        <aside className="journal-sidebar">
            <div className="journal-toc" data-open={tocOpen} onKeyDown={event => { if (event.key === 'Escape' && tocOpen) { event.stopPropagation(); closeContents() } }}>
              <div className="journal-toc__heading">
                <span className="journal-toc__icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 6h12M8 12h9M8 18h6M4 6h.01M4 12h.01M4 18h.01" /></svg></span>
                <h2 className="journal-toc__label">{copy.inArticle}<small>{copy.sectionCount(post.sections.length)}</small></h2>
                <button className="journal-toc__toggle" ref={tocToggleRef} type="button" aria-expanded={tocOpen} aria-controls="article-contents" aria-label={tocOpen ? copy.closeContents : copy.openContents} onClick={() => setTocOpen(open => !open)}><LaptopIcon name="chevron" /></button>
              </div>
              <nav id="article-contents" aria-label={copy.inArticle}>{post.sections.map((section, index) => <a key={section.id} href={`#${section.id}`} onClick={event => jumpToSection(event, section.id)} aria-current={activeId === section.id ? 'location' : undefined}><span className="journal-toc__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="journal-toc__text">{section.title}</span></a>)}</nav>
            </div>
            <div className="journal-service"><span className="journal-service__icon"><LaptopIcon name="tool" /></span><h2>{copy.service}</h2><p>{copy.serviceText}</p><a className="journal-link" href={l10n.href(post.serviceHref)}>{copy.serviceLink}<LaptopIcon name="arrow" /></a></div>
        </aside>
        <div className="journal-prose">
            <div className="journal-takeaway"><span><LaptopIcon name="info" />{copy.takeaway}</span><p>{post.takeaway}</p></div>
            {post.sections.map(section => <section id={section.id} key={section.id} tabIndex={-1}><h2>{section.title}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}
            {post.sources?.length ? <section className="journal-sources"><h2>{copy.sources}</h2><ul>{post.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<span aria-hidden="true"> ↗</span></a></li>)}</ul></section> : null}
            <p className="journal-article-note">{copy.note}</p>
            <div className="journal-article-actions"><a className="journal-link" href={l10n.href('/blog/')}><span aria-hidden="true">←</span>{copy.back}</a><button type="button" onClick={copyLink}>{copy.copy}</button></div>
            <p className="journal-copy-status" role="status">{copyStatus}</p>
        </div>
      </article>
      <section className="journal-related" aria-labelledby="journal-related-title"><div className="journal-library__heading"><h2 id="journal-related-title">{copy.related}</h2><a className="journal-link" href={l10n.href('/blog/')}>{copy.more}<LaptopIcon name="arrow" /></a></div><div className="journal-grid">{related.map(item => <BlogArticleCard key={item.id} post={item} />)}</div></section>
    </div>
  </main>
}
