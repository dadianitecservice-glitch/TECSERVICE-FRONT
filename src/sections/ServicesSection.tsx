import { ServiceCard } from '../components/ServiceCard'
import { SectionHeader } from '../components/SectionHeader'
import { services } from '../data/services'

export function ServicesSection() {
  return (
    <section className="services-section" id="services" aria-labelledby="services-title">
      <SectionHeader
        headingId="services-title"
        title="ჩვენი სერვისები"
        description="პროფესიონალური დიაგნოსტიკა და შეკეთება სხვადასხვა ტიპის ტექნიკისთვის."
      />
      <div className="services-grid" aria-labelledby="services-title">
        {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      </div>
    </section>
  )
}
