import { useState } from 'react'
import { LaptopIcon } from '../components/LaptopIcon'
import { dashboardCopy } from './dashboardCopy'
import { InvoiceButton } from './InvoiceButton'
import { getProductImageUrl as getPurchaseImageUrl } from './productImage'
import { accountDateTime } from './accountFormat'
import { toGeorgianMtavruli } from '../utils/text'
import type { CustomerPurchase } from './types'
import '../styles/account-purchases.css'

export type CustomerPurchaseCardProps = {
  purchase: CustomerPurchase
  locale: 'ka' | 'en'
  compact?: boolean
  detail?: boolean
  isPreview?: boolean
}

const purchaseCopy = {
  ka: { products: 'პროდუქტები', more: 'დანარჩენი პროდუქტები', collapse: 'დაკეცვა', noItems: 'პროდუქტების დეტალები მითითებული არ არის.', details: 'დეტალები', orderDetails: 'შეკვეთის დეტალები', orderStatus: 'შეკვეთის სტატუსი', ordered: 'შეკვეთა:', total: 'შეკვეთის ღირებულება:' },
  en: { products: 'Products', more: 'Remaining products', collapse: 'Collapse', noItems: 'Product details have not been provided.', details: 'Details', orderDetails: 'Order details', orderStatus: 'Order status', ordered: 'Ordered:', total: 'Order total:' },
}

export { getPurchaseImageUrl }

function PurchaseThumbnail({ source, name }: { source?: string | null; name: string }) {
  const imageUrl = getPurchaseImageUrl(source)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const showImage = Boolean(imageUrl && imageUrl !== failedSource)
  return <span className="account-purchase-item__tile" data-has-image={showImage} aria-hidden={showImage ? undefined : true}>
    {showImage && imageUrl ? <img
      src={imageUrl}
      alt={name}
      width="48"
      height="48"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedSource(imageUrl)}
    /> : <LaptopIcon name="briefcase" />}
  </span>
}

function purchaseMoney(value: number, currency: string, locale: 'ka' | 'en') {
  if (!Number.isFinite(value)) return '—'
  if (locale === 'ka') {
    const amount = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value).replaceAll(',', '\u00a0')
    return `${amount}\u00a0${currency.toUpperCase() === 'GEL' ? '₾' : currency.toUpperCase()}`
  }
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
  } catch {
    return `${value.toLocaleString('en-GB')} ${currency}`
  }
}

export function PurchaseProducts({ purchase, locale, items = purchase.items, compact = false }: { purchase: CustomerPurchase; locale: 'ka' | 'en'; items?: CustomerPurchase['items']; compact?: boolean }) {
  const copy = dashboardCopy[locale]
  const text = purchaseCopy[locale]
  const ProductHeading = compact ? 'h5' : 'h4'
  if (!items.length) return <p className="account-purchase-card__empty">{text.noItems}</p>
  return <ul className="account-purchase-card__products" aria-label={text.products}>{items.map((item, index) => <li className="account-purchase-item" key={`${index}-${item.name}`}>
    <PurchaseThumbnail source={item.image_url} name={item.name || copy.product} />
    <div className="account-purchase-item__content">
      <ProductHeading>{item.name || copy.missing}</ProductHeading>
      <dl className="account-purchase-item__facts">
        <div className={item.quantity === 1 ? 'account-purchase-sr-only' : undefined}><dt className="account-purchase-sr-only">{copy.quantity}</dt><dd>{item.quantity}<span className="account-purchase-item__times" aria-hidden="true">×</span></dd></div>
        <div><dt className="account-purchase-sr-only">{copy.unitPrice}</dt><dd>{purchaseMoney(item.unit_price, purchase.currency, locale)}</dd></div>
      </dl>
    </div>
  </li>)}</ul>
}

export function CustomerPurchaseCard({ purchase, locale, compact = false, detail = false, isPreview = false }: CustomerPurchaseCardProps) {
  const copy = dashboardCopy[locale]
  const text = purchaseCopy[locale]
  const Heading = compact ? 'h4' : 'h3'
  const DetailHeading = compact ? 'h5' : 'h4'
  const visibleItems = purchase.items.slice(0, 2)
  const remainingItems = purchase.items.slice(2)
  const dateTime = Number.isNaN(Date.parse(purchase.created_at)) ? undefined : purchase.created_at
  const statusLabel = (status: string) => (Object.hasOwn(copy.statusLabels, status) ? copy.statusLabels[status] : status) || copy.missing

  return <article className={`account-purchase-card${compact ? ' account-purchase-card--compact' : ''}${detail ? ' account-purchase-card--detail' : ''}`} data-status={purchase.status}>
    <details className="account-purchase-disclosure" open={detail || undefined}>
      <summary aria-label={`${copy.order} ${purchase.order_number || copy.missing} — ${text.details}`}>
        <header className="account-purchase-card__header">
          <div className="account-purchase-card__identity">
            <Heading aria-label={`${copy.order} ${purchase.order_number || copy.missing}`}><span className="account-purchase-card__number">{purchase.order_number ? `${purchase.order_number.startsWith('#') ? '' : '#'}${purchase.order_number}` : copy.missing}</span></Heading>
          </div>
          <span className="account-purchase-card__open"><span>{text.details}<LaptopIcon name="chevron" /></span></span>
        </header>
        <div className="account-purchase-card__body">
          <PurchaseProducts purchase={purchase} locale={locale} items={visibleItems} compact={compact} />
        </div>
        <footer className="account-purchase-card__footer">
          <div className="account-purchase-card__meta">
            <div className="account-purchase-card__date"><span>{text.ordered}</span><time dateTime={dateTime}>{accountDateTime(purchase.created_at)}</time></div>
          </div>
          <dl className="account-purchase-card__total"><dt>{text.total}</dt><dd>{purchaseMoney(purchase.total, purchase.currency, locale)}</dd></dl>
        </footer>
      </summary>
      <div className="account-purchase-expanded">
        <div className="account-purchase-invoice"><InvoiceButton target={{ kind: 'purchase', id: purchase.id, reference: purchase.order_number }} locale={locale} isPreview={isPreview} /></div>
        <div className="account-purchase-expanded__heading">
          <DetailHeading>{toGeorgianMtavruli(text.orderDetails)}</DetailHeading>
          <button type="button" className="account-purchase-collapse" onClick={event => {
            const disclosure = event.currentTarget.closest('details')
            if (disclosure) {
              disclosure.open = false
              disclosure.querySelector('summary')?.focus({ preventScroll: true })
            }
          }}><span>{text.collapse}</span><LaptopIcon name="chevron" /></button>
        </div>
        <dl className="account-purchase-expanded__metadata">
          <div><dt>{text.orderStatus}</dt><dd>{statusLabel(purchase.status)}</dd></div>
          <div><dt>{copy.payment}</dt><dd data-payment-status={purchase.payment_status}>{statusLabel(purchase.payment_status)}</dd></div>
        </dl>
        {remainingItems.length > 0 && <section className="account-purchase-expanded__products" aria-label={text.more}>
          <DetailHeading>{toGeorgianMtavruli(text.more)}</DetailHeading>
          <PurchaseProducts purchase={purchase} locale={locale} items={remainingItems} compact={compact} />
        </section>}
      </div>
    </details>
  </article>
}

export default CustomerPurchaseCard
