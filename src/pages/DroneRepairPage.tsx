import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
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
  return <a className={className} href={href ?? droneRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function DroneRepairPage() {
  const [selectedProblem, setSelectedProblem] = useState('crash-gimbal')
  const [priceCategory, setPriceCategory] = useState<DronePriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
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

  const moveProblem = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % droneProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + droneProblems.length) % droneProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = droneProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(droneProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page drone-page" id="drone-page">
      <section className="lp-hero" aria-labelledby="drone-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">დრონები</span>
            </nav>
            <h1 id="drone-title">{display('დრონების')} <span>{display('დიაგნოსტიკა და შეკეთება')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">DJI და FPV დრონების დაცემის, გიმბალის, კამერის, მკლავების, მოტორების, ESC/FC-ის, სენსორებისა და პროგრამული სისტემების სრული დიაგნოსტიკა.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('შეკეთების მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#drone-contact"><LaptopIcon name="phone" />{display('დაგვიკავშირდით')}</a>
            </div>
            <div className="lp-hero__facts drone-hero-facts">
              {droneHeroFacts.map(fact => <span key={fact.title}><LaptopIcon name={fact.icon} /><span>{fact.title} {fact.subtitle}</span></span>)}
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/drone-repair/hero-mavic-4-pro.webp" alt="ხელთათმანიანი ტექნიკოსი დაშლილი DJI დრონის დიაგნოსტიკასა და შეკეთებაზე მუშაობს" width="1672" height="941" fetchPriority="high" decoding="async" /><figcaption><span />DJI დრონის შეკეთება</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--drone-gimbal"><img src="/assets/drone-repair/hero-gimbal-disassembled.webp" alt="DJI დრონის დაშლილი გიმბალისა და კამერის მოდულის შეკეთება" width="1672" height="941" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="activity" />გიმბალის შეკეთება</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--drone-fpv"><img src="/assets/drone-repair/hero-controller-disassembled.webp" alt="დაშლილი DJI პულტის ჯოისტიკისა და მართვის პლატის შეკეთება" width="1672" height="941" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="gamepad" />DJI პულტის შეკეთება</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav drone-section-nav" aria-label="დრონების სერვისის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="drone-problems" aria-labelledby="drone-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-problems-title">{display('რა პრობლემა აქვს თქვენს დრონს?')}</h2><p>აირჩიეთ სიმპტომი. დაცემის შემდეგ ფარული გეომეტრიული ან ელექტრონული დაზიანება მხოლოდ ვიზუალურად ყოველთვის არ ჩანს.</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="დრონის პრობლემები" aria-orientation="vertical">
                {droneProblems.map((item, index) => <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`drone-problem-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls={item.id === 'crash-gimbal' ? 'drone-problem-panel' : `drone-problem-panel-${item.id}`} tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}><LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" /></button>)}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>დაცემის ან წყლით დაზიანების შემდეგ დრონი აღარ ჩართოთ; თუ უსაფრთხოა, მოხსენით ბატარეა.</span></p>
            </div>
            {droneProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'crash-gimbal' ? 'drone-problem-panel' : `drone-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role="tabpanel" aria-labelledby={`drone-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                  <span className="lp-eyebrow">სიმპტომი და პროფესიონალური დიაგნოსტიკა</span>
                      <h3>{display(problem.title)}</h3>
                      <p>{problem.description}</p>
                      <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                      <div className="lp-problem-service"><h4>შესაძლო მომსახურება</h4><p>{problem.service}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={droneProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ WhatsApp-ში</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo drone-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="drone-process" aria-labelledby="drone-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-process-title">{display('დრონის დიაგნოსტიკისა და შეკეთების პროცესი')}</h2></div>
          <ol className="lp-process-steps">{droneRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="drone-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="drone-service-code">უკვე ჩაბარებული გაქვთ დრონი?</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="drone-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'drone-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="drone-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="drone-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="drone-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="drone-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
          <p className="drone-status-helper">შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="drone-prices" aria-labelledby="drone-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="drone-prices-title">{display('დრონის სერვისის ფასები')}</h2><div className="lp-price-filters" role="group" aria-label="მომსახურების ტიპი">{dronePriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{display(filter.label)}</button>)}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="drone-price-disclaimer"><LaptopIcon name="info" /><span>{dronePriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="დრონის შეკეთების ფასები" aria-describedby="drone-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">ფასი</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}</div><span role="cell" data-label="ფასი"><strong className="lp-price-amount">{formatDronePrice(price)}</strong><small className="lp-price-note">{price.priceNote}</small></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div></div>)}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />ნაწილების ღირებულება ცალკე ითვლება. ფრენის უსაფრთხოებაზე მოქმედი სამუშაო დასრულებულად ითვლება მხოლოდ კალიბრაციისა და ფუნქციური ტესტის შემდეგ.</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="დრონის შეკეთების ღირებულების დაზუსტება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="drone-faq" aria-labelledby="drone-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="drone-faq-title">{display('ხშირად დასმული კითხვები')}</h2><p>პასუხები დაცემის, გიმბალის, firmware-ის, ბატარეისა და საბოლოო ტესტის შესახებ.</p></div>
          <div className="lp-faq__list">{droneFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lp-faq__question">{item.question}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{item.answer}</p></div></details>)}</div>
        </div>
      </section>

      <ContactSection id="drone-contact" headingId="drone-contact-title" />
    </main>
  )
}
