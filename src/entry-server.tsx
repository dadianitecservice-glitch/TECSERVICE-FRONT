import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

// Build-time rendering only; no backend or production Node server is required.
export function render() {
  return renderToString(<StrictMode><App /></StrictMode>)
}
