import { useEffect, useRef, useState } from 'react'
import { services } from '../data/services'
import { toGeorgianMtavruli } from '../utils/text'

type HeaderProps = {
  isAuthenticated?: boolean
  userFirstName?: string
  homePath?: '' | '/'
  activeServicePath?: string
}

const primaryLinks = [
  { label: 'ბლოგი', href: '#blog' },
  { label: 'ჩვენს შესახებ', href: '#contact' },
  { label: 'კონტაქტი', href: '#contact' },
] as const

export function Header({ isAuthenticated = false, userFirstName, homePath = '', activeServicePath }: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isServicesOpen, setServicesOpen] = useState(false)
  const [isScrolled, setScrolled] = useState(false)
  const servicesMenuRef = useRef<HTMLDivElement>(null)
  const accountLabel = isAuthenticated
    ? userFirstName?.trim() || 'კაბინეტი'
    : 'შესვლა'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [])

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
  const shopLink = <a className="site-header__nav-link site-header__shop-link" href="https://shop.tecservice.ge" target="_blank" rel="noreferrer" onClick={closeMenu}>
    <img className="site-header__shop-icon" src="/assets/icons/shopping-bag-blue.svg" alt="" />
    <span>{toGeorgianMtavruli('მაღაზია')}</span>
  </a>
  return (
    <header
      className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}
      data-figma-node="250:150"
    >
      <div className="site-header__utility" aria-label="საკონტაქტო ინფორმაცია">
        <div className="site-header__utility-grid site-container">
          <a
            className="site-header__utility-cell site-header__utility-cell--left"
            href="https://wa.me/995591474040"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp-ში დაგვიკავშირდით ნომერზე +995 591 47 40 40"
          >
            <img className="site-header__utility-icon" src="/assets/icons/phone.svg" alt="" />
            <span>+995 591 47 40 40</span>
          </a>

          <a
            className="site-header__utility-cell site-header__utility-cell--center"
            href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7"
            target="_blank"
            rel="noreferrer"
            aria-label="TECSERVICE-ის მდებარეობის გახსნა Google Maps-ზე"
          >
            <img className="site-header__utility-icon" src="/assets/icons/pin.svg" alt="" />
            <span>თბილისი, ცოტნე დადიანის 7ბ/2</span>
          </a>

          <div className="site-header__utility-cell site-header__utility-cell--right">
            <img className="site-header__utility-icon" src="/assets/icons/clock.svg" alt="" />
            <span title="ორშ–პარ · 10:00–19:00; შაბ · 11:00–17:00">ორშ–პარ · 10:00–19:00</span>
            <div className="site-header__language-switcher" aria-label="ენის არჩევა">
              <span className="site-header__language-option site-header__language-option--active" aria-current="true">KA</span>
              <span className="site-header__language-divider" aria-hidden="true">/</span>
              <span className="site-header__language-option" aria-disabled="true">EN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="site-header__main">
        <div className="site-header__main-inner site-container">
          <a className="site-header__brand" href="/" aria-label="TECSERVICE — მთავარი გვერდი">
            <img src="/assets/brand/tecservice-logo.svg" alt="TECSERVICE" />
          </a>

          <button
            className={`site-header__menu-toggle${isMenuOpen ? ' site-header__menu-toggle--open' : ''}`}
            type="button"
            aria-label={toGeorgianMtavruli(isMenuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა')}
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
            <nav className="site-header__primary-nav" aria-label="მთავარი ნავიგაცია">
              {shopLink}

              <div
                ref={servicesMenuRef}
                className={`site-header__services-menu${isServicesOpen ? ' site-header__services-menu--open' : ''}`}
              >
                <button
                  className="site-header__nav-link site-header__nav-link--services"
                  type="button"
                  aria-expanded={isServicesOpen}
                  aria-controls="site-services-dropdown"
                  aria-current={activeServicePath ? 'true' : undefined}
                  onClick={() => setServicesOpen((current) => !current)}
                >
                  <span>{toGeorgianMtavruli('სერვისები')}</span>
                  <img src="/assets/icons/chevron-down.svg" alt="" />
                </button>

                <div className="site-header__services-dropdown" id="site-services-dropdown">
                  <div className="site-header__services-grid">
                    {services.map((service) => (
                      <a className="site-header__service-link" href={service.href} key={service.id} onClick={closeMenu} aria-current={service.href === activeServicePath ? 'page' : undefined}>
                        <span className="site-header__service-icon">
                          <img src={service.icon} alt="" />
                        </span>
                        <span>{toGeorgianMtavruli(service.title)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {primaryLinks.map((link) => (
                <a className="site-header__nav-link" href={`${homePath}${link.href}`} key={link.label} onClick={closeMenu}>
                  {toGeorgianMtavruli(link.label)}
                </a>
              ))}
            </nav>

            <a className="site-header__cabinet-action" href={`${homePath}#ticket`} onClick={closeMenu}>
              <img src="/assets/icons/user-blue.svg" alt="" />
              <span>{toGeorgianMtavruli(accountLabel)}</span>
            </a>
            <div className="site-header__mobile-utility">
              <a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer">თბილისი, ცოტნე დადიანის 7ბ/2 ↗</a>
              <span>ორშ–პარ · 10:00–19:00<br />შაბ · 11:00–17:00</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
