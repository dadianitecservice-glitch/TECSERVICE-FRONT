import { useTranslation } from '../i18n/LocaleProvider'
import { useEffect, useRef } from 'react'
import type { Product } from '../data/products'
import { toGeorgianMtavruli } from '../utils/text'

type CartLine = { product: Product; quantity: number }

type CartDrawerProps = {
  open: boolean
  lines: CartLine[]
  onClose: () => void
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartDrawer({ open, lines, onClose, onQuantityChange, onRemove }: CartDrawerProps) {
  const l10n = useTranslation()
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'))

      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('drawer-open')
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('drawer-open')
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  const subtotal = lines.reduce((total, line) => total + line.product.price * line.quantity, 0)

  return (
    <div className={`cart-layer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <button className="cart-backdrop" type="button" aria-label={l10n.t("კალათის დახურვა")} onClick={onClose} />
      <aside ref={drawerRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="cart-drawer__header">
          <div>
            <span>{l10n.t(toGeorgianMtavruli('თქვენი შეკვეთა'))}</span>
            <h2 className="display-title" id="cart-title">{l10n.t(toGeorgianMtavruli('კალათა'))}</h2>
          </div>
          <button ref={closeButtonRef} type="button" className="cart-close" onClick={onClose} aria-label={l10n.t("დახურვა")}>×</button>
        </header>
        <div className="cart-drawer__body">
          {l10n.t(lines.length === 0 ? (
            <div className="empty-cart">
              <img src="/assets/icons/cart-header.svg" alt="" />
              <h3>{l10n.t(toGeorgianMtavruli('კალათა ცარიელია'))}</h3>
              <p>{l10n.t("პროდუქტის დამატების შემდეგ ის აქ გამოჩნდება.")}</p>
            </div>
          ) : (
            <ul className="cart-lines">
              {l10n.t(lines.map((line) => (
                <li key={line.product.id}>
                  <img className="cart-line__image" src={line.product.image} alt="" />
                  <div className="cart-line__content">
                    <h3>{l10n.t(line.product.name)}</h3>
                    <strong>{l10n.t(line.product.price.toLocaleString('ka-GE'))} ₾</strong>
                    <div className="cart-line__controls">
                      <div className="quantity-control" aria-label={l10n.t("რაოდენობა")}>
                        <button type="button" onClick={() => onQuantityChange(line.product.id, line.quantity - 1)} aria-label={l10n.t("შემცირება")}>−</button>
                        <span>{l10n.t(line.quantity)}</span>
                        <button type="button" onClick={() => onQuantityChange(line.product.id, line.quantity + 1)} aria-label={l10n.t("გაზრდა")}>+</button>
                      </div>
                      <button className="remove-line" type="button" onClick={() => onRemove(line.product.id)}>{l10n.t(toGeorgianMtavruli('წაშლა'))}</button>
                    </div>
                  </div>
                </li>
              )))}
            </ul>
          ))}
        </div>
        {l10n.t(lines.length ? (
          <footer className="cart-drawer__footer">
            <div><span>{l10n.t("ჯამი")}</span><strong>{l10n.t(subtotal.toLocaleString('ka-GE'))} ₾</strong></div>
            <button type="button">{l10n.t(toGeorgianMtavruli('შეკვეთის გაგრძელება'))}</button>
            <small>{l10n.t('ონლაინ გადახდა ჯერ არ არის ჩართული.')}</small>
          </footer>
        ) : null)}
      </aside>
    </div>
  )
}
