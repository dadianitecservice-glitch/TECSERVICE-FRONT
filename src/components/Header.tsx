import { useTranslation } from '../i18n/LocaleProvider'
import { localePath, type Locale } from '../i18n/locale'
import { useEffect, useRef, useState } from 'react'
import { services } from '../data/services'
import { toGeorgianMtavruli } from '../utils/text'
import { getPrimaryLinkCurrent } from '../utils/navigation'
import { useCustomerAuth } from '../account/CustomerAuthProvider'

type HeaderProps = {
  isAuthenticated?: boolean
  userFirstName?: string
  homePath?: '' | '/'
  activeServicePath?: string
  activePagePath?: string
}

const primaryLinks = [
  { label: 'ბლოგი', href: '/blog/' },
  { label: 'ჩვენს შესახებ', href: '/about/' },
  { label: 'კონტაქტი', href: '/contact/' },
] as const

export function Header({ isAuthenticated = false, userFirstName, homePath = '', activeServicePath, activePagePath }: HeaderProps) {
  const l10n = useTranslation()
  const account = useCustomerAuth()
  const languageSwitchPath = l10n.pathname === '/' ? '/' : `${l10n.pathname.replace(/\/+$/, '')}/`
  const preserveLocation = (event: React.MouseEvent<HTMLAnchorElement>, locale: Locale) => {
    event.currentTarget.href = localePath(languageSwitchPath, locale) + window.location.search + window.location.hash
  }
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isServicesOpen, setServicesOpen] = useState(false)
  const [isScrolled, setScrolled] = useState(false)
  const [currentHash, setCurrentHash] = useState('')
  const servicesMenuRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const servicesToggleRef = useRef<HTMLButtonElement>(null)
  const accountLabel = (isAuthenticated || account.user)
    ? (userFirstName?.trim() || (account.user ? (l10n.locale === 'en' ? 'My account' : 'კაბინეტი') : 'კაბინეტი'))
    : 'შესვლა'

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash)
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) menuToggleRef.current?.focus()
        else if (isServicesOpen) servicesToggleRef.current?.focus()
        setMenuOpen(false)
        setServicesOpen(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen, isServicesOpen])

  useEffect(() => {
    const closeServicesOutside = (event: PointerEvent) => {
      if (!servicesMenuRef.current?.contains(event.target as Node)) setServicesOpen(false)
    }

    document.addEventListener('pointerdown', closeServicesOutside)
    return () => document.removeEventListener('pointerdown', closeServicesOutside)
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
    setServicesOpen(false)
  }
  const normalizedActiveServicePath = activeServicePath?.replace(/\/+$/, '')
  const resolveHref = (href: string) => href.startsWith('#') ? `${homePath}${href}` : href
  const shopLink = <a className="site-header__nav-link site-header__shop-link" href={l10n.href("https://shop.tecservice.ge")} target="_blank" rel="noreferrer" onClick={closeMenu}>
    <img className="site-header__shop-icon" src="/assets/icons/shopping-bag-blue.svg" alt="" />
    <span>{l10n.t(toGeorgianMtavruli('მაღაზია'))}</span>
  </a>
  return (
    <header
      className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}
      data-figma-node="250:150"
    >
      <div className="site-header__utility" aria-label={l10n.t("საკონტაქტო ინფორმაცია")}>
        <div className="site-header__utility-grid site-container">
          <a
            className="site-header__utility-cell site-header__utility-cell--left"
            href={l10n.href("https://wa.me/995591474040")}
            target="_blank"
            rel="noreferrer"
            aria-label={l10n.t("WhatsApp-ში დაგვიკავშირდით ნომერზე +995 591 47 40 40")}
          >
            <img className="site-header__utility-icon" src="/assets/icons/phone.svg" alt="" />
            <span>+995 591 47 40 40</span>
          </a>

          <a
            className="site-header__utility-cell site-header__utility-cell--center"
            href={l10n.href("https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7")}
            target="_blank"
            rel="noreferrer"
            aria-label={l10n.t("TECSERVICE-ის მდებარეობის გახსნა Google Maps-ზე")}
          >
            <img className="site-header__utility-icon" src="/assets/icons/pin.svg" alt="" />
            <span>{l10n.t("თბილისი, ცოტნე დადიანის 7ბ/2")}</span>
          </a>

          <div className="site-header__utility-cell site-header__utility-cell--right">
            <a className="site-header__hours-link" href={l10n.href('/contact/#working-hours')} title={l10n.t("ორშ–პარ · 10:00–19:00; შაბ · 11:00–18:00")}>
              <img className="site-header__utility-icon" src="/assets/icons/clock.svg" alt="" />
              <span>{l10n.t("ორშ–პარ · 10:00–19:00")}</span>
            </a>
            <div className="site-header__language-switcher" aria-label={l10n.t("ენის არჩევა")}>
              <a className={`site-header__language-option${l10n.locale === 'ka' ? ' site-header__language-option--active' : ''}`} href={localePath(languageSwitchPath, 'ka')} hrefLang="ka" lang="ka" aria-label="ქართული" aria-current={l10n.locale === 'ka' ? 'page' : undefined} onClick={event => preserveLocation(event, 'ka')}>KA</a>
              <span className="site-header__language-divider" aria-hidden="true">/</span>
              <a className={`site-header__language-option${l10n.locale === 'en' ? ' site-header__language-option--active' : ''}`} href={localePath(languageSwitchPath, 'en')} hrefLang="en" lang="en" aria-label="English" aria-current={l10n.locale === 'en' ? 'page' : undefined} onClick={event => preserveLocation(event, 'en')}>EN</a>
            </div>
          </div>
        </div>
      </div>

      <div className="site-header__main">
        <div className="site-header__main-inner site-container">
          <a className="site-header__brand" href={l10n.href("/")} aria-label={l10n.t("TECSERVICE — მთავარი გვერდი")}>
            <img src="/assets/brand/tecservice-logo.svg" alt="TECSERVICE" width="10528" height="2198" decoding="async" />
          </a>

          <button
            ref={menuToggleRef}
            className={`site-header__menu-toggle${isMenuOpen ? ' site-header__menu-toggle--open' : ''}`}
            type="button"
            aria-label={l10n.t(toGeorgianMtavruli(isMenuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'))}
            aria-expanded={isMenuOpen}
            aria-controls="site-primary-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <div
            className={`site-header__navigation-shell${isMenuOpen ? ' site-header__navigation-shell--open' : ''}`}
            id="site-primary-navigation"
          >
            <nav className="site-header__primary-nav" aria-label={l10n.t("მთავარი ნავიგაცია")}>
              {l10n.t(shopLink)}

              <div
                ref={servicesMenuRef}
                className={`site-header__services-menu${isServicesOpen ? ' site-header__services-menu--open' : ''}`}
              >
                <button
                  ref={servicesToggleRef}
                  className="site-header__nav-link site-header__nav-link--services"
                  type="button"
                  aria-expanded={isServicesOpen}
                  aria-controls="site-services-dropdown"
                  aria-current={activeServicePath ? 'true' : undefined}
                  onClick={() => setServicesOpen((current) => !current)}
                >
                  <span>{l10n.t(toGeorgianMtavruli('სერვისები'))}</span>
                  <img src="/assets/icons/chevron-down.svg" alt="" />
                </button>

                <div className="site-header__services-dropdown" id="site-services-dropdown">
                  <div className="site-header__services-grid">
                    {l10n.t(services.map((service) => (
                      <a className="site-header__service-link" href={l10n.href(service.href)} key={service.id} onClick={closeMenu} aria-current={service.href.replace(/\/+$/, '') === normalizedActiveServicePath ? 'page' : undefined}>
                        <span className="site-header__service-icon">
                          <img src={service.icon} alt="" />
                        </span>
                        <span>{l10n.t(toGeorgianMtavruli(service.title))}</span>
                      </a>
                    )))}
                  </div>
                </div>
              </div>

              {l10n.t(primaryLinks.map((link) => (
                <a
                  className="site-header__nav-link"
                  href={l10n.href(resolveHref(link.href))}
                  key={link.label}
                  onClick={closeMenu}
                  aria-current={getPrimaryLinkCurrent(link.href, activePagePath ?? l10n.pathname, currentHash)}
                >
                  {l10n.t(toGeorgianMtavruli(link.label))}
                </a>
              )))}
            </nav>

            <a className="site-header__cabinet-action" href={l10n.href('/account/')} onClick={event => { closeMenu(); if (!account.user && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); account.openAuth('login') } }}>
              <img src="/assets/icons/user-blue.svg" alt="" />
              <span>{l10n.t(toGeorgianMtavruli(accountLabel))}</span>
            </a>
            <div className="site-header__mobile-utility">
              <a href={l10n.href("https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7")} target="_blank" rel="noreferrer">{l10n.t("თბილისი, ცოტნე დადიანის 7ბ/2 ↗")}</a>
              <a href={l10n.href('/contact/#working-hours')} onClick={closeMenu}>{l10n.t("ორშ–პარ · 10:00–19:00")}<br />{l10n.t("შაბ · 11:00–18:00")}</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
