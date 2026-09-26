import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { AddressCopyButton, BusinessHoursStatus } from '../components/ContactDetailsEnhancements'
import { TicketLookup } from '../sections/TicketLookup'
import { toGeorgianMtavruli } from '../utils/text'

const phoneDisplay = '+995 591 47 40 40'
const phoneHref = 'tel:+995591474040'
const whatsappHref = 'https://wa.me/995591474040?text=' + encodeURIComponent('გამარჯობა, მინდა ტექნიკის შეკეთებაზე კონსულტაცია.')
const mapsHref = 'https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7'
const serviceAddress = 'თბილისი, ცოტნე დადიანის 7ბ/2'

export default function ContactPage() {
  const l10n = useTranslation()
  const display = toGeorgianMtavruli
  const [statusOpen, setStatusOpen] = useState(false)
  const statusTriggerRef = useRef<HTMLButtonElement>(null)
  const hoursRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const focusHours = () => {
      if (window.location.hash === '#working-hours') hoursRef.current?.focus({ preventScroll: true })
    }
    focusHours()
    window.addEventListener('hashchange', focusHours)
    return () => window.removeEventListener('hashchange', focusHours)
  }, [])

  return (
    <main className="contact-page">
      <div className="contact-page__container">
        <nav className="contact-page__breadcrumb" aria-label={l10n.t("ნავიგაციის გზა")}>
          <a href={l10n.href("/")}>{l10n.t("მთავარი")}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{l10n.t("კონტაქტი")}</span>
        </nav>

        <header className="contact-page__intro">
          <div>
            <p className="contact-page__eyebrow">{l10n.t("თქვენი ტექნიკის სერვისი")}</p>
            <h1>{l10n.t(display('დაგვიკავშირდით'))}</h1>
          </div>
          <p className="contact-page__lead">{l10n.t("ტექნიკის შეკეთების შესახებ კონსულტაციისთვის")}<br />{l10n.t("დაგვიკავშირდით თქვენთვის მოსახერხებელი გზით.")}</p>
        </header>

        <div className="contact-page__layout">
          <section className="contact-page__details" aria-label={l10n.t("საკონტაქტო ინფორმაცია")}>
            <div className="contact-page__call">
              <div className="contact-page__label">
                <LaptopIcon name="phone" />
                <h2>{l10n.t(display('დაგვირეკეთ'))}</h2>
              </div>
              <a className="contact-page__phone" href={l10n.href(phoneHref)}>{l10n.t(phoneDisplay)}</a>
              <p>{l10n.t("კონსულტაცია და ვიზიტის დეტალები")}</p>
              <a className="contact-page__button" href={l10n.href(phoneHref)}>
                {l10n.t(display('დარეკვა'))}<LaptopIcon name="arrow" />
              </a>
            </div>

            <a className="contact-page__whatsapp" href={l10n.href(whatsappHref)} target="_blank" rel="noreferrer">
              <span className="contact-page__whatsapp-icon"><LaptopIcon name="whatsapp" /></span>
              <span>
                <span className="contact-page__whatsapp-title">{l10n.t("მოგვწერეთ WhatsApp-ში")}</span>
              </span>
              <LaptopIcon name="arrow" />
            </a>

            <section className="contact-page__hours" id="working-hours" ref={hoursRef} tabIndex={-1} aria-labelledby="contact-hours-title">
              <div className="contact-page__label">
                <img src="/assets/icons/clock.svg" alt="" width="20" height="20" />
                <h2 id="contact-hours-title">{l10n.t(display('სამუშაო საათები'))}</h2>
              </div>
              <BusinessHoursStatus />
              <dl aria-label={l10n.t("ორშ–პარ · 10:00–19:00; შაბ · 11:00–18:00")}>
                <div><dt>{l10n.t("ორშაბათი – პარასკევი")}</dt><dd>10:00–19:00</dd></div>
                <div><dt>{l10n.t("შაბათი")}</dt><dd>11:00–18:00</dd></div>
              </dl>
              <p>{l10n.t("თბილისის დროით · სტანდარტული გრაფიკი. სადღესასწაულო საათები გადაამოწმეთ დარეკვით.")}</p>
            </section>
          </section>

          <section className="contact-page__location" aria-labelledby="contact-location-title">
            <div className="contact-page__location-heading">
              <span className="contact-page__location-brand">TECSERVICE<span> / </span>{l10n.t(display('სერვის ცენტრი'))}</span>
              <span className="contact-page__city"><img src="/assets/icons/pin.svg" alt="" width="16" height="16" />{l10n.t("თბილისი")}</span>
            </div>
            <div className="contact-page__map">
              <img
                className="contact-page__map-fallback"
                src="/assets/map/tecservice-map.jpg"
                alt={l10n.t("TECSERVICE-ის მდებარეობა რუკაზე — თბილისი, ცოტნე დადიანის 7ბ/2")}
                width="740"
                height="418"
                decoding="async"
              />
              <iframe
                src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed"
                title={l10n.t("TECSERVICE-ის მდებარეობა Google Maps-ზე")}
                width="740"
                height="418"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="contact-page__address">
              <div className="contact-page__address-copy">
                <span className="contact-page__address-icon"><img src="/assets/icons/pin.svg" alt="" width="22" height="22" /></span>
                <div>
                  <p>{l10n.t("გვესტუმრეთ")}</p>
                  <h2 id="contact-location-title">{l10n.t(display('ცოტნე დადიანის 7ბ/2'))}</h2>
                  <address>{l10n.t(serviceAddress)}</address>
                  <AddressCopyButton address={serviceAddress} />
                </div>
              </div>
              <a className="contact-page__directions" href={l10n.href(mapsHref)} target="_blank" rel="noreferrer">
                {l10n.t(display('მარშრუტის ნახვა'))}<LaptopIcon name="arrow" />
              </a>
            </div>
          </section>
        </div>

        <section className="contact-page__visit" aria-labelledby="contact-visit-title">
          <div className="contact-page__visit-heading">
            <h2 id="contact-visit-title">{l10n.t(display('ვიზიტამდე სასარგებლოა'))}</h2>
            <p>{l10n.t("რამდენიმე დეტალი, რომელიც დაგვეხმარება.")}</p>
          </div>
          <div className="contact-page__visit-grid">
            <article>
              <span className="contact-page__visit-icon"><LaptopIcon name="camera" /></span>
              <div>
                <h3>{l10n.t("მოდელი და პრობლემის აღწერა")}</h3>
                <p>{l10n.t("მოგვწერეთ, რა მოწყობილობა გაქვთ, რა დაემართა და, თუ შესაძლებელია, დაურთეთ ფოტო.")}</p>
              </div>
            </article>
            <article>
              <span className="contact-page__visit-icon"><LaptopIcon name="battery" /></span>
              <div>
                <h3>{l10n.t("დამტენი და საჭირო აქსესუარები")}</h3>
                <p>{l10n.t("თუ პრობლემა კვებას ან დატენვას უკავშირდება, მოწყობილობასთან ერთად დამტენიც წამოიღეთ.")}</p>
              </div>
            </article>
            <article>
              <span className="contact-page__visit-icon"><LaptopIcon name="barcode" /></span>
              <div>
                <h3>{l10n.t("ტექნიკა უკვე ჩაბარებულია?")}</h3>
                <p>{l10n.t("მოძებნეთ თქვენი შეკვეთა სერვისის კოდით ან ტელეფონის ნომრით.")}</p>
                <button
                  className="contact-page__status-toggle"
                  ref={statusTriggerRef}
                  type="button"
                  aria-expanded={statusOpen}
                  aria-controls="contact-status-panel"
                  onClick={() => setStatusOpen(open => !open)}
                >
                  {l10n.t(statusOpen ? 'ძიების დახურვა' : 'შეამოწმეთ სტატუსი')} <LaptopIcon name={statusOpen ? 'close' : 'arrow'} />
                </button>
              </div>
            </article>
          </div>
        </section>
        <div id="contact-status-panel" className="contact-page__lookup" hidden={!statusOpen}>
          {l10n.t(statusOpen && <>
            <button
              className="contact-page__lookup-close"
              type="button"
              aria-label={l10n.t("სტატუსის ძიების დახურვა")}
              onClick={() => { setStatusOpen(false); statusTriggerRef.current?.focus({ preventScroll: true }) }}
            ><LaptopIcon name="close" /></button>
            <TicketLookup variant="embedded" id="contact-status" focusOnMount />
          </>)}
        </div>
      </div>
    </main>
  )
}
