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

try {
  const { render, getRouteMetadata, laptopRepairPath } = await server.ssrLoadModule('/src/entry-server.tsx')
  const html = await readFile(output, 'utf8')
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) throw new Error('Expected an empty root in the fresh Vite build.')
  const content = render()
  if (!content.includes('<h1') || !content.includes('id="services"')) {
    throw new Error('Homepage prerender is missing its primary content.')
  }
  await writeFile(output, html.replace(marker, () => `<div id="root">${content}</div>`))
  console.log('Homepage content prerendered into dist/index.html.')

  const laptopContent = render(laptopRepairPath)
  if (!laptopContent.includes('<h1') || laptopContent.includes('id="hero-title"')) {
    throw new Error('Laptop route prerender did not return its own service page.')
  }
  const metadata = getRouteMetadata(laptopRepairPath)
  const escapeAttribute = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  let laptopHtml = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttribute(metadata.title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, () => `<link rel="canonical" href="${metadata.canonical}" />`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
  for (const [attribute, name, value] of [
    ['name', 'description', metadata.description],
    ['name', 'robots', metadata.robots],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:url', metadata.canonical],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
  ]) {
    laptopHtml = laptopHtml.replace(
      new RegExp(`<meta ${attribute}="${name}" content="[^"]*"\\s*/>`),
      () => `<meta ${attribute}="${name}" content="${escapeAttribute(value)}" />`,
    )
  }
  const laptopOutputDirectory = new URL(`../dist${laptopRepairPath}/`, import.meta.url)
  await mkdir(laptopOutputDirectory, { recursive: true })
  await writeFile(new URL('index.html', laptopOutputDirectory), laptopHtml.replace(marker, () => `<div id="root">${laptopContent}</div>`))
  console.log(`Laptop preview prerendered into dist${laptopRepairPath}/index.html.`)
} finally {
  await server.close()
}
