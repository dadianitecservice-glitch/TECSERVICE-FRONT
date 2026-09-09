import type { Service } from '../data/services'
import { toGeorgianMtavruli } from '../utils/text'

export function ServiceCard({ service }: { service: Service }) {
  return (
    <a className="service-card" href={service.href}>
      <div className="service-card__top">
        <span className="service-card__icon">
          <img src={service.icon} alt="" />
        </span>
        <div>
          <h3 className="display-title">{toGeorgianMtavruli(service.title)}</h3>
          <p>{service.description}</p>
        </div>
      </div>
      <span className="service-card__link">{toGeorgianMtavruli('დეტალურად')}&nbsp; →</span>
    </a>
  )
}
