export const laptopRepairPath = '/services/laptop-repair'

export function isLaptopRepairPath(pathname: string) {
  return pathname === laptopRepairPath || pathname === `${laptopRepairPath}/`
}

export function getRouteMetadata(pathname: string) {
  if (!isLaptopRepairPath(pathname)) return null

  return {
    title: 'ლეპტოპების შეკეთება | TECSERVICE',
    description: 'ლეპტოპების დიაგნოსტიკა და შეკეთება: ეკრანი, კლავიატურა, კვების სისტემა, პლატა, გაგრილება და SSD/RAM განახლება.',
    canonical: `https://tecservice.ge${laptopRepairPath}/`,
    // The service page is a partial design preview until its content is approved.
    robots: 'noindex, follow',
  }
}

export function applyRouteMetadata(pathname: string) {
  const metadata = getRouteMetadata(pathname)
  if (!metadata) return

  document.title = metadata.title
  const contentUpdates = [
    ['meta[name="description"]', metadata.description],
    ['meta[name="robots"]', metadata.robots],
    ['meta[property="og:title"]', metadata.title],
    ['meta[property="og:description"]', metadata.description],
    ['meta[property="og:url"]', metadata.canonical],
    ['meta[name="twitter:title"]', metadata.title],
    ['meta[name="twitter:description"]', metadata.description],
  ]
  for (const [selector, content] of contentUpdates) {
    document.querySelector(selector)?.setAttribute('content', content)
  }
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', metadata.canonical)
  // Do not describe a laptop preview as the seven-service Home page in dev.
  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => script.remove())
}
