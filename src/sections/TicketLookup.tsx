import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { TicketResult } from '../components/TicketResult'
import { OtpVerification } from '../components/OtpVerification'
import { DEMO_OTP, DEMO_PHONE, DEMO_TICKET_CODE, findTicketByCode, findTicketsByPhone, type Ticket } from '../data/tickets'
import { toGeorgianMtavruli } from '../utils/text'
import { normalizeGeorgianMobile } from '../utils/validation'
import { useResponsiveHome } from '../hooks/useResponsiveHome'
import { useTranslation } from '../i18n/LocaleProvider'
import { useCustomerAuth } from '../account/CustomerAuthProvider'

type SearchMode = 'code' | 'phone'
type SearchState = 'default' | 'loading' | 'found' | 'not-found' | 'otp' | 'error'

type TicketLookupProps = {
  variant?: 'default' | 'embedded'
  id?: string
  focusOnMount?: boolean
}

export function TicketLookup({ variant = 'default', id = 'ticket', focusOnMount = false }: TicketLookupProps = {}) {
  const l10n = useTranslation()
  const account = useCustomerAuth()
  const responsive = useResponsiveHome()
  const embedded = variant === 'embedded'
  const headingId = `${id}-heading`
  const queryId = `${id}-query`
  const label = (text: string) => l10n.t(toGeorgianMtavruli(text))
  const [mode, setMode] = useState<SearchMode>('code')
  const [value, setValue] = useState('')
  const [state, setState] = useState<SearchState>('default')
  const [foundTickets, setFoundTickets] = useState<Ticket[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const pendingLookup = useRef<number | null>(null)
  const queryInputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const cancelPendingLookup = () => {
    if (pendingLookup.current !== null) {
      window.clearTimeout(pendingLookup.current)
      pendingLookup.current = null
    }
  }

  useEffect(() => () => cancelPendingLookup(), [])

  useEffect(() => {
    if (!focusOnMount) return
    queryInputRef.current?.focus({ preventScroll: true })
    queryInputRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, [focusOnMount])

  useEffect(() => {
    if (!embedded || state !== 'found') return
    resultRef.current?.focus({ preventScroll: true })
    resultRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [embedded, state])

  useEffect(() => {
    const requestedCode = new URLSearchParams(window.location.search).get('service-code')
    if (requestedCode?.trim()) setValue(requestedCode.trim().slice(0, 64))
  }, [])

  const selectMode = (nextMode: SearchMode) => {
    cancelPendingLookup()
    setMode(nextMode)
    setValue('')
    setErrorMessage('')
    setFoundTickets([])
    setState('default')
  }

  const submitLookup = (event: FormEvent) => {
    event.preventDefault()
    cancelPendingLookup()
    setFoundTickets([])
    if (!value.trim()) {
      setErrorMessage(mode === 'phone' ? 'შეიყვანეთ ტელეფონის ნომერი.' : 'შეიყვანეთ სერვისის კოდი.')
      setState('error')
      queryInputRef.current?.focus()
      return
    }
    if (mode === 'phone') {
      const normalizedPhone = normalizeGeorgianMobile(value)
      if (!normalizedPhone) {
        setErrorMessage('შეიყვანეთ სწორი მობილურის ნომერი: +995 5XX XX XX XX.')
        setState('error')
        queryInputRef.current?.focus()
        return
      }
      setValue(normalizedPhone)
    }
    setErrorMessage('')
    setState('loading')
    pendingLookup.current = window.setTimeout(() => {
      pendingLookup.current = null
      if (mode === 'phone') {
        setState('otp')
      } else {
        const ticket = findTicketByCode(value)
        setFoundTickets(ticket ? [ticket] : [])
        setState(ticket ? 'found' : 'not-found')
      }
    }, 650)
  }

  const confirmOtp = (code: string) => {
    if (code === DEMO_OTP) {
      setErrorMessage('')
      const matchingTickets = findTicketsByPhone(value)
      setFoundTickets(matchingTickets)
      setState(matchingTickets.length ? 'found' : 'not-found')
    } else {
      setErrorMessage(code.length === 6 ? 'კოდი არასწორია. სცადეთ ხელახლა.' : 'შეიყვანეთ ექვსივე ციფრი.')
    }
  }

  return (
    <section className={`ticket-section${embedded ? ' ticket-section--embedded' : ''}`} id={id} aria-labelledby={headingId}>
      {embedded ? <header className="ticket-embedded-heading">
        <h2 id={headingId}>{label('სერვისის სტატუსი')}</h2>
        <p>{l10n.t('შეიყვანეთ სერვისის კოდი ან ტელეფონის ნომერი — შეკვეთის დეტალები აქვე გამოჩნდება.')}</p>
      </header> : <SectionHeader headingId={headingId} title={label('სერვისის სტატუსი')} description={l10n.t('შეამოწმეთ შეკეთების მიმდინარე სტატუსი რეგისტრაციის გარეშე.')} />}
      <div className="ticket-layout">
        <div className="ticket-search-panel">
          {state === 'otp' ? (
            <OtpVerification
              phone={value}
              errorMessage={l10n.t(errorMessage)}
              onCodeChange={() => setErrorMessage('')}
              onConfirm={confirmOtp}
              onBack={() => { setErrorMessage(''); setState('default') }}
            />
          ) : (
            <>
              {!embedded && <div className="ticket-search-panel__intro">
                <h3 className="display-title">{label('მოძებნეთ სერვისი')}</h3>
                <span>{l10n.t('რეგისტრაცია არ არის საჭირო')}</span>
              </div>}
              <div className="ticket-tabs" role="group" aria-label={l10n.t('ძებნის მეთოდი')}>
                <button aria-pressed={mode === 'code'} className={mode === 'code' ? 'is-active' : ''} onClick={() => selectMode('code')} type="button">{label('სერვისის კოდით')}</button>
                <button aria-pressed={mode === 'phone'} className={mode === 'phone' ? 'is-active' : ''} onClick={() => selectMode('phone')} type="button"><span className="ticket-tabs__phone-full">{label('ტელეფონის ნომრით')}</span><span className="ticket-tabs__phone-short">{label('ტელეფონით')}</span></button>
              </div>
              <form className="ticket-form" onSubmit={submitLookup} aria-busy={state === 'loading'}>
                <label htmlFor={queryId}>{mode === 'code' ? responsive ? l10n.t('სერვისის კოდი') : label('სერვისის კოდი') : responsive ? l10n.t('ტელეფონის ნომერი') : label('ტელეფონის ნომერი')}</label>
                <div className="ticket-form__row">
                  <input
                    ref={queryInputRef}
                    id={queryId}
                    type={mode === 'phone' ? 'tel' : 'text'}
                    autoComplete={mode === 'phone' ? 'tel' : 'off'}
                    aria-invalid={state === 'error'}
                    aria-describedby={`${queryId}-help${state === 'error' ? ` ${queryId}-error` : ''}`}
                    maxLength={64}
                    value={value}
                    onChange={(event) => {
                      cancelPendingLookup()
                      setValue(event.target.value)
                      setErrorMessage('')
                      setFoundTickets([])
                      setState('default')
                    }}
                    placeholder={mode === 'code' ? DEMO_TICKET_CODE : '+995 5XX XX XX XX'}
                    inputMode={mode === 'phone' ? 'tel' : 'text'}
                  />
                  <button className="ticket-search-button" type="submit" disabled={state === 'loading'}>
                    <img src="/assets/icons/search-white.svg" alt="" />
                    {label(state === 'loading' ? 'იძებნება...' : 'ძიება')}
                  </button>
                </div>
                <p id={`${queryId}-help`}>{mode === 'code'
                  ? l10n.locale === 'en' ? `The code is on your service intake document. Demo code: ${DEMO_TICKET_CODE}.` : `კოდი მითითებულია სერვისის მიღების დოკუმენტზე. დემო კოდი: ${DEMO_TICKET_CODE}.`
                  : l10n.locale === 'en' ? `Demo number: ${DEMO_PHONE}. No real SMS is sent.` : `დემო ნომერი: ${DEMO_PHONE}. რეალური SMS არ იგზავნება.`}</p>
              </form>
              <div className="ticket-verification-note">
                <img src="/assets/icons/shield.svg" alt="" />
                <span>{l10n.t('ტელეფონით ძებნისას შესაძლოა საჭირო იყოს ერთჯერადი SMS-კოდი.')}</span>
              </div>
              {state === 'not-found' ? <div className="ticket-message ticket-message--info" role="status">{l10n.t(mode === 'phone' ? 'ამ ნომერზე შეკვეთა ვერ მოიძებნა. გადაამოწმეთ ნომერი ან მოძებნეთ სერვისის კოდით.' : 'სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.')}</div> : null}
              {state === 'error' ? <div id={`${queryId}-error`} className="ticket-message ticket-message--error" role="alert">{l10n.t(errorMessage)}</div> : null}
            </>
          )}
        </div>

        {!embedded && <aside className="cabinet-promo">
          <span className="cabinet-promo__icon"><img src="/assets/icons/user-blue.svg" alt="" /></span>
          <h3 className="display-title">{label('ხშირად სარგებლობთ ჩვენი სერვისებით?')}</h3>
          <p>{l10n.t('კაბინეტში მარტივად ნახავთ აქტიურ სერვისებს, მომსახურების ისტორიას, შეტყობინებებსა და შეთავაზებებს.')}</p>
          <button type="button" onClick={() => { if (account.user) window.location.assign(l10n.href('/account/')!); else account.openAuth('login') }}>
            <img src="/assets/icons/user-header.svg" alt="" />
            <span>{label('კაბინეტში შესვლა')}</span>
          </button>
          <span className="cabinet-promo__status">{l10n.locale === 'en' ? 'Your services and purchases in one place' : 'თქვენი სერვისები და შესყიდვები ერთ სივრცეში'}</span>
        </aside>}
      </div>
      {state === 'found' && foundTickets.length > 0 ? <div className="ticket-lookup-results" ref={resultRef} tabIndex={-1} role="region" aria-label={l10n.t('მოძებნილი შეკვეთები')}>
        {foundTickets.map(ticket => <TicketResult key={ticket.id} ticket={ticket} />)}
      </div> : null}
    </section>
  )
}
