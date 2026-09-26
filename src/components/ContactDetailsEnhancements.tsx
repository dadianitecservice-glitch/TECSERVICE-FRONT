import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef, useState } from 'react'
import { getBusinessHoursStatus } from '../utils/businessHours'
import { LaptopIcon } from './LaptopIcon'

export function BusinessHoursStatus() {
  const l10n = useTranslation()
  // Resolve the current time after hydration, never at the static build's time.
  const [status, setStatus] = useState<ReturnType<typeof getBusinessHoursStatus> | null>(null)

  useEffect(() => {
    const refresh = () => setStatus(getBusinessHoursStatus(new Date()))
    refresh()
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return (
    <div className="contact-page__opening-status" role="status" aria-live="polite" aria-atomic="true">
      {l10n.t(status ? <>
        <span className={`contact-page__opening-badge ${status.isOpen ? 'is-open' : 'is-closed'}`}>
          <span aria-hidden="true" />{l10n.t(status.label)}
        </span>
        <span className="contact-page__opening-detail">{l10n.t(status.detail)}</span>
      </> : <span className="contact-page__opening-detail">{l10n.t("სამუშაო გრაფიკი · თბილისის დროით")}</span>)}
    </div>
  )
}

export function AddressCopyButton({ address }: { address: string }) {
  const l10n = useTranslation()
  const [state, setState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  const fallbackRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state === 'error') {
      fallbackRef.current?.focus()
      fallbackRef.current?.select()
    }
    if (state !== 'copied') return
    const timer = window.setTimeout(() => setState('idle'), 3000)
    return () => window.clearTimeout(timer)
  }, [state])

  const copyAddress = async () => {
    setState('copying')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(l10n.t(address))
      setState('copied')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="contact-page__copy-control">
      <button
        className="contact-page__copy-address"
        type="button"
        onClick={copyAddress}
        disabled={state === 'copying'}
        aria-label={l10n.t("მისამართის კოპირება")}
      >
        {l10n.t(state === 'copied' ? <LaptopIcon name="check" /> : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="8" y="8" width="12" height="13" rx="2" />
            <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
          </svg>
        ))}
        {l10n.t(state === 'copied' ? 'დაკოპირებულია' : state === 'copying' ? 'კოპირდება…' : 'მისამართის კოპირება')}
      </button>
      <span className="contact-page__copy-feedback" role="status" aria-live="polite">
        {l10n.t(state === 'copied' ? 'მისამართი დაკოპირებულია' : '')}
      </span>
      {l10n.t(state === 'error' && <div className="contact-page__copy-fallback">
        <p role="status">{l10n.t("ავტომატური კოპირება ვერ მოხერხდა. მონიშნული მისამართი ხელით დააკოპირეთ.")}</p>
        <input ref={fallbackRef} aria-label={l10n.t("მისამართი ხელით კოპირებისთვის")} value={l10n.t(address)} readOnly onFocus={event => event.currentTarget.select()} />
      </div>)}
    </div>
  )
}
