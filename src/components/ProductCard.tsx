import { useEffect, useRef, useState } from 'react'
import type { Product } from '../data/products'

type ProductCardProps = {
  product: Product
  quantity: number
  onAdd: (product: Product) => void
}

export function ProductCard({ product, quantity, onAdd }: ProductCardProps) {
  const [compared, setCompared] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const addedTimer = useRef<number | null>(null)
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined

  useEffect(() => () => {
    if (addedTimer.current !== null) window.clearTimeout(addedTimer.current)
  }, [])

  const handleAdd = () => {
    onAdd(product)
    setJustAdded(true)
    if (addedTimer.current !== null) window.clearTimeout(addedTimer.current)
    addedTimer.current = window.setTimeout(() => {
      setJustAdded(false)
      addedTimer.current = null
    }, 1200)
  }

  return (
    <article className={`product-card${quantity ? ' is-added' : ''}`}>
      <div className="product-card__image">
        <img src={product.image} alt={product.name} />
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
            data-tooltip={compared ? 'შედარებიდან ამოღება' : 'შედარება'}
            title={compared ? 'შედარებიდან ამოღება' : 'შედარება'}
            onClick={() => setCompared((value) => !value)}
          >
            <img src="/assets/icons/compare.svg" alt="" />
          </button>
          <button className={`add-cart-button${justAdded ? ' is-confirmed' : ''}`} type="button" onClick={handleAdd}>
            <img src="/assets/icons/cart-product.svg" alt="" />
            <span aria-live="polite">{justAdded ? 'დამატებულია' : 'დამატება'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
