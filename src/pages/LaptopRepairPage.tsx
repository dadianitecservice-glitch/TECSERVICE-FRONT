import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
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
  return <a className={className} href={href ?? laptopRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function LaptopRepairPage() {
  const [selectedProblem, setSelectedProblem] = useState('screen')
  const [priceCategory, setPriceCategory] = useState<LaptopPriceCategory>('hardware')
  const [showRemainingTechnical, setShowRemainingTechnical] = useState(false)
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const problem = laptopProblems.find(item => item.id === selectedProblem)!
  const prices = laptopPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)
  const hasRemainingTechnical = priceCategory === 'hardware' && prices.length > technicalPreviewCount
  const visiblePrices = hasRemainingTechnical && !showRemainingTechnical ? prices.slice(0, technicalPreviewCount) : prices

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
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % laptopProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + laptopProblems.length) % laptopProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = laptopProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(laptopProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page" id="laptop-page">
      <section className="lp-hero" aria-labelledby="laptop-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">ლეპტოპები</span>
            </nav>
            <h1 id="laptop-title">{display('ლეპტოპების')} <span>{display('შეკეთება')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">ეკრანიდან სისტემურ პლატამდე — ტექნიკური და პროგრამული პრობლემების დიაგნოსტიკა და შეკეთება.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('შეკეთების მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#laptop-contact"><LaptopIcon name="phone" />{display('დაგვიკავშირდით')}</a>
            </div>
            <div className="lp-hero__facts">
              <span><LaptopIcon name="tool" /><span>კომპონენტური<br />შეკეთება</span></span>
              <span><LaptopIcon name="people" /><span>სამუშაოს წინასწარი<br />შეთანხმება</span></span>
              <span><LaptopIcon name="calendar" /><span>2002 წლიდან</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src={repairImage} alt="ლეპტოპის სისტემური პლატისა და გაგრილების სისტემის პროფესიონალური დიაგნოსტიკა" width="1536" height="1024" fetchPriority="high" /><figcaption><span />გაგრილება და დიაგნოსტიკა</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--board"><img src={systemBoardImage} alt="ლეპტოპის პლატაზე კვების სისტემის ზუსტი დიაგნოსტიკა" width="1200" height="899" /><figcaption><LaptopIcon name="chip" />სისტემური პლატა</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src={upgradeImage} alt="ლეპტოპში SSD-ისა და ოპერატიული მეხსიერების განახლება" width="1200" height="900" /><figcaption><LaptopIcon name="memory" />SSD / RAM</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav" aria-label="ლეპტოპის სერვისის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="laptop-problems" aria-labelledby="laptop-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="laptop-problems-title">{display('რა პრობლემა აქვს თქვენს ლეპტოპს?')}</h2><p>აირჩიეთ სიმპტომი და ნახეთ, რას ვამოწმებთ.</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="ლეპტოპის პრობლემები" aria-orientation="vertical">
                {laptopProblems.map((item, index) => <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`problem-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls="laptop-problem-panel" tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}><LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" /></button>)}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>სითხის მოხვედრისას არ ჩართოთ და არ დატენოთ მოწყობილობა.</span></p>
            </div>
            <div className="lp-problem-panel" id="laptop-problem-panel" role="tabpanel" aria-labelledby={`problem-tab-${problem.id}`} tabIndex={0}>
              <div className="lp-problem-panel__main" key={problem.id}>
                <div className="lp-problem-panel__copy">
                  <span className="lp-eyebrow">სიმპტომი და დიაგნოსტიკა</span>
                  <h3>{display(problem.title)}</h3>
                  <p>{problem.description}</p>
                  <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                  <div className="lp-problem-service"><h4>შესაძლო მომსახურება</h4><p>{problem.service}</p></div>
                  <RequestLink className="lp-text-link lp-whatsapp-link" href={laptopProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ WhatsApp-ში</span><LaptopIcon name="arrow" /></RequestLink>
                </div>
                <div className={`lp-problem-panel__photo lp-problem-panel__photo--${problem.id}`}><img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading="lazy" /></div>
              </div>
              <p className="lp-info-note"><LaptopIcon name="info" />არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="laptop-prices" aria-labelledby="laptop-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="laptop-prices-title">{display('ფასები და სავარაუდო ვადები')}</h2><div className="lp-price-filters" role="group" aria-label="მომსახურების ტიპი">{laptopPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => { setPriceCategory(filter.id); setShowRemainingTechnical(false) }}>{filter.label}</button>)}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="laptop-price-disclaimer"><LaptopIcon name="info" /><span>{laptopPriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="ლეპტოპის შეკეთების ფასები" aria-describedby="laptop-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">ფასი</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" id="laptop-price-rows" role="rowgroup">{visiblePrices.map(price => <div className="lp-price-entry" key={price.id}>
              <div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}{price.programs && <span className="lp-price-programs">{price.programs.join(' · ')}</span>}</div><span role="cell" data-label="ფასი"><strong className="lp-price-amount">{formatLaptopPrice(price)}</strong><small className="lp-price-note">{price.priceNote}</small></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div>
            </div>)}</div>
          </div>
          {hasRemainingTechnical && <button className="lp-price-more" type="button" aria-expanded={showRemainingTechnical} aria-controls="laptop-price-rows" onClick={() => setShowRemainingTechnical(current => !current)}>{showRemainingTechnical ? 'ნაკლების ჩვენება ↑' : `დანარჩენი ${prices.length - technicalPreviewCount} მომსახურების ნახვა →`}</button>}
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />საბოლოო ფასი თანხმდება დიაგნოსტიკის შემდეგ. ვადა დამოკიდებულია სამუშაოზე, რიგსა და ნაწილების მარაგზე.</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="ლეპტოპის შეკეთების ღირებულება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-process" id="laptop-process" aria-labelledby="laptop-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="laptop-process-title">{display('თქვენი ლეპტოპის გზა სერვისში')}</h2></div>
          <ol className="lp-process-steps">{laptopRepairSteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="laptop-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="laptop-service-code">უკვე ჩაბარებული გაქვთ მოწყობილობა?</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="laptop-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'laptop-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="laptop-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="laptop-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="laptop-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="laptop-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="laptop-faq" aria-labelledby="laptop-faq-title">
        <div className="site-container">
          <div className="lp-section-heading">
            <h2 id="laptop-faq-title">{display('ხშირად დასმული კითხვები')}</h2>
            <p>მოკლე პასუხები ლეპტოპის ჩაბარებამდე ყველაზე მნიშვნელოვან კითხვებზე.</p>
          </div>
          <div className="lp-faq__list">
            {laptopFaqs.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="lp-faq__question">{item.question}</span>
                  <LaptopIcon name="chevron" />
                </summary>
                <div className="lp-faq__answer"><p>{item.answer}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-contact" id="laptop-contact" aria-labelledby="laptop-contact-title">
        <div className="site-container lp-contact__card">
          <div className="lp-contact__copy">
            <span className="lp-eyebrow">შემდეგი ნაბიჯი</span>
            <h2 id="laptop-contact-title">{display('მზად ხართ ლეპტოპის შესაკეთებლად?')}</h2>
            <p>მოგვწერეთ პრობლემის მოკლე აღწერა ან დაგვირეკეთ. მოწყობილობის მიღების შემდეგ დიაგნოსტიკის შედეგსა და სამუშაოს პირობებს წინასწარ შეგითანხმებთ.</p>
            <div className="lp-contact__actions">
              <RequestLink className="lp-button lp-button--primary"><LaptopIcon name="whatsapp" />{display('შეკეთების მოთხოვნა')}</RequestLink>
            </div>
            <ul className="lp-contact__details" aria-label="საკონტაქტო ინფორმაცია">
              <li><img src="/assets/icons/phone.svg" alt="" /><span><a href="tel:+995591474040" aria-label="ტელეფონი: +995 591 47 40 40">+995 591 47 40 40</a></span></li>
              <li><img src="/assets/icons/pin.svg" alt="" /><span><a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer" aria-label="მისამართი: თბილისი, ცოტნე დადიანის 7ბ/2">თბილისი, ცოტნე დადიანის 7ბ/2</a></span></li>
              <li><img src="/assets/icons/clock.svg" alt="" /><span><span aria-label="სამუშაო საათები: ორშაბათიდან პარასკევამდე 10:00-დან 19:00-მდე; შაბათს 11:00-დან 17:00-მდე">ორშ–პარ · 10:00–19:00; შაბ · 11:00–17:00</span></span></li>
            </ul>
          </div>
          <div className="lp-contact__map">
            <iframe src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed" title="TECSERVICE-ის მდებარეობა Google Maps-ზე" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            <a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer" aria-label="TECSERVICE-ის მდებარეობის გახსნა Google Maps-ზე"><strong>TECSERVICE</strong><small>თბილისი, ცოტნე დადიანის 7ბ/2</small></a>
          </div>
        </div>
      </section>
    </main>
  )
}
