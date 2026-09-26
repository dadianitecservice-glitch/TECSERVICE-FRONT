import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import { laptopFaqs, laptopProblems, laptopPrices, laptopPriceFilters, laptopPriceDisclaimer, formatLaptopPrice, laptopRepairSteps, laptopRequestUrl, laptopProblemRequestUrl, type LaptopPriceCategory } from '../data/laptopRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const repairImage = '/assets/laptop-repair/repair-workbench.webp'
const systemBoardImage = '/assets/laptop-repair/hero-system-board-warm.webp'
const upgradeImage = '/assets/laptop-repair/hero-ssd-ram-cool.webp'
const technicalPreviewCount = 8
const sectionLinks = [
  { id: 'laptop-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'laptop-prices', label: 'ფასები', icon: 'info' },
  { id: 'laptop-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'laptop-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'laptop-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? laptopRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function LaptopRepairPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('screen')
  const [priceCategory, setPriceCategory] = useState<LaptopPriceCategory>('hardware')
  const [showRemainingTechnical, setShowRemainingTechnical] = useState(false)
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const prices = laptopPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)
  const hasRemainingTechnical = priceCategory === 'hardware' && prices.length > technicalPreviewCount
  const shownPriceIds = new Set((hasRemainingTechnical && !showRemainingTechnical ? prices.slice(0, technicalPreviewCount) : prices).map(item => item.id))

  const cancelTicketLookup = () => {
    if (ticketLookupTimer.current !== null) {
      window.clearTimeout(ticketLookupTimer.current)
      ticketLookupTimer.current = null
    }
  }

  useEffect(() => () => cancelTicketLookup(), [])
  useEffect(() => {
    if (ticketState === 'found') requestAnimationFrame(() => ticketResultRef.current?.focus())
  }, [ticketState])

  const submitServiceCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    cancelTicketLookup()
    const code = serviceCode.trim()
    if (!code) {
      setFoundTicket(null)
      setTicketState('error')
      serviceCodeInput.current?.focus()
      return
    }

    setFoundTicket(null)
    setTicketState('loading')
    ticketLookupTimer.current = window.setTimeout(() => {
      ticketLookupTimer.current = null
      const ticket = findTicketByCode(code)
      setFoundTicket(ticket ?? null)
      setTicketState(ticket ? 'found' : 'not-found')
    }, 650)
  }

  return (
    <main className="laptop-page" id="laptop-page">
      <section className="lp-hero" aria-labelledby="laptop-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("ლეპტოპები")}</span>
            </nav>
            <h1 id="laptop-title">{l10n.locale === 'en' ? 'Laptop' : l10n.t(display('ლეპტოპების'))} <span>{l10n.locale === 'en' ? 'repair' : l10n.t(display('შეკეთება'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("ეკრანიდან სისტემურ პლატამდე — ლეპტოპის ტექნიკური და პროგრამული პრობლემების დიაგნოსტიკა და შეკეთება თბილისში. ვთავაზობთ ეკრანის, კლავიატურის, დამტენის პორტის, გაგრილების სისტემისა და Windows-ის პროგრამულ სერვისს.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('შეკეთების მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#laptop-contact")}><LaptopIcon name="phone" />{l10n.t(display('დაგვიკავშირდით'))}</a>
            </div>
            <div className="lp-hero__facts laptop-hero-facts">
              <span><LaptopIcon name="screen" /><span>{l10n.t("ეკრანი / კლავიატურა")}</span></span>
              <span><LaptopIcon name="chip" /><span>{l10n.t("პლატის შეკეთება")}</span></span>
              <span><LaptopIcon name="memory" /><span>{l10n.t("SSD / RAM განახლება")}</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src={repairImage} alt={l10n.t("ლეპტოპის სისტემური პლატისა და გაგრილების სისტემის პროფესიონალური დიაგნოსტიკა")} width="1280" height="853" fetchPriority="high" decoding="async" /><figcaption><span />{l10n.t("გაგრილება და დიაგნოსტიკა")}</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--board"><img src={systemBoardImage} alt={l10n.t("ლეპტოპის პლატაზე კვების სისტემის ზუსტი დიაგნოსტიკა")} width="1200" height="899" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="chip" />{l10n.t("სისტემური პლატა")}</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src={upgradeImage} alt={l10n.t("ლეპტოპში SSD-ისა და ოპერატიული მეხსიერების განახლება")} width="1200" height="900" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="memory" />SSD / RAM</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav" aria-label={l10n.t("ლეპტოპის სერვისის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="laptop-problems" aria-labelledby="laptop-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="laptop-problems-title">{l10n.t(display('რა პრობლემა აქვს თქვენს ლეპტოპს?'))}</h2><p>{l10n.t("აირჩიეთ სიმპტომი და ნახეთ, რას ვამოწმებთ.")}</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={laptopProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="ლეპტოპის პრობლემები" tabIdPrefix="problem-tab" panelIdPrefix="laptop-problem-panel" defaultProblemId="screen" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("სითხის მოხვედრისას არ ჩართოთ და არ დატენოთ მოწყობილობა.")}</span></p>
            </div>
            {l10n.t(laptopProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'screen' ? 'laptop-problem-panel' : `laptop-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{l10n.t("სიმპტომი და დიაგნოსტიკა")}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("შესაძლო მომსახურება")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(laptopProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ WhatsApp-ში")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo lp-problem-panel__photo--${problem.id}`}><img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="laptop-process" aria-labelledby="laptop-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="laptop-process-title">{l10n.t(display('თქვენი ლეპტოპის გზა სერვისში'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(laptopRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="laptop-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="laptop-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ მოწყობილობა?")}</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="laptop-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'laptop-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="laptop-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="laptop-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="laptop-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="laptop-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="laptop-prices" aria-labelledby="laptop-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="laptop-prices-title">{l10n.t(display('ფასები და სავარაუდო ვადები'))}</h2><div className="lp-price-filters" role="group" aria-label={l10n.t("მომსახურების ტიპი")}>{l10n.t(laptopPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => { setPriceCategory(filter.id); setShowRemainingTechnical(false) }}>{l10n.t(filter.label)}</button>))}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="laptop-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(laptopPriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("ლეპტოპის შეკეთების ფასები")} aria-describedby="laptop-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("ფასი")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" id="laptop-price-rows" role="rowgroup">{l10n.t(laptopPrices.map(price => {
              const isVisible = shownPriceIds.has(price.id)
              return <div className="lp-price-entry" key={price.id} hidden={!isVisible} aria-hidden={isVisible ? undefined : true}>
                <div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}{l10n.t(price.programs && <span className="lp-price-programs">{l10n.t(price.programs.join(' · '))}</span>)}</div><span role="cell" data-label={l10n.t("ფასი")}><strong className="lp-price-amount">{l10n.t(formatLaptopPrice(price))}</strong><small className="lp-price-note">{l10n.t(price.priceNote)}</small></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div>
              </div>
            }))}</div>
          </div>
          {l10n.t(hasRemainingTechnical && <button className="lp-price-more" type="button" aria-expanded={showRemainingTechnical} aria-controls="laptop-price-rows" onClick={() => setShowRemainingTechnical(current => !current)}>{l10n.t(showRemainingTechnical ? 'ნაკლების ჩვენება ↑' : `დანარჩენი ${prices.length - technicalPreviewCount} მომსახურების ნახვა →`)}</button>)}
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("საბოლოო ფასი თანხმდება დიაგნოსტიკის შემდეგ. ვადა დამოკიდებულია სამუშაოზე, რიგსა და ნაწილების მარაგზე.")}</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="ლეპტოპის შეკეთების ღირებულება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="laptop-faq" aria-labelledby="laptop-faq-title">
        <div className="site-container">
          <div className="lp-section-heading">
            <h2 id="laptop-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2>
            <p>{l10n.t("მოკლე პასუხები ლეპტოპის ჩაბარებამდე ყველაზე მნიშვნელოვან კითხვებზე.")}</p>
          </div>
          <div className="lp-faq__list">
            {l10n.t(laptopFaqs.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span>
                  <span className="lp-faq__question">{l10n.t(item.question)}</span>
                  <LaptopIcon name="chevron" />
                </summary>
                <div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div>
              </details>
            )))}
          </div>
        </div>
      </section>

      <ContactSection id="laptop-contact" headingId="laptop-contact-title" />
    </main>
  )
}
