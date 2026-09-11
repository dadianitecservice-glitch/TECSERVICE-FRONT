import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { ServicesSection } from './sections/ServicesSection'
import { TicketLookup } from './sections/TicketLookup'
import { ShopSection } from './sections/ShopSection'
import { ReviewsSection } from './sections/ReviewsSection'
import { BlogSection } from './sections/BlogSection'
import { ContactSection } from './sections/AboutSection'
import { Footer } from './sections/Footer'
import LaptopRepairPage from './pages/LaptopRepairPage'
import { isLaptopRepairPath, laptopRepairPath } from './utils/routes'

export default function App({ pathname = '/' }: { pathname?: string }) {
  if (isLaptopRepairPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={laptopRepairPath} />
        <LaptopRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

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
