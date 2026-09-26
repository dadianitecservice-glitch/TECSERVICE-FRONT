import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { legalDocuments, type LegalPageKind } from '../data/legalPages'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import { getActiveSectionId } from '../utils/sectionNavigation'
import '../styles/legal-page.css'

export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const { locale, href } = useTranslation()
  const isEnglish = locale === 'en'
  const content = legalDocuments[locale][kind]
  const title = (text: string) => isEnglish ? text : toGeorgianMtavruli(text)
  const otherKind = kind === 'terms' ? 'privacy' : 'terms'
  const [activeSection, setActiveSection] = useState(content.sections[0].id)
  const [contentsOpen, setContentsOpen] = useState(false)
  const contentsToggleRef = useRef<HTMLButtonElement>(null)
  const jumpFrameRef = useRef(0)
  const contentsLabel = isEnglish ? 'On this page' : 'ამ გვერდზე'
  const closeContents = () => {
    setContentsOpen(false)
    if (contentsToggleRef.current?.getClientRects().length) contentsToggleRef.current.focus()
  }
  const jumpToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!window.matchMedia('(max-width: 1100px)').matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    setContentsOpen(false)
    window.cancelAnimationFrame(jumpFrameRef.current)
    // Let the mobile contents collapse before measuring the destination.
    jumpFrameRef.current = window.requestAnimationFrame(() => {
      jumpFrameRef.current = 0
      const target = document.getElementById(id)
      if (window.location.hash === `#${id}`) target?.scrollIntoView({ block: 'start' })
      else window.location.hash = id
      target?.focus({ preventScroll: true })
    })
  }

  useEffect(() => {
    let frame = 0
    let disposed = false
    const sections = content.sections.flatMap(section => {
      const element = document.getElementById(section.id)
      return element ? [element] : []
    })
    const updateActiveSection = () => {
      frame = 0
      const root = document.documentElement
      const scrollPadding = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
      const sectionMargin = sections[0] ? Number.parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0 : 0
      const activationTop = scrollPadding + sectionMargin + 8
      const atPageEnd = window.scrollY + window.innerHeight >= root.scrollHeight - 2
      setActiveSection(getActiveSectionId(
        sections.map(element => ({ id: element.id, top: element.getBoundingClientRect().top })),
        activationTop,
        atPageEnd,
      ))
    }
    const scheduleUpdate = () => {
      if (!disposed && !frame) frame = window.requestAnimationFrame(updateActiveSection)
    }
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    const observer = new ResizeObserver(scheduleUpdate)
    sections.forEach(section => observer.observe(section))
    void document.fonts.ready.then(scheduleUpdate)
    scheduleUpdate()
    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(jumpFrameRef.current)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [content.sections])

  return <main className={`legal-page legal-page--${kind}`}>
    <section className="legal-page__hero" aria-labelledby="legal-title">
      <div className="site-container">
        <nav className="legal-page__breadcrumb" aria-label={isEnglish ? 'Breadcrumb navigation' : 'ნავიგაციის გზა'}>
          <a href={href('/')}>{isEnglish ? 'Home' : 'მთავარი'}</a><span aria-hidden="true">/</span><span aria-current="page">{content.title}</span>
        </nav>
        <p className="legal-page__eyebrow">TECSERVICE · {isEnglish ? 'Useful information' : 'სასარგებლო ინფორმაცია'}</p>
        <h1 id="legal-title">{title(content.title)}</h1>
        <p className="legal-page__intro">{content.intro}</p>
      </div>
    </section>
    <div className="site-container legal-page__layout">
      <aside className="legal-page__sidebar">
        <div className="legal-page__contents" data-open={contentsOpen} onKeyDown={event => { if (event.key === 'Escape' && contentsOpen) { event.preventDefault(); event.stopPropagation(); closeContents() } }}>
          <div className="legal-page__contents-heading">
            <span className="legal-page__contents-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 6h12M8 12h9M8 18h6M4 6h.01M4 12h.01M4 18h.01" /></svg></span>
            <h2 id="legal-contents-title" className="legal-page__contents-label">{contentsLabel}<small>{content.sections.length} {isEnglish ? 'sections' : 'საკითხი'}</small></h2>
            <button className="legal-page__contents-toggle" ref={contentsToggleRef} type="button" aria-expanded={contentsOpen} aria-controls="legal-contents" aria-label={isEnglish ? (contentsOpen ? 'Close page contents' : 'Open page contents') : (contentsOpen ? 'სარჩევის დახურვა' : 'სარჩევის გახსნა')} onClick={() => setContentsOpen(open => !open)}><LaptopIcon name="chevron" /></button>
          </div>
          <nav id="legal-contents" aria-label={contentsLabel}>
            <ol>{content.sections.map((section, index) => <li key={section.id}><a href={`#${section.id}`} onClick={event => jumpToSection(event, section.id)} aria-current={activeSection === section.id ? 'location' : undefined}><span className="legal-page__contents-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="legal-page__contents-text">{section.title}</span></a></li>)}</ol>
          </nav>
        </div>
        <aside className="legal-page__contact" aria-labelledby="legal-contact-title">
          <span className="legal-page__contact-icon" aria-hidden="true"><LaptopIcon name="info" /></span>
          <h2 id="legal-contact-title">{isEnglish ? 'Have a question?' : 'გაქვთ შეკითხვა?'}</h2>
          <p>{isEnglish ? 'Contact us to clarify service or data-related questions.' : 'მომსახურების ან მონაცემების შესახებ კითხვების დასაზუსტებლად დაგვიკავშირდით.'}</p>
          <a href={href('/contact/')} className="legal-page__button">{isEnglish ? 'Contact us' : 'დაგვიკავშირდით'}<LaptopIcon name="arrow" /></a>
        </aside>
      </aside>
      <div className="legal-page__body">
        {content.sections.map((section, index) => <section className="legal-page__section" key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} tabIndex={-1}>
          <span className="legal-page__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <h2 id={`${section.id}-title`}>{title(section.title)}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>)}
        <a className="legal-page__related" href={href(`/${otherKind}/`)}>{legalDocuments[locale][otherKind].title}<LaptopIcon name="arrow" /></a>
      </div>
    </div>
  </main>
}
