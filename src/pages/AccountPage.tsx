import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../i18n/LocaleProvider'
import { LaptopIcon } from '../components/LaptopIcon'
import { useCustomerAuth } from '../account/CustomerAuthProvider'
import { customerApi, CustomerApiError, customerErrorMessage, type CustomerProfileUpdate } from '../account/customerApi'
import type { CustomerUser, CustomerTicket, CustomerPurchase } from '../account/types'
import CustomerDashboard from '../account/CustomerDashboard'
import '../styles/account-auth.css'
import '../styles/account-page.css'

type AccountData = { user: CustomerUser; tickets: CustomerTicket[]; purchases: CustomerPurchase[] }

export default function AccountPage() {
  const { locale, href } = useTranslation()
  const auth = useCustomerAuth()
  const [preview, setPreview] = useState<AccountData | null>(null)
  const [canPreview, setCanPreview] = useState(false)
  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const profileGeneration = useRef(0)
  const currentUser = useRef(auth.user)
  currentUser.current = auth.user
  useEffect(() => () => { profileGeneration.current++ }, [])
  const text = (ka: string, en: string) => locale === 'en' ? en : ka

  useEffect(() => {
    let cancelled = false
    if (import.meta.env.DEV) {
      setCanPreview(true)
      if (new URLSearchParams(window.location.search).get('preview') === '1') {
        import('../account/demoAccount').then(module => { if (!cancelled) setPreview(module.getDemoAccount(locale)) })
      }
    }
    return () => { cancelled = true }
  }, [locale])

  useEffect(() => {
    if (!auth.user || auth.user.role !== 'customer' || auth.user.approval_status !== 'approved' || !auth.user.is_active || preview) { setData(null); return }
    const controller = new AbortController()
    const user = auth.user
    setLoading(true); setError('')
    Promise.all([customerApi.tickets(controller.signal), customerApi.purchases(controller.signal)]).then(([tickets, purchases]) => {
      if (!controller.signal.aborted) setData({ user, tickets, purchases })
    }).catch(err => {
      if (controller.signal.aborted) return
      if (err instanceof CustomerApiError && (err.status === 401 || err.status === 403)) { setData(null); auth.clearUser() }
      setError(customerErrorMessage(err, locale === 'en'))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [auth.user, locale, revision, preview])

  const current = preview ?? (data?.user.id === auth.user?.id ? data : null)
  const passwordGeneration = profileGeneration.current
  const signOut = async () => {
    if (savingProfile) return
    profileGeneration.current++
    if (preview) { window.location.assign(href('/account/')!); return }
    setError('')
    try { await auth.logout(); setData(null) }
    catch (err) { setError(customerErrorMessage(err, locale === 'en')) }
  }
  const saveProfile = async (payload: CustomerProfileUpdate) => {
    if (preview) {
      setPreview(value => value ? { ...value, user: { ...value.user, full_name: payload.full_name.trim(), email: payload.email?.trim() || null, contact_phone: payload.contact_phone === undefined ? value.user.contact_phone : payload.contact_phone, is_georgian_citizen: payload.is_georgian_citizen === undefined ? value.user.is_georgian_citizen : payload.is_georgian_citizen, personal_id: payload.personal_id === undefined ? value.user.personal_id : payload.personal_id } } : value)
      return
    }
    const owner = currentUser.current
    if (!owner) throw new CustomerApiError(401)
    const attempt = ++profileGeneration.current
    setSavingProfile(true)
    try {
      const updated = await customerApi.updateProfile(payload)
      if (attempt !== profileGeneration.current || currentUser.current?.id !== owner.id) throw new CustomerApiError(401)
      if (updated.id !== owner.id) throw new CustomerApiError(502)
      setData(value => value?.user.id === owner.id ? { ...value, user: updated } : value)
      auth.acceptUser(updated)
    } catch (err) {
      if (attempt === profileGeneration.current && currentUser.current?.id === owner.id && err instanceof CustomerApiError && err.status === 401) { setData(null); auth.clearUser() }
      throw err
    } finally { if (attempt === profileGeneration.current) setSavingProfile(false) }
  }
  if (current) return <>
    {error && <div className="site-container account-page__notice" role="alert">{error}</div>}
    <CustomerDashboard user={current.user} tickets={current.tickets} purchases={current.purchases} isPreview={!!preview} onLogout={signOut} onSaveProfile={saveProfile} onPasswordChanged={() => {
      if (passwordGeneration !== profileGeneration.current || currentUser.current?.id !== current.user.id) return
      profileGeneration.current++; setData(null); auth.clearUser(); setPasswordChanged(true)
    }} savingProfile={savingProfile} refreshing={loading} />
  </>

  const restricted = !!auth.user && (auth.user.role !== 'customer' || !auth.user.is_active || auth.user.approval_status !== 'approved')
  const waiting = auth.checking || (!!auth.user && !restricted && loading)
  return <main className="account-page account-page--entry">
    <div className="site-container">
      <nav className="account-page__breadcrumb" aria-label={text('ნავიგაციის გზა', 'Breadcrumb')}><a href={href('/')}>{text('მთავარი', 'Home')}</a><span aria-hidden="true">/</span><span>{text('პირადი კაბინეტი', 'My account')}</span></nav>
      <section className="account-page__welcome" aria-labelledby="account-title">
        {passwordChanged && <p className="account-settings__success" role="status">{text('პაროლი შეიცვალა. ხელახლა შედით ახალი პაროლით.', 'Your password was changed. Sign in again with your new password.')}</p>}
        <span className="account-page__lock"><LaptopIcon name="lock" /></span>
        <p className="account-page__eyebrow">TECSERVICE · {text('პირადი სივრცე', 'Personal space')}</p>
        <h1 id="account-title">{text('თქვენი ტექნიკა. ყველაფერი ერთ სივრცეში.', 'Your devices. Everything in one place.')}</h1>
        <p>{text('ნახეთ თქვენი სერვისის მიმდინარე სტატუსი, მომსახურების ისტორია და შესყიდვები.', 'View the current status of your repairs, your service history and your purchases.')}</p>
        {waiting ? <p role="status" className="account-page__loading">{text('კაბინეტი იტვირთება…', 'Loading your account…')}</p> : restricted ? <div className="account-page__restricted"><p>{text('ეს სივრცე დადასტურებული მომხმარებლებისთვისაა. წვდომის საკითხზე დაგვიკავშირდით.', 'This space is for approved customer accounts. Contact us for help with access.')}</p><button className="account-auth__primary" type="button" onClick={signOut}>{text('გასვლა', 'Sign out')}</button></div> : auth.user ? <div className="account-page__restricted"><button type="button" className="account-auth__primary" onClick={() => setRevision(value => value + 1)}>{text('ხელახლა ჩატვირთვა', 'Try again')}</button><button type="button" className="account-auth__text-button" onClick={signOut}>{text('გასვლა', 'Sign out')}</button></div> : <div className="account-page__entry-actions">
          <button type="button" className="account-auth__primary" onClick={() => auth.openAuth('login')}>{text('შესვლა', 'Sign in')}<LaptopIcon name="arrow" /></button>
          <button type="button" className="account-auth__secondary" onClick={() => auth.openAuth('register')}>{text('რეგისტრაცია', 'Register')}</button>
        </div>}
        {error && <p className="account-auth__error" role="alert">{error}</p>}
        {canPreview && <a className="account-page__preview" href={`${href('/account/')}?preview=1`}>{text('კაბინეტის დიზაინის ნახვა', 'View account layout')}</a>}
      </section>
      <div className="account-page__features">
        <article><LaptopIcon name="tool" /><h2>{text('ჩემი სერვისები', 'My services')}</h2><p>{text('ტიკეტები, მოწყობილობები და შეკეთების მიმდინარე მდგომარეობა.', 'Tickets, devices and the current progress of your repairs.')}</p></article>
        <article><LaptopIcon name="briefcase" /><h2>{text('ჩემი შესყიდვები', 'My purchases')}</h2><p>{text('შეკვეთილი პროდუქტები, ღირებულება და შეკვეთის დეტალები.', 'Ordered products, totals and order details.')}</p></article>
        <article><LaptopIcon name="people" /><h2>{text('ჩემი პროფილი', 'My profile')}</h2><p>{text('თქვენი ანგარიშისა და საკონტაქტო მონაცემები.', 'Your account and contact information.')}</p></article>
      </div>
    </div>
  </main>
}
