import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ProblemSelector, useCompactProblemLayout } from '../components/ProblemSelector'
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
  const l10n = useTranslation()
  return <a className={className} href={l10n.href(href ?? dataRecoveryRequestUrl(subject))} target="_blank" rel="noreferrer">{l10n.t(children)}</a>
}

export default function DataRecoveryPage() {
  const l10n = useTranslation()
  const [selectedProblem, setSelectedProblem] = useState('hdd-clicking')
  const [priceCategory, setPriceCategory] = useState<DataRecoveryPriceCategory>('all')
  const [serviceCode, setServiceCode] = useState('')
  const [ticketState, setTicketState] = useState<'default' | 'loading' | 'found' | 'not-found' | 'error'>('default')
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null)
  const compactProblems = useCompactProblemLayout()
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


  return (
    <main className="laptop-page data-recovery-page" id="data-recovery-page">
      <section className="lp-hero" aria-labelledby="data-recovery-title">
        <div className="site-container lp-hero__grid">
          <div className="lp-hero__copy">
            <nav className="lp-breadcrumb" aria-label={l10n.t("გვერდის მდებარეობა")}>
              <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a><span aria-hidden="true">/</span><a href={l10n.href("/#services")}>{l10n.t("სერვისები")}</a><span aria-hidden="true">/</span><span aria-current="page">{l10n.t("ინფორმაციის აღდგენა")}</span>
            </nav>
            <h1 id="data-recovery-title">{l10n.locale === 'en' ? 'Laboratory data' : l10n.t(display('ინფორმაციის'))} <span>{l10n.locale === 'en' ? 'recovery' : l10n.t(display('ლაბორატორიული აღდგენა'))}</span></h1>
            <span className="lp-title-accent" aria-hidden="true" />
            <p className="lp-hero__description">{l10n.t("HDD, SSD, RAID, NAS, USB და SD მატარებლებიდან მონაცემების უსაფრთხო აღდგენა PC‑3000 და Data Extractor ლაბორატორიული სისტემებით.")}</p>
            <div className="lp-hero__actions">
              <RequestLink className="lp-button lp-button--primary">{l10n.t(display('აღდგენის მოთხოვნა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("#data-recovery-contact")}><LaptopIcon name="phone" />{l10n.t(display('დაგვიკავშირდით'))}</a>
            </div>
            <div className="lp-hero__facts dr-hero-facts">
              <span><LaptopIcon name="chip" /><span>PC‑3000 +<br />Data Extractor</span></span>
              <span><LaptopIcon name="hardDrive" /><span>{l10n.t("6 ტიპის მატარებელი")}<br />{l10n.t("HDD, SSD, RAID, NAS, USB და SD")}</span></span>
              <span><LaptopIcon name="calendar" /><span>{l10n.t("15 წლიანი")}<br />{l10n.t("გამოცდილება")}</span></span>
              <span><LaptopIcon name="lock" /><span>{l10n.t("კონფიდენციალური")}<br />{l10n.t("პროცესი")}</span></span>
            </div>
          </div>
          <div className="lp-hero__visual">
            <figure className="lp-hero__photo"><img src="/assets/data-recovery/hero-hdd-opening.webp" alt={l10n.t("სუფთა ლაბორატორიულ გარემოში ხელთათმანებით მყარი დისკის პროფესიონალური გახსნა")} width="1280" height="720" fetchPriority="high" decoding="async" /><figcaption><span />{l10n.t("HDD ლაბორატორიული გახსნა")}</figcaption></figure>
            <div className="lp-hero__details">
              <figure className="lp-hero__detail lp-hero__detail--usb"><img src="/assets/data-recovery/problem-usb-sd.webp" alt={l10n.t("USB ფლეშკისა და microSD მეხსიერების მიკროსკოპით დიაგნოსტიკა")} width="960" height="720" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="usb" />{l10n.t("USB / SD აღდგენა")}</figcaption></figure>
              <figure className="lp-hero__detail lp-hero__detail--upgrade"><img src="/assets/data-recovery/hero-ssd-lab.webp" alt={l10n.t("SSD და NVMe მეხსიერების ჩიპების ლაბორატორიული დიაგნოსტიკა")} width="1280" height="960" loading="lazy" decoding="async" /><figcaption><LaptopIcon name="memory" />SSD / NVMe</figcaption></figure>
            </div>
          </div>
        </div>
        <nav className="site-container lp-section-nav dr-section-nav" aria-label={l10n.t("ინფორმაციის აღდგენის სექციები")}>
          {l10n.t(sectionLinks.map(item => <a key={item.id} href={l10n.href(`#${item.id}`)}><LaptopIcon name={item.icon} />{l10n.t(display(item.label))}</a>))}
        </nav>
      </section>

      <section className="lp-section lp-problems" id="data-recovery-problems" aria-labelledby="data-recovery-problems-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-problems-title">{l10n.t(display('რა დაემართა თქვენს მონაცემებს?'))}</h2><p>{l10n.t("აირჩიეთ სიმპტომი. დაზიანებული მატარებლის განმეორებით ჩართვამ შეიძლება აღდგენის შანსი შეამციროს.")}</p></div>
          <div className="lp-problems__grid">
            <div className="lp-problems__sidebar">
              <ProblemSelector problems={dataRecoveryProblems} selectedProblem={selectedProblem} onSelect={setSelectedProblem} compact={compactProblems} label="მონაცემთა მატარებლის პრობლემები" tabIdPrefix="data-recovery-problem-tab" panelIdPrefix="data-recovery-problem-panel" defaultProblemId="hdd-clicking" />
              <p className="lp-safety-note"><LaptopIcon name="info" /><span>{l10n.t("არ ჩართოთ, არ დააფორმატოთ და არ გაუშვათ CHKDSK ან სხვა „Repair“ პროგრამა.")}</span></p>
            </div>
            {l10n.t(dataRecoveryProblems.map(problem => {
              const isSelected = selectedProblem === problem.id
              const panelId = problem.id === 'hdd-clicking' ? 'data-recovery-problem-panel' : `data-recovery-problem-panel-${problem.id}`
              return (
                <div key={problem.id} className="lp-problem-panel" id={panelId} role={compactProblems ? 'region' : 'tabpanel'} aria-labelledby={compactProblems ? `${panelId}-title` : `data-recovery-problem-tab-${problem.id}`} aria-hidden={!isSelected} hidden={!isSelected} tabIndex={isSelected ? 0 : -1}>
                  <div className="lp-problem-panel__main">
                    <div className="lp-problem-panel__copy">
                      <span className="lp-eyebrow">{l10n.t(problem.eyebrow)}</span>
                      <h3 id={`${panelId}-title`}>{l10n.t(display(problem.title))}</h3>
                      <p>{l10n.t(problem.description)}</p>
                      <ul className="lp-check-list">{l10n.t(problem.checks.map(check => <li key={check}><span><LaptopIcon name="check" /></span>{l10n.t(check)}</li>))}</ul>
                      <div className="lp-problem-service"><h4>{l10n.t("ლაბორატორიული პროცესი")}</h4><p>{l10n.t(problem.service)}</p></div>
                      <RequestLink className="lp-text-link lp-whatsapp-link" href={l10n.href(dataRecoveryProblemRequestUrl(problem))}><LaptopIcon name="whatsapp" /><span>{l10n.t("მოგვწერეთ მატარებლის მოდელი და სიმპტომი")}</span><LaptopIcon name="arrow" /></RequestLink>
                    </div>
                    <div className={`lp-problem-panel__photo dr-problem-photo--${problem.id}`}><img src={problem.photo.src} alt={l10n.t(problem.photo.alt)} width={problem.photo.width} height={problem.photo.height} loading="lazy" decoding="async" /></div>
                  </div>
                  <p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("არ ხართ დარწმუნებული? სერვისში შემოწმება პრობლემის მიზეზის გარკვევაში დაგეხმარებათ.")}</p>
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-process" id="data-recovery-process" aria-labelledby="data-recovery-process-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-process-title">{l10n.t(display('მატარებლის გზა ლაბორატორიაში'))}</h2></div>
          <ol className="lp-process-steps">{l10n.t(dataRecoverySteps.map((step, index) => <li key={step.title}><span className="lp-process-number">{l10n.t(index + 1)}</span><h3>{l10n.t(display(step.title))}</h3><p>{l10n.t(step.description)}</p></li>))}</ol>
          <div className="lp-ticket-lookup" id="data-recovery-status">
            <div className="lp-status-strip"><div><LaptopIcon name="barcode" /><label htmlFor="data-recovery-service-code">{l10n.t("უკვე ჩაბარებული გაქვთ მატარებელი?")}</label></div><form onSubmit={submitServiceCode} noValidate aria-busy={ticketState === 'loading'}><input ref={serviceCodeInput} id="data-recovery-service-code" name="service-code" type="text" placeholder={l10n.t("სერვისის კოდი")} required maxLength={64} autoComplete="off" aria-label={l10n.t("სერვისის კოდი")} aria-invalid={ticketState === 'error'} aria-describedby={ticketState === 'error' || ticketState === 'not-found' ? 'data-recovery-service-code-message' : undefined} value={serviceCode} onChange={event => { cancelTicketLookup(); setServiceCode(event.target.value); setFoundTicket(null); setTicketState('default') }} /><button className="lp-button lp-button--primary lp-button--small" type="submit" disabled={ticketState === 'loading'} aria-controls="data-recovery-ticket-result" aria-expanded={ticketState === 'found'}>{l10n.t(ticketState === 'loading' ? 'იძებნება...' : 'სტატუსის ნახვა')}<LaptopIcon name={ticketState === 'loading' ? 'search' : 'arrow'} /></button></form></div>
            {l10n.t(ticketState === 'error' && <p className="lp-ticket-message lp-ticket-message--error" id="data-recovery-service-code-message" role="alert">{l10n.t("შეიყვანეთ სერვისის კოდი.")}</p>)}
            {l10n.t(ticketState === 'not-found' && <p className="lp-ticket-message" id="data-recovery-service-code-message" role="status">{l10n.t("სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.")}</p>)}
            {l10n.t(ticketState === 'found' && foundTicket && <div ref={ticketResultRef} className="lp-ticket-result" id="data-recovery-ticket-result" role="region" aria-label={l10n.t("მოძებნილი სერვისის სტატუსი")} tabIndex={-1}><TicketResult ticket={foundTicket} /></div>)}
          </div>
          <p className="dr-status-helper">{l10n.t("შედეგი გამოჩნდება მხოლოდ სერვისის კოდის მოძებნის შემდეგ.")}</p>
        </div>
      </section>

      <section className="lp-section lp-pricing" id="data-recovery-prices" aria-labelledby="data-recovery-prices-title">
        <div className="site-container">
          <div className="lp-section-heading lp-section-heading--split"><h2 id="data-recovery-prices-title">{l10n.t(display('ლაბორატორიული შეფასება და ფასები'))}</h2><div className="lp-price-filters" role="group" aria-label={l10n.t("აღდგენის მომსახურების ტიპი")}>{l10n.t(dataRecoveryPriceFilters.map(filter => <button key={filter.id} type="button" aria-pressed={priceCategory === filter.id} onClick={() => setPriceCategory(filter.id)}>{l10n.t(display(filter.label))}</button>))}</div></div>
          <p className="lp-info-note lp-price-disclaimer" id="data-recovery-price-disclaimer"><LaptopIcon name="info" /><span>{l10n.t(dataRecoveryPriceDisclaimer)}</span></p>
          <div className="lp-price-table" role="table" aria-label={l10n.t("ინფორმაციის აღდგენის ფასები")} aria-describedby="data-recovery-price-disclaimer">
            <div className="lp-price-table__head" role="row"><span role="columnheader">{l10n.t("მომსახურება")}</span><span role="columnheader">{l10n.t("ფასი")}</span><span role="columnheader">{l10n.t("სავარაუდო ვადა")}</span></div>
            <div className="lp-price-table__rows" role="rowgroup">{l10n.t(visiblePrices.map(price => <div className="lp-price-entry" key={price.id}><div role="row" className="lp-price-row"><div role="cell" className="lp-price-name">{l10n.t(price.name)}</div><span role="cell" data-label={l10n.t("ფასი")}><strong className="lp-price-amount">{l10n.t(price.price)}</strong></span><span role="cell" data-label={l10n.t("სავარაუდო ვადა")}>{l10n.t(price.duration)}</span></div></div>))}</div>
          </div>
          <div className="lp-price-footer"><p className="lp-info-note"><LaptopIcon name="info" />{l10n.t("აღდგენის საბოლოო შესაძლებლობა, ფასი და ვადა დგინდება დიაგნოსტიკისა და პირველადი კითხვის შემდეგ. დონორი ნაწილის ღირებულება, თუ საჭიროა, ცალკე თანხმდება.")}</p><RequestLink className="lp-button lp-button--outline lp-button--small" subject="ინფორმაციის აღდგენის ღირებულების დაზუსტება">{l10n.t("ღირებულების დაზუსტება")}<LaptopIcon name="arrow" /></RequestLink></div>
        </div>
      </section>

      <section className="lp-section lp-faq" id="data-recovery-faq" aria-labelledby="data-recovery-faq-title">
        <div className="site-container">
          <div className="lp-section-heading"><h2 id="data-recovery-faq-title">{l10n.t(display('ხშირად დასმული კითხვები'))}</h2><p>{l10n.t("მნიშვნელოვანი პასუხები აღდგენის შანსზე, ვადაზე, დონორ ნაწილსა და მონაცემების დაცვაზე.")}</p></div>
          <div className="lp-faq__list">{l10n.t(dataRecoveryFaqs.map((item, index) => <details key={item.question} open={index === 0 ? true : undefined}><summary><span className="lp-faq__number" aria-hidden="true">{l10n.t(String(index + 1).padStart(2, '0'))}</span><span className="lp-faq__question">{l10n.t(item.question)}</span><LaptopIcon name="chevron" /></summary><div className="lp-faq__answer"><p>{l10n.t(item.answer)}</p></div></details>))}</div>
        </div>
      </section>

      <section className="dr-contact" id="data-recovery-contact" aria-labelledby="data-recovery-contact-title">
        <div className="site-container dr-contact__card">
          <div className="dr-contact__copy">
            <span className="lp-eyebrow">{l10n.t("15 წლიანი ლაბორატორიული გამოცდილება")}</span>
            <h2 id="data-recovery-contact-title">{l10n.t(display('მონაცემები მნიშვნელოვანია? ჯერ ნუ ჩართავთ მოწყობილობას'))}</h2>
            <p>{l10n.t("მოგვწერეთ მატარებლის მოდელი, მოცულობა, დაზიანების ისტორია და რომელი ფაილებია პრიორიტეტული. უსაფრთხო აღდგენა სწორი პირველი ნაბიჯით იწყება.")}</p>
            <div className="dr-contact__actions">
              <RequestLink className="lp-button lp-button--primary"><LaptopIcon name="whatsapp" />{l10n.t(display('WhatsApp-ში მოწერა'))}<LaptopIcon name="arrow" /></RequestLink>
              <a className="lp-button lp-button--secondary" href={l10n.href("tel:+995591474040")}><LaptopIcon name="phone" />{l10n.t(display('დაგვიკავშირდით'))}</a>
            </div>
            <div className="dr-contact__details">
              <a href={l10n.href("tel:+995591474040")}><span><LaptopIcon name="phone" /></span><small>{l10n.t("ტელეფონი")}</small><strong>+995 591 47 40 40</strong></a>
              <a href={l10n.href(mapUrl)} target="_blank" rel="noreferrer"><span><img src="/assets/icons/pin.svg" alt="" /></span><small>{l10n.t("მისამართი")}</small><strong>{l10n.t("თბილისი, ცოტნე დადიანის 7ბ/2")}</strong></a>
              <div><span><LaptopIcon name="calendar" /></span><small>{l10n.t("სამუშაო საათები")}</small><strong>{l10n.t("ორშ–პარ · 10:00–19:00; შაბ · 11:00–18:00")}</strong></div>
            </div>
          </div>
          <div className="dr-contact__map">
            <iframe src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed" title={l10n.t("TECSERVICE-ის მდებარეობა Google Maps-ზე")} width="740" height="418" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            <a href={l10n.href(mapUrl)} target="_blank" rel="noreferrer"><strong>TECSERVICE</strong><small>{l10n.t("თბილისი, ცოტნე დადიანის 7ბ/2")}</small></a>
          </div>
        </div>
      </section>
    </main>
  )
}
