import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
export {
  computerRepairPath,
  consoleRepairPath,
  dataRecoveryPath,
  droneRepairPath,
  getRouteMetadata,
  laptopRepairPath,
  mobileTabletRepairPath,
  notFoundMetadata,
  otherElectronicsPath,
} from './utils/routes'
export { serializeServiceStructuredData } from './seo/serviceStructuredData'

// Build-time rendering only; no backend or production Node server is required.
export function render(pathname = '/') {
  return renderToString(<StrictMode><App pathname={pathname} /></StrictMode>)
}
