import { useTranslation } from '../i18n/LocaleProvider'
import { useState } from 'react'
import type { Product } from '../data/products'
import { toGeorgianMtavruli } from '../utils/text'
import { formatPrice } from '../utils/formatPrice'
import { ProductCommentsDialog } from './ProductCommentsDialog'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const l10n = useTranslation()
  const [compared, setCompared] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined
  const shopUrl = `https://shop.tecservice.ge/product/${product.slug}/`

  return (
    <article className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={l10n.t(product.imageAlt)} width={product.imageWidth} height={product.imageHeight} loading="lazy" decoding="async" />
        {l10n.t(discount ? <span className="sale-badge">−{l10n.t(discount)}%</span> : null)}
      </div>
      <div className="product-card__copy">
        <div className={`product-card__price${product.oldPrice ? ' is-sale' : ''}`}>
          <span className="product-card__price-value">{l10n.t(formatPrice(product.price))} ₾</span>
          {l10n.t(product.oldPrice ? <del>{l10n.t(formatPrice(product.oldPrice))} ₾</del> : null)}
        </div>
        <div className="product-card__name">{l10n.t(product.name)}</div>
        <button type="button" className="product-card__comments" onClick={() => setCommentsOpen(true)} aria-label={`${l10n.locale === 'ka' ? 'კომენტარები' : 'Comments'} · ${product.name}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20 3H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h3v4l5-4h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Z"/><path d="M7 8h10M7 12h7"/></svg>{l10n.locale === 'ka' ? 'კომენტარები' : 'Comments'}</button>
        <div className="product-card__actions">
          <button
            className={`compare-button${compared ? ' is-active' : ''}`}
            type="button"
            aria-pressed={compared}
            aria-label={l10n.t(`${product.name} შედარებაში ${compared ? 'ამოშლა' : 'დამატება'}`)}
            data-tooltip={l10n.t(toGeorgianMtavruli(compared ? 'შედარებიდან ამოღება' : 'შედარება'))}
            title={l10n.t(toGeorgianMtavruli(compared ? 'შედარებიდან ამოღება' : 'შედარება'))}
            onClick={() => setCompared((value) => !value)}
          >
            <img src="/assets/icons/compare.svg" alt="" />
          </button>
          <a
            className="add-cart-button"
            href={l10n.href(shopUrl)}
            target="_blank"
            rel="noreferrer"
            aria-label={l10n.t(`${product.name} მაღაზიაში ნახვა`)}
          >
            <img src="/assets/icons/cart-product.svg" alt="" />
            <span className="add-cart-button__label">
              <span>{l10n.t(toGeorgianMtavruli('ყიდვა'))}</span>
            </span>
          </a>
        </div>
      </div>
      {commentsOpen && <ProductCommentsDialog productSlug={product.slug} productName={product.name} onClose={() => setCommentsOpen(false)} />}
    </article>
  )
}
