import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import { customerApi, CustomerApiError } from './customerApi'
import { accountDate } from './accountFormat'
import { dashboardCopy } from './dashboardCopy'
import { InvoiceButton } from './InvoiceButton'
import { PurchaseProducts } from './CustomerPurchaseCard'
import type { CustomerAddress, CustomerPurchase } from './types'
import '../styles/account-settings.css'

export function CustomerAddresses({ isPreview, active }: { isPreview: boolean; active: boolean }) {
  const { locale } = useTranslation()
  const text = (ka: string, en: string) => locale === 'ka' ? ka : en
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<CustomerAddress | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [revision, setRevision] = useState(0)
  const savingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const removeButtonsRef = useRef(new Map<string, HTMLButtonElement>())
  const focusTargetRef = useRef<{ action: 'confirm' | 'remove' | 'add'; id?: string } | null>(null)
  const failure = (cause: unknown) => cause instanceof CustomerApiError && [401, 403].includes(cause.status)
    ? text('ხელახლა გაიარეთ ავტორიზაცია.', 'Please sign in again.')
    : text('ცვლილება ვერ შესრულდა. სცადეთ ხელახლა.', 'The change could not be completed. Please try again.')
  useEffect(() => {
    if (!active || loaded) return
    if (isPreview && import.meta.env.DEV) { setLoaded(true); return }
    const controller = new AbortController()
    setLoading(true); setError('')
    customerApi.addresses(controller.signal).then(value => {
      if (!controller.signal.aborted) { setAddresses(value); setLoaded(true) }
    }).catch(cause => { if (!controller.signal.aborted) setError(failure(cause)) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [active, loaded, isPreview, revision])

  useEffect(() => {
    if (!active) { focusTargetRef.current = null; return }
    if (saving || !focusTargetRef.current) return
    const target = focusTargetRef.current
    const button = target.action === 'confirm' ? confirmButtonRef.current
      : target.action === 'remove' && target.id ? removeButtonsRef.current.get(target.id) ?? addButtonRef.current
        : addButtonRef.current
    button?.focus({ preventScroll: true })
    focusTargetRef.current = null
  }, [active, deleting, draft, saving, addresses])

  function cancelRemoval(id: string) {
    if (savingRef.current) return
    focusTargetRef.current = { action: 'remove', id }
    setDeleting(null)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft || savingRef.current) return
    const payload = { label: draft.label.trim(), city: draft.city.trim(), address: draft.address.trim() }
    const missing = (Object.keys(payload) as (keyof typeof payload)[]).find(field => !payload[field])
    if (missing) {
      setMessage(''); setError(text('შეავსეთ მისამართის ყველა ველი.', 'Complete all address fields.'))
      formRef.current?.querySelector<HTMLInputElement>(`input[name="${missing}"]`)?.focus()
      return
    }
    savingRef.current = true
    setSaving(true); setError(''); setMessage('')
    try {
      const saved = isPreview && import.meta.env.DEV ? { ...payload, id: draft.id || crypto.randomUUID() } : await customerApi.saveAddress(payload, draft.id || undefined)
      setAddresses(values => draft.id ? values.map(value => value.id === saved.id ? saved : value) : [...values, saved])
      focusTargetRef.current = { action: 'add' }
      setDraft(null); setMessage(isPreview ? text('მისამართი ამ გვერდზე დაემატა. რეალურ ანგარიშში ცვლილება არ შენახულა.', 'Address updated on this page. Nothing was saved to a real account.') : text('მისამართი შენახულია.', 'Address saved.'))
    } catch (cause) { setError(failure(cause)) }
    finally { savingRef.current = false; setSaving(false) }
  }
  async function remove(id: string) {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true); setError(''); setMessage('')
    try {
      if (!(isPreview && import.meta.env.DEV)) await customerApi.deleteAddress(id)
      focusTargetRef.current = { action: 'add' }
      setAddresses(values => values.filter(value => value.id !== id)); setDeleting(null)
      setMessage(isPreview ? text('მისამართი ამ გვერდიდან წაიშალა. რეალურ ანგარიშში ცვლილება არ შესრულებულა.', 'Address removed from this page. No real account was changed.') : text('მისამართი წაშლილია.', 'Address removed.'))
    } catch (cause) { focusTargetRef.current = { action: 'confirm' }; setError(failure(cause)) }
    finally { savingRef.current = false; setSaving(false) }
  }
  return <div className="account-settings">
    {loading && !loaded && <p role="status">{text('იტვირთება…', 'Loading…')}</p>}
    {error && <p id="customer-address-error" className="account-settings__error" role="alert">{error}{!loaded && <button type="button" onClick={() => setRevision(value => value + 1)}>{text('ხელახლა ცდა', 'Try again')}</button>}</p>}
    {message && <p className="account-settings__success" role="status">{message}</p>}
    {!draft && loaded && <>
      <div className="account-addresses">{addresses.map(value => <article className="account-address" key={value.id}>
        <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg><div><h3>{value.label}</h3><p>{value.city}<br />{value.address}</p>
          {deleting === value.id ? <div className="account-settings__confirmation" role="group" aria-label={`${text('მისამართის წაშლის დადასტურება', 'Confirm address removal')}: ${value.label}`} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); cancelRemoval(value.id) } }}><p>{text('წავშალოთ ეს მისამართი?', 'Remove this address?')}</p><button ref={confirmButtonRef} type="button" disabled={saving} onClick={() => void remove(value.id)}>{text('წაშლა', 'Remove')}</button><button type="button" disabled={saving} onClick={() => cancelRemoval(value.id)}>{text('გაუქმება', 'Cancel')}</button></div>
            : <div className="account-settings__inline-actions"><button type="button" disabled={saving} onClick={() => { setDraft({ ...value }); setDeleting(null); setMessage(''); setError('') }}>{text('რედაქტირება', 'Edit')}</button><button ref={node => { if (node) removeButtonsRef.current.set(value.id, node); else removeButtonsRef.current.delete(value.id) }} type="button" disabled={saving} onClick={() => { focusTargetRef.current = { action: 'confirm' }; setDeleting(value.id) }}>{text('წაშლა', 'Remove')}</button></div>}
        </div>
      </article>)}</div>
      {!addresses.length && <p className="account-settings__empty">{text('შენახული მისამართები ჯერ არ გაქვთ.', 'You have no saved addresses yet.')}</p>}
      <button ref={addButtonRef} type="button" className="account-settings__add" disabled={saving} onClick={() => { setDraft({ id: '', label: '', city: '', address: '' }); setDeleting(null); setMessage(''); setError('') }}>+ {text('მისამართის დამატება', 'Add an address')}</button>
    </>}
    {draft && <form ref={formRef} className="account-settings__form" onSubmit={event => void save(event)} aria-busy={saving}>
      <label className="account-settings__field">{text('დასახელება', 'Label')}<input name="label" autoFocus required maxLength={60} autoComplete="off" value={draft.label} onChange={event => setDraft({ ...draft, label: event.target.value })} disabled={saving} aria-invalid={error && !draft.label.trim() ? true : undefined} aria-describedby={error && !draft.label.trim() ? 'customer-address-error' : undefined} placeholder={text('მაგალითად, სახლი', 'For example, home')} /></label>
      <label className="account-settings__field">{text('ქალაქი', 'City')}<input name="city" required maxLength={100} autoComplete="address-level2" value={draft.city} onChange={event => setDraft({ ...draft, city: event.target.value })} disabled={saving} aria-invalid={error && !draft.city.trim() ? true : undefined} aria-describedby={error && !draft.city.trim() ? 'customer-address-error' : undefined} /></label>
      <label className="account-settings__field">{text('მისამართი', 'Street address')}<input name="address" required maxLength={300} autoComplete="street-address" value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })} disabled={saving} aria-invalid={error && !draft.address.trim() ? true : undefined} aria-describedby={error && !draft.address.trim() ? 'customer-address-error' : undefined} /></label>
      <button className="account-settings__primary" disabled={saving}>{saving ? text('ინახება…', 'Saving…') : text('შენახვა', 'Save')}</button>
      <button className="account-settings__cancel" type="button" disabled={saving} onClick={() => { focusTargetRef.current = { action: 'add' }; setDraft(null); setError('') }}>{text('გაუქმება', 'Cancel')}</button>
    </form>}
  </div>
}

export function CustomerPassword({ isPreview, onChanged }: { isPreview: boolean; onChanged: () => void }) {
  const { locale } = useTranslation()
  const text = (ka: string, en: string) => locale === 'ka' ? ka : en
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const busyRef = useRef(false)
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busyRef.current) return
    setError(''); setSuccess('')
    if (password !== confirm) { setError(text('ახალი პაროლები ერთმანეთს არ ემთხვევა.', 'The new passwords do not match.')); return }
    if (password.length < 8 || Array.from(password).length < 8 || !/\p{L}/u.test(password) || !/\d/.test(password) || new TextEncoder().encode(password).length > 72) { setError(text('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, ასოებსა და ციფრებს (არაუმეტეს 72 ბაიტისა).', 'Use at least 8 characters, including letters and numbers (maximum 72 bytes).')); return }
    if (password === current) { setError(text('ახალი პაროლი მიმდინარე პაროლისგან უნდა განსხვავდებოდეს.', 'Choose a new password that differs from your current password.')); return }
    busyRef.current = true
    setBusy(true)
    try {
      if (isPreview && import.meta.env.DEV) {
        setSuccess(text('პაროლი არ შეცვლილა — ამ ხედში ცვლილება არ ინახება.', 'Your password was not changed — changes are not saved in this view.'))
      } else { await customerApi.changePassword(current, password); onChanged() }
      setCurrent(''); setPassword(''); setConfirm('')
    } catch (cause) {
      setCurrent('')
      setError(cause instanceof CustomerApiError && cause.status === 403 ? text('მიმდინარე პაროლი არასწორია ან ცვლილება მიუწვდომელია.', 'The current password is incorrect or this action is unavailable.')
        : cause instanceof CustomerApiError && cause.status === 401 ? text('სესია დასრულდა. ხელახლა გაიარეთ ავტორიზაცია.', 'Your session has expired. Please sign in again.')
          : cause instanceof CustomerApiError && cause.status === 429 ? text('დაფიქსირდა ბევრი მცდელობა. მოგვიანებით სცადეთ.', 'Too many attempts. Please try again later.')
            : text('პაროლი ვერ შეიცვალა. გადაამოწმეთ ველები და სცადეთ ხელახლა.', 'Password change was not confirmed. Check the fields and try again.'))
    } finally { busyRef.current = false; setBusy(false) }
  }
  return <form className="account-settings account-settings__form" onSubmit={event => void submit(event)} aria-busy={busy}>
    <label className="account-settings__field">{text('მიმდინარე პაროლი', 'Current password')}<input type="password" autoComplete="current-password" required maxLength={128} value={current} disabled={busy} onChange={event => setCurrent(event.target.value)} /></label>
    <label className="account-settings__field">{text('ახალი პაროლი', 'New password')}<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} disabled={busy} onChange={event => setPassword(event.target.value)} /></label>
    <label className="account-settings__field">{text('გაიმეორეთ ახალი პაროლი', 'Confirm new password')}<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirm} disabled={busy} onChange={event => setConfirm(event.target.value)} /></label>
    {error && <p className="account-settings__error" role="alert">{error}</p>}
    {success && <p className="account-settings__success" role="status">{success}</p>}
    <button className="account-settings__primary" disabled={busy}>{busy ? text('ინახება…', 'Saving…') : text('პაროლის შეცვლა', 'Change password')}</button>
    {!isPreview && <p className="account-settings__note">{text('შეცვლის შემდეგ ყველა მოწყობილობაზე ხელახლა შესვლა დაგჭირდებათ.', 'After changing your password, sign in again on all devices.')}</p>}
  </form>
}

export function CustomerPayments({ purchases, isPreview }: { purchases: CustomerPurchase[]; isPreview: boolean }) {
  const { locale } = useTranslation()
  const text = (ka: string, en: string) => locale === 'ka' ? ka : en
  const copy = dashboardCopy[locale]
  const [bank, setBank] = useState<'bog' | 'tbc'>('bog')
  const [remember, setRemember] = useState(false)
  const [showNotice, setShowNotice] = useState(false)
  return <div className="account-settings account-settings--payments">
    <section className="account-bank-cards" aria-label={text('შენახული ბარათები', 'Saved cards')}>
      <div className="account-bank-cards__empty">
        <span className="account-bank-cards__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /></svg></span>
        <div><h3>{toGeorgianMtavruli(text('თქვენი ბარათები', 'Your cards'))}</h3><p>{text('დამახსოვრებული ბარათები აქ გამოჩნდება.', 'Your saved cards will appear here.')}</p></div>
      </div>
      <details className="account-bank-setup" onToggle={event => { if (!event.currentTarget.open) { setShowNotice(false); setRemember(false) } }}>
        <summary><span aria-hidden="true">+</span>{text('ბარათის დამატება', 'Add a card')}</summary>
        <form onSubmit={event => { event.preventDefault(); setShowNotice(true) }}>
          <fieldset className="account-bank-options">
            <legend>{text('აირჩიეთ გადახდის პროვაიდერი', 'Choose a payment provider')}</legend>
            {(['bog', 'tbc'] as const).map(value => <label key={value} className={`account-bank-option account-bank-option--${value}`}>
              <input type="radio" name="payment-provider" value={value} checked={bank === value} onChange={() => { setBank(value); setShowNotice(false) }} />
              <img className="account-bank-option__mark" src={value === 'bog' ? '/assets/brand/bank-of-georgia.svg' : '/assets/brand/tbc-bank.svg'} width="40" height="40" alt="" />
              <span>{value === 'bog' ? text('საქართველოს ბანკი', 'Bank of Georgia') : text('თიბისი', 'TBC Bank')}</span>
            </label>)}
          </fieldset>
          <label className="account-bank-remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /><span>{text('დავიმახსოვრო ბარათი შემდეგი გადახდებისთვის', 'Remember my card for future payments')}</span></label>
          <p className="account-bank-setup__note">{text('ვიზუალური ვერსია — ბანკთან კავშირი ჯერ არ არის ჩართული. ბარათის მონაცემებს აქ არ ვაგროვებთ.', 'Visual preview — bank integration is not connected yet. No card details are collected here.')}</p>
          <button type="submit" className="account-settings__primary">{text('გაგრძელება', 'Continue')}<span aria-hidden="true">→</span></button>
          {showNotice && <p className="account-bank-setup__status" role="status">{text('ბარათის დამატება ხელმისაწვდომი გახდება ბანკის ინტეგრაციის შემდეგ. ამ ეტაპზე ბარათი არ დამატებულა და თანხა არ ჩამოჭრილა.', 'Card linking will be available after bank integration. No card was added and no payment was made.')}</p>}
        </form>
      </details>
    </section>
    <h3 className="account-payment-history-title">{toGeorgianMtavruli(text('გადახდის ისტორია', 'Payment history'))}</h3>
    {!purchases.length && <p className="account-settings__empty">{text('გადახდის ჩანაწერები ჯერ არ არის.', 'There are no payment records yet.')}</p>}
    <div className="account-payment-list">{purchases.map(purchase => <article key={purchase.id} className="account-payment-row">
      <details className="account-payment-disclosure">
        <summary aria-label={`${copy.order} ${purchase.order_number || copy.missing} — ${copy.details}`}>
          <span className="account-payment-row__identity"><h3>{purchase.order_number || copy.missing}</h3><time dateTime={purchase.created_at}>{accountDate(purchase.created_at, locale)}</time></span>
          <span className="account-payment-row__status" data-payment-status={purchase.payment_status}>{Object.hasOwn(copy.statusLabels, purchase.payment_status) ? copy.statusLabels[purchase.payment_status] : purchase.payment_status || copy.missing}</span>
          <span className="account-payment-row__amount"><small>{text('შეკვეთის ჯამი', 'Order total')}</small><strong>{new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-GB', { maximumFractionDigits: 2 }).format(purchase.total)} {purchase.currency.toUpperCase() === 'GEL' ? '₾' : purchase.currency.toUpperCase()}</strong></span>
          <svg className="account-payment-row__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="account-payment-row__products"><PurchaseProducts purchase={purchase} locale={locale} /></div>
      </details>
      <InvoiceButton target={{ kind: 'purchase', id: purchase.id, reference: purchase.order_number }} locale={locale} isPreview={isPreview} />
    </article>)}</div>
  </div>
}
