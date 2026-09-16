import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

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

function applyMetadata(html, metadata, structuredData = null) {
  let routeHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttribute(metadata.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => `<link rel="canonical" href="${metadata.canonical}" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')

  for (const [attribute, name, value] of [
    ['name', 'description', metadata.description],
    ['name', 'robots', metadata.robots],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:url', metadata.canonical],
    ['property', 'og:image', metadata.image],
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
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/\s*<meta property="og:(?:url|image|image:width|image:height|image:alt)" content="[^"]*"\s*\/>/g, '')
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
    serializeServiceStructuredData,
    getRouteMetadata,
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
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) throw new Error('Expected an empty root in the fresh Vite build.')

  const homeContent = render()
  if (!homeContent.includes('<h1') || !homeContent.includes('id="services"')) {
    throw new Error('Homepage prerender is missing its primary content.')
  }
  await writeFile(output, html.replace(marker, () => `<div id="root">${homeContent}</div>`))
  console.log('Homepage content prerendered into dist/index.html.')

  for (const [label, routePath] of [
    ['Laptop', laptopRepairPath],
    ['Computer', computerRepairPath],
    ['Data recovery', dataRecoveryPath],
    ['Console', consoleRepairPath],
    ['Drone', droneRepairPath],
    ['Mobile and tablet', mobileTabletRepairPath],
    ['Other electronics', otherElectronicsPath],
  ]) {
    const content = render(routePath)
    if (!content.includes('<h1') || content.includes('id="hero-title"')) {
      throw new Error(`${label} route prerender did not return its own service page.`)
    }
    const metadata = getRouteMetadata(routePath)
    if (!metadata) throw new Error(`${label} route metadata is missing.`)
    const structuredData = serializeServiceStructuredData(routePath, metadata)
    if (!structuredData) throw new Error(`${label} route structured data is missing.`)
    const routeOutputDirectory = new URL(`../dist${routePath}/`, import.meta.url)
    await mkdir(routeOutputDirectory, { recursive: true })
    await writeFile(new URL('index.html', routeOutputDirectory), applyMetadata(html, metadata, structuredData).replace(marker, () => `<div id="root">${content}</div>`))
    console.log(`${label} preview prerendered into dist${routePath}/index.html.`)
  }

  const notFoundContent = render('/404-not-found/')
  if (!notFoundContent.includes('id="not-found-title"')) {
    throw new Error('404 prerender did not return the Not Found page.')
  }
  await writeFile(
    new URL('../dist/404.html', import.meta.url),
    applyNotFoundMetadata(html, notFoundMetadata).replace(marker, () => `<div id="root">${notFoundContent}</div>`),
  )
  console.log('Custom noindex 404 page prerendered into dist/404.html.')
} finally {
  await server.close()
}
