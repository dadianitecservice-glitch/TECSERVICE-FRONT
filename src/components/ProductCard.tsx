import { useState } from 'react'
import type { Product } from '../data/products'
import { toGeorgianMtavruli } from '../utils/text'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [compared, setCompared] = useState(false)
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined
  const shopUrl = `https://shop.tecservice.ge/product/${product.slug}/`

  return (
    <article className="product-card">
      <div className="product-card__image">
        <img src={product.image} alt={product.imageAlt} />
        {discount ? <span className="sale-badge">−{discount}%</span> : null}
      </div>
      <div className="product-card__copy">
        <div className={`product-card__price${product.oldPrice ? ' is-sale' : ''}`}>
          <strong>{product.price.toLocaleString('ka-GE')} ₾</strong>
          {product.oldPrice ? <del>{product.oldPrice.toLocaleString('ka-GE')} ₾</del> : null}
        </div>
        <h3>{product.name}</h3>
        <div className="product-card__actions">
          <button
            className={`compare-button${compared ? ' is-active' : ''}`}
            type="button"
            aria-pressed={compared}
            aria-label={`${product.name} შედარებაში ${compared ? 'ამოშლა' : 'დამატება'}`}
            data-tooltip={toGeorgianMtavruli(compared ? 'შედარებიდან ამოღება' : 'შედარება')}
            title={toGeorgianMtavruli(compared ? 'შედარებიდან ამოღება' : 'შედარება')}
            onClick={() => setCompared((value) => !value)}
          >
            <img src="/assets/icons/compare.svg" alt="" />
          </button>
          <a
            className="add-cart-button"
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${product.name} მაღაზიაში ნახვა`}
          >
            <img src="/assets/icons/cart-product.svg" alt="" />
            <span className="add-cart-button__label">
              <span>{toGeorgianMtavruli('ყიდვა')}</span>
            </span>
          </a>
        </div>
      </div>
    </article>
  )
}
