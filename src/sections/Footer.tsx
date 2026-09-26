import { toGeorgianMtavruli } from '../utils/text'
import { useTranslation } from '../i18n/LocaleProvider'

const footerNavigation = [
  { label: 'სერვისები', href: '#services' },
  { label: 'კაბინეტი', href: '/account/' },
  { label: 'ბლოგი', href: '/blog/' },
  { label: 'ჩვენს შესახებ', href: '/about/' },
  { label: 'მაღაზია', href: 'https://shop.tecservice.ge', external: true },
  { label: 'კონტაქტი', href: '/contact/' },
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
  const l10n = useTranslation()
  const links = footerNavigation
  const label = (value: string) => l10n.t(toGeorgianMtavruli(value))
  const resolveHref = (href: string) => l10n.href(href.startsWith('#') ? `${homePath}${href}` : href)
  return (
    <footer className="site-footer" data-figma-node="259:242">
      <div className="site-footer__main site-container">
        <div className="site-footer__brand">
          <a className="site-footer__logo" href={l10n.href('/')} aria-label={l10n.t('TECSERVICE — მთავარი გვერდი')}>
            <img src="/assets/brand/tecservice-logo-footer.svg" alt="TECSERVICE" width="211" height="44" loading="lazy" decoding="async" />
          </a>
          <p>{l10n.t('თქვენი ტექნიკის სერვისი 2002 წლიდან')}</p>
        </div>

        <nav className="site-footer__navigation" aria-label={l10n.t('ქვედა ნავიგაცია')}>
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
                    {l10n.t(link.label)}
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
                  <a href={l10n.href(service.href)}>{l10n.t(service.label)}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="site-footer__social">
          <h2>{label('გამოგვყევით')}</h2>
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
        <p>{l10n.t('© 2026 TECSERVICE. ყველა უფლება დაცულია.')}</p>
        <nav className="site-footer__legal" aria-label={l10n.t('სამართლებრივი ინფორმაცია')}>
          <a href={l10n.href('/terms/')}>{l10n.t('მომსახურების პირობები')}</a>
          <a href={l10n.href('/privacy/')}>{l10n.t('კონფიდენციალურობის პოლიტიკა')}</a>
        </nav>
      </div>
    </footer>
  )
}
