import { useTranslation } from '../i18n/LocaleProvider'
import type { Service } from '../data/services'
import { toGeorgianMtavruli } from '../utils/text'

export function ServiceCard({ service }: { service: Service }) {
  const l10n = useTranslation()
  return (
    <article className="service-card" id={`service-${service.id}`}>
      <div className="service-card__top">
        <span className="service-card__icon">
          <img src={service.icon} alt="" />
        </span>
        <div>
          <h3 className="display-title">{l10n.t(toGeorgianMtavruli(service.title))}</h3>
          <p>{l10n.t(service.description)}</p>
        </div>
      </div>
      <a
        className="service-card__link"
        href={l10n.href(service.href)}
        aria-label={l10n.t(`${service.title} — დეტალურად`)}
      >
        {l10n.t(toGeorgianMtavruli('დეტალურად'))}&nbsp; →
      </a>
    </article>
  )
}
