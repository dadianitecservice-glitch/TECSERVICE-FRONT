import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/noto-sans-georgian/400.css'
import '@fontsource/noto-sans-georgian/500.css'
import '@fontsource/noto-sans-georgian/600.css'
import '@fontsource/noto-sans-georgian/700.css'
import App from './App'
import { loadPage } from './pageLoader'
import './styles/global.css'
import './styles/responsive.css'
import './styles/contact-page.css'
import './styles/localization.css'
import { isKnownPublicPath } from './utils/routePaths'

const root = document.getElementById('root')!
const pathname = window.location.pathname
// Production documents already contain canonical metadata and complete JSON-LD.
// Do not download every service catalog just to recreate that same static head.
// Vite preview may serve Home HTML for an unknown path. Repair that fallback's
// head too; a genuine prerendered 404 has no canonical and needs no heavy module.
const needsMetadata = !root.hasChildNodes()
  || (!isKnownPublicPath(pathname) && !!document.querySelector('link[rel="canonical"]'))
const metadataReady = !needsMetadata ? Promise.resolve() : Promise.all([
  import('./utils/routes'),
  import('./seo/serviceStructuredData'),
]).then(([metadata, schema]) => {
  metadata.applyRouteMetadata(pathname)
  schema.applyServiceStructuredData(pathname)
})
// Keep the full prerendered page visible while its interactive module loads.
Promise.all([loadPage(pathname), metadataReady]).then(([page]) => {
  const app = <StrictMode><App pathname={pathname} page={page} /></StrictMode>
  if (root.hasChildNodes() && isKnownPublicPath(pathname)) {
    hydrateRoot(root, app)
  } else {
    root.replaceChildren()
    createRoot(root).render(app)
  }
}).catch(error => {
  // A failed chunk must not erase readable, crawlable production HTML.
  console.error('Page interaction could not be loaded. Reload to try again.', error)
})
