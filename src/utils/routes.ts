export const laptopRepairPath = '/services/laptop-repair'
export const computerRepairPath = '/services/computer-repair'
export const dataRecoveryPath = '/services/data-recovery'
export const consoleRepairPath = '/services/console-repair'
export const droneRepairPath = '/services/drone-repair'
export const mobileTabletRepairPath = '/services/mobile-tablet-repair'
export const otherElectronicsPath = '/services/other-electronics'

export const notFoundMetadata = {
  title: 'გვერდი ვერ მოიძებნა | TECSERVICE',
  description: 'მითითებული გვერდი ვერ მოიძებნა. დაბრუნდით TECSERVICE-ის მთავარ გვერდზე ან აირჩიეთ სასურველი სერვისი.',
  robots: 'noindex, follow',
}

export function isHomePath(pathname: string) {
  return pathname === '' || pathname === '/'
}

export function isLaptopRepairPath(pathname: string) {
  return pathname === laptopRepairPath || pathname === `${laptopRepairPath}/`
}

export function isComputerRepairPath(pathname: string) {
  return pathname === computerRepairPath || pathname === `${computerRepairPath}/`
}

export function isDataRecoveryPath(pathname: string) {
  return pathname === dataRecoveryPath || pathname === `${dataRecoveryPath}/`
}

export function isConsoleRepairPath(pathname: string) {
  return pathname === consoleRepairPath || pathname === `${consoleRepairPath}/`
}

export function isDroneRepairPath(pathname: string) {
  return pathname === droneRepairPath || pathname === `${droneRepairPath}/`
}

export function isMobileTabletRepairPath(pathname: string) {
  return pathname === mobileTabletRepairPath || pathname === `${mobileTabletRepairPath}/`
}

export function isOtherElectronicsPath(pathname: string) {
  return pathname === otherElectronicsPath || pathname === `${otherElectronicsPath}/`
}

export function isKnownPublicPath(pathname: string) {
  return isHomePath(pathname)
    || isLaptopRepairPath(pathname)
    || isComputerRepairPath(pathname)
    || isDataRecoveryPath(pathname)
    || isConsoleRepairPath(pathname)
    || isDroneRepairPath(pathname)
    || isMobileTabletRepairPath(pathname)
    || isOtherElectronicsPath(pathname)
}

export function getRouteMetadata(pathname: string) {
  if (isLaptopRepairPath(pathname)) {
    return {
      title: 'ლეპტოპების შეკეთება თბილისში | TECSERVICE',
      description: 'TECSERVICE გთავაზობთ ლეპტოპების დიაგნოსტიკასა და შეკეთებას თბილისში: ეკრანი, კლავიატურა, კვების სისტემა, პლატა, გაგრილება და SSD/RAM განახლება.',
      canonical: `https://tecservice.ge${laptopRepairPath}/`,
      image: 'https://tecservice.ge/assets/laptop-repair/repair-workbench.webp',
      imageAlt: 'ლეპტოპის სისტემური პლატისა და გაგრილების სისტემის დიაგნოსტიკა TECSERVICE-ში',
      imageWidth: '1536',
      imageHeight: '1024',
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
      image: 'https://tecservice.ge/assets/data-recovery/hero-hdd-opening.jpg',
      imageAlt: 'მყარი დისკის ლაბორატორიული გახსნა და მონაცემების აღდგენა TECSERVICE-ში',
      imageWidth: '1672',
      imageHeight: '941',
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
      imageWidth: '1536',
      imageHeight: '1024',
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
      imageWidth: '1672',
      imageHeight: '941',
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
      imageWidth: '1672',
      imageHeight: '941',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  if (isOtherElectronicsPath(pathname)) {
    return {
      title: 'ელექტრონული პლატების შეკეთება თბილისში | TECSERVICE',
      description: 'ელექტრონული პლატებისა და არასტანდარტული ტექნიკის შეკეთება თბილისში: კვების ბლოკები, UPS, ინვერტორები, CNC, BMS, აუდიო და უსაფრთხოების სისტემები.',
      canonical: `https://tecservice.ge${otherElectronicsPath}/`,
      image: 'https://tecservice.ge/assets/electronic-board-repair/hero-tv-repair.jpg',
      imageAlt: 'ტელევიზორის პლატის დიაგნოსტიკა და შეკეთება TECSERVICE-ში',
      imageWidth: '1536',
      imageHeight: '1024',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    }
  }

  return null
}

export function applyRouteMetadata(pathname: string) {
  const metadata = getRouteMetadata(pathname)
  if (!metadata) {
    if (isHomePath(pathname)) return

    document.title = notFoundMetadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', notFoundMetadata.description)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', notFoundMetadata.robots)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', notFoundMetadata.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', notFoundMetadata.description)
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', notFoundMetadata.title)
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', notFoundMetadata.description)
    document.querySelector('link[rel="canonical"]')?.remove()
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove())
    return
  }

  document.title = metadata.title
  const contentUpdates = [
    ['meta[name="description"]', metadata.description],
    ['meta[name="robots"]', metadata.robots],
    ['meta[property="og:title"]', metadata.title],
    ['meta[property="og:description"]', metadata.description],
    ['meta[property="og:url"]', metadata.canonical],
    ['meta[property="og:image"]', metadata.image],
    ['meta[property="og:image:width"]', metadata.imageWidth],
    ['meta[property="og:image:height"]', metadata.imageHeight],
    ['meta[property="og:image:alt"]', metadata.imageAlt],
    ['meta[name="twitter:title"]', metadata.title],
    ['meta[name="twitter:description"]', metadata.description],
    ['meta[name="twitter:image"]', metadata.image],
    ['meta[name="twitter:image:alt"]', metadata.imageAlt],
  ]
  for (const [selector, content] of contentUpdates) {
    document.querySelector(selector)?.setAttribute('content', content)
  }
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', metadata.canonical)
  // Do not describe a service preview as the seven-service Home page in dev.
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove())
}
