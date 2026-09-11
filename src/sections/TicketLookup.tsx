import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { TicketResult } from '../components/TicketResult'
import { OtpVerification } from '../components/OtpVerification'
import { DEMO_OTP, findTicketByCode, tickets } from '../data/tickets'
import { toGeorgianMtavruli } from '../utils/text'
import { normalizeGeorgianMobile } from '../utils/validation'
import { useResponsiveHome } from '../hooks/useResponsiveHome'

type SearchMode = 'code' | 'phone'
type SearchState = 'default' | 'loading' | 'found' | 'not-found' | 'otp' | 'error'

export function TicketLookup() {
  const responsive = useResponsiveHome()
  const label = toGeorgianMtavruli
  const [mode, setMode] = useState<SearchMode>('code')
  const [value, setValue] = useState('')
  const [state, setState] = useState<SearchState>('default')
  const [errorMessage, setErrorMessage] = useState('')
  const pendingLookup = useRef<number | null>(null)
  const queryInputRef = useRef<HTMLInputElement>(null)

  const cancelPendingLookup = () => {
    if (pendingLookup.current !== null) {
      window.clearTimeout(pendingLookup.current)
      pendingLookup.current = null
    }
  }

  useEffect(() => () => cancelPendingLookup(), [])

  useEffect(() => {
    const requestedCode = new URLSearchParams(window.location.search).get('service-code')
    if (requestedCode?.trim()) setValue(requestedCode.trim().slice(0, 64))
  }, [])

  const selectMode = (nextMode: SearchMode) => {
    cancelPendingLookup()
    setMode(nextMode)
    setValue('')
    setErrorMessage('')
    setState('default')
  }

  const submitLookup = (event: FormEvent) => {
    event.preventDefault()
    cancelPendingLookup()
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
        setState(findTicketByCode(value) ? 'found' : 'not-found')
      }
    }, 650)
  }

  const confirmOtp = (code: string) => {
    if (code === DEMO_OTP) {
      setErrorMessage('')
      setState('found')
    } else {
      setErrorMessage(code.length === 6 ? 'კოდი არასწორია. სცადეთ ხელახლა.' : 'შეიყვანეთ ექვსივე ციფრი.')
    }
  }

  return (
    <section className="ticket-section" id="ticket" aria-labelledby="ticket-heading">
      <SectionHeader headingId="ticket-heading" title={toGeorgianMtavruli('სერვისის სტატუსი')} description="შეამოწმეთ შეკეთების მიმდინარე სტატუსი რეგისტრაციის გარეშე." />
      <div className="ticket-layout">
        <div className="ticket-search-panel">
          {state === 'otp' ? (
            <OtpVerification
              phone={value}
              errorMessage={errorMessage}
              onCodeChange={() => setErrorMessage('')}
              onConfirm={confirmOtp}
              onBack={() => { setErrorMessage(''); setState('default') }}
            />
          ) : (
            <>
              <div className="ticket-search-panel__intro">
                <h3 className="display-title">{label('მოძებნეთ სერვისი')}</h3>
                <span>რეგისტრაცია არ არის საჭირო</span>
              </div>
              <div className="ticket-tabs" role="tablist" aria-label="ძებნის მეთოდი">
                <button role="tab" aria-selected={mode === 'code'} className={mode === 'code' ? 'is-active' : ''} onClick={() => selectMode('code')} type="button">{label('სერვისის კოდით')}</button>
                <button role="tab" aria-selected={mode === 'phone'} className={mode === 'phone' ? 'is-active' : ''} onClick={() => selectMode('phone')} type="button"><span className="ticket-tabs__phone-full">{label('ტელეფონის ნომრით')}</span><span className="ticket-tabs__phone-short">{label('ტელეფონით')}</span></button>
              </div>
              <form className="ticket-form" onSubmit={submitLookup}>
                <label htmlFor="ticket-query">{mode === 'code' ? responsive ? 'სერვისის კოდი' : label('სერვისის კოდი') : responsive ? 'ტელეფონის ნომერი' : label('ტელეფონის ნომერი')}</label>
                <div className="ticket-form__row">
                  <input
                    ref={queryInputRef}
                    id="ticket-query"
                    type={mode === 'phone' ? 'tel' : 'text'}
                    autoComplete={mode === 'phone' ? 'tel' : 'off'}
                    aria-invalid={state === 'error'}
                    aria-describedby={`ticket-query-help${state === 'error' ? ' ticket-query-error' : ''}`}
                    value={value}
                    onChange={(event) => {
                      cancelPendingLookup()
                      setValue(event.target.value)
                      setErrorMessage('')
                      setState('default')
                    }}
                    placeholder={mode === 'code' ? '#1000' : '+995 5XX XX XX XX'}
                    inputMode={mode === 'phone' ? 'tel' : 'text'}
                  />
                  <button className="ticket-search-button" type="submit" disabled={state === 'loading'}>
                    <img src="/assets/icons/search-white.svg" alt="" />
                    {label(state === 'loading' ? 'იძებნება...' : 'ძიება')}
                  </button>
                </div>
                <p id="ticket-query-help">{mode === 'code' ? 'კოდი მითითებულია სერვისის მიღების დოკუმენტზე.' : 'დემო რეჟიმი — რეალური SMS არ იგზავნება.'}</p>
              </form>
              <div className="ticket-verification-note">
                <img src="/assets/icons/shield.svg" alt="" />
                <span>ტელეფონით ძებნისას შესაძლოა საჭირო იყოს ერთჯერადი SMS-კოდი.</span>
              </div>
              {state === 'not-found' ? <div className="ticket-message ticket-message--info" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</div> : null}
              {state === 'error' ? <div id="ticket-query-error" className="ticket-message ticket-message--error" role="alert">{errorMessage}</div> : null}
            </>
          )}
        </div>

        <aside className="cabinet-promo">
          <span className="cabinet-promo__icon"><img src="/assets/icons/user-blue.svg" alt="" /></span>
          <h3 className="display-title">{label('ხშირად სარგებლობთ ჩვენი სერვისებით?')}</h3>
          <p>კაბინეტში მარტივად ნახავთ აქტიურ სერვისებს, მომსახურების ისტორიას, შეტყობინებებსა და შეთავაზებებს.</p>
          <button type="button" onClick={() => { window.location.href = '/cabinet' }}>
            <img src="/assets/icons/user-header.svg" alt="" />
            <span>{label('კაბინეტში შესვლა')}</span>
          </button>
          <a href="/cabinet#register">{label('დარეგისტრირდი')} →</a>
        </aside>
      </div>
      {state === 'found' ? <TicketResult ticket={tickets[0]} /> : null}
    </section>
  )
}
