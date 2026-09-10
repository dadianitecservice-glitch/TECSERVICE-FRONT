import { readFile, writeFile } from 'node:fs/promises'
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
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx')
  const html = await readFile(output, 'utf8')
  const marker = '<div id="root"></div>'
  if (!html.includes(marker)) throw new Error('Expected an empty root in the fresh Vite build.')
  const content = render()
  if (!content.includes('<h1') || !content.includes('id="services"')) {
    throw new Error('Homepage prerender is missing its primary content.')
  }
  await writeFile(output, html.replace(marker, () => `<div id="root">${content}</div>`))
  console.log('Homepage content prerendered into dist/index.html.')
} finally {
  await server.close()
}
