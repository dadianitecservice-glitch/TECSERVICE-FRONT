import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import {
  droneFaqs,
  droneHeroFacts,
  dronePriceDisclaimer,
  dronePriceFilters,
  dronePrices,
  droneProblemRequestUrl,
  droneProblems,
  droneRepairSteps,
  droneRequestUrl,
  formatDronePrice,
  type DronePriceCategory,
} from '../data/droneRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const sectionLinks = [
  { id: 'drone-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'drone-prices', label: 'ფასები', icon: 'info' },
  { id: 'drone-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'drone-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'drone-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? droneRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function DroneRepairPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('crash-gimbal')
  const [priceCategory, setPriceCategory] = useState<DronePriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const visiblePrices = dronePrices.filter(item => priceCategory === 'all' || item.category === priceCategory)

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
    <main className="laptop-page drone-page" id="drone-page">
      <section className="lp-hero" aria-labelledby="drone-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("დრონები")}</span>
            </nav>
            <h1 id="drone-title">{l10n.locale === 'en' ? 'Drone' : l10n.t(display('დრონების'))} <span>{l10n.locale === 'en' ? 'diagnostics and repair' : l10n.t(display('დიაგნოსტიკა და შეკეთება'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("DJI და FPV დრონების დაცემის, გიმბალის, კამერის, მკლავების, მოტორების, ESC/FC-ის, სენსორებისა და პროგრამული სისტემების სრული დიაგნოსტიკა.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('შეკეთების მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#drone-contact")}><LaptopIcon name="phone" />{l10n.t(display('დაგვიკავშირდით'))}</a>
            </div>
            <div className="lp-hero__facts drone-hero-facts">
              {l10n.t(droneHeroFacts.map(fact => <span key={fact.title}><LaptopIcon name={fact.icon} /><span>{l10n.t(fact.title)} {l10n.t(fact.subtitle)}</span></span>))}
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/drone-repair/hero-mavic-4-pro.webp" alt={l10n.t("ხელთათმანიანი ტექნიკოსი დაშლილი DJI დრონის დიაგნოსტიკასა და შეკეთებაზე მუშაობს")} width="1280" height="720" fetchPriority="high" decoding="async" /><figcaption><span />{l10n.t("DJI დრონის შეკეთება")}</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--drone-gimbal"><img src="/assets/drone-repair/hero-gimbal-disassembled.webp" alt={l10n.t("DJI დრონის დაშლილი გიმბალისა და კამერის მოდულის შეკეთება")} width="1280" height="720" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="activity" />{l10n.t("გიმბალის შეკეთება")}</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--drone-fpv"><img src="/assets/drone-repair/hero-controller-disassembled.webp" alt={l10n.t("დაშლილი DJI პულტის ჯოისტიკისა და მართვის პლატის შეკეთება")} width="1280" height="720" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="gamepad" />{l10n.t("DJI პულტის შეკეთება")}</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav drone-section-nav" aria-label={l10n.t("დრონების სერვისის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="drone-problems" aria-labelledby="drone-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-problems-title">{l10n.t(display('რა პრობლემა აქვს თქვენს დრონს?'))}</h2><p>{l10n.t("აირჩიეთ სიმპტომი. დაცემის შემდეგ ფარული გეომეტრიული ან ელექტრონული დაზიანება მხოლოდ ვიზუალურად ყოველთვის არ ჩანს.")}</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={droneProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="დრონის პრობლემები" tabIdPrefix="drone-problem-tab" panelIdPrefix="drone-problem-panel" defaultProblemId="crash-gimbal" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("დაცემის ან წყლით დაზიანების შემდეგ დრონი აღარ ჩართოთ; თუ უსაფრთხოა, მოხსენით ბატარეა.")}</span></p>
            </div>
            {l10n.t(droneProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'crash-gimbal' ? 'drone-problem-panel' : `drone-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `drone-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                  <span className="lp-eyebrow">{l10n.t("სიმპტომი და პროფესიონალური დიაგნოსტიკა")}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("შესაძლო მომსახურება")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(droneProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ WhatsApp-ში")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo drone-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="drone-process" aria-labelledby="drone-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-process-title">{l10n.t(display('დრონის დიაგნოსტიკისა და შეკეთების პროცესი'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(droneRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="drone-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="drone-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ დრონი?")}</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="drone-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'drone-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="drone-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="drone-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="drone-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="drone-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
          <p className="drone-status-helper">{l10n.t("შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.")}</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="drone-prices" aria-labelledby="drone-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="drone-prices-title">{l10n.t(display('დრონის სერვისის ფასები'))}</h2><div className="lp-price-filters" role="group" aria-label={l10n.t("მომსახურების ტიპი")}>{l10n.t(dronePriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{l10n.t(display(filter.label))}</button>))}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="drone-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(dronePriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("დრონის შეკეთების ფასები")} aria-describedby="drone-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("ფასი")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{l10n.t(visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}</div><span role="cell" data-label={l10n.t("ფასი")}><strong className="lp-price-amount">{l10n.t(formatDronePrice(price))}</strong><small className="lp-price-note">{l10n.t(price.priceNote)}</small></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div></div>))}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("ნაწილების ღირებულება ცალკე ითვლება. ფრენის უსაფრთხოებაზე მოქმედი სამუშაო დასრულებულად ითვლება მხოლოდ კალიბრაციისა და ფუნქციური ტესტის შემდეგ.")}</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="დრონის შეკეთების ღირებულების დაზუსტება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="drone-faq" aria-labelledby="drone-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2><p>{l10n.t("პასუხები დაცემის, გიმბალის, მიკროპროგრამის, ბატარეისა და საბოლოო ტესტის შესახებ.")}</p></div>
          <div className="lp-faq__list">{l10n.t(droneFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span><span className="lp-faq__question">{l10n.t(item.question)}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div></details>))}</div>
        </div>
      </section>

      <ContactSection id="drone-contact" headingId="drone-contact-title" />
    </main>
  )
}
