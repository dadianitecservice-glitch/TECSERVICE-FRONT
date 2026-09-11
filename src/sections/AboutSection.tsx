import { toGeorgianMtavruli } from '../utils/text'

export function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div className="contact-copy">
        <h2 className="display-title" id="contact-heading">{toGeorgianMtavruli('დაგვიკავშირდით')}</h2>
        <p className="contact-description">დაგვიკავშირდით, მოგვწერეთ ან გვესტუმრეთ სერვის ცენტრში.</p>

        <div className="contact-details">
          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/phone.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <a href="https://wa.me/995591474040" target="_blank" rel="noreferrer" aria-label="ტელეფონი: +995 591 47 40 40">+995 591 47 40 40</a>
            </span>
          </div>

          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/pin.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer" aria-label="მისამართი: თბილისი, ცოტნე დადიანის 7ბ/2">{toGeorgianMtavruli('თბილისი, ცოტნე დადიანის 7ბ/2')}</a>
            </span>
          </div>

          <div className="contact-detail">
            <span className="contact-detail__icon"><img src="/assets/icons/clock.svg" alt="" /></span>
            <span className="contact-detail__copy">
              <span aria-label="სამუშაო საათები: ორშაბათიდან პარასკევამდე 10:00-დან 19:00-მდე; შაბათს 11:00-დან 17:00-მდე">ორშ–პარ · 10:00–19:00; შაბ · 11:00–17:00</span>
            </span>
          </div>
        </div>
      </div>

      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps?q=41.7188516,44.8036156&z=17&output=embed"
          title="TECSERVICE-ის მდებარეობა Google Maps-ზე"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          className="contact-map__label"
          href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7"
          target="_blank"
          rel="noreferrer"
          aria-label="TECSERVICE-ის მდებარეობის გახსნა Google Maps-ზე"
        >
          <strong>TECSERVICE</strong>
          <small>{toGeorgianMtavruli('თბილისი, ცოტნე დადიანის 7ბ/2')}</small>
        </a>
      </div>
    </section>
  )
}
