import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { loadPage } from './pageLoader'
export { getPageModuleId } from './pageLoader'
export {
  aboutPath,
  accountPath,
  blogPath,
  getBlogPaths,
  termsPath,
  privacyPath,
  computerRepairPath,
  contactPath,
  consoleRepairPath,
  dataRecoveryPath,
  droneRepairPath,
  getRouteMetadata,
  laptopRepairPath,
  mobileTabletRepairPath,
  notFoundMetadata,
  otherElectronicsPath,
} from './utils/routes'
export { serializeRouteStructuredData, serializeServiceStructuredData } from './seo/serviceStructuredData'

// Build-time rendering only; no backend or production Node server is required.
export async function render(pathname = '/') {
  const page = await loadPage(pathname)
  return renderToString(<StrictMode><App pathname={pathname} page={page} /></StrictMode>)
}
