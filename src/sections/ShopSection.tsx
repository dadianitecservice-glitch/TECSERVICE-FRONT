import { useMemo, useState } from 'react'
import { CarouselControls } from '../components/CarouselControls'
import { ProductCard } from '../components/ProductCard'
import { SectionHeader } from '../components/SectionHeader'
import { products } from '../data/products'
import { toGeorgianMtavruli } from '../utils/text'
import { useResponsiveHome } from '../hooks/useResponsiveHome'
import { useSwipeCarousel } from '../hooks/useSwipeCarousel'

export function ShopSection() {
  const responsive = useResponsiveHome()
  const swipe = useSwipeCarousel(responsive, products.length)
  const productsPerPage = 12
  const productsPerMove = 6
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(products.length / productsPerMove))
  const visibleProducts = useMemo(
    () => Array.from(
      { length: Math.min(productsPerPage, products.length) },
      (_, offset) => products[(page * productsPerMove + offset) % products.length],
    ),
    [page, productsPerPage, productsPerMove],
  )

  const move = (direction: number) => setPage((current) => (current + direction + pageCount) % pageCount)

  return (
    <section className="shop-section" id="shop" aria-labelledby="shop-title">
      <SectionHeader
        headingId="shop-title"
        title={toGeorgianMtavruli('მაღაზია')}
        description="შეარჩიეთ კომპონენტები, აქსესუარები და ტექნიკის პროდუქტები ონლაინ."
        actions={(
          <div className="shop-header-actions">
            <a href="https://shop.tecservice.ge" target="_blank" rel="noreferrer">{toGeorgianMtavruli('გადასვლა მაღაზიაში')} →</a>
            <CarouselControls label="მაღაზიის პროდუქტები" onPrevious={() => responsive ? swipe.move(-1) : move(-1)} onNext={() => responsive ? swipe.move(1) : move(1)} />
          </div>
        )}
      />
      <div className="products-grid" ref={swipe.ref} onScroll={swipe.onScroll} key={responsive ? 'swipe' : page}>
        {(responsive ? products : visibleProducts).map((product) => (
          <ProductCard
            product={product}
            key={product.id}
          />
        ))}
      </div>
      <div className="carousel-pagination" aria-label="პროდუქტების გვერდები">
        {Array.from({ length: responsive ? swipe.pageCount : pageCount }, (_, index) => (
          <button key={index} className={index === (responsive ? swipe.page : page) ? 'is-active' : ''} type="button" onClick={() => responsive ? swipe.goTo(index) : setPage(index)} aria-label={`${index + 1} გვერდი`} aria-current={index === (responsive ? swipe.page : page) ? 'page' : undefined} />
        ))}
      </div>
    </section>
  )
}
