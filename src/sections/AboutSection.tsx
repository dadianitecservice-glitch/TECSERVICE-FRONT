import { toGeorgianMtavruli } from '../utils/text'
import { useTranslation } from '../i18n/LocaleProvider'

export function ContactSection({ id = 'contact', headingId = 'contact-heading' }: { id?: string; headingId?: string } = {}) {
  const l10n = useTranslation()
  return (
    <section className="contact-section" id={id} aria-labelledby={headingId}>
      <div className="contact-copy">
        <h2 className="display-title" id={headingId}>{l10n.t(toGeorgianMtavruli('დაგვიკავშირდით'))}</h2>
        <p className="contact-description">{l10n.t('დაგვიკავშირდით, მოგვწერეთ ან გვესტუმრეთ სერვის ცენტრში.')}</p>

        <div className="contact-details">
          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/phone.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <small>{l10n.t('ტელეფონი')}</small>
              <a href="tel:+995591474040" aria-label={l10n.t('ტელეფონი: +995 591 47 40 40')}>+995 591 47 40 40</a>
            </span>
          </div>

          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/pin.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <small>{l10n.t('მისამართი')}</small>
              <a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer" aria-label={l10n.t('მისამართი: თბილისი, ცოტნე დადიანის 7ბ/2')}>{l10n.t(toGeorgianMtavruli('თბილისი, ცოტნე დადიანის 7ბ/2'))}</a>
            </span>
          </div>

          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/clock.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <small>{l10n.t('სამუშაო საათები')}</small>
              <span aria-label={l10n.t('სამუშაო საათები: ორშაბათიდან პარასკევამდე 10:00-დან 19:00-მდე; შაბათს 11:00-დან 18:00-მდე')}>{l10n.t('ორშ–პარ · 10:00–19:00; შაბ · 11:00–18:00')}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="contact-map">
        <img
          src="/assets/map/tecservice-map.jpg"
          alt={l10n.t('TECSERVICE-ის მდებარეობა რუკაზე — თბილისი, ცოტნე დადიანის 7ბ/2')}
          width="740"
          height="418"
          loading="lazy"
          decoding="async"
        />
        <iframe
          src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed"
          title={l10n.t('TECSERVICE-ის მდებარეობა Google Maps-ზე')}
          width="740"
          height="418"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          className="contact-map__label"
          href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7"
          target="_blank"
          rel="noreferrer"
          aria-label={l10n.t('TECSERVICE-ის მდებარეობის გახსნა Google Maps-ზე')}
        >
          <strong>TECSERVICE</strong>
          <small>{l10n.t(toGeorgianMtavruli('თბილისი, ცოტნე დადიანის 7ბ/2'))}</small>
        </a>
      </div>
    </section>
  )
}
