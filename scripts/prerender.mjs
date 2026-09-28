import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import { applyRouteAssets } from './prerender-assets.mjs'
import { getImageMimeType } from '../src/utils/imageMimeType.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = new URL('../dist/index.html', import.meta.url)
const server = await createServer({
  root,
  configFile: false,
  plugins: [react()],
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const escapeAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function applyLanguage(html, path, language = 'ka', alternates = true) {
  const base = (path.replace(/^\/en(?=\/|$)/, '') || '/').replace(/\/+$/, '') + '/'
  let result = html.replace('<html lang="ka">', `<html lang="${language}">`)
    .replace(/(<meta property="og:locale" content=")[^"]+/, `$1${language === 'en' ? 'en_GB' : 'ka_GE'}`)
  if (alternates) result = result.replace('</head>', ['ka', 'en', 'x-default'].map(locale =>
    `    <link rel="alternate" hreflang="${locale}" href="https://tecservice.ge${locale === 'en' ? '/en' : ''}${base}" />`,
  ).join('\n') + '\n  </head>')
  return result
}

function applyMetadata(html, metadata, structuredData = null) {
  let routeHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttribute(metadata.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => `<link rel="canonical" href="${metadata.canonical}" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')

  for (const [attribute, name, value] of [
    ['name', 'description', metadata.description],
    ['name', 'robots', metadata.robots],
    ['property', 'og:title', metadata.title],
    ['property', 'og:type', metadata.ogType ?? 'website'],
    ['property', 'og:description', metadata.description],
    ['property', 'og:url', metadata.canonical],
    ['property', 'og:image', metadata.image],
    ['property', 'og:image:type', getImageMimeType(metadata.image)],
    ['property', 'og:image:width', metadata.imageWidth],
    ['property', 'og:image:height', metadata.imageHeight],
    ['property', 'og:image:alt', metadata.imageAlt],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
    ['name', 'twitter:image', metadata.image],
    ['name', 'twitter:image:alt', metadata.imageAlt],
  ]) {
    routeHtml = routeHtml.replace(
      new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*\\/>`),
      () => `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`,
    )
  }

  if (structuredData) {
    routeHtml = routeHtml.replace(
      '</head>',
      `    <script type="application/ld+json" data-tecservice-route-schema>${structuredData}</script>\n  </head>`,
    )
  }
  return routeHtml
}

function applyNotFoundMetadata(html, metadata) {
  let routeHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttribute(metadata.title)}</title>`)
    .replace(/\s*<link rel="canonical" href="[^"]*"\s*\/>/, '')
    .replace(/(<meta name="twitter:card" content=")[^"]+/, '$1summary')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/\s*<meta property="og:(?:url|image|image:type|image:width|image:height|image:alt)" content="[^"]*"\s*\/>/g, '')
    .replace(/\s*<meta name="twitter:(?:image|image:alt)" content="[^"]*"\s*\/>/g, '')

  for (const [attribute, name, value] of [
    ['name', 'description', metadata.description],
    ['name', 'robots', metadata.robots],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
  ]) {
    routeHtml = routeHtml.replace(
      new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*\\/>`),
      () => `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`,
    )
  }

  return routeHtml
}

try {
  const {
    render,
    getPageModuleId,
    serializeRouteStructuredData,
    getRouteMetadata,
    aboutPath,
    accountPath,
    getBlogPaths,
    termsPath,
    privacyPath,
    contactPath,
    laptopRepairPath,
    computerRepairPath,
    dataRecoveryPath,
    consoleRepairPath,
    droneRepairPath,
    mobileTabletRepairPath,
    notFoundMetadata,
    otherElectronicsPath,
  } = await server.ssrLoadModule('/src/entry-server.tsx')
  const html = await readFile(output, 'utf8')
  const manifest = JSON.parse(await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8'))
  const htmlFor = path => {
    const pageHtml = applyRouteAssets(html, manifest, getPageModuleId(path))
    return /^\/en(?:\/|$)/.test(path)
      ? applyRouteAssets(pageHtml, manifest, 'src/i18n/translate.ts')
      : pageHtml
  }
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) throw new Error('Expected an empty root in the fresh Vite build.')

  const homeContent = await render()
  if (!homeContent.includes('<h1') || !homeContent.includes('id="services"')) {
    throw new Error('Homepage prerender is missing its primary content.')
  }
  await writeFile(output, applyLanguage(htmlFor('/'), '/').replace(marker, () => `<div id="root">${homeContent}</div>`))
  console.log('Homepage content prerendered into dist/index.html.')

  for (const [label, routePath] of [
    ['Laptop', laptopRepairPath],
    ['Computer', computerRepairPath],
    ['Data recovery', dataRecoveryPath],
    ['Console', consoleRepairPath],
    ['Drone', droneRepairPath],
    ['Mobile and tablet', mobileTabletRepairPath],
    ['Other electronics', otherElectronicsPath],
    ['Contact', contactPath],
    ['About', aboutPath],
    ['Terms', termsPath],
    ['Privacy', privacyPath],
    ...getBlogPaths().map(path => ['Blog', path]),
  ]) {
    const content = await render(routePath)
    if (!content.includes('<h1') || content.includes('id="hero-title"')) {
      throw new Error(`${label} route prerender did not return its own page.`)
    }
    const metadata = getRouteMetadata(routePath)
    if (!metadata) throw new Error(`${label} route metadata is missing.`)
    const structuredData = serializeRouteStructuredData(routePath, metadata)
    if (!structuredData) throw new Error(`${label} route structured data is missing.`)
    const routeOutputDirectory = new URL(`../dist${routePath}/`, import.meta.url)
    await mkdir(routeOutputDirectory, { recursive: true })
    await writeFile(new URL('index.html', routeOutputDirectory), applyLanguage(applyMetadata(htmlFor(routePath), metadata, structuredData), routePath).replace(marker, () => `<div id="root">${content}</div>`))
    console.log(`${label} preview prerendered into dist${routePath}/index.html.`)
  }

  for (const path of ['/', laptopRepairPath, computerRepairPath, dataRecoveryPath, consoleRepairPath, droneRepairPath, mobileTabletRepairPath, otherElectronicsPath, contactPath, aboutPath, termsPath, privacyPath, ...getBlogPaths()]) {
    const englishPath = `/en${path === '/' ? '/' : `${path}/`}`
    const metadata = getRouteMetadata(englishPath)
    if (!metadata) throw new Error(`Missing English metadata: ${englishPath}`)
    const content = await render(englishPath)
    const structuredData = serializeRouteStructuredData(englishPath, metadata)
    const directory = new URL(`../dist${englishPath}`, import.meta.url)
    await mkdir(directory, { recursive: true })
    await writeFile(new URL('index.html', directory), applyLanguage(applyMetadata(htmlFor(englishPath), metadata, structuredData), path, 'en').replace(marker, () => `<div id="root">${content}</div>`))
    console.log(`English page prerendered into dist${englishPath}index.html.`)
  }

  // Only render the public sign-in shell, never customer data or development fixtures.
  for (const language of ['ka', 'en']) {
    const path = `${language === 'en' ? '/en' : ''}${accountPath}/`
    const metadata = getRouteMetadata(path)
    const directory = new URL(`../dist${path}`, import.meta.url)
    await mkdir(directory, { recursive: true })
    const content = await render(path)
    await writeFile(new URL('index.html', directory), applyLanguage(applyMetadata(htmlFor(path), metadata), path, language).replace(marker, () => `<div id="root">${content}</div>`))
    console.log(`Account sign-in shell prerendered into dist${path}index.html.`)
  }

  const indexablePaths = ['/', laptopRepairPath, computerRepairPath, dataRecoveryPath, consoleRepairPath, droneRepairPath, mobileTabletRepairPath, otherElectronicsPath, contactPath, aboutPath, termsPath, privacyPath, ...getBlogPaths()]
  const sitemapUrls = ['', '/en'].flatMap(prefix => indexablePaths
    .map(path => `${prefix}${path === '/' ? '/' : `${path}/`}`)
    .filter(path => {
      const metadata = getRouteMetadata(path)
      // Georgian Home uses the audited base index.html metadata.
      if (!metadata && path !== '/') throw new Error(`Missing sitemap metadata: ${path}`)
      return !metadata?.robots.includes('noindex')
    })
    .map(path => `https://tecservice.ge${path}`))
  await writeFile(new URL('../dist/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`)

  const notFoundContent = await render('/404-not-found/')
  if (!notFoundContent.includes('id="not-found-title"')) {
    throw new Error('404 prerender did not return the Not Found page.')
  }
  await writeFile(
    new URL('../dist/404.html', import.meta.url),
    applyNotFoundMetadata(htmlFor('/404-not-found/'), notFoundMetadata).replace(marker, () => `<div id="root">${notFoundContent}</div>`),
  )
  console.log('Custom noindex 404 page prerendered into dist/404.html.')
  const englishNotFound = { title: 'Page not found | TECSERVICE', description: 'This page could not be found. Return to the TECSERVICE home page or choose a service.', robots: 'noindex, follow' }
  const englishNotFoundContent = await render('/en/404-not-found/')
  await writeFile(new URL('../dist/en/404.html', import.meta.url), applyLanguage(applyNotFoundMetadata(htmlFor('/en/404-not-found/'), englishNotFound), '/en/404.html', 'en', false).replace(marker, () => `<div id="root">${englishNotFoundContent}</div>`))
} finally {
  await server.close()
}
