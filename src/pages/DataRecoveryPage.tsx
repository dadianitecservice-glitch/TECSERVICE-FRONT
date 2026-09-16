import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { TicketResult } from '../components/TicketResult'
import {
  dataRecoveryFaqs,
  dataRecoveryPriceDisclaimer,
  dataRecoveryPriceFilters,
  dataRecoveryPrices,
  dataRecoveryProblemRequestUrl,
  dataRecoveryProblems,
  dataRecoveryRequestUrl,
  dataRecoverySteps,
  type DataRecoveryPriceCategory,
} from '../data/dataRecovery'
import { findTicketByCode, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli as display } from '../utils/text'
import '../styles/laptop-repair.css'
import '../styles/data-recovery.css'

const sectionLinks = [
  { id: 'data-recovery-problems', label: 'პრობლემები', icon: 'tool' },
  { id: 'data-recovery-prices', label: 'ფასები', icon: 'info' },
  { id: 'data-recovery-process', label: 'პროცესი', icon: 'calendar' },
  { id: 'data-recovery-status', label: 'სერვისის კოდი', icon: 'barcode' },
  { id: 'data-recovery-faq', label: 'ხშირად დასმული კითხვები', icon: 'chevron' },
] as const

const mapUrl = 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7'

function RequestLink({ children, className = '', subject, href }: { children: ReactNode; className?: string; subject?: string; href?: string }) {
  return <a className={className} href={href ?? dataRecoveryRequestUrl(subject)} target="_blank" rel="noreferrer">{children}</a>
}

export default function DataRecoveryPage() {
  const [selectedProblem, setSelectedProblem] = useState('hdd-clicking')
  const [priceCategory, setPriceCategory] = useState<DataRecoveryPriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const problemTabs = useRef<(HTMLButtonElement | null)[]>([])
  const serviceCodeInput = useRef<HTMLInputElement>(null)
  const ticketResultRef = useRef<HTMLDivElement>(null)
  const ticketLookupTimer = useRef<number | null>(null)
  const visiblePrices = dataRecoveryPrices.filter(item => priceCategory === 'all' || item.category === priceCategory)

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
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % dataRecoveryProblems.length
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + dataRecoveryProblems.length) % dataRecoveryProblems.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = dataRecoveryProblems.length - 1
    else return
    event.preventDefault()
    setSelectedProblem(dataRecoveryProblems[next].id)
    problemTabs.current[next]?.focus()
  }

  return (
    <main className="laptop-page data-recovery-page" id="data-recovery-page">
      <section className="lp-hero" aria-labelledby="data-recovery-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label="გვერდის მდებარეობა">
              <a href="/">მთავარი</a><span aria-hidden="true">/</span><a href="/#services">სერვისები</a><span aria-hidden="true">/</span><span aria-current="page">ინფორმაციის აღდგენა</span>
            </nav>
            <h1 id="data-recovery-title">{display('ინფორმაციის')} <span>{display('ლაბორატორიული აღდგენა')}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">HDD, SSD, RAID, NAS, USB და SD მატარებლებიდან მონაცემების უსაფრთხო აღდგენა PC‑3000 და Data Extractor ლაბორატორიული სისტემებით.</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{display('აღდგენის მოთხოვნა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="#data-recovery-contact"><LaptopIcon name="phone" />{display('დაგვიკავშირდით')}</a>
            </div>
            <div className="lp-hero__facts dr-hero-facts">
              <span><LaptopIcon name="chip" /><span>PC‑3000 +<br />Data Extractor</span></span>
              <span><LaptopIcon name="hardDrive" /><span>6 ტიპის მატარებელი<br />HDD, SSD, RAID, NAS, USB და SD</span></span>
              <span><LaptopIcon name="calendar" /><span>15 წლიანი<br />გამოცდილება</span></span>
              <span><LaptopIcon name="lock" /><span>კონფიდენციალური<br />პროცესი</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/data-recovery/hero-hdd-opening.jpg" alt="სუფთა ლაბორატორიულ გარემოში ხელთათმანებით მყარი დისკის პროფესიონალური გახსნა" width="1672" height="941" fetchPriority="high" /><figcaption><span />HDD ლაბორატორიული გახსნა</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--usb"><img src="/assets/data-recovery/problem-usb-sd.jpg" alt="USB ფლეშკისა და microSD მეხსიერების მიკროსკოპით დიაგნოსტიკა" width="1448" height="1086" /><figcaption><LaptopIcon name="usb" />USB / SD აღდგენა</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src="/assets/data-recovery/hero-ssd-lab.jpg" alt="SSD და NVMe მეხსიერების ჩიპების ლაბორატორიული დიაგნოსტიკა" width="1448" height="1086" /><figcaption><LaptopIcon name="memory" />SSD / NVMe</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav dr-section-nav" aria-label="ინფორმაციის აღდგენის სექციები">
          {sectionLinks.map(item => <a key={item.id} href={`#${item.id}`}><LaptopIcon name={item.icon} />{display(item.label)}</a>)}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="data-recovery-problems" aria-labelledby="data-recovery-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-problems-title">{display('რა დაემართა თქვენს მონაცემებს?')}</h2><p>აირჩიეთ სიმპტომი. დაზიანებული მატარებლის განმეორებით ჩართვამ შეიძლება აღდგენის შანსი შეამციროს.</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <div className="lp-problem-tabs" role="tablist" aria-label="მონაცემთა მატარებლის პრობლემები" aria-orientation="vertical">
                {dataRecoveryProblems.map((item, index) => <button key={item.id} ref={node => { problemTabs.current[index] = node }} id={`data-recovery-problem-tab-${item.id}`} role="tab" type="button" aria-selected={selectedProblem === item.id} aria-controls={item.id === 'hdd-clicking' ? 'data-recovery-problem-panel' : `data-recovery-problem-panel-${item.id}`} tabIndex={selectedProblem === item.id ? 0 : -1} onClick={() => setSelectedProblem(item.id)} onKeyDown={event => moveProblem(event, index)}><LaptopIcon name={item.icon} /><span>{item.label}</span><span className="lp-selection-dot" aria-hidden="true" /></button>)}
              </div>
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>არ ჩართოთ, არ დააფორმატოთ და არ გაუშვათ CHKDSK ან სხვა „Repair“ პროგრამა.</span></p>
            </div>
            {dataRecoveryProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'hdd-clicking' ? 'data-recovery-problem-panel' : `data-recovery-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role="tabpanel" aria-labelledby={`data-recovery-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{problem.eyebrow}</span>
                      <h3>{display(problem.title)}</h3>
                      <p>{problem.description}</p>
                      <ul className="lp-check-list">{problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{check}</li>)}</ul>
                      <div className="lp-problem-service"><h4>ლაბორატორიული პროცესი</h4><p>{problem.service}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={dataRecoveryProblemRequestUrl(problem)}><LaptopIcon name="whatsapp" /><span>მოგვწერეთ მატარებლის მოდელი და სიმპტომი</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo dr-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={problem.photo.alt} width={problem.photo.width} height={problem.photo.height} loading="lazy" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="data-recovery-process" aria-labelledby="data-recovery-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-process-title">{display('მატარებლის გზა ლაბორატორიაში')}</h2></div>
          <ol className="lp-process-steps">{dataRecoverySteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{index + 1}</span><h3>{display(step.title)}</h3><p>{step.description}</p></li>)}</ol>
          <div className="lp-ticket-lookup" id="data-recovery-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="data-recovery-service-code">უკვე ჩაბარებული გაქვთ მატარებელი?</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="data-recovery-service-code" name="service-code" type="text" placeholder="სერვისის კოდი" required maxLength={64} autoComplete="off" aria-label="სერვისის კოდი" aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'data-recovery-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="data-recovery-ticket-result" aria-expanded={ticketState === 'found'}>{ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა'}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="data-recovery-service-code-message" role="alert">შეიყვანეთ სერვისის კოდი.</p>}
            {ticketState === 'not-found' && <p className="lp-ticket-message" id="data-recovery-service-code-message" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</p>}
            {ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="data-recovery-ticket-result" role="region" aria-label="მოძებნილი სერვისის სტატუსი" tabIndex={-1}><TicketResult ticket={foundTicket} /></div>}
          </div>
          <p className="dr-status-helper">შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="data-recovery-prices" aria-labelledby="data-recovery-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="data-recovery-prices-title">{display('ლაბორატორიული შეფასება და ფასები')}</h2><div className="lp-price-filters" role="group" aria-label="აღდგენის მომსახურების ტიპი">{dataRecoveryPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{display(filter.label)}</button>)}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="data-recovery-price-disclaimer"><LaptopIcon name="info" /><span>{dataRecoveryPriceDisclaimer}</span></p>
          <div className="lp-price-table" role="table" aria-label="ინფორმაციის აღდგენის ფასები" aria-describedby="data-recovery-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">მომსახურება</span><span role="columnheader">ფასი</span><span role="columnheader">სავარაუდო ვადა</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{price.name}</div><span role="cell" data-label="ფასი"><strong className="lp-price-amount">{price.price}</strong></span><span role="cell" data-label="სავარაუდო ვადა">{price.duration}</span></div></div>)}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />აღდგენის საბოლოო შესაძლებლობა, ფასი და ვადა დგინდება დიაგნოსტიკისა და პირველადი კითხვის შემდეგ. დონორი ნაწილის ღირებულება, თუ საჭიროა, ცალკე თანხმდება.</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="ინფორმაციის აღდგენის ღირებულების დაზუსტება">ღირებულების დაზუსტება<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="data-recovery-faq" aria-labelledby="data-recovery-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-faq-title">{display('ხშირად დასმული კითხვები')}</h2><p>მნიშვნელოვანი პასუხები აღდგენის შანსზე, ვადაზე, დონორ ნაწილსა და მონაცემების დაცვაზე.</p></div>
          <div className="lp-faq__list">{dataRecoveryFaqs.map((item, index) => <details key={item.question} open={index === 0 ? true : undefined}><summary><span className="lp-faq__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="lp-faq__question">{item.question}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{item.answer}</p></div></details>)}</div>
        </div>
      </section>

      <section className="dr-contact" id="data-recovery-contact" aria-labelledby="data-recovery-contact-title">
        <div className="site-container dr-contact__card">
          <div className="dr-contact__copy">
            <span className="lp-eyebrow">15 წლიანი ლაბორატორიული გამოცდილება</span>
            <h2 id="data-recovery-contact-title">{display('მონაცემები მნიშვნელოვანია? ჯერ ნუ ჩართავთ მოწყობილობას')}</h2>
            <p>მოგვწერეთ მატარებლის მოდელი, მოცულობა, დაზიანების ისტორია და რომელი ფაილებია პრიორიტეტული. უსაფრთხო აღდგენა სწორი პირველი ნაბიჯით იწყება.</p>
            <div className="dr-contact__actions">
              <RequestLink className="lp-button lp-button--primary"><LaptopIcon name="whatsapp" />{display('WhatsApp-ში მოწერა')}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href="tel:+995591474040"><LaptopIcon name="phone" />{display('დაგვიკავშირდით')}</a>
            </div>
            <div className="dr-contact__details">
              <a href="tel:+995591474040"><span><LaptopIcon name="phone" /></span><small>ტელეფონი</small><strong>+995 591 47 40 40</strong></a>
              <a href={mapUrl} target="_blank" rel="noreferrer"><span><img src="/assets/icons/pin.svg" alt="" /></span><small>მისამართი</small><strong>თბილისი, ცოტნე დადიანის 7ბ/2</strong></a>
              <div><span><LaptopIcon name="calendar" /></span><small>სამუშაო საათები</small><strong>ორშ–პარ · 10:00–19:00; შაბ · 11:00–17:00</strong></div>
            </div>
          </div>
          <div className="dr-contact__map">
            <iframe src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed" title="TECSERVICE-ის მდებარეობა Google Maps-ზე" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            <a href={mapUrl} target="_blank" rel="noreferrer"><strong>TECSERVICE</strong><small>თბილისი, ცოტნე დადიანის 7ბ/2</small></a>
          </div>
        </div>
      </section>
    </main>
  )
}
