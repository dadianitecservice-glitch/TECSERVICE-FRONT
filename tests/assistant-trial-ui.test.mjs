import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const hero = await readFile(new URL('../src/sections/Hero.tsx', import.meta.url), 'utf8')
const globalCss = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8')
const responsiveCss = await readFile(new URL('../src/styles/responsive.css', import.meta.url), 'utf8')

test('trial assistant has no attachment picker, filename state or unused attachment styles', () => {
  assert.doesNotMatch(hero, /type="file"|attachmentName|fileInputRef|attachment-button|attachment\.svg/)
  assert.doesNotMatch(globalCss + responsiveCss, /\.attachment-button/)
  assert.match(globalCss, /\.textarea-shell textarea\s*\{[^}]*padding: 12px 14px;/)
})

test('trial assistant uses the local service-price helper with the current language and no API or session storage', () => {
  assert.match(hero, /getServicePriceAssessment\(selectedDevice, problem\.trim\(\), l10n\.locale, l10n\.t\)/)
  assert.doesNotMatch(hero, /askTecServiceAssistant|assistantApi|sessionStorage|localStorage|fetch\(|AbortController|assistantHistory/)
})

test('assistant omits the testing-mode notice in both languages and links only the active validation error', () => {
  assert.doesNotMatch(hero, /ai-mode-note|TECSERVICE AI სატესტო რეჟიმშია|without an external AI service/)
  assert.match(hero, /aria-invalid=\{feedback === 'required'\}/)
  assert.match(hero, /aria-describedby=\{feedback === 'required' \? 'ai-feedback' : undefined\}/)
  assert.match(hero, /\{feedback === 'required' && <p id="ai-feedback" className="ai-disclaimer" role="alert">/)
})

test('clarifications and safety replies remain visible even when a price is available', () => {
  const reply = hero.indexOf('{assessment.reply}')
  const price = hero.indexOf('{assessment.assessment &&')
  assert.ok(reply > -1 && price > reply)
  assert.match(hero, /assessment\.sources\.map/)
  assert.match(hero, /href=\{l10n\.href\(source\.path\)\}/)
  assert.match(hero, /role="status"/)
  assert.match(hero, /problemInputRef\.current\?\.focus\(\)/)
})
