import { useMemo, useState, type ReactNode } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'
import { dashboardCopy } from './dashboardCopy'
import { CustomerServiceCard } from './CustomerServiceCard'
import { CustomerPurchaseCard } from './CustomerPurchaseCard'
import { CustomerProfile } from './CustomerProfile'
import { CustomerComments } from './CustomerComments'
import { CustomerAddresses, CustomerPassword, CustomerPayments } from './CustomerSettings'
import { filterCustomerTickets, type ServiceCollection } from './serviceCollections'
import { filterCustomerPurchases, type PurchaseCollection } from './purchaseCollections'
import type { CustomerProfileUpdate } from './customerApi'
import type { CustomerPurchase, CustomerTicket, CustomerUser } from './types'
import '../styles/account-dashboard.css'

export type CustomerDashboardProps = {
  user: CustomerUser
  tickets: CustomerTicket[]
  purchases: CustomerPurchase[]
  isPreview: boolean
  onLogout: () => void | Promise<void>
  onSaveProfile: (payload: CustomerProfileUpdate) => Promise<void>
  onPasswordChanged: () => void
  refreshing?: boolean
  savingProfile?: boolean
}

type AccountSection = 'profile' | 'services' | 'purchases' | 'comments' | 'addresses' | 'payments' | 'password'
const sections: AccountSection[] = ['profile', 'services', 'purchases', 'comments', 'addresses', 'payments', 'password']
function recordTime(value: string) { const time = Date.parse(value); return Number.isNaN(time) ? 0 : time }
function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="account-empty"><h3>{toGeorgianMtavruli(title)}</h3><p>{text}</p>{action}</div>
}

export function CustomerDashboard({ user, tickets, purchases, isPreview, onLogout, onSaveProfile, onPasswordChanged, refreshing = false, savingProfile = false }: CustomerDashboardProps) {
  const { locale, href } = useTranslation()
  const copy = dashboardCopy[locale]
  const [section, setSection] = useState<AccountSection>(() => {
    const requested = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('section') : null
    return sections.includes(requested as AccountSection) ? requested as AccountSection : 'services'
  })
  const [serviceFilter, setServiceFilter] = useState<ServiceCollection>('active')
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseCollection>('active')
  const [serviceQuery, setServiceQuery] = useState('')
  const [purchaseQuery, setPurchaseQuery] = useState('')
  const [pendingAction, setPendingAction] = useState<'logout' | null>(null)
  const [actionError, setActionError] = useState(false)
  const sortedTickets = useMemo(() => [...tickets].sort((a,b) => recordTime(b.created_at) - recordTime(a.created_at)), [tickets])
  const sortedPurchases = useMemo(() => [...purchases].sort((a,b) => recordTime(b.created_at) - recordTime(a.created_at)), [purchases])
  const activeTickets = filterCustomerTickets(sortedTickets, 'active')
  const collectedTickets = filterCustomerTickets(sortedTickets, 'collected')
  const activePurchases = filterCustomerPurchases(sortedPurchases, 'active')
  const completedPurchases = filterCustomerPurchases(sortedPurchases, 'completed')
  const collectionTickets = serviceFilter === 'active' ? activeTickets : collectedTickets
  const collectionPurchases = purchaseFilter === 'active' ? activePurchases : completedPurchases
  const deviceLabel = (device?: string | null) => device && Object.hasOwn(copy.deviceLabels, device) ? copy.deviceLabels[device] : device
  const fullName = user.full_name.trim() || copy.customer
  const busy = pendingAction !== null || refreshing || savingProfile
  const ticketKey = (ticket: CustomerTicket,index: number) => `${ticket.ticket_code ?? 'unassigned'}-${ticket.created_at}-${index}`

  const filteredTickets = collectionTickets.filter(ticket => {
    const text = [ticket.ticket_code,ticket.device,deviceLabel(ticket.device),ticket.issue_description,
      ...ticket.items.flatMap(item => [item.device,deviceLabel(item.device)])].join(' ').toLocaleLowerCase()
    return text.includes(serviceQuery.trim().toLocaleLowerCase())
  })
  const filteredPurchases = collectionPurchases.filter(purchase => [purchase.order_number,...purchase.items.map(item => item.name)].join(' ').toLocaleLowerCase().includes(purchaseQuery.trim().toLocaleLowerCase()))

  async function handleLogout() {
    if (busy) return
    setActionError(false); setPendingAction('logout')
    try { await onLogout() }
    catch { setActionError(true) }
    finally { setPendingAction(null) }
  }
  const resetServices = () => { setServiceQuery('') }
  const resetPurchases = () => { setPurchaseQuery('') }
  function showSection(next: AccountSection) {
    setSection(next); setActionError(false)
    if (next === 'services') { setServiceFilter('active'); resetServices() }
    if (next === 'purchases') { setPurchaseFilter('active'); resetPurchases() }
  }
  const contactAction = <a className="account-text-link" href={href('/contact/')}>{copy.contact}<LaptopIcon name="arrow" /></a>

  return <main className="account-dashboard">
    <div className="site-container account-container">
      <header className="account-greeting">
        <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg>
        <h1>{toGeorgianMtavruli(copy.greeting)} <span>{toGeorgianMtavruli(fullName)}</span></h1>
      </header>
      <div className="account-layout">
        <aside className="account-sidebar">
          <div className="account-nav-card">
            <nav className="account-nav" aria-label={copy.navigation}>
              {sections.map((item, index) => <button key={item} type="button" disabled={savingProfile} aria-pressed={section === item} aria-controls="account-panel" onClick={() => showSection(item)}><span className="account-nav__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="account-nav__label">{toGeorgianMtavruli(item === 'profile' ? copy.editProfile : copy[item])}</span></button>)}
            </nav>
          </div>
          <button className="account-signout" type="button" disabled={busy} onClick={() => { void handleLogout() }}><svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4H5v16h4M9 12h12m-4-4 4 4-4 4" /></svg><span>{pendingAction === 'logout' ? copy.loggingOut : copy.logout}</span></button>
        </aside>
        <section className="account-panel" id="account-panel" data-section={section} aria-labelledby="account-panel-title">
          <header className={`account-panel__heading${section === 'services' || section === 'purchases' ? ' account-panel__heading--quiet' : ''}`}>
            <h2 id="account-panel-title" className={section === 'services' || section === 'purchases' ? 'account-sr-only' : undefined}>{toGeorgianMtavruli(section === 'profile' ? copy.editProfile : copy[section])}</h2>
          </header>
          {actionError && <p className="account-action-error" role="alert">{copy.actionError}</p>}
          {section === 'services' && <>
            <div className="account-collection-header"><div className="account-filters" role="group" aria-label={copy.services}>{([
              ['active',copy.currentServices,activeTickets.length],['collected',copy.completedServices,collectedTickets.length],
            ] as const).map(([value,label,count]) => <button key={value} type="button" aria-pressed={serviceFilter === value} onClick={() => { setServiceFilter(value); resetServices() }}>{toGeorgianMtavruli(label)}<span>({count})</span></button>)}</div>
            {collectionTickets.length > 0 && <div className="account-toolbar">
              <div className="account-search"><LaptopIcon name="search" /><label className="account-sr-only" htmlFor="account-service-search">{copy.searchServices}</label><input id="account-service-search" type="search" value={serviceQuery} placeholder={copy.serviceSearchPlaceholder} onChange={event => setServiceQuery(event.target.value)} aria-controls="account-services-list" />{serviceQuery && <button type="button" aria-label={copy.clearSearch} onClick={() => setServiceQuery('')}><LaptopIcon name="close" /></button>}</div>
            </div>}</div>
            <p className="account-result-count account-sr-only" role="status" aria-live="polite">{copy.results}: {filteredTickets.length}</p>
            <div id="account-services-list" className="account-record-grid account-record-grid--services">{filteredTickets.map((ticket,index) => <CustomerServiceCard key={ticketKey(ticket,index)} ticket={ticket} copy={copy} locale={locale} isPreview={isPreview} />)}</div>
            {!filteredTickets.length && <EmptyState title={collectionTickets.length ? copy.noResults : serviceFilter === 'active' ? copy.noActiveServices : copy.noCompletedServices} text={collectionTickets.length ? copy.noResultsText : serviceFilter === 'active' ? copy.noActiveServicesText : copy.noCompletedServicesText} action={collectionTickets.length ? <button className="account-text-link" type="button" onClick={resetServices}>{copy.resetFilters}</button> : contactAction} />}
          </>}
          {section === 'purchases' && <>
            <div className="account-collection-header"><div className="account-filters" role="group" aria-label={copy.purchases}>{([
              ['active',copy.currentPurchases,activePurchases.length],['completed',copy.completedPurchases,completedPurchases.length],
            ] as const).map(([value,label,count]) => <button key={value} type="button" aria-pressed={purchaseFilter === value} onClick={() => { setPurchaseFilter(value); resetPurchases() }}>{toGeorgianMtavruli(label)}<span>({count})</span></button>)}</div>
            {collectionPurchases.length > 0 && <div className="account-toolbar">
              <div className="account-search"><LaptopIcon name="search" /><label className="account-sr-only" htmlFor="account-purchase-search">{copy.searchPurchases}</label><input id="account-purchase-search" type="search" value={purchaseQuery} placeholder={copy.purchaseSearchPlaceholder} onChange={event => setPurchaseQuery(event.target.value)} aria-controls="account-purchases-list" />{purchaseQuery && <button type="button" aria-label={copy.clearSearch} onClick={() => setPurchaseQuery('')}><LaptopIcon name="close" /></button>}</div>
            </div>}</div>
              <p className="account-result-count account-sr-only" role="status" aria-live="polite">{copy.results}: {filteredPurchases.length}</p>
              <div id="account-purchases-list" className="account-purchase-list">{filteredPurchases.map(purchase => <CustomerPurchaseCard key={purchase.id} purchase={purchase} locale={locale} isPreview={isPreview} />)}</div>
              {!filteredPurchases.length && <EmptyState title={collectionPurchases.length ? copy.noResults : purchaseFilter === 'active' ? copy.noCurrentPurchases : copy.noCompletedPurchases} text={collectionPurchases.length ? copy.noResultsText : purchaseFilter === 'active' ? copy.noCurrentPurchasesText : copy.noCompletedPurchasesText} action={collectionPurchases.length ? <button className="account-text-link" type="button" onClick={resetPurchases}>{copy.resetFilters}</button> : undefined} />}
          </>}
          {section === 'profile' && <CustomerProfile user={user} isPreview={isPreview} onSave={onSaveProfile} />}
          {section === 'comments' && <CustomerComments key={user.id} isPreview={isPreview} />}
          <div hidden={section !== 'addresses'}><CustomerAddresses key={user.id} isPreview={isPreview} active={section === 'addresses'} /></div>
          {section === 'payments' && <CustomerPayments purchases={sortedPurchases} isPreview={isPreview} />}
          {section === 'password' && <CustomerPassword isPreview={isPreview} onChanged={onPasswordChanged} />}
        </section>
      </div>
    </div>
  </main>
}

export default CustomerDashboard
