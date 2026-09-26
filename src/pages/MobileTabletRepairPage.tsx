import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import {
  formatMobileTabletPrice,
  mobileTabletFaqs,
  mobileTabletHeroFacts,
  mobileTabletPriceDisclaimer,
  mobileTabletPriceFilters,
  mobileTabletPrices,
  mobileTabletProblemRequestUrl,
  mobileTabletProblems,
  mobileTabletRepairSteps,
  mobileTabletRequestUrl,
  type MobileTabletPriceCategory,
} from '../data/mobileTabletRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const sectionLinks = [
  { id: 'mobile-tablet-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'mobile-tablet-prices', label: 'ფასები', icon: 'info' },
  { id: 'mobile-tablet-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'mobile-tablet-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'mobile-tablet-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? mobileTabletRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function MobileTabletRepairPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('screen-touch')
  const [priceCategory, setPriceCategory] = useState<MobileTabletPriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const visiblePrices = mobileTabletPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)

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
    <main className="laptop-page mobile-tablet-page" id="mobile-tablet-page">
      <section className="lp-hero" aria-labelledby="mobile-tablet-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("მობილურები და პლანშეტები")}</span>
            </nav>
            <h1 id="mobile-tablet-title">{l10n.locale === 'en' ? 'Phone and tablet' : l10n.t(display('მობილურებისა და პლანშეტების'))} <span>{l10n.locale === 'en' ? 'repair' : l10n.t(display('შეკეთება'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("ეკრანის, სენსორის, ბატარეის, დამტენის პორტის, კამერისა და სისტემური პლატის დიაგნოსტიკა — მონაცემების უსაფრთხოების გათვალისწინებით.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('შეკეთების მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#mobile-tablet-contact")}>{l10n.t(display('დაგვიკავშირდით'))}<LaptopIcon name="arrow" /></a>
            </div>
            <div className="lp-hero__facts mobile-tablet-hero-facts">
              {l10n.t(mobileTabletHeroFacts.map(fact => <span key={fact.title}><LaptopIcon name={fact.icon} /><span>{l10n.t(fact.title)} {l10n.t(fact.subtitle)}</span></span>))}
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/mobile-tablet-repair/hero-main.webp" alt={l10n.t("მობილურის სისტემური პლატის მიკროსკოპული დიაგნოსტიკა")} width="1280" height="720" fetchPriority="high" decoding="async" /><figcaption><span />{l10n.t("პლატის მიკროსკოპული დიაგნოსტიკა")}</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--mobile-connectors"><img src="/assets/mobile-tablet-repair/hero-connectors.webp" alt={l10n.t("მობილურის დამტენის კონექტორისა და მიკროსქემის შეკეთება")} width="849" height="565" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="ports" />{l10n.t("კონექტორები / მიკროსქემა")}</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--mobile-screen"><img src="/assets/mobile-tablet-repair/hero-screen-touch.webp" alt={l10n.t("მობილურის ეკრანისა და სენსორის შეკეთება")} width="800" height="533" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="screen" />{l10n.t("ეკრანი / სენსორი")}</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav mobile-tablet-section-nav" aria-label={l10n.t("მობილურებისა და პლანშეტების სერვისის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="mobile-tablet-problems" aria-labelledby="mobile-tablet-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="mobile-tablet-problems-title">{l10n.t(display('რა პრობლემა აქვს თქვენს მოწყობილობას?'))}</h2><p>{l10n.t("აირჩიეთ სიმპტომი — დიაგნოსტიკისას ვამოწმებთ არა მხოლოდ დაზიანებულ ნაწილს, არამედ მასთან დაკავშირებულ კვანძებსაც.")}</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={mobileTabletProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="მობილურისა და პლანშეტის პრობლემები" tabIdPrefix="mobile-tablet-problem-tab" panelIdPrefix="mobile-tablet-problem-panel" defaultProblemId="screen-touch" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("სითხის მოხვედრისას მოწყობილობა არ ჩართოთ, არ დატენოთ და SIM ბარათი ამოიღეთ, თუ უსაფრთხოდ შეგიძლიათ.")}</span></p>
            </div>
            {l10n.t(mobileTabletProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'screen-touch' ? 'mobile-tablet-problem-panel' : `mobile-tablet-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `mobile-tablet-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{l10n.t("სიმპტომი · მოწყობილობის დიაგნოსტიკა")}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("შესაძლო მომსახურება")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(mobileTabletProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ მოდელი და გამოგვიგზავნეთ ფოტო")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo mobile-tablet-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="mobile-tablet-process" aria-labelledby="mobile-tablet-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="mobile-tablet-process-title">{l10n.t(display('მობილურის შეკეთების სამუშაო პროცესი'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(mobileTabletRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="mobile-tablet-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="mobile-tablet-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ მოწყობილობა?")}</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="mobile-tablet-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'mobile-tablet-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="mobile-tablet-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="mobile-tablet-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="mobile-tablet-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="mobile-tablet-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
          <p className="mobile-tablet-status-helper">{l10n.t("შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.")}</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="mobile-tablet-prices" aria-labelledby="mobile-tablet-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="mobile-tablet-prices-title">{l10n.t(display('მობილურისა და პლანშეტის სერვისის ფასები'))}</h2><div className="lp-price-filters" role="group" aria-label={l10n.t("მომსახურების ტიპი")}>{l10n.t(mobileTabletPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{l10n.t(display(filter.label))}</button>))}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="mobile-tablet-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(mobileTabletPriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("მობილურისა და პლანშეტის შეკეთების ფასები")} aria-describedby="mobile-tablet-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("ფასი")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{l10n.t(visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}</div><span role="cell" data-label={l10n.t("ფასი")}><strong className="lp-price-amount">{l10n.t(formatMobileTabletPrice(price))}</strong><small className="lp-price-note">{l10n.t(price.priceNote)}</small></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div></div>))}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("ნაწილისა და სამუშაოს საბოლოო ფასი წინასწარ თანხმდება. წყლით ან პლატის დაზიანების შემთხვევაში შედეგი დამოკიდებულია დაზიანების მასშტაბზე.")}</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="მობილურის ან პლანშეტის შეკეთების ღირებულების დაზუსტება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="mobile-tablet-faq" aria-labelledby="mobile-tablet-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="mobile-tablet-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2><p>{l10n.t("მოკლე პასუხები ეკრანის, მონაცემების, ბატარეისა და წყლით დაზიანების შესახებ.")}</p></div>
          <div className="lp-faq__list">{l10n.t(mobileTabletFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span><span className="lp-faq__question">{l10n.t(item.question)}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div></details>))}</div>
        </div>
      </section>

      <ContactSection id="mobile-tablet-contact" headingId="mobile-tablet-contact-title" />
    </main>
  )
}
