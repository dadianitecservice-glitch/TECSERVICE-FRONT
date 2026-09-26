import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LaptopIcon } from '../components/LaptopIcon'
import { accountDate, accountMoney } from './accountFormat'
import { customerInvoiceApi, type CustomerInvoice, type InvoiceTarget, type ServiceInvoice } from './customerInvoiceApi'
import { CustomerApiError } from './customerApi'
import '../styles/account-invoices.css'

export function InvoiceIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8Z"/><path d="M14 2v6h6M8 12h8M8 16h8M8 19h4"/></svg>
}

export function InvoiceButton({ target, locale, isPreview = false }: { target: InvoiceTarget; locale: 'ka' | 'en'; isPreview?: boolean }) {
  const [open, setOpen] = useState(false)
  const label = locale === 'ka' ? 'ინვოისი' : 'Invoice'
  return <>
    <button type="button" className="account-invoice-trigger" title={label} aria-label={`${label} · ${target.reference}`} onClick={event => { event.preventDefault(); event.stopPropagation(); setOpen(true) }}><InvoiceIcon /></button>
    {open && createPortal(<InvoiceDialog target={target} locale={locale} isPreview={isPreview} onClose={() => setOpen(false)} />, document.body)}
  </>
}

function InvoiceDialog({ target, locale, isPreview, onClose }: { target: InvoiceTarget; locale: 'ka' | 'en'; isPreview: boolean; onClose: () => void }) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const request = useRef<AbortController | null>(null)
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([])
  const [paper, setPaper] = useState<ServiceInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const text = (ka: string, en: string) => locale === 'ka' ? ka : en
  const errorMessage = (cause: unknown) => cause instanceof CustomerApiError && [401, 403].includes(cause.status)
    ? text('ინვოისის სანახავად ხელახლა გაიარეთ ავტორიზაცია.', 'Please sign in again to access invoices.')
    : cause instanceof CustomerApiError && cause.status === 404
      ? text('ეს ინვოისი ამ ანგარიშისთვის ხელმისაწვდომი არ არის.', 'This invoice is not available for this account.')
      : text('ინვოისი ვერ ჩაიტვირთა. სცადეთ მოგვიანებით.', 'The invoice could not be loaded. Please try again later.')

  useEffect(() => {
    const element = dialog.current!
    const opener = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      request.current?.abort(); element.close(); document.body.style.overflow = overflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    request.current = controller
    const timeout = setTimeout(() => controller.abort(), 15000)
    let active = true
    const load = async () => {
      try {
        if (isPreview && import.meta.env.DEV) {
          const { demoInvoice } = await import('./demoInvoice')
          if (active) { const sample = demoInvoice(target, locale); setInvoices([sample]); setPaper(sample) }
        } else {
          const entries = await customerInvoiceApi.list(target, controller.signal)
          if (active) setInvoices(entries)
        }
      } catch (cause) { if (active) setError(errorMessage(cause)) }
      finally { if (active) setLoading(false); clearTimeout(timeout) }
    }
    void load()
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [target.kind, target.id, locale, isPreview])

  async function view(invoice: CustomerInvoice) {
    if (busyId) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    const timeout = setTimeout(() => controller.abort(), 15000)
    setBusyId(invoice.id); setError(''); setPaper(null)
    try {
      if (target.kind === 'service') {
        const document = await customerInvoiceApi.service(target, invoice.id, controller.signal)
        if (!controller.signal.aborted) setPaper(document)
      } else {
        const blob = await customerInvoiceApi.pdf(target, invoice.id, controller.signal)
        if (controller.signal.aborted) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = `invoice-${invoice.number.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80)}.pdf`
        link.hidden = true
        document.body.appendChild(link)
        link.click(); link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }
    } catch (cause) { if (dialog.current?.open) setError(errorMessage(cause)) }
    finally { clearTimeout(timeout); if (dialog.current?.open) setBusyId(null) }
  }

  return <dialog ref={dialog} className="account-invoice-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="account-invoice-dialog__content">
      <header className="account-invoice-dialog__heading"><div><span>{target.reference}</span><h2 id={titleId}>{text('ინვოისი', 'Invoice')}{isPreview ? ` · ${text('ნიმუში', 'Preview')}` : ''}</h2></div><button type="button" onClick={onClose} aria-label={text('დახურვა', 'Close')}><LaptopIcon name="close" /></button></header>
      {loading && <p role="status">{text('იტვირთება…', 'Loading…')}</p>}
      {error && <p className="account-invoice-error" role="alert">{error}</p>}
      {!loading && !error && !invoices.length && <div className="account-invoice-empty"><InvoiceIcon /><h3>{text('ინვოისი ჯერ არ არის გაცემული', 'No invoice has been issued yet')}</h3><p>{text('გაცემის შემდეგ დოკუმენტი აქ გამოჩნდება.', 'The document will appear here once it is issued.')}</p></div>}
      {!isPreview && !!invoices.length && <ul className="account-invoice-list">{invoices.map(invoice => <li key={invoice.id}><div><strong>{invoice.number}</strong><time dateTime={invoice.issued_at}>{accountDate(invoice.issued_at, locale)}</time></div><button type="button" disabled={!!busyId} onClick={() => void view(invoice)}><InvoiceIcon />{busyId === invoice.id ? text('იტვირთება…', 'Loading…') : target.kind === 'purchase' ? text('PDF ჩამოტვირთვა', 'Download PDF') : text('ფორმის ნახვა', 'View invoice')}</button></li>)}</ul>}
      {paper && <>
        <InvoicePaper invoice={paper} locale={locale} isPreview={isPreview} />
        {!isPreview && <button type="button" className="account-invoice-print" onClick={() => window.print()}>{text('ბეჭდვა / PDF შენახვა', 'Print / save as PDF')}</button>}
      </>}
    </div>
  </dialog>
}

function InvoicePaper({ invoice, locale, isPreview }: { invoice: ServiceInvoice; locale: 'ka' | 'en'; isPreview: boolean }) {
  const text = (ka: string, en: string) => locale === 'ka' ? ka : en
  const money = (value: number) => accountMoney(value, locale)
  return <article className="account-invoice-paper">
    {isPreview && <p className="account-invoice-paper__sample">{text('დემო ფორმა — არ არის გადახდის დოკუმენტი', 'Sample only — not a payment document')}</p>}
    <header><h3>{text('ინვოისი', 'Invoice')} № {invoice.number}</h3><span>{invoice.document_date}</span></header>
    <div className="account-invoice-parties">
      <section><h4>{text('გამყიდველი', 'Seller')}</h4><strong>{invoice.seller.name}</strong>{invoice.seller.tax_id && <p>{text('ს/კ', 'Tax ID')}: {invoice.seller.tax_id}</p>}{invoice.seller.address && <p>{invoice.seller.address}</p>}{invoice.seller.phone && <p>{invoice.seller.phone}</p>}</section>
      <section><h4>{text('მომხმარებელი', 'Customer')}</h4><strong>{invoice.buyer.company_name || invoice.buyer.name}</strong>{invoice.buyer.company_name && invoice.buyer.name && <p>{invoice.buyer.name}</p>}{invoice.buyer.tax_id && <p>{text('ს/კ', 'Tax ID')}: {invoice.buyer.tax_id}</p>}{invoice.buyer.phone && <p>{invoice.buyer.phone}</p>}</section>
    </div>
    <div className="account-invoice-table"><table><thead><tr><th>{text('აღწერა', 'Description')}</th><th>{text('რაოდ.', 'Qty')}</th><th>{text('ფასი', 'Price')}</th><th>{text('თანხა', 'Amount')}</th></tr></thead><tbody>{invoice.lines.map((line, index) => <tr key={index}><td>{line.description}{line.device && <small>{line.device}</small>}</td><td data-label={text('რაოდ.', 'Qty')}>{line.quantity}</td><td data-label={text('ფასი', 'Price')}>{money(line.unit_price)}</td><td data-label={text('თანხა', 'Amount')}>{money(line.amount)}</td></tr>)}</tbody></table></div>
    <footer><span>{text('ჯამი', 'Total')}</span><strong>{money(invoice.total)}</strong></footer>
    <p className="account-invoice-paper__payment">{invoice.payment_status === 'paid' ? text('გადახდა დადასტურებულია', 'Payment confirmed') : text('ეს ფორმა გადახდის დადასტურებას არ ნიშნავს.', 'This document is not confirmation of payment.')}{invoice.payment_status === 'paid' && invoice.paid_at ? ` · ${accountDate(invoice.paid_at, locale)}` : ''}</p>
  </article>
}
