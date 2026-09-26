import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import {
  computerBuildIncludes,
  computerBuildParts,
  computerBuildPrices,
  computerBuildProfiles,
  computerBuildRequestUrl,
  computerFaqs,
  computerPriceDisclaimer,
  computerPriceFilters,
  computerPrices,
  computerProblemRequestUrl,
  computerProblems,
  computerRepairSteps,
  computerRequestUrl,
  formatComputerPrice,
  type ComputerPriceCategory,
} from '../data/computerRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const technicalPreviewCount = 8
const sectionLinks = [
  { id: 'computer-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'computer-build', label: 'კომპიუტერის აწყობა', icon: 'chip' },
  { id: 'computer-prices', label: 'ფასები', icon: 'info' },
  { id: 'computer-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'computer-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'computer-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? computerRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function ComputerRepairPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('display')
  const [priceCategory, setPriceCategory] = useState<ComputerPriceCategory>('hardware')
  const [showRemainingTechnical, setShowRemainingTechnical] = useState(false)
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const prices = computerPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)
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
    <main className="laptop-page computer-page" id="computer-page">
      <section className="lp-hero" aria-labelledby="computer-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("კომპიუტერები")}</span>
            </nav>
            <h1 id="computer-title">{l10n.t(display('კომპიუტერების'))} <span>{l10n.t(display('შეკეთება და აწყობა'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("დესკტოპ კომპიუტერების ტექნიკური და პროგრამული დიაგნოსტიკა, კომპონენტური შეკეთება, განახლება და სრული სისტემის აწყობა.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('შეკეთების მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#computer-build")}><LaptopIcon name="chip" />{l10n.t(display('კომპიუტერის აწყობა'))}</a>
            </div>
            <div className="lp-hero__facts computer-hero-facts">
              <span><LaptopIcon name="chip" /><span>{l10n.t("პლატის დიაგნოსტიკა")}</span></span>
              <span><LaptopIcon name="memory" /><span>{l10n.t("GPU / RAM განახლება")}</span></span>
              <span><LaptopIcon name="server" /><span>{l10n.t("სისტემის სრული აწყობა")}</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/computer-repair/hero-diagnostics.webp" alt={l10n.t("დესკტოპ კომპიუტერის პროფესიონალური კომპონენტური დიაგნოსტიკა")} width="1280" height="853" fetchPriority="high" decoding="async" /><figcaption><span />{l10n.t("დიაგნოსტიკა და შეკეთება")}</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--board"><img src="/assets/computer-repair/hero-gpu-power.webp" alt={l10n.t("ვიდეოკარტისა და კვების სისტემის პროფესიონალური შემოწმება")} width="1280" height="960" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="chip" />{l10n.t("GPU / კვება")}</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src="/assets/computer-repair/hero-custom-build.webp" alt={l10n.t("ინდივიდუალური კომპიუტერის აწყობა და ტესტირება")} width="1280" height="960" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="memory" />{l10n.t("სრული აწყობა")}</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav" aria-label={l10n.t("კომპიუტერის სერვისის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="computer-problems" aria-labelledby="computer-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-problems-title">{l10n.t(display('რა პრობლემა აქვს თქვენს კომპიუტერს?'))}</h2><p>{l10n.t("აირჩიეთ სიმპტომი და ნახეთ, რას ვამოწმებთ.")}</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={computerProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="კომპიუტერის პრობლემები" tabIdPrefix="computer-problem-tab" panelIdPrefix="computer-problem-panel" defaultProblemId="display" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("დამწვრის სუნის, კვამლის ან ნაპერწკლის შემთხვევაში კომპიუტერი დაუყოვნებლივ გამორთეთ დენიდან.")}</span></p>
            </div>
            {l10n.t(computerProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'display' ? 'computer-problem-panel' : `computer-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `computer-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{l10n.t("სიმპტომი და დიაგნოსტიკა")}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("შესაძლო მომსახურება")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(computerProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ WhatsApp-ში")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo pc-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section pc-build" id="computer-build" aria-labelledby="computer-build-title">
        <div className="site-container">
          <div className="lp-section-heading pc-build__heading">
            <div><span className="lp-eyebrow"><LaptopIcon name="chip" />{l10n.t("ინდივიდუალური კომპლექტაცია")}</span><h2 id="computer-build-title">{l10n.t(display('კომპიუტერის აწყობა და კომპონენტები'))}</h2></div>
            <p>{l10n.t("შევარჩევთ თავსებად კომპონენტებს, მოვამზადებთ სრულ შეთავაზებას და ავაწყობთ სისტემას თქვენი დანიშნულებისა და ბიუჯეტის მიხედვით.")}</p>
          </div>
          <div className="pc-build__profiles">{l10n.t(computerBuildProfiles.map(profile => <article key={profile.title}><span><LaptopIcon name={profile.icon} /></span><div><h3>{l10n.t(display(profile.title))}</h3><p>{l10n.t(profile.description)}</p></div></article>))}</div>
          <div className="pc-build__card">
            <figure className="pc-build__photo"><img src="/assets/computer-repair/custom-build-components.webp" alt={l10n.t("კომპიუტერის სრული აწყობა შერჩეული თავსებადი კომპონენტებით")} width="1280" height="720" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="check" />{l10n.t("აწყობა, კაბელების მართვა და ტესტირება")}</figcaption></figure>
            <div className="pc-build__content">
              <span className="lp-eyebrow">{l10n.t("სრული მომსახურება ერთ სივრცეში")}</span>
              <h3>{l10n.t(display('შერჩევიდან გამართულ სისტემამდე'))}</h3>
              <ul className="pc-build__includes">{l10n.t(computerBuildIncludes.map(item => <li key={item}><LaptopIcon name="check" />{l10n.t(item)}</li>))}</ul>
              <div className="pc-build__parts" aria-label={l10n.t("კომპიუტერის კომპონენტები")}>{l10n.t(computerBuildParts.map(part => <span key={part}>{l10n.t(part)}</span>))}</div>
              <div className="pc-build__prices">{l10n.t(computerBuildPrices.map(item => <div key={item.name}><span>{l10n.t(item.name)}</span><strong>{l10n.t(item.price)}</strong><small>{l10n.t(item.duration)}</small></div>))}</div>
              <p className="pc-build__note"><LaptopIcon name="info" />{l10n.t("კომპონენტების ფასი მომსახურებაში არ შედის და რეალური მარაგისა და მიმდინარე ღირებულების მიხედვით წინასწარ თანხმდება.")}</p>
              <div className="pc-build__actions">
                <RequestLink className="lp-button lp-button--primary" href={l10n.href(computerBuildRequestUrl())}><LaptopIcon name="whatsapp" />{l10n.t(display('კომპლექტაციის მოთხოვნა'))}</RequestLink>
                <a className="lp-button lp-button--outline" href={l10n.href("https://shop.tecservice.ge")} target="_blank" rel="noreferrer">{l10n.t(display('კომპონენტების ნახვა'))}<LaptopIcon name="arrow" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="computer-process" aria-labelledby="computer-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-process-title">{l10n.t(display('თქვენი კომპიუტერის გზა სერვისში'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(computerRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="computer-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="computer-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ მოწყობილობა?")}</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="computer-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'computer-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="computer-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="computer-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="computer-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="computer-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="computer-prices" aria-labelledby="computer-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="computer-prices-title">{l10n.t(display('ფასები და სავარაუდო ვადები'))}</h2><div className="lp-price-filters" role="group" aria-label={l10n.t("მომსახურების ტიპი")}>{l10n.t(computerPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => { setPriceCategory(filter.id); setShowRemainingTechnical(false) }}>{l10n.t(filter.label)}</button>))}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="computer-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(computerPriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("კომპიუტერის შეკეთების ფასები")} aria-describedby="computer-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("საორიენტაციო ფასი")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" id="computer-price-rows" role="rowgroup">{l10n.t(computerPrices.map(price => {
              const isVisible = shownPriceIds.has(price.id)
              return <div className="lp-price-entry" key={price.id} hidden={!isVisible} aria-hidden={isVisible ? undefined : true}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}{l10n.t(price.programs && <span className="lp-price-programs">{l10n.t(price.programs.join(' · '))}</span>)}</div><span role="cell" data-label={l10n.t("ფასი")}><strong className="lp-price-amount">{l10n.t(formatComputerPrice(price))}</strong><small className="lp-price-note">{l10n.t(price.priceNote)}</small></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div></div>
            }))}</div>
          </div>
          {l10n.t(hasRemainingTechnical && <button className="lp-price-more" type="button" aria-expanded={showRemainingTechnical} aria-controls="computer-price-rows" onClick={() => setShowRemainingTechnical(current => !current)}>{l10n.t(showRemainingTechnical ? 'ნაკლების ჩვენება ↑' : `დანარჩენი ${prices.length - technicalPreviewCount} მომსახურების ნახვა →`)}</button>)}
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("საბოლოო ფასი თანხმდება დიაგნოსტიკის შემდეგ. ვადა დამოკიდებულია სამუშაოზე, რიგსა და კომპონენტების მარაგზე.")}</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="კომპიუტერის შეკეთების ღირებულება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="computer-faq" aria-labelledby="computer-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2><p>{l10n.t("მოკლე პასუხები შეკეთებისა და კომპიუტერის აწყობის შესახებ.")}</p></div>
          <div className="lp-faq__list">{l10n.t(computerFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span><span className="lp-faq__question">{l10n.t(item.question)}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div></details>))}</div>
        </div>
      </section>

      <ContactSection id="computer-contact" headingId="computer-contact-title" />
    </main>
  )
}
