import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from '../i18n/LocaleProvider'
import { LaptopIcon } from '../components/LaptopIcon'
import { useCustomerAuth } from './CustomerAuthProvider'
import { customerApi, customerErrorMessage } from './customerApi'
import { normalizeGeorgianMobile } from '../utils/validation'
import '../styles/account-auth.css'

export default function AuthDialog() {
  const { locale, href } = useTranslation()
  const english = locale === 'en'
  const auth = useCustomerAuth()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const attemptRef = useRef(0)
  const busyRef = useRef(false)
  const text = (ka: string, en: string) => english ? en : ka
  const mode = auth.authMode
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !mode) return
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      attemptRef.current++
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [!!mode])
  useEffect(() => { setError(''); setRegistered(false); setShowPassword(false); setBusy(false); busyRef.current = false; attemptRef.current++ }, [mode])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busyRef.current || (mode !== 'login' && mode !== 'register')) return
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const fields = new FormData(form)
    const password = String(fields.get('password') ?? '')
    const fullName = String(fields.get('full_name') ?? '').trim().replace(/\s+/g, ' ')
    const identifier = String(fields.get('identifier') ?? '').trim()
    setError('')
    const attempt = ++attemptRef.current
    if (mode === 'register') {
      if (fullName.length < 2 || fullName.length > 160) { setError(text('სახელი და გვარი უნდა შეიცავდეს 2–160 სიმბოლოს.', 'Your full name must contain 2–160 characters.')); form.querySelector<HTMLInputElement>('[name="full_name"]')?.focus(); return }
      if (!normalizeGeorgianMobile(String(fields.get('phone') ?? ''))) { setError(text('შეიყვანეთ სწორი ქართული მობილურის ნომერი.', 'Enter a valid Georgian mobile number.')); return }
      if (password.length < 8 || Array.from(password).length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password) || new TextEncoder().encode(password).length > 72) { setError(text('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, ასოებსა და ციფრებს (არაუმეტეს 72 ბაიტისა).', 'Use at least 8 characters, including letters and numbers (maximum 72 bytes).')); return }
      if (password !== fields.get('confirm')) { setError(text('პაროლები ერთმანეთს არ ემთხვევა.', 'The passwords do not match.')); return }
    } else if (!identifier) { setError(text('მიუთითეთ მობილურის ნომერი ან ელფოსტა.', 'Enter your mobile number or email.')); form.querySelector<HTMLInputElement>('[name="identifier"]')?.focus(); return }
    busyRef.current = true
    setBusy(true)
    try {
      if (mode === 'register') {
        await customerApi.register({ full_name: fullName, phone: normalizeGeorgianMobile(String(fields.get('phone')) )!, ...(String(fields.get('email') ?? '').trim() ? { email: String(fields.get('email')).trim() } : {}), password })
        if (attempt !== attemptRef.current) return
        form.reset()
        setRegistered(true)
      } else {
        const user = await customerApi.login(identifier, password)
        if (attempt !== attemptRef.current) return
        auth.acceptUser(user)
        auth.closeAuth()
        window.location.assign(href('/account/')!)
      }
    } catch (err) {
      if (attempt === attemptRef.current) setError(customerErrorMessage(err, english))
    } finally { if (attempt === attemptRef.current) { busyRef.current = false; setBusy(false) } }
  }

  if (!mode) return null
  return <dialog ref={dialogRef} className="account-auth" aria-labelledby="account-auth-title" aria-describedby={mode === 'help' || registered ? 'account-auth-intro' : undefined} onCancel={event => { event.preventDefault(); if (!busy) auth.closeAuth() }} onClick={event => { if (event.target === event.currentTarget && !busy) auth.closeAuth() }}>
    <div className="account-auth__panel">
      <button type="button" className="account-auth__close" disabled={busy} onClick={auth.closeAuth} aria-label={text('ფანჯრის დახურვა', 'Close dialog')}><LaptopIcon name="close" /></button>
      <div className="account-auth__brand"><img src="/assets/brand/tecservice-logo.svg" alt="TECSERVICE" width="190" height="40" /></div>
      <h2 id="account-auth-title">{mode === 'help' ? text('შესვლაში დაგეხმარებით', 'Let us help you sign in') : registered ? text('მოთხოვნა მიღებულია', 'Request received') : mode === 'register' ? text('რეგისტრაცია', 'Registration') : text('პროფილი', 'Profile')}</h2>
      {(mode === 'help' || registered) && <p id="account-auth-intro">{mode === 'help' ? text('ანგარიშის აღდგენისთვის დაუკავშირდით ჩვენს გუნდს. პაროლი არავის გაუზიაროთ.', 'Contact our team to recover access to your account. Never share your password.') : text('მონაცემების გადამოწმებისა და ანგარიშის დადასტურების შემდეგ შეძლებთ შესვლას.', 'You can sign in once our team has verified your details and approved your account.')}</p>}
      {mode === 'help' ? <div className="account-auth__help">
        <a className="account-auth__primary" href="tel:+995591474040"><LaptopIcon name="phone" />+995 591 47 40 40</a>
        <a className="account-auth__secondary" href={href('/contact/')}>{text('საკონტაქტო გვერდი', 'Contact page')}<LaptopIcon name="arrow" /></a>
        <button className="account-auth__text-button" onClick={() => auth.openAuth('login')}>{text('შესვლაზე დაბრუნება', 'Back to sign in')}</button>
      </div> : registered ? <div className="account-auth__success">
        <span><LaptopIcon name="check" /></span>
        <p>{text('თქვენი სერვისები და შესყიდვები მხოლოდ ანგარიშის დადასტურების შემდეგ გახდება ხელმისაწვდომი.', 'Your services and purchases become available only after your account is approved.')}</p>
        <button className="account-auth__primary" type="button" onClick={() => auth.openAuth('login')}>{text('შესვლის ფანჯარაზე დაბრუნება', 'Back to sign in')}</button>
      </div> : <>
        <div className="account-auth__tabs" role="group" aria-label={text('ავტორიზაციის მეთოდი', 'Account access')}>
          <button type="button" disabled={busy} aria-pressed={mode === 'login'} onClick={() => auth.openAuth('login')}>{text('შესვლა', 'Sign in')}</button>
          <button type="button" disabled={busy} aria-pressed={mode === 'register'} onClick={() => auth.openAuth('register')}>{text('რეგისტრაცია', 'Register')}</button>
        </div>
        <form key={mode} className="account-auth__form" onSubmit={submit} aria-busy={busy}>
          <fieldset disabled={busy}>
            {mode === 'register' ? <>
              <label htmlFor="account-full-name">{text('სახელი და გვარი', 'Full name')}<input id="account-full-name" name="full_name" autoComplete="name" required minLength={2} maxLength={160} placeholder={text('თქვენი სახელი და გვარი', 'Your full name')} /></label>
              <label htmlFor="account-phone">{text('მობილურის ნომერი', 'Mobile number')}<input id="account-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} placeholder="+995 5XX XX XX XX" /></label>
              <label htmlFor="account-email">{text('ელფოსტა', 'Email')} <small>{text('(არასავალდებულო)', '(optional)')}</small><input id="account-email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="name@example.com" /></label>
            </> : <label htmlFor="account-identifier">{text('მობილურის ნომერი ან ელფოსტა', 'Mobile number or email')}<input id="account-identifier" name="identifier" autoComplete="username" required maxLength={254} placeholder={text('ნომერი ან ელფოსტა', 'Phone number or email')} /></label>}
            <div><label htmlFor="account-password">{text('პაროლი', 'Password')}</label><span className="account-auth__password"><input id="account-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : 1} maxLength={128} /><button type="button" aria-pressed={showPassword} aria-label={showPassword ? text('პაროლის დამალვა', 'Hide password') : text('პაროლის ჩვენება', 'Show password')} onClick={() => setShowPassword(value => !value)}>{showPassword ? text('დამალვა', 'Hide') : text('ჩვენება', 'Show')}</button></span></div>
            {mode === 'register' ? <>
              <label htmlFor="account-confirm">{text('გაიმეორეთ პაროლი', 'Confirm password')}<input id="account-confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
              <label className="account-auth__consent"><input type="checkbox" required name="terms" /><span>{text('გავეცანი', 'I have read the')} <a href={href('/terms/')} target="_blank" rel="noopener noreferrer">{text('მომსახურების პირობებს', 'terms of service')}</a> {text('და', 'and')} <a href={href('/privacy/')} target="_blank" rel="noopener noreferrer">{text('კონფიდენციალურობის პოლიტიკას', 'privacy policy')}</a>.</span></label>
              <p className="account-auth__hint">{text('უსაფრთხოებისთვის ანგარიშს ჩვენი გუნდი გადაამოწმებს და დაადასტურებს.', 'For security, our team will verify and approve your account.')}</p>
            </> : <button className="account-auth__text-button account-auth__forgot" type="button" onClick={() => auth.openAuth('help')}>{text('ვერ შედიხართ ანგარიშში?', 'Having trouble signing in?')}</button>}
            {error && <p className="account-auth__error" role="alert">{error}</p>}
            <button type="submit" className="account-auth__primary">{busy ? text('გთხოვთ, დაელოდოთ…', 'Please wait…') : mode === 'register' ? text('რეგისტრაცია', 'Create account') : text('შესვლა', 'Sign in')}<LaptopIcon name="arrow" /></button>
          </fieldset>
        </form>
      </>}
      <p className="account-auth__footer"><LaptopIcon name="lock" />{text('პირადი ანგარიში · მხოლოდ თქვენი ინფორმაცია', 'Personal account · only your information')}</p>
    </div>
  </dialog>
}
