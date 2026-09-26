import { LaptopIcon } from '../components/LaptopIcon'
import { aboutPageCopy } from '../data/aboutPage'
import { services } from '../data/services'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import '../styles/about-page.css'

export default function AboutPage() {
  const l10n = useTranslation()
  const copy = aboutPageCopy[l10n.locale]
  const serviceSummaries: Readonly<Record<string, string>> = copy.serviceSummaries
  const heading = (text: string) => l10n.locale === 'ka' ? toGeorgianMtavruli(text) : text

  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="site-container">
          <nav className="about-breadcrumb" aria-label={l10n.t('ნავიგაციის გზა')}>
            <a href={l10n.href('/')}>{l10n.t('მთავარი')}</a>
            <span aria-hidden="true">/</span><span aria-current="page">{copy.title}</span>
          </nav>
          <div className="about-hero__grid">
            <div className="about-hero__copy">
              <p className="about-eyebrow">{copy.eyebrow}</p>
              <h1 id="about-title">{heading(copy.title)}</h1>
              <p className="about-hero__lead">{copy.lead}</p>
              {copy.intro.map(paragraph => <p className="about-hero__intro" key={paragraph}>{paragraph}</p>)}
              <div className="about-hero__actions hero__actions">
                <a className="button button--primary" href="#about-services">{heading(copy.explore)}<img src="/assets/icons/arrow-right-white.svg" alt="" /></a>
                <a className="button button--secondary" href={l10n.href('/contact/')}><img src="/assets/icons/contact-red.svg" alt="" />{heading(copy.contact)}</a>
              </div>
            </div>
            <div className="about-hero__visual"><figure className="about-hero__photo">
              <img src="/assets/about/multi-device-repair.webp" alt={copy.photoAlt} width="1440" height="960" fetchPriority="high" decoding="async" />
              <figcaption><span className="about-hero__photo-brand">TECSERVICE</span><span>{copy.photoCaption}</span></figcaption>
            </figure></div>
          </div>
          <dl className="about-facts">
            {copy.facts.map(fact => <div key={fact.value}>
              <dt><span className="about-fact-icon"><LaptopIcon name={fact.icon} /></span>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>)}
          </dl>
        </div>
      </section>

      <section className="about-section site-container about-approach" aria-labelledby="about-approach-title">
        <div className="about-approach__story">
          <p className="about-eyebrow">{copy.approachLabel}</p>
          <h2 id="about-approach-title">{heading(copy.approachTitle)}</h2>
          {copy.story.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="about-principles">
          {copy.principles.map((principle, index) => <article key={principle.title}>
            <span className="about-icon"><LaptopIcon name={(['search', 'check', 'lock'] as const)[index]} /></span>
            <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
          </article>)}
        </div>
      </section>

      <section className="about-services" id="about-services" aria-labelledby="about-services-title">
        <div className="site-container about-section">
          <div className="about-section__heading">
            <div><p className="about-eyebrow">{copy.servicesLabel}</p><h2 id="about-services-title">{heading(copy.servicesTitle)}</h2></div>
            <p>{copy.servicesLead}</p>
          </div>
          <div className="about-services__grid">
            {services.map(service => <a className="about-service" href={l10n.href(service.href)} key={service.id} aria-labelledby={`about-service-${service.id}`}>
              <img src={service.icon} alt="" width="28" height="28" />
              <div><h3 id={`about-service-${service.id}`}>{l10n.t(service.title)}</h3><p>{serviceSummaries[service.id]}</p></div>
              <LaptopIcon name="arrow" />
            </a>)}
            <a className="about-service about-service--contact" href={l10n.href('/contact/')} aria-labelledby="about-service-contact">
              <LaptopIcon name="people" />
              <div><h3 id="about-service-contact">{copy.otherTitle}</h3><p>{copy.otherText}</p></div>
              <LaptopIcon name="arrow" />
            </a>
          </div>
        </div>
      </section>

      <section className="about-process" aria-labelledby="about-process-title">
        <div className="site-container about-section">
          <div className="about-process__heading"><h2 id="about-process-title">{heading(copy.processTitle)}</h2></div>
          <ol className="about-process__steps" role="list">
            {copy.steps.map((step, index) => <li key={step.title}>
              <span className="about-process__number" aria-hidden="true">{index + 1}</span>
              <h3>{heading(step.title)}</h3><p>{step.text}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="site-container about-section" aria-labelledby="about-visit-title">
        <div className="about-visit">
          <a className="about-visit__map" href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noopener noreferrer" aria-label={copy.mapLinkLabel}>
            <span className="about-visit__map-heading"><img src="/assets/icons/pin.svg" alt="" width="20" height="20" /><span>{copy.mapLabel}</span><span className="about-visit__map-brand">TECSERVICE</span></span>
            <img className="about-visit__map-image" src="/assets/map/tecservice-map.jpg" alt={copy.mapAlt} width="740" height="418" loading="lazy" decoding="async" />
            <span className="about-visit__map-action">{copy.mapAction}<LaptopIcon name="arrow" /></span>
          </a>
          <div className="about-visit__copy">
            <p className="about-eyebrow">{copy.visitLabel}</p><h2 id="about-visit-title">{heading(copy.visitTitle)}</h2>
            <p>{copy.visitText}</p>
            <address><img src="/assets/icons/pin.svg" alt="" width="20" height="20" />{copy.address}</address>
            <p className="about-visit__hours"><LaptopIcon name="calendar" />{copy.hours}</p>
            <div className="about-actions">
              <a className="about-button" href={l10n.href('/contact/')}>{copy.directions}<LaptopIcon name="arrow" /></a>
              <a className="about-text-link" href="tel:+995591474040"><LaptopIcon name="phone" />{copy.call}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
