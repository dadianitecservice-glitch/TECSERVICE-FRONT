import { useCallback, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { CartDrawer } from './components/CartDrawer'
import { Hero } from './sections/Hero'
import { ServicesSection } from './sections/ServicesSection'
import { TicketLookup } from './sections/TicketLookup'
import { ShopSection } from './sections/ShopSection'
import { ReviewsSection } from './sections/ReviewsSection'
import { BlogSection } from './sections/BlogSection'
import { AboutSection } from './sections/AboutSection'
import { Footer } from './sections/Footer'
import type { Product } from './data/products'

export type CartLine = { product: Product; quantity: number }

export default function App() {
  const [cart, setCart] = useState<CartLine[]>([])
  const [isCartOpen, setCartOpen] = useState(false)

  const cartCount = useMemo(
    () => cart.reduce((total, line) => total + line.quantity, 0),
    [cart],
  )

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }

  const changeQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((line) => line.product.id !== productId)
        : current.map((line) => (line.product.id === productId ? { ...line, quantity } : line)),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((line) => line.product.id !== productId))
  }

  return (
    <>
      <Header cartCount={cartCount} onCartOpen={openCart} />
      <main>
        <Hero />
        <ServicesSection />
        <TicketLookup />
        <ShopSection cart={cart} onAddToCart={addToCart} />
        <ReviewsSection />
        <BlogSection />
        <AboutSection />
      </main>
      <Footer />
      <CartDrawer
        open={isCartOpen}
        lines={cart}
        onClose={closeCart}
        onQuantityChange={changeQuantity}
        onRemove={removeFromCart}
      />
    </>
  )
}
