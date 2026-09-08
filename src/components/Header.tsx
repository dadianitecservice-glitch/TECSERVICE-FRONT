import { useEffect, useState } from 'react'

type HeaderProps = {
  cartCount: number
  onCartOpen: () => void
}

const primaryLinks = [
  { label: 'ᲩᲕᲔᲜᲡ ᲨᲔᲡᲐᲮᲔᲑ', href: '#about' },
  { label: 'ᲑᲚᲝᲒᲘ', href: '#blog' },
  { label: 'ᲙᲝᲜᲢᲐᲥᲢᲘ', href: '#contact' },
] as const

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setScrolled] = useState(false)
  const displayedCartCount = cartCount > 99 ? '99+' : cartCount

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const openCart = () => {
    closeMenu()
    onCartOpen()
  }

  return (
    <header
      className={`site-header${isScrolled ? ' site-header--scrolled' : ''}`}
      data-figma-node="250:150"
    >
      <div className="site-header__utility" aria-label="საკონტაქტო ინფორმაცია">
        <div className="site-header__utility-grid site-container">
          <a className="site-header__utility-cell site-header__utility-cell--left" href="tel:+995591474040">
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
            <span>თბილისი, ცოტნე დადიანის 7ბ</span>
          </a>

          <div className="site-header__utility-cell site-header__utility-cell--right">
            <img className="site-header__utility-icon" src="/assets/icons/clock.svg" alt="" />
            <span>ორშ–შაბ · 10:00–19:00</span>
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
            aria-label={isMenuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
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
              <a className="site-header__nav-link site-header__nav-link--services" href="#services" onClick={closeMenu}>
                <span>ᲡᲔᲠᲕᲘᲡᲔᲑᲘ</span>
                <img src="/assets/icons/chevron-down.svg" alt="" />
              </a>

              {primaryLinks.map((link) => (
                <a className="site-header__nav-link" href={link.href} key={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              ))}

              <div className="site-header__ecommerce-group">
                <a
                  className="site-header__nav-link site-header__shop-link"
                  href="https://shop.tecservice.ge"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  SHOP
                </a>

                <button
                  className="site-header__cart-button"
                  type="button"
                  aria-label={cartCount > 0 ? `კალათა, ${cartCount} ნივთი` : 'კალათა ცარიელია'}
                  onClick={openCart}
                >
                  <img src="/assets/icons/cart-header.svg" alt="" />
                  {cartCount > 0 && (
                    <span className="site-header__cart-badge" aria-hidden="true">
                      {displayedCartCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            <a className="site-header__cabinet-action" href="#ticket" onClick={closeMenu}>
              <img src="/assets/icons/user-blue.svg" alt="" />
              <span>ᲙᲐᲑᲘᲜᲔᲢᲘ</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
