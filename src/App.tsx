import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { ServicesSection } from './sections/ServicesSection'
import { TicketLookup } from './sections/TicketLookup'
import { ShopSection } from './sections/ShopSection'
import { ReviewsSection } from './sections/ReviewsSection'
import { BlogSection } from './sections/BlogSection'
import { ContactSection } from './sections/AboutSection'
import { Footer } from './sections/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServicesSection />
        <TicketLookup />
        <ShopSection />
        <ReviewsSection />
        <BlogSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
