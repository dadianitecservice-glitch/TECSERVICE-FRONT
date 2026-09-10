import { ServiceCard } from '../components/ServiceCard'
import { SectionHeader } from '../components/SectionHeader'
import { services } from '../data/services'
import { toGeorgianMtavruli } from '../utils/text'
import { useResponsiveHome } from '../hooks/useResponsiveHome'

export function ServicesSection() {
  const responsive = useResponsiveHome()
  return (
    <section className="services-section" id="services" aria-labelledby="services-title">
      <SectionHeader
        headingId="services-title"
        title={toGeorgianMtavruli('ჩვენი სერვისები')}
        description="პროფესიონალური დიაგნოსტიკა და შეკეთება სხვადასხვა ტიპის ტექნიკისთვის."
      />
      <div className="services-grid" aria-labelledby="services-title" tabIndex={responsive ? 0 : undefined} role={responsive ? 'region' : undefined} onKeyDown={event => {
        if (responsive && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
          event.preventDefault()
          event.currentTarget.scrollBy({
            left: event.key === 'ArrowRight' ? 312 : -312,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          })
        }
      }}>
        {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      </div>
    </section>
  )
}
