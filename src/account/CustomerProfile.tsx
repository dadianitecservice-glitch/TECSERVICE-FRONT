import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import { CustomerApiError, type CustomerProfileUpdate } from './customerApi'
import type { CustomerUser } from './types'
import '../styles/account-profile.css'

export type CustomerProfileProps = {
  user: CustomerUser
  isPreview: boolean
  onSave: (payload: CustomerProfileUpdate) => Promise<void>
}

const profileCopy = {
  ka: {
    phone: 'ტელეფონის ნომერი', email: 'ელფოსტა', firstName: 'სახელი', lastName: 'გვარი',
    personalId: 'პირადი ნომერი', optional: 'არასავალდებულო',
    edit: 'რედაქტირება', missing: 'არ არის მითითებული', update: 'განახლება', saving: 'ინახება…',
    phoneNote: 'რეგისტრაციის ნომერი დაცულია. ამ ნომერს უკავშირდება ანგარიშში შესვლა და მომსახურების ისტორია.',
    nameError: 'მიუთითეთ სახელი. სახელი და გვარი ერთად უნდა შეიცავდეს 2–160 სიმბოლოს.',
    georgianIdError: 'პირადი ნომერი უნდა შეიცავდეს 11 ციფრს. ველის შევსება არასავალდებულოა.',
    otherIdError: 'მიუთითეთ 3–30 ლათინური ასო, ციფრი ან დეფისი, ან დატოვეთ ველი ცარიელი.',
    confirmTitle: 'ცვლილებების დადასტურება', password: 'მიმდინარე პაროლი',
    passwordHint: 'უსაფრთხოებისთვის შეიყვანეთ მიმდინარე პაროლი.',
    showPassword: 'პაროლის ჩვენება', hidePassword: 'პაროლის დამალვა',
    confirm: 'შენახვა', cancel: 'გაუქმება', saved: 'პროფილი განახლდა.',
    previewSaved: 'ნიმუში განახლდა. რეალურ ანგარიშში ცვლილება არ შენახულა.',
    wrongPassword: 'მიმდინარე პაროლი არასწორია. სცადეთ ხელახლა.',
    emailConflict: 'ამ ელფოსტით განახლება ვერ მოხერხდა. მიუთითეთ სხვა მისამართი.',
    invalid: 'გადაამოწმეთ შეყვანილი ინფორმაცია.',
    expired: 'სესია დასრულდა. ცვლილების შესანახად ხელახლა შედით.',
    denied: 'პროფილის განახლება მიუწვდომელია.',
    tooMany: 'დაფიქსირდა ბევრი მცდელობა. 15 წუთის შემდეგ სცადეთ ხელახლა.',
    failed: 'შენახვა ვერ დადასტურდა. სცადეთ ხელახლა.',
  },
  en: {
    phone: 'Phone number', email: 'Email', firstName: 'First name', lastName: 'Surname',
    personalId: 'Personal ID', optional: 'optional',
    edit: 'Edit', missing: 'Not provided', update: 'Update', saving: 'Saving…',
    phoneNote: 'Your registered number is protected. Sign-in and your service history are linked to it.',
    nameError: 'Enter a first name. Your full name must contain 2–160 characters in total.',
    georgianIdError: 'Use an 11-digit personal ID, or leave this optional field blank.',
    otherIdError: 'Use 3–30 Latin letters, numbers or hyphens, or leave this optional field blank.',
    confirmTitle: 'Confirm your changes', password: 'Current password',
    passwordHint: 'For security, enter your current password.',
    showPassword: 'Show password', hidePassword: 'Hide password',
    confirm: 'Save changes', cancel: 'Cancel', saved: 'Your profile has been updated.',
    previewSaved: 'Sample updated. Nothing was saved to a real account.',
    wrongPassword: 'Your current password is incorrect. Please try again.',
    emailConflict: 'The profile could not be updated with this email. Use another address.',
    invalid: 'Please check the information you entered.',
    expired: 'Your session has expired. Sign in again to save your changes.',
    denied: 'Profile updates are unavailable for this account.',
    tooMany: 'Too many attempts. Please try again in 15 minutes.',
    failed: 'Your changes were not confirmed as saved. Please try again.',
  },
}

function splitName(value: string) {
  const [firstName = '', ...rest] = value.trim().split(/\s+/)
  return { firstName, lastName: rest.join(' ') }
}

function EditPencil() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15v5ZM12 20h8" /></svg>
}

type ProfileDraft = Omit<CustomerProfileUpdate, 'current_password'>
type InvalidField = 'name' | 'personal_id' | null

export function CustomerProfile({ user, isPreview, onSave }: CustomerProfileProps) {
  const { locale } = useTranslation()
  const copy = profileCopy[locale]
  const initialName = splitName(user.full_name)
  const [firstName, setFirstName] = useState(initialName.firstName)
  const [lastName, setLastName] = useState(initialName.lastName)
  const [email, setEmail] = useState(user.email ?? '')
  const citizen = user.is_georgian_citizen ?? null
  const [personalId, setPersonalId] = useState(user.personal_id ?? '')
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [invalidField, setInvalidField] = useState<InvalidField>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const personalIdRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const updateRef = useRef<HTMLButtonElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const pendingRef = useRef<ProfileDraft | null>(null)
  const savingRef = useRef(false)
  const generationRef = useRef(0)

  useEffect(() => {
    const name = splitName(user.full_name)
    setFirstName(name.firstName); setLastName(name.lastName); setEmail(user.email ?? '')
    setPersonalId(user.personal_id ?? '')
  }, [user.id, user.full_name, user.email, user.is_georgian_citizen, user.personal_id])

  useEffect(() => {
    savingRef.current = false
    pendingRef.current = null
    setConfirming(false); setPassword(''); setShowPassword(false); setSaving(false)
    setError(''); setSuccess(''); setInvalidField(null)
    return () => { generationRef.current++; pendingRef.current = null }
  }, [user.id, isPreview])

  useEffect(() => {
    if (!confirming) return
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    passwordRef.current?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      updateRef.current?.focus({ preventScroll: true })
    }
  }, [confirming])

  const changed = () => { setError(''); setSuccess(''); setInvalidField(null) }
  const closeConfirmation = () => {
    if (savingRef.current) return
    pendingRef.current = null
    setConfirming(false); setPassword(''); setShowPassword(false); setError('')
  }
  const draft = (): ProfileDraft | null => {
    const first = firstName.trim().replace(/\s+/g, ' ')
    const last = lastName.trim().replace(/\s+/g, ' ')
    const fullName = [first, last].filter(Boolean).join(' ')
    if (!first || fullName.length < 2 || fullName.length > 160) {
      setError(copy.nameError); setInvalidField('name'); firstNameRef.current?.focus(); return null
    }
    const cleanId = personalId.trim()
    if (cleanId && !(citizen === true ? /^\d{11}$/ : /^[A-Za-z0-9-]{3,30}$/).test(cleanId)) {
      setError(citizen === true ? copy.georgianIdError : copy.otherIdError)
      setInvalidField('personal_id'); personalIdRef.current?.focus(); return null
    }
    // Citizenship is no longer editable here. Omitting it preserves the stored value.
    return { full_name: fullName, email: email.trim().toLowerCase() || null, personal_id: cleanId || null }
  }

  const save = async (payload: ProfileDraft, currentPassword: string) => {
    if (savingRef.current) return
    savingRef.current = true
    const generation = generationRef.current
    setSaving(true); setError(''); setSuccess('')
    try {
      await onSave({ ...payload, current_password: currentPassword })
      if (generation !== generationRef.current) return
      pendingRef.current = null
      setConfirming(false); setPassword(''); setShowPassword(false)
      setSuccess(isPreview ? copy.previewSaved : copy.saved)
    } catch (cause) {
      if (generation !== generationRef.current) return
      let message = copy.failed
      if (cause instanceof CustomerApiError) {
        if (cause.status === 401) message = copy.expired
        else if (cause.status === 403) message = /current password/i.test(cause.reason) ? copy.wrongPassword : copy.denied
        else if (cause.status === 409) message = copy.emailConflict
        else if (cause.status === 422) message = copy.invalid
        else if (cause.status === 429) message = copy.tooMany
      }
      setError(message); setPassword(''); setShowPassword(false)
      window.requestAnimationFrame(() => messageRef.current?.focus())
    } finally {
      if (generation === generationRef.current) { savingRef.current = false; setSaving(false) }
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (savingRef.current || confirming) return
    const payload = draft()
    if (!payload) return
    setError(''); setSuccess(''); setInvalidField(null)
    if (isPreview) { await save(payload, ''); return }
    pendingRef.current = payload
    setPassword(''); setShowPassword(false); setConfirming(true)
  }

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPreview || !pendingRef.current || savingRef.current || !password) return
    await save(pendingRef.current, password)
  }

  return <div className="account-profile-editor">
    {success && <p className="account-profile-editor__success" role="status">{success}</p>}
    <form className="account-profile-editor__form" onSubmit={event => { void submit(event) }} aria-busy={saving}>
      <div className="account-profile-editor__grid">
        <div className="account-profile-editor__phone" title={copy.phoneNote}>
          <span id="customer-profile-phone-label">{copy.phone}</span>
          <strong aria-labelledby="customer-profile-phone-label" aria-describedby="customer-profile-phone-note">{user.phone || copy.missing}</strong>
        </div>
        <div className={`account-profile-editor__field${email ? ' has-value' : ''}`}>
          <label htmlFor="customer-profile-email">{copy.email}</label>
          <input id="customer-profile-email" ref={emailRef} type="email" name="email" autoComplete="email" maxLength={254} value={email} onChange={event => { setEmail(event.target.value); changed() }} disabled={saving || confirming} />
          <button type="button" className="account-profile-editor__pencil" aria-label={`${copy.edit}: ${copy.email}`} onClick={() => emailRef.current?.focus()} disabled={saving || confirming}><EditPencil /></button>
        </div>
        <div className={`account-profile-editor__field${firstName ? ' has-value' : ''}`}>
          <label htmlFor="customer-profile-first-name">{copy.firstName}</label>
          <input id="customer-profile-first-name" ref={firstNameRef} type="text" name="first_name" autoComplete="given-name" required maxLength={160} value={firstName} onChange={event => { setFirstName(event.target.value); changed() }} disabled={saving || confirming} aria-invalid={invalidField === 'name' || undefined} aria-describedby={invalidField === 'name' ? 'customer-profile-error' : undefined} />
          <button type="button" className="account-profile-editor__pencil" aria-label={`${copy.edit}: ${copy.firstName}`} onClick={() => firstNameRef.current?.focus()} disabled={saving || confirming}><EditPencil /></button>
        </div>
        <div className={`account-profile-editor__field${lastName ? ' has-value' : ''}`}>
          <label htmlFor="customer-profile-last-name">{copy.lastName}</label>
          <input id="customer-profile-last-name" ref={lastNameRef} type="text" name="last_name" autoComplete="family-name" maxLength={160} value={lastName} onChange={event => { setLastName(event.target.value); changed() }} disabled={saving || confirming} />
          <button type="button" className="account-profile-editor__pencil" aria-label={`${copy.edit}: ${copy.lastName}`} onClick={() => lastNameRef.current?.focus()} disabled={saving || confirming}><EditPencil /></button>
        </div>
        <div className={`account-profile-editor__field${personalId ? ' has-value' : ''}`}>
          <label htmlFor="customer-profile-personal-id">{copy.personalId}<span className="account-sr-only"> ({copy.optional})</span></label>
          <input id="customer-profile-personal-id" ref={personalIdRef} type="text" name="personal_id" autoComplete="off" inputMode={citizen === true ? 'numeric' : 'text'} maxLength={30} value={personalId} onChange={event => { setPersonalId(event.target.value); changed() }} disabled={saving || confirming} aria-invalid={invalidField === 'personal_id' || undefined} aria-describedby={invalidField === 'personal_id' ? 'customer-profile-error' : undefined} />
          <button type="button" className="account-profile-editor__pencil" aria-label={`${copy.edit}: ${copy.personalId}`} onClick={() => personalIdRef.current?.focus()} disabled={saving || confirming}><EditPencil /></button>
        </div>
      </div>
      <p id="customer-profile-phone-note" className="account-sr-only">{copy.phoneNote}</p>
      {!confirming && error && <p id="customer-profile-error" ref={messageRef} className="account-profile-editor__error" role="alert" tabIndex={-1}>{error}</p>}
      <button ref={updateRef} type="submit" className="account-profile-editor__save" disabled={saving || confirming}>{saving ? copy.saving : copy.update}</button>
    </form>
    {confirming && <dialog ref={dialogRef} className="account-profile-confirm" aria-labelledby="customer-profile-confirm-title" aria-describedby="customer-profile-password-hint" onCancel={event => { event.preventDefault(); closeConfirmation() }} onClick={event => { if (event.target === event.currentTarget) closeConfirmation() }}>
      <div className="account-profile-confirm__panel">
        <button type="button" className="account-profile-confirm__close" onClick={closeConfirmation} disabled={saving} aria-label={copy.cancel}><LaptopIcon name="close" /></button>
        <h3 id="customer-profile-confirm-title">{toGeorgianMtavruli(copy.confirmTitle)}</h3>
        <p id="customer-profile-password-hint">{copy.passwordHint}</p>
        <form onSubmit={event => { void confirm(event) }} aria-busy={saving}>
          <div className="account-profile-confirm__password">
            <label htmlFor="customer-profile-password">{copy.password}</label>
            <input id="customer-profile-password" ref={passwordRef} type={showPassword ? 'text' : 'password'} name="current_password" autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)} disabled={saving} aria-describedby="customer-profile-password-hint" />
            <button type="button" onClick={() => setShowPassword(value => !value)} disabled={saving} aria-label={showPassword ? copy.hidePassword : copy.showPassword} aria-pressed={showPassword}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m3 3 18 18" />}</svg>
            </button>
          </div>
          {error && <p ref={messageRef} className="account-profile-editor__error" role="alert" tabIndex={-1}>{error}</p>}
          <button type="submit" className="account-profile-editor__save" disabled={saving}>{saving ? copy.saving : copy.confirm}</button>
          <button type="button" className="account-profile-confirm__cancel" disabled={saving} onClick={closeConfirmation}>{copy.cancel}</button>
        </form>
      </div>
    </dialog>}
  </div>
}
