import { useMemo, useState } from 'react'
import { CarouselControls } from '../components/CarouselControls'
import { ProductCard } from '../components/ProductCard'
import { SectionHeader } from '../components/SectionHeader'
import { products, type Product } from '../data/products'

type ShopSectionProps = {
  cart: Array<{ product: Product; quantity: number }>
  onAddToCart: (product: Product) => void
}

const productsPerPage = 12
const productsPerMove = 6

export function ShopSection({ cart, onAddToCart }: ShopSectionProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(products.length / productsPerMove))
  const visibleProducts = useMemo(
    () => Array.from(
      { length: Math.min(productsPerPage, products.length) },
      (_, offset) => products[(page * productsPerMove + offset) % products.length],
    ),
    [page],
  )

  const move = (direction: number) => setPage((current) => (current + direction + pageCount) % pageCount)

  return (
    <section className="shop-section" id="shop" aria-labelledby="shop-title">
      <SectionHeader
        headingId="shop-title"
        title="მაღაზია"
        description="შეარჩიეთ კომპონენტები, აქსესუარები და ტექნიკის პროდუქტები ონლაინ."
        actions={(
          <div className="shop-header-actions">
            <a href="https://shop.tecservice.ge" target="_blank" rel="noreferrer">გადასვლა მაღაზიაში →</a>
            <CarouselControls label="მაღაზიის პროდუქტები" onPrevious={() => move(-1)} onNext={() => move(1)} />
          </div>
        )}
      />
      <div className="products-grid" key={page}>
        {visibleProducts.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            quantity={cart.find((line) => line.product.id === product.id)?.quantity ?? 0}
            onAdd={onAddToCart}
          />
        ))}
      </div>
      <div className="carousel-pagination" aria-label="პროდუქტების გვერდები">
        {Array.from({ length: pageCount }, (_, index) => (
          <button key={index} className={index === page ? 'is-active' : ''} type="button" onClick={() => setPage(index)} aria-label={`${index + 1} გვერდი`} aria-current={index === page ? 'page' : undefined} />
        ))}
      </div>
    </section>
  )
}
