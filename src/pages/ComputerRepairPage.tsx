import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
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
  return <a className={className} href={href ?? computerRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function ComputerRepairPage() {
  const [selectedProblem, setSelectedProblem] = useState('display')
  const [priceCategory, setPriceCategory] = useState<ComputerPriceCategory>('hardware')
  const [showRemainingTechnical, setShowRemainingTechnical] = useState(false)
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
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

  const moveProblem = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % computerProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + computerProblems.length) % computerProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = computerProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(computerProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page computer-page" id="computer-page">
      <section className="lp-hero" aria-labelledby="computer-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">კომპიუტერები</span>
            </nav>
            <h1 id="computer-title">{display('კომპიუტერების')} <span>{display('შეკეთება და აწყობა')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">დესკტოპ კომპიუტერების ტექნიკური და პროგრამული დიაგნოსტიკა, კომპონენტური შეკეთება, განახლება და სრული სისტემის აწყობა.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('შეკეთების მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#computer-build"><LaptopIcon name="chip" />{display('კომპიუტერის აწყობა')}</a>
            </div>
            <div className="lp-hero__facts computer-hero-facts">
              <span><LaptopIcon name="chip" /><span>პლატის დიაგნოსტიკა</span></span>
              <span><LaptopIcon name="memory" /><span>GPU / RAM განახლება</span></span>
              <span><LaptopIcon name="server" /><span>სისტემის სრული აწყობა</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/computer-repair/hero-diagnostics.webp" alt="დესკტოპ კომპიუტერის პროფესიონალური კომპონენტური დიაგნოსტიკა" width="1280" height="853" fetchPriority="high" /><figcaption><span />დიაგნოსტიკა და შეკეთება</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--board"><img src="/assets/computer-repair/hero-gpu-power.webp" alt="ვიდეოკარტისა და კვების სისტემის პროფესიონალური შემოწმება" width="1280" height="960" /><figcaption><LaptopIcon name="chip" />GPU / კვება</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src="/assets/computer-repair/hero-custom-build.webp" alt="ინდივიდუალური კომპიუტერის აწყობა და ტესტირება" width="1280" height="960" /><figcaption><LaptopIcon name="memory" />სრული აწყობა</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav" aria-label="კომპიუტერის სერვისის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="computer-problems" aria-labelledby="computer-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-problems-title">{display('რა პრობლემა აქვს თქვენს კომპიუტერს?')}</h2><p>აირჩიეთ სიმპტომი და ნახეთ, რას ვამოწმებთ.</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="კომპიუტერის პრობლემები" aria-orientation="vertical">
                {computerProblems.map((item, index) => <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`computer-problem-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls={item.id === 'display' ? 'computer-problem-panel' : `computer-problem-panel-${item.id}`} tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}><LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" /></button>)}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>დამწვრის სუნის, კვამლის ან ნაპერწკლის შემთხვევაში კომპიუტერი დაუყოვნებლივ გამორთეთ დენიდან.</span></p>
            </div>
            {computerProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'display' ? 'computer-problem-panel' : `computer-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role="tabpanel" aria-labelledby={`computer-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">სიმპტომი და დიაგნოსტიკა</span>
                      <h3>{display(problem.title)}</h3>
                      <p>{problem.description}</p>
                      <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                      <div className="lp-problem-service"><h4>შესაძლო მომსახურება</h4><p>{problem.service}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={computerProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ WhatsApp-ში</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo pc-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading="lazy" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section pc-build" id="computer-build" aria-labelledby="computer-build-title">
        <div className="site-container">
          <div className="lp-section-heading pc-build__heading">
            <div><span className="lp-eyebrow"><LaptopIcon name="chip" />ინდივიდუალური კომპლექტაცია</span><h2 id="computer-build-title">{display('კომპიუტერის აწყობა და კომპონენტები')}</h2></div>
            <p>შევარჩევთ თავსებად კომპონენტებს, მოვამზადებთ სრულ შეთავაზებას და ავაწყობთ სისტემას თქვენი დანიშნულებისა და ბიუჯეტის მიხედვით.</p>
          </div>
          <div className="pc-build__profiles">{computerBuildProfiles.map(profile => <article key={profile.title}><span><LaptopIcon name={profile.icon} /></span><div><h3>{display(profile.title)}</h3><p>{profile.description}</p></div></article>)}</div>
          <div className="pc-build__card">
            <figure className="pc-build__photo"><img src="/assets/computer-repair/custom-build-components.webp" alt="კომპიუტერის სრული აწყობა შერჩეული თავსებადი კომპონენტებით" width="1280" height="720" loading="lazy" /><figcaption><LaptopIcon name="check" />აწყობა, კაბელების მართვა და ტესტირება</figcaption></figure>
            <div className="pc-build__content">
              <span className="lp-eyebrow">სრული მომსახურება ერთ სივრცეში</span>
              <h3>{display('შერჩევიდან გამართულ სისტემამდე')}</h3>
              <ul className="pc-build__includes">{computerBuildIncludes.map(item => <li key={item}><LaptopIcon name="check" />{item}</li>)}</ul>
              <div className="pc-build__parts" aria-label="კომპიუტერის კომპონენტები">{computerBuildParts.map(part => <span key={part}>{part}</span>)}</div>
              <div className="pc-build__prices">{computerBuildPrices.map(item => <div key={item.name}><span>{item.name}</span><strong>{item.price}</strong><small>{item.duration}</small></div>)}</div>
              <p className="pc-build__note"><LaptopIcon name="info" />კომპონენტების ფასი მომსახურებაში არ შედის და რეალური მარაგისა და მიმდინარე ღირებულების მიხედვით წინასწარ თანხმდება.</p>
              <div className="pc-build__actions">
                <RequestLink className="lp-button lp-button--primary" href={computerBuildRequestUrl()}><LaptopIcon name="whatsapp" />{display('კომპლექტაციის მოთხოვნა')}</RequestLink>
                <a className="lp-button lp-button--outline" href="https://shop.tecservice.ge" target="_blank" rel="noreferrer">{display('კომპონენტების ნახვა')}<LaptopIcon name="arrow" /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="computer-process" aria-labelledby="computer-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-process-title">{display('თქვენი კომპიუტერის გზა სერვისში')}</h2></div>
          <ol className="lp-process-steps">{computerRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="computer-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="computer-service-code">უკვე ჩაბარებული გაქვთ მოწყობილობა?</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="computer-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'computer-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="computer-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="computer-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="computer-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="computer-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="computer-prices" aria-labelledby="computer-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="computer-prices-title">{display('ფასები და სავარაუდო ვადები')}</h2><div className="lp-price-filters" role="group" aria-label="მომსახურების ტიპი">{computerPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => { setPriceCategory(filter.id); setShowRemainingTechnical(false) }}>{filter.label}</button>)}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="computer-price-disclaimer"><LaptopIcon name="info" /><span>{computerPriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="კომპიუტერის შეკეთების ფასები" aria-describedby="computer-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">საორიენტაციო ფასი</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" id="computer-price-rows" role="rowgroup">{computerPrices.map(price => {
              const isVisible = shownPriceIds.has(price.id)
              return <div className="lp-price-entry" key={price.id} hidden={!isVisible} aria-hidden={isVisible ? undefined : true}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}{price.programs && <span className="lp-price-programs">{price.programs.join(' · ')}</span>}</div><span role="cell" data-label="ფასი"><strong className="lp-price-amount">{formatComputerPrice(price)}</strong><small className="lp-price-note">{price.priceNote}</small></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div></div>
            })}</div>
          </div>
          {hasRemainingTechnical && <button className="lp-price-more" type="button" aria-expanded={showRemainingTechnical} aria-controls="computer-price-rows" onClick={() => setShowRemainingTechnical(current => !current)}>{showRemainingTechnical ? 'ნაკლების ჩვენება ↑' : `დანარჩენი ${prices.length - technicalPreviewCount} მომსახურების ნახვა →`}</button>}
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />საბოლოო ფასი თანხმდება დიაგნოსტიკის შემდეგ. ვადა დამოკიდებულია სამუშაოზე, რიგსა და კომპონენტების მარაგზე.</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="კომპიუტერის შეკეთების ღირებულება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="computer-faq" aria-labelledby="computer-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="computer-faq-title">{display('ხშირად დასმული კითხვები')}</h2><p>მოკლე პასუხები შეკეთებისა და კომპიუტერის აწყობის შესახებ.</p></div>
          <div className="lp-faq__list">{computerFaqs.map((item, index) => <details key={item.question}><summary><span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lp-faq__question">{item.question}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{item.answer}</p></div></details>)}</div>
        </div>
      </section>

      <ContactSection id="computer-contact" headingId="computer-contact-title" />
    </main>
  )
}
