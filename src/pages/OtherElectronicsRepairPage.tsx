import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
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
  return <a className={className} href={href ?? otherElectronicsRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function OtherElectronicsRepairPage() {
  const [selectedProblem, setSelectedProblem] = useState('power-supplies')
  const [priceCategory, setPriceCategory] = useState<OtherElectronicsPriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
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

  const moveProblem = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % otherElectronicsProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + otherElectronicsProblems.length) % otherElectronicsProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = otherElectronicsProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(otherElectronicsProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page other-electronics-page" id="other-electronics-page">
      <section className="lp-hero" aria-labelledby="other-electronics-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">სხვა ელექტრონიკა</span>
            </nav>
            <h1 id="other-electronics-title">{display('ელექტრონული პლატებისა და')} <span>{display('არასტანდარტული ტექნიკის შეკეთება')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">კვების ბლოკების, UPS-ების, საწარმოო დანადგარებისა და სხვადასხვა მოწყობილობის მართვის პლატების დიაგნოსტიკა და კომპონენტური შეკეთება.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('შეკეთების მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#other-electronics-contact">{display('დაგვიკავშირდით')}<LaptopIcon name="arrow" /></a>
            </div>
            <div className="lp-hero__facts other-electronics-hero-facts">
              {otherElectronicsHeroFacts.map(fact => <span key={fact.title}><LaptopIcon name={fact.icon} /><span>{fact.title} {fact.subtitle}</span></span>)}
            </div>
          </div>

          <div className="lp-hero__visual other-electronics-hero-visual" aria-label="ტელევიზორის, UPS-ისა და არასტანდარტული პლატების შეკეთება">
            <figure className="lp-hero__photo">
              <img src="/assets/electronic-board-repair/hero-tv-repair.jpg" alt="ტექნიკოსი ტელევიზორის პლატის დიაგნოსტიკასა და შეკეთებაზე მუშაობს" width="1536" height="1024" fetchPriority="high" decoding="async" />
              <figcaption><span />ტელევიზორის შეკეთება</figcaption>
            </figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--ups">
                <img src="/assets/electronic-board-repair/hero-ups-repair.jpg" alt="UPS უწყვეტი კვების წყაროს პლატის კომპონენტური შეკეთება" width="1536" height="1024" loading="lazy" decoding="async" />
                <figcaption><LaptopIcon name="power" />UPS-ის შეკეთება</figcaption>
              </figure>
              <figure className="lp-hero__detail lp-hero__detail--nonstandard-board">
                <img src="/assets/electronic-board-repair/hero-nonstandard-board-repair.jpg" alt="არასტანდარტული საწარმოო მართვის ელექტრონული პლატის დიაგნოსტიკა" width="1536" height="1024" loading="lazy" decoding="async" />
                <figcaption><LaptopIcon name="chip" />არასტანდარტული პლატა</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <nav className="site-container lp-section-nav other-electronics-section-nav" aria-label="ელექტრონული პლატების სერვისის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="other-electronics-directions" aria-labelledby="other-electronics-directions-title">
        <div className="site-container">
          <div className="lp-section-heading">
            <h2 id="other-electronics-directions-title">{display('რომელი მოწყობილობის შეკეთება გჭირდებათ?')}</h2>
            <p>აირჩიეთ მიმართულება და გამოგვიგზავნეთ მოწყობილობის მოდელი, მონაცემთა ფირფიტის ფოტო, პლატის ფოტო და პრობლემის მოკლე აღწერა.</p>
          </div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="ელექტრონული პლატების შეკეთების მიმართულებები" aria-orientation="vertical">
                {otherElectronicsProblems.map((item, index) => (
                    <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`other-electronics-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls={item.id === 'power-supplies' ? 'other-electronics-problem-panel' : `other-electronics-problem-panel-${item.id}`} tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}>
                    <LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" />
                  </button>
                ))}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>მაღალი ძაბვის ან უცნობი დანიშნულების მოწყობილობა არ ჩართოთ განმეორებით. მიღებამდე გამოგვიგზავნეთ მოდელი და ფოტოები.</span></p>
            </div>

            {otherElectronicsProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'power-supplies' ? 'other-electronics-problem-panel' : `other-electronics-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role="tabpanel" aria-labelledby={`other-electronics-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">კომპონენტური დიაგნოსტიკა და ინდივიდუალური შეფასება</span>
                      <h3>{display(problem.title)}</h3>
                      <p>{problem.description}</p>
                      <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                      <div className="lp-problem-service"><h4>შესაძლო მომსახურება</h4><p>{problem.service}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={otherElectronicsProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ მოდელი და გამოგვიგზავნეთ ფოტოები</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo other-electronics-problem-photo--${problem.id}`}>
                      <img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading={isSelected ? 'eager' : 'lazy'} decoding="async" />
                    </div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />ყველა მოწყობილობის შეკეთება შესაძლებელი არ არის — მიღებას ვადასტურებთ წინასწარი ინფორმაციისა და ფოტოების განხილვის შემდეგ.</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="other-electronics-process" aria-labelledby="other-electronics-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="other-electronics-process-title">{display('მოწყობილობის გზა სერვისში')}</h2></div>
          <ol className="lp-process-steps">{otherElectronicsRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="other-electronics-status">
            <div className="lp-status-strip">
              <div><LaptopIcon name="barcode" /><label htmlFor="other-electronics-service-code">უკვე ჩაბარებული გაქვთ მოწყობილობა?</label></div>
              <form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}>
                <input ref={serviceCodeInput} id="other-electronics-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'other-electronics-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} />
                <button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="other-electronics-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button>
              </form>
            </div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="other-electronics-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="other-electronics-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="other-electronics-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
          <p className="other-electronics-status-helper">შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="other-electronics-prices" aria-labelledby="other-electronics-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split">
            <h2 id="other-electronics-prices-title">{display('ფასები და სავარაუდო ვადები')}</h2>
            <div className="lp-price-filters" role="group" aria-label="მომსახურების მიმართულება">
              {otherElectronicsPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{display(filter.label)}</button>)}
            </div>
          </div>
          <p className="lp-info-note lp-price-disclaimer" id="other-electronics-price-disclaimer"><LaptopIcon name="info" /><span>{otherElectronicsPriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="ელექტრონული პლატების შეკეთების პირობები" aria-describedby="other-electronics-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">ღირებულება</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" role="rowgroup">
              {visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}</div><span role="cell" data-label="ღირებულება"><strong className="lp-price-amount">{price.priceLabel}</strong><small className="lp-price-note">{price.priceNote}</small></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div></div>)}
            </div>
          </div>
          <div className="lp-price-footer">
            <p className="lp-info-note"><LaptopIcon name="info" />საბოლოო პირობები დიაგნოსტიკის შემდეგ, სამუშაოს დაწყებამდე თანხმდება. იშვიათი კომპონენტის შეკვეთის ვადა ცალკე დაზუსტდება.</p>
            <RequestLink className="lp-button lp-button--outline lp-button--small" subject="ელექტრონული პლატის შეკეთების შესაძლებლობისა და ღირებულების დაზუსტება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink>
          </div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="other-electronics-faq" aria-labelledby="other-electronics-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="other-electronics-faq-title">{display('ხშირად დასმული კითხვები')}</h2><p>პასუხები არასტანდარტული ელექტრონიკის მიღების, დიაგნოსტიკის, ფასისა და გარანტიის შესახებ.</p></div>
          <div className="lp-faq__list">{otherElectronicsFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lp-faq__question">{item.question}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{item.answer}</p></div></details>)}</div>
        </div>
      </section>

      <ContactSection id="other-electronics-contact" headingId="other-electronics-contact-title" />
    </main>
  )
}
