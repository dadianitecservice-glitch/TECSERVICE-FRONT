import { toGeorgianMtavruli } from '../utils/text'

const footerNavigation = [
  { label: 'სერვისები', href: '#services' },
  { label: 'კაბინეტი', href: '#ticket' },
  { label: 'ბლოგი', href: '#blog' },
  { label: 'მაღაზია', href: 'https://shop.tecservice.ge', external: true },
  { label: 'კონტაქტი', href: '#contact' },
] as const

const serviceNavigation = [
  { label: 'ლეპტოპები', href: '/services/laptop-repair/' },
  { label: 'კომპიუტერები', href: '/services/computer-repair/' },
  { label: 'ინფორმაციის აღდგენა', href: '/services/data-recovery/' },
  { label: 'კონსოლები', href: '/services/console-repair/' },
  { label: 'დრონები', href: '/services/drone-repair/' },
  { label: 'მობილურები / პლანშეტები', href: '/services/mobile-tablet-repair/' },
  { label: 'სხვა ელექტრონიკა', href: '/services/other-electronics/' },
] as const

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/tecservice.ge/', icon: '/assets/icons/facebook.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com/tecservice__/', icon: '/assets/icons/instagram.svg' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@tec__service', icon: '/assets/icons/tiktok.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/@techservicege', icon: '/assets/icons/youtube.svg' },
] as const

export function Footer({ homePath = '' }: { homePath?: string }) {
  const links = footerNavigation
  const label = toGeorgianMtavruli
  const resolveHref = (href: string) => href.startsWith('#') ? `${homePath}${href}` : href
  return (
    <footer className="site-footer" data-figma-node="259:242">
      <div className="site-footer__main site-container">
        <div className="site-footer__brand">
          <a className="site-footer__logo" href="/" aria-label="TECSERVICE — მთავარი გვერდი">
            <img src="/assets/brand/tecservice-logo-footer.svg" alt="TECSERVICE" />
          </a>
          <p>თქვენი ტექნიკის სერვისი 2002 წლიდან</p>
        </div>

        <nav className="site-footer__navigation" aria-label="ქვედა ნავიგაცია">
          <div className="site-footer__column">
            <h2>{label('ნავიგაცია')}</h2>
            <ul>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={resolveHref(link.href)}
                    target={'external' in link && link.external ? '_blank' : undefined}
                    rel={'external' in link && link.external ? 'noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__column site-footer__column--services">
            <h2>{label('სერვისები')}</h2>
            <ul>
              {serviceNavigation.map((service) => (
                <li key={service.href}>
                  <a href={service.href}>{service.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="site-footer__social">
          <h2>{label('გამოგვყევით')}</h2>
          <p>სიახლეები და პრაქტიკული რჩევები</p>
          <ul className="site-footer__social-list">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  <img src={social.icon} alt="" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="site-footer__divider site-container" />

      <div className="site-footer__bottom site-container">
        <p>© 2026 TECSERVICE. ყველა უფლება დაცულია.</p>
        <nav className="site-footer__legal" aria-label="სამართლებრივი ინფორმაცია">
          <span>მომსახურების პირობები</span>
          <span>კონფიდენციალურობის პოლიტიკა</span>
        </nav>
      </div>
    </footer>
  )
}
