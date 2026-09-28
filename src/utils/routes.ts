import { localeFromPath, localePath, stripLocale } from '../i18n/locale.ts'
import { translateText } from '../i18n/translate.ts'
import { legalDocuments, legalDocumentsApproved } from '../data/legalPages.ts'
import { getBlogPost, getBlogPosts } from '../data/blogPosts.ts'
import { getImageMimeType } from './imageMimeType.ts'
import {
  aboutPath, blogPath, computerRepairPath, consoleRepairPath, contactPath,
  dataRecoveryPath, droneRepairPath, laptopRepairPath, mobileTabletRepairPath,
  otherElectronicsPath, getBlogArticleSlug, getLegalPageKind, isAccountPath,
  isAboutPath, isBlogPath, isComputerRepairPath, isConsoleRepairPath,
  isContactPath, isDataRecoveryPath, isDroneRepairPath, isHomePath,
  isKnownPublicPath, isLaptopRepairPath, isMobileTabletRepairPath,
  isOtherElectronicsPath,
} from './routePaths.ts'

export * from './routePaths.ts'

export const notFoundMetadata = {
  title: 'გვერდი ვერ მოიძებნა | TECSERVICE',
  description: 'მითითებული გვერდი ვერ მოიძებნა. დაბრუნდით TECSERVICE-ის მთავარ გვერდზე ან აირჩიეთ სასურველი სერვისი.',
  robots: 'noindex, follow',
}

export function getRouteMetadata(pathname: string) {
  if (!isKnownPublicPath(pathname)) return null
  if (isAccountPath(pathname)) {
    const english = localeFromPath(pathname) === 'en'
    return {
      title: english ? 'My account | TECSERVICE' : 'პირადი კაბინეტი | TECSERVICE',
      description: english ? 'Sign in to view your own services, tickets and purchase history.' : 'შედით პირად კაბინეტში თქვენი სერვისების, ტიკეტებისა და შესყიდვების ისტორიის სანახავად.',
      canonical: `https://tecservice.ge${english ? '/en' : ''}/account/`,
      image: 'https://tecservice.ge/assets/brand/tecservice-favicon-v2.png',
      imageAlt: 'TECSERVICE', imageWidth: '256', imageHeight: '256',
      robots: 'noindex, nofollow',
    }
  }
  const articleSlug = getBlogArticleSlug(pathname)
  if (isBlogPath(pathname) || articleSlug) {
    const locale = localeFromPath(pathname)
    const article = articleSlug ? getBlogPost(articleSlug, locale) : undefined
    const preview = article ?? getBlogPosts(locale)[0]
    return {
      title: article ? `${article.title} | TECSERVICE` : locale === 'en' ? 'News and practical tips | TECSERVICE' : 'სიახლეები და პრაქტიკული რჩევები | TECSERVICE',
      description: article?.excerpt ?? (locale === 'en' ? 'Explore technology news and practical tips on device care, repair and data protection from TECSERVICE.' : 'გაეცანით ტექნოლოგიურ სიახლეებსა და პრაქტიკულ რჩევებს ტექნიკის მოვლის, შეკეთებისა და მონაცემების დაცვის შესახებ — TECSERVICE.'),
      canonical: `https://tecservice.ge${localePath(`${blogPath}${article ? `/${article.slug}` : ''}/`, locale)}`,
      image: `https://tecservice.ge${preview.image}`,
      imageAlt: preview.imageAlt,
      imageWidth: String(preview.imageWidth), imageHeight: String(preview.imageHeight),
      ogType: article ? 'article' : 'website',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }
  const legalKind = getLegalPageKind(pathname)
  if (legalKind) {
    const locale = localeFromPath(pathname)
    const document = legalDocuments[locale][legalKind]
    return {
      title: `${document.title} | TECSERVICE`,
      description: document.description,
      canonical: `https://tecservice.ge${localePath(`/${legalKind}/`, locale)}`,
      image: 'https://tecservice.ge/assets/map/tecservice-map.jpg',
      imageAlt: locale === 'en' ? 'TECSERVICE service centre location in Tbilisi' : 'TECSERVICE-ის სერვის ცენტრის მდებარეობა თბილისში',
      imageWidth: '740', imageHeight: '418',
      robots: legalDocumentsApproved ? 'index, follow' : 'noindex, follow',
    }
  }
  const metadata = getGeorgianRouteMetadata(stripLocale(pathname))
  if (localeFromPath(pathname) !== 'en') return metadata
  if (metadata && isAboutPath(pathname)) return {
    ...metadata,
    title: 'About us — Device repair since 2002 | TECSERVICE',
    description: 'Meet TECSERVICE, a device repair service in Tbilisi since 2002. Explore our wide range of repair and data recovery services, work process and location.',
    canonical: `https://tecservice.ge/en${aboutPath}/`,
    imageAlt: 'Illustration of laptop, phone, controller, drone and circuit board repairs at an electronics workbench',
  }
  if (!metadata && isHomePath(pathname)) return {
    title: 'Device Repair & Data Recovery in Tbilisi | TECSERVICE',
    description: 'Professional laptop, computer, console, drone, phone and circuit board repair in Tbilisi. Diagnostics, upgrades and laboratory data recovery at TECSERVICE.',
    canonical: 'https://tecservice.ge/en/',
    image: 'https://tecservice.ge/assets/blog/laptop-repair.jpg',
    imageAlt: 'Laptop diagnostics and repair at TECSERVICE',
    imageWidth: '2000', imageHeight: '1334',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  }
  if (!metadata) return null
  return {
    ...metadata,
    title: translateText(metadata.title, 'en'),
    description: translateText(metadata.description, 'en'),
    imageAlt: translateText(metadata.imageAlt, 'en'),
    canonical: `https://tecservice.ge${localePath(new URL(metadata.canonical).pathname, 'en')}`,
  }
}

function getGeorgianRouteMetadata(pathname: string) {
  if (isAboutPath(pathname)) {
    return {
      title: 'ჩვენს შესახებ — ტექნიკის სერვისი | TECSERVICE',
      description: 'გაიცანით TECSERVICE — ტექნიკის სერვისი თბილისში 2002 წლიდან. შეკეთებისა და ინფორმაციის აღდგენის მრავალი მიმართულება, მუშაობის პროცესი და სერვის ცენტრის მდებარეობა.',
      canonical: `https://tecservice.ge${aboutPath}/`,
      image: 'https://tecservice.ge/assets/about/multi-device-repair.webp',
      imageAlt: 'ლეპტოპის, ტელეფონის, კონტროლერის, დრონისა და ელექტრონული პლატების შეკეთების ილუსტრაცია',
      imageWidth: '1440',
      imageHeight: '960',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isLaptopRepairPath(pathname)) {
    return {
      title: 'ლეპტოპების შეკეთება თბილისში | TECSERVICE',
      description: 'TECSERVICE გთავაზობთ ლეპტოპების დიაგნოსტიკასა და შეკეთებას თბილისში: ეკრანი, კლავიატურა, კვების სისტემა, პლატა, გაგრილება და SSD/RAM განახლება.',
      canonical: `https://tecservice.ge${laptopRepairPath}/`,
      image: 'https://tecservice.ge/assets/laptop-repair/repair-workbench.webp',
      imageAlt: 'ლეპტოპის სისტემური პლატისა და გაგრილების სისტემის დიაგნოსტიკა TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '853',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isComputerRepairPath(pathname)) {
    return {
      title: 'კომპიუტერების შეკეთება და აწყობა თბილისში | TECSERVICE',
      description: 'დესკტოპ კომპიუტერების დიაგნოსტიკა, კომპონენტური შეკეთება, განახლება და სრული სისტემის აწყობა თბილისში — შეთანხმებული სამუშაო და საორიენტაციო ვადები.',
      canonical: `https://tecservice.ge${computerRepairPath}/`,
      image: 'https://tecservice.ge/assets/computer-repair/hero-diagnostics.webp',
      imageAlt: 'დესკტოპ კომპიუტერის კომპონენტური დიაგნოსტიკა TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '853',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isDataRecoveryPath(pathname)) {
    return {
      title: 'ინფორმაციის აღდგენა თბილისში | TECSERVICE',
      description: 'HDD, SSD, RAID, NAS, USB და SD მატარებლებიდან მონაცემების უსაფრთხო აღდგენა თბილისში — ლაბორატორიული დიაგნოსტიკა PC‑3000 და Data Extractor სისტემებით.',
      canonical: `https://tecservice.ge${dataRecoveryPath}/`,
      image: 'https://tecservice.ge/assets/data-recovery/hero-hdd-opening.webp',
      imageAlt: 'მყარი დისკის ლაბორატორიული გახსნა და მონაცემების აღდგენა TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '720',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isConsoleRepairPath(pathname)) {
    return {
      title: 'კონსოლების შეკეთება თბილისში | TECSERVICE',
      description: 'PlayStation, Xbox და Nintendo კონსოლების შეკეთება თბილისში: HDMI, კვების სისტემა, გაგრილება, დისკ-დრაივი, მეხსიერება და კონტროლერები.',
      canonical: `https://tecservice.ge${consoleRepairPath}/`,
      image: 'https://tecservice.ge/assets/console-repair/hero-controller.webp',
      imageAlt: 'გეიმინგ კონსოლის კონტროლერის შეკეთება TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '853',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isDroneRepairPath(pathname)) {
    return {
      title: 'დრონების შეკეთება თბილისში | TECSERVICE',
      description: 'DJI და FPV დრონების დიაგნოსტიკა და შეკეთება თბილისში: გიმბალი, კამერა, მოტორი, ESC/FC, GPS/IMU, ბატარეა და პროგრამული გამართვა.',
      canonical: `https://tecservice.ge${droneRepairPath}/`,
      image: 'https://tecservice.ge/assets/drone-repair/hero-mavic-4-pro.webp',
      imageAlt: 'დაშლილი DJI დრონის დიაგნოსტიკა და შეკეთება TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '720',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isMobileTabletRepairPath(pathname)) {
    return {
      title: 'მობილურებისა და პლანშეტების შეკეთება თბილისში | TECSERVICE',
      description: 'მობილურებისა და პლანშეტების დიაგნოსტიკა და შეკეთება თბილისში: ეკრანი, სენსორი, ბატარეა, დამტენის პორტი, კამერა, პლატა და პროგრამული გამართვა.',
      canonical: `https://tecservice.ge${mobileTabletRepairPath}/`,
      image: 'https://tecservice.ge/assets/mobile-tablet-repair/hero-main.webp',
      imageAlt: 'მობილური ტელეფონის პლატის დიაგნოსტიკა და შეკეთება TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '720',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isOtherElectronicsPath(pathname)) {
    return {
      title: 'ელექტრონული პლატების შეკეთება თბილისში | TECSERVICE',
      description: 'ელექტრონული პლატებისა და არასტანდარტული ტექნიკის შეკეთება თბილისში: ტელევიზორის პლატა და LED განათება, UPS, კვების ბლოკები, ინვერტორები, CNC და BMS.',
      canonical: `https://tecservice.ge${otherElectronicsPath}/`,
      image: 'https://tecservice.ge/assets/electronic-board-repair/hero-tv-repair.webp',
      imageAlt: 'ტელევიზორის პლატის დიაგნოსტიკა და შეკეთება TECSERVICE-ში',
      imageWidth: '1280',
      imageHeight: '853',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isContactPath(pathname)) {
    return {
      title: 'კონტაქტი და მისამართი | TECSERVICE თბილისი',
      description: 'დაუკავშირდით TECSERVICE-ს ტექნიკის შეკეთებისა და დიაგნოსტიკისთვის. ტელეფონი, WhatsApp, სამუშაო საათები და სერვის ცენტრის მისამართი: თბილისი, ცოტნე დადიანის 7ბ/2.',
      canonical: `https://tecservice.ge${contactPath}/`,
      image: 'https://tecservice.ge/assets/map/tecservice-map.jpg',
      imageAlt: 'TECSERVICE-ის სერვის ცენტრის მდებარეობა — თბილისი, ცოტნე დადიანის 7ბ/2',
      imageWidth: '740',
      imageHeight: '418',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  return null
}

function setMetaContent(attribute: 'name' | 'property', name: string, content: string) {
  const selector = `meta[${attribute}="${name}"]`
  const matches = [...document.querySelectorAll<HTMLMetaElement>(selector)]
  const meta = matches.shift() ?? document.createElement('meta')
  meta.setAttribute(attribute, name)
  meta.setAttribute('content', content)
  if (!meta.parentNode) document.head.append(meta)
  matches.forEach(duplicate => duplicate.remove())
}

export function applyRouteMetadata(pathname: string) {
  const locale = localeFromPath(pathname)
  document.documentElement.lang = locale
  setMetaContent('property', 'og:locale', locale === 'en' ? 'en_GB' : 'ka_GE')
  setMetaContent('property', 'og:type', getBlogArticleSlug(pathname) ? 'article' : 'website')
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove())
  if (isKnownPublicPath(pathname)) {
    const base = stripLocale(pathname).replace(/\/+$/, '') + '/'
    for (const language of ['ka', 'en', 'x-default'] as const) {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = language
      link.href = `https://tecservice.ge${localePath(base, language === 'en' ? 'en' : 'ka')}`
      document.head.append(link)
    }
  }
  const metadata = getRouteMetadata(pathname)
  if (!metadata) {
    if (isHomePath(pathname)) return

    document.title = translateText(notFoundMetadata.title, locale)
    setMetaContent('name', 'description', translateText(notFoundMetadata.description, locale))
    setMetaContent('name', 'robots', notFoundMetadata.robots)
    setMetaContent('property', 'og:title', translateText(notFoundMetadata.title, locale))
    setMetaContent('property', 'og:description', translateText(notFoundMetadata.description, locale))
    setMetaContent('name', 'twitter:title', translateText(notFoundMetadata.title, locale))
    setMetaContent('name', 'twitter:description', translateText(notFoundMetadata.description, locale))
    setMetaContent('name', 'twitter:card', 'summary')
    // Unknown paths must not retain the homepage URL or preview photograph.
    document.querySelectorAll('meta[property="og:url"], meta[property="og:image"], meta[property^="og:image:"], meta[name="twitter:image"], meta[name="twitter:image:alt"]').forEach((meta) => meta.remove())
    document.querySelector('link[rel="canonical"]')?.remove()
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove())
    return
  }

  document.title = metadata.title
  const contentUpdates: Array<['name' | 'property', string, string]> = [
    ['name', 'description', metadata.description],
    ['name', 'robots', metadata.robots],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:url', metadata.canonical],
    ['property', 'og:image', metadata.image],
    ['property', 'og:image:type', getImageMimeType(metadata.image)],
    ['property', 'og:image:width', metadata.imageWidth],
    ['property', 'og:image:height', metadata.imageHeight],
    ['property', 'og:image:alt', metadata.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
    ['name', 'twitter:image', metadata.image],
    ['name', 'twitter:image:alt', metadata.imageAlt],
  ]
  for (const [attribute, name, content] of contentUpdates) {
    setMetaContent(attribute, name, content)
  }
  const canonicals = [...document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')]
  const canonical = canonicals.shift() ?? document.createElement('link')
  canonical.setAttribute('rel', 'canonical')
  canonical.setAttribute('href', metadata.canonical)
  if (!canonical.parentNode) document.head.append(canonical)
  canonicals.forEach(duplicate => duplicate.remove())
  // Do not describe a service preview as the seven-service Home page in dev.
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove())
}
