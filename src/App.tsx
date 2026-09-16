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
import ComputerRepairPage from './pages/ComputerRepairPage'
import DataRecoveryPage from './pages/DataRecoveryPage'
import ConsoleRepairPage from './pages/ConsoleRepairPage'
import DroneRepairPage from './pages/DroneRepairPage'
import MobileTabletRepairPage from './pages/MobileTabletRepairPage'
import OtherElectronicsRepairPage from './pages/OtherElectronicsRepairPage'
import NotFoundPage from './pages/NotFoundPage'
import {
  computerRepairPath,
  consoleRepairPath,
  dataRecoveryPath,
  droneRepairPath,
  isComputerRepairPath,
  isConsoleRepairPath,
  isDataRecoveryPath,
  isDroneRepairPath,
  isLaptopRepairPath,
  isMobileTabletRepairPath,
  isOtherElectronicsPath,
  isHomePath,
  laptopRepairPath,
  mobileTabletRepairPath,
  otherElectronicsPath,
} from './utils/routes'

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

  if (isComputerRepairPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={computerRepairPath} />
        <ComputerRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (isDataRecoveryPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={dataRecoveryPath} />
        <DataRecoveryPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (isConsoleRepairPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={consoleRepairPath} />
        <ConsoleRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (isDroneRepairPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={droneRepairPath} />
        <DroneRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (isMobileTabletRepairPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={mobileTabletRepairPath} />
        <MobileTabletRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (isOtherElectronicsPath(pathname)) {
    return (
      <>
        <Header homePath="/" activeServicePath={otherElectronicsPath} />
        <OtherElectronicsRepairPage />
        <Footer homePath="/" />
      </>
    )
  }

  if (!isHomePath(pathname)) {
    return (
      <>
        <Header homePath="/" />
        <NotFoundPage />
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
