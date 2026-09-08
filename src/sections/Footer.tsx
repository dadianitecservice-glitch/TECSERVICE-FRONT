const footerNavigation = [
  { label: 'სერვისები', href: '#services' },
  { label: 'კაბინეტი', href: '#ticket' },
  { label: 'ბლოგი', href: '#blog' },
  { label: 'SHOP', href: 'https://shop.tecservice.ge', external: true },
  { label: 'ჩვენს შესახებ', href: '#about' },
  { label: 'კონტაქტი', href: '#contact' },
] as const

const serviceNavigation = [
  'ლეპტოპები',
  'კომპიუტერები',
  'ინფორმაციის აღდგენა',
  'კონსოლები',
  'დრონები',
] as const

const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: '/assets/icons/facebook.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: '/assets/icons/instagram.svg' },
  { label: 'TikTok', href: 'https://www.tiktok.com/', icon: '/assets/icons/tiktok.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: '/assets/icons/youtube.svg' },
] as const

export function Footer() {
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
            <h2>ნავიგაცია</h2>
            <ul>
              {footerNavigation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
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
            <h2>სერვისები</h2>
            <ul>
              {serviceNavigation.map((service) => (
                <li key={service}>
                  <a href="#services">{service}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="site-footer__social">
          <h2>გამოგვყევით</h2>
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
          <a href="/terms">მომსახურების პირობები</a>
          <a href="/privacy">კონფიდენციალურობის პოლიტიკა</a>
        </nav>
      </div>
    </footer>
  )
}
