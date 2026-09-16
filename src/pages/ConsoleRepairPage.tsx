import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import { ContactSection } from '../sections/AboutSection'
import {
  consoleFaqs,
  consolePlatforms,
  consolePriceDisclaimer,
  consolePriceFilters,
  consolePrices,
  consoleProblemRequestUrl,
  consoleProblems,
  consoleRepairSteps,
  consoleRequestUrl,
  formatConsolePrice,
  type ConsolePriceCategory,
} from '../data/consoleRepair'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'

const sectionLinks = [
  { id: 'console-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'console-prices', label: 'ფასები', icon: 'info' },
  { id: 'console-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'console-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'console-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  return <a className={className} href={href ?? consoleRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function ConsoleRepairPage() {
  const [selectedProblem, setSelectedProblem] = useState('hdmi')
  const [priceCategory, setPriceCategory] = useState<ConsolePriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const visiblePrices = consolePrices.filter(item => priceCategory === 'all' || item.category === priceCategory)

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
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % consoleProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + consoleProblems.length) % consoleProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = consoleProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(consoleProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page console-page" id="console-page">
      <section className="lp-hero" aria-labelledby="console-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">კონსოლები</span>
            </nav>
            <h1 id="console-title">{display('კონსოლების')} <span>{display('შეკეთება')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">PlayStation, Xbox და Nintendo კონსოლების პლატის, HDMI-ის, გაგრილების, კვებისა და კონტროლერების პროფესიონალური სერვისი.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('შეკეთების მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#console-prices"><LaptopIcon name="info" />{display('ფასების ნახვა')}</a>
            </div>
            <div className="lp-hero__facts console-hero-facts">
              {consolePlatforms.map(platform => <span key={platform.title}><LaptopIcon name={platform.icon} /><span>{platform.title}<br />{platform.subtitle}</span></span>)}
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/console-repair/hero-controller.webp" alt="კონსოლის ჯოისტიკისა და კონტროლერის პროფესიონალური შეკეთება" width="1536" height="1024" fetchPriority="high" decoding="async" /><figcaption><span />ჯოისტიკის შეკეთება</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--ps5"><img src="/assets/console-repair/hero-ps5.webp" alt="PlayStation 5 კონსოლის პროფესიონალური შეკეთება" width="1536" height="1024" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="gamepad" />PS5 შეკეთება</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--xbox"><img src="/assets/console-repair/hero-xbox.webp" alt="Xbox კონსოლის პროფესიონალური შეკეთება" width="1536" height="1024" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="activity" />Xbox შეკეთება</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav console-section-nav" aria-label="კონსოლების სერვისის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="console-problems" aria-labelledby="console-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="console-problems-title">{display('რა პრობლემა აქვს თქვენს კონსოლს?')}</h2><p>აირჩიეთ სიმპტომი და ნახეთ, რას ვამოწმებთ.</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="კონსოლის პრობლემები" aria-orientation="vertical">
                {consoleProblems.map((item, index) => <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`console-problem-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls={item.id === 'hdmi' ? 'console-problem-panel' : `console-problem-panel-${item.id}`} tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}><LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" /></button>)}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>დამწვრის სუნის, კვამლის, სითხის ან ნაპერწკლის შემთხვევაში კონსოლი გამორთეთ დენიდან და აღარ ჩართოთ.</span></p>
            </div>
            {consoleProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'hdmi' ? 'console-problem-panel' : `console-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role="tabpanel" aria-labelledby={`console-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">სიმპტომი და დიაგნოსტიკა</span>
                      <h3>{display(problem.title)}</h3>
                      <p>{problem.description}</p>
                      <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                      <div className="lp-problem-service"><h4>შესაძლო მომსახურება</h4><p>{problem.service}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={consoleProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ WhatsApp-ში</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo console-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading="lazy" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="console-process" aria-labelledby="console-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="console-process-title">{display('თქვენი კონსოლის გზა სერვისში')}</h2></div>
          <ol className="lp-process-steps">{consoleRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="console-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="console-service-code">უკვე ჩაბარებული გაქვთ მოწყობილობა?</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="console-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'console-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="console-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="console-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="console-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="console-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="console-prices" aria-labelledby="console-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="console-prices-title">{display('ფასები და სავარაუდო ვადები')}</h2><div className="lp-price-filters" role="group" aria-label="მომსახურების ტიპი">{consolePriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{filter.label}</button>)}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="console-price-disclaimer"><LaptopIcon name="info" /><span>{consolePriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="კონსოლის შეკეთების ფასები" aria-describedby="console-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">საორიენტაციო ფასი</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}</div><span role="cell" data-label="ფასი"><strong className="lp-price-amount">{formatConsolePrice(price)}</strong><small className="lp-price-note">{price.priceNote}</small></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div></div>)}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />საბოლოო ფასი თანხმდება დიაგნოსტიკის შემდეგ. ვადა დამოკიდებულია სამუშაოზე, რიგსა და საჭირო ნაწილის ხელმისაწვდომობაზე.</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="კონსოლის შეკეთების ღირებულება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="console-faq" aria-labelledby="console-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="console-faq-title">{display('ხშირად დასმული კითხვები')}</h2><p>მოკლე პასუხები კონსოლის ჩაბარებამდე ყველაზე მნიშვნელოვან კითხვებზე.</p></div>
          <div className="lp-faq__list">{consoleFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lp-faq__question">{item.question}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{item.answer}</p></div></details>)}</div>
        </div>
      </section>

      <ContactSection id="console-contact" headingId="console-contact-title" />
    </main>
  )
}
