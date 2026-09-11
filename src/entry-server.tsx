import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
export { getRouteMetadata, laptopRepairPath } from './utils/routes'

// Build-time rendering only; no backend or production Node server is required.
export function render(pathname = '/') {
  return renderToString(<StrictMode><App pathname={pathname} /></StrictMode>)
}
