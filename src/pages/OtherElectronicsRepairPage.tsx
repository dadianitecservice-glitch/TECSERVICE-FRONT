import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import {
  otherElectronicsFaqs,
  otherElectronicsHeroFacts,
  otherElectronicsPriceDisclaimer,
  otherElectronicsPriceFilters,
  otherElectronicsPrices,
  otherElectronicsProblemRequestUrl,
  otherElectronicsProblems,
  otherElectronicsRepairSteps,
  otherElectronicsRequestUrl,
  type OtherElectronicsPriceCategory,
} from '../data/otherElectronicsRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const sectionLinks = [
  { id: 'other-electronics-directions', label: 'მიმართულებები', icon: 'tool' },
  { id: 'other-electronics-prices', label: 'ფასები', icon: 'info' },
  { id: 'other-electronics-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'other-electronics-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'other-electronics-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? otherElectronicsRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function OtherElectronicsRepairPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('power-supplies')
  const [priceCategory, setPriceCategory] = useState<OtherElectronicsPriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const visiblePrices = otherElectronicsPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)

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
    <main className="laptop-page other-electronics-page" id="other-electronics-page">
      <section className="lp-hero" aria-labelledby="other-electronics-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("სხვა ელექტრონიკა")}</span>
            </nav>
            <h1 id="other-electronics-title">{l10n.t(display('ელექტრონული პლატებისა და'))} <span>{l10n.t(display('არასტანდარტული ტექნიკის შეკეთება'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("კვების ბლოკების, UPS-ების, საწარმოო დანადგარებისა და სხვადასხვა მოწყობილობის მართვის პლატების დიაგნოსტიკა და კომპონენტური შეკეთება.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('შეკეთების მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#other-electronics-contact")}>{l10n.t(display('დაგვიკავშირდით'))}<LaptopIcon name="arrow" /></a>
            </div>
            <div className="lp-hero__facts other-electronics-hero-facts">
              {l10n.t(otherElectronicsHeroFacts.map(fact => <span key={fact.title}><LaptopIcon name={fact.icon} /><span>{l10n.t(fact.title)} {l10n.t(fact.subtitle)}</span></span>))}
            </div>
          </div>

          <div className="lp-hero__visual other-electronics-hero-visual" aria-label={l10n.t("ტელევიზორის, UPS-ისა და არასტანდარტული პლატების შეკეთება")}>
            <figure className="lp-hero__photo">
              <img src="/assets/electronic-board-repair/hero-tv-repair.webp" alt={l10n.t("ტექნიკოსი ტელევიზორის პლატის დიაგნოსტიკასა და შეკეთებაზე მუშაობს")} width="1280" height="853" fetchPriority="high" decoding="async" />
              <figcaption><span />{l10n.t("ტელევიზორის შეკეთება")}</figcaption>
            </figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--ups">
                <img src="/assets/electronic-board-repair/hero-ups-repair.webp" alt={l10n.t("UPS უწყვეტი კვების წყაროს პლატის კომპონენტური შეკეთება")} width="1280" height="853" loading="lazy" decoding="async" />
                <figcaption><LaptopIcon name="power" />{l10n.t("UPS-ის შეკეთება")}</figcaption>
              </figure>
              <figure className="lp-hero__detail lp-hero__detail--nonstandard-board">
                <img src="/assets/electronic-board-repair/hero-nonstandard-board-repair.webp" alt={l10n.t("არასტანდარტული საწარმოო მართვის ელექტრონული პლატის დიაგნოსტიკა")} width="1280" height="853" loading="lazy" decoding="async" />
                <figcaption><LaptopIcon name="chip" />{l10n.t("არასტანდარტული პლატა")}</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <nav className="site-container lp-section-nav other-electronics-section-nav" aria-label={l10n.t("ელექტრონული პლატების სერვისის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="other-electronics-directions" aria-labelledby="other-electronics-directions-title">
        <div className="site-container">
          <div className="lp-section-heading">
            <h2 id="other-electronics-directions-title">{l10n.t(display('რომელი მოწყობილობის შეკეთება გჭირდებათ?'))}</h2>
            <p>{l10n.t("აირჩიეთ მიმართულება და გამოგვიგზავნეთ მოწყობილობის მოდელი, მონაცემთა ფირფიტის ფოტო, პლატის ფოტო და პრობლემის მოკლე აღწერა.")}</p>
          </div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={otherElectronicsProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="ელექტრონული პლატების შეკეთების მიმართულებები" tabIdPrefix="other-electronics-tab" panelIdPrefix="other-electronics-problem-panel" defaultProblemId="power-supplies" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("მაღალი ძაბვის ან უცნობი დანიშნულების მოწყობილობა არ ჩართოთ განმეორებით. მიღებამდე გამოგვიგზავნეთ მოდელი და ფოტოები.")}</span></p>
            </div>

            {l10n.t(otherElectronicsProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'power-supplies' ? 'other-electronics-problem-panel' : `other-electronics-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `other-electronics-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{l10n.t("კომპონენტური დიაგნოსტიკა და ინდივიდუალური შეფასება")}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("შესაძლო მომსახურება")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(otherElectronicsProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ მოდელი და გამოგვიგზავნეთ ფოტოები")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo other-electronics-problem-photo--${problem.id}`}>
                      <img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" />
                    </div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("ყველა მოწყობილობის შეკეთება შესაძლებელი არ არის — მიღებას ვადასტურებთ წინასწარი ინფორმაციისა და ფოტოების განხილვის შემდეგ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="other-electronics-process" aria-labelledby="other-electronics-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="other-electronics-process-title">{l10n.t(display('მოწყობილობის გზა სერვისში'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(otherElectronicsRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="other-electronics-status">
            <div className="lp-status-strip">
              <div><LaptopIcon name="barcode" /><label htmlFor="other-electronics-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ მოწყობილობა?")}</label></div>
              <form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}>
                <input ref={serviceCodeInput} id="other-electronics-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'other-electronics-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} />
                <button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="other-electronics-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button>
              </form>
            </div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="other-electronics-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="other-electronics-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="other-electronics-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
          <p className="other-electronics-status-helper">{l10n.t("შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.")}</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="other-electronics-prices" aria-labelledby="other-electronics-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split">
            <h2 id="other-electronics-prices-title">{l10n.t(display('ფასები და სავარაუდო ვადები'))}</h2>
            <div className="lp-price-filters" role="group" aria-label={l10n.t("მომსახურების მიმართულება")}>
              {l10n.t(otherElectronicsPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{l10n.t(display(filter.label))}</button>))}
            </div>
          </div>
          <p className="lp-info-note lp-price-disclaimer" id="other-electronics-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(otherElectronicsPriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("ელექტრონული პლატების შეკეთების პირობები")} aria-describedby="other-electronics-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("ღირებულება")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" role="rowgroup">
              {l10n.t(visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}</div><span role="cell" data-label={l10n.t("ღირებულება")}><strong className="lp-price-amount">{l10n.t(price.priceLabel)}</strong><small className="lp-price-note">{l10n.t(price.priceNote)}</small></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div></div>))}
            </div>
          </div>
          <div className="lp-price-footer">
            <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("საბოლოო პირობები დიაგნოსტიკის შემდეგ, სამუშაოს დაწყებამდე თანხმდება. იშვიათი კომპონენტის შეკვეთის ვადა ცალკე დაზუსტდება.")}</p>
            <RequestLink className="lp-button lp-button--outline lp-button--small" subject="ელექტრონული პლატის შეკეთების შესაძლებლობისა და ღირებულების დაზუსტება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink>
          </div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="other-electronics-faq" aria-labelledby="other-electronics-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="other-electronics-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2><p>{l10n.t("პასუხები არასტანდარტული ელექტრონიკის მიღების, დიაგნოსტიკის, ფასისა და გარანტიის შესახებ.")}</p></div>
          <div className="lp-faq__list">{l10n.t(otherElectronicsFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span><span className="lp-faq__question">{l10n.t(item.question)}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div></details>))}</div>
        </div>
      </section>

      <ContactSection id="other-electronics-contact" headingId="other-electronics-contact-title" />
    </main>
  )
}
