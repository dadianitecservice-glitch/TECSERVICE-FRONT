import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SectionHeader } from '../components/SectionHeader'
import { TicketResult } from '../components/TicketResult'
import { OtpVerification } from '../components/OtpVerification'
import { findTicketByCode, tickets } from '../data/tickets'

type SearchMode = 'code' | 'phone'
type SearchState = 'default' | 'loading' | 'found' | 'not-found' | 'otp' | 'error'

export function TicketLookup() {
  const [mode, setMode] = useState<SearchMode>('code')
  const [value, setValue] = useState('')
  const [state, setState] = useState<SearchState>('default')
  const [errorMessage, setErrorMessage] = useState('')
  const pendingLookup = useRef<number | null>(null)

  const cancelPendingLookup = () => {
    if (pendingLookup.current !== null) {
      window.clearTimeout(pendingLookup.current)
      pendingLookup.current = null
    }
  }

  useEffect(() => () => cancelPendingLookup(), [])

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
      setErrorMessage('შეავსეთ ველი სწორად.')
      setState('error')
      return
    }
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
    if (code === '123456') {
      setErrorMessage('')
      setState('found')
    } else {
      setErrorMessage('კოდი არასწორია. დემო კოდია 123456.')
      setState('error')
    }
  }

  return (
    <section className="ticket-section" id="ticket" aria-labelledby="ticket-heading">
      <SectionHeader headingId="ticket-heading" title="სერვისის სტატუსი" description="შეამოწმეთ შეკეთების მიმდინარე სტატუსი რეგისტრაციის გარეშე." />
      <div className="ticket-layout">
        <div className="ticket-search-panel">
          {state === 'otp' ? (
            <OtpVerification phone={value} onConfirm={confirmOtp} onBack={() => setState('default')} />
          ) : (
            <>
              <div className="ticket-search-panel__intro">
                <h3 className="display-title">მოძებნეთ სერვისი</h3>
                <span>რეგისტრაცია არ არის საჭირო</span>
              </div>
              <div className="ticket-tabs" role="tablist" aria-label="ძებნის მეთოდი">
                <button role="tab" aria-selected={mode === 'code'} className={mode === 'code' ? 'is-active' : ''} onClick={() => selectMode('code')} type="button">სერვისის კოდით</button>
                <button role="tab" aria-selected={mode === 'phone'} className={mode === 'phone' ? 'is-active' : ''} onClick={() => selectMode('phone')} type="button">ტელეფონის ნომრით</button>
              </div>
              <form className="ticket-form" onSubmit={submitLookup}>
                <label htmlFor="ticket-query">{mode === 'code' ? 'სერვისის კოდი' : 'ტელეფონის ნომერი'}</label>
                <div className="ticket-form__row">
                  <input
                    id="ticket-query"
                    value={value}
                    onChange={(event) => {
                      cancelPendingLookup()
                      setValue(event.target.value)
                      setErrorMessage('')
                      setState('default')
                    }}
                    placeholder={mode === 'code' ? 'მაგ: TS-2026-001245' : 'მაგ: +995 591 47 40 40'}
                    inputMode={mode === 'phone' ? 'tel' : 'text'}
                  />
                  <button className="ticket-search-button" type="submit" disabled={state === 'loading'}>
                    <img src="/assets/icons/search-white.svg" alt="" />
                    {state === 'loading' ? 'იძებნება...' : 'ძიება'}
                  </button>
                </div>
                <p>{mode === 'code' ? 'კოდი მითითებულია სერვისის მიღების დოკუმენტზე.' : 'ნომერზე გამოიგზავნება ერთჯერადი SMS-კოდი.'}</p>
              </form>
              <div className="ticket-verification-note">
                <img src="/assets/icons/shield.svg" alt="" />
                <span>ტელეფონით ძებნისას შესაძლოა საჭირო იყოს ერთჯერადი SMS-კოდი.</span>
              </div>
              {state === 'not-found' ? <div className="ticket-message ticket-message--info" role="status">სერვისი ვერ მოიძებნა. გადაამოწმეთ კოდი და სცადეთ ხელახლა.</div> : null}
              {state === 'error' ? <div className="ticket-message ticket-message--error" role="alert">{errorMessage}</div> : null}
            </>
          )}
        </div>

        <aside className="cabinet-promo">
          <span className="cabinet-promo__icon"><img src="/assets/icons/user-blue.svg" alt="" /></span>
          <h3 className="display-title">ხშირად სარგებლობთ ჩვენი სერვისებით?</h3>
          <p>კაბინეტში მარტივად ნახავთ აქტიურ სერვისებს, მომსახურების ისტორიას, შეტყობინებებსა და შეთავაზებებს.</p>
          <button type="button">
            <img src="/assets/icons/user-header.svg" alt="" />
            <span>კაბინეტში შესვლა</span>
          </button>
          <a href="/cabinet#register">დარეგისტრირდი →</a>
        </aside>
      </div>
      {state === 'found' ? <TicketResult ticket={tickets[0]} /> : null}
    </section>
  )
}
