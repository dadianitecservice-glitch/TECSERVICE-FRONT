import { Hero } from '../sections/Hero'
import { ServicesSection } from '../sections/ServicesSection'
import { TicketLookup } from '../sections/TicketLookup'
import { ShopSection } from '../sections/ShopSection'
import { ReviewsSection } from '../sections/ReviewsSection'
import { BlogSection } from '../sections/BlogSection'
import { ContactSection } from '../sections/AboutSection'

export default function HomePage() {
  return <main>
    <Hero />
    <ServicesSection />
    <TicketLookup />
    <ShopSection />
    <ReviewsSection />
    <BlogSection />
    <ContactSection />
  </main>
}
