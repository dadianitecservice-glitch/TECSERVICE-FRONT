import { useEffect } from 'react'
import { Header } from './components/Header'
import { LocaleProvider } from './i18n/LocaleProvider'
import { Footer } from './sections/Footer'
import { CustomerAuthProvider } from './account/CustomerAuthProvider'
import AuthDialog from './account/AuthDialog'
import type { LoadedPage } from './pageLoader'

export default function App({ pathname = '/', page }: { pathname?: string; page: LoadedPage }) {
  useEffect(() => {
    if (!window.location.hash) return
    let frame = 0
    // Resolve deep links after hydration and the compact mobile layout settle.
    frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => {
        let id: string
        try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
        document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])
  return <LocaleProvider pathname={pathname}><CustomerAuthProvider>
    <Header {...page.header} />
    {page.content}
    <Footer homePath={page.header.homePath} />
    <AuthDialog />
  </CustomerAuthProvider></LocaleProvider>
}
