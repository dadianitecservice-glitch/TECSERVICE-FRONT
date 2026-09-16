import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/noto-sans-georgian/400.css'
import '@fontsource/noto-sans-georgian/500.css'
import '@fontsource/noto-sans-georgian/600.css'
import '@fontsource/noto-sans-georgian/700.css'
import App from './App'
import './styles/global.css'
import './styles/responsive.css'
import { applyServiceStructuredData } from './seo/serviceStructuredData'
import { applyRouteMetadata, isKnownPublicPath } from './utils/routes'

const root = document.getElementById('root')!
const pathname = window.location.pathname
applyRouteMetadata(pathname)
applyServiceStructuredData(pathname)
const app = (
  <StrictMode>
    <App pathname={pathname} />
  </StrictMode>
)

if (root.hasChildNodes() && isKnownPublicPath(pathname)) {
  hydrateRoot(root, app)
} else {
  root.replaceChildren()
  createRoot(root).render(app)
}
