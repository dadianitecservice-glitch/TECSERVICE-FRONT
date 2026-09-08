import { useEffect, useMemo, useState } from 'react'
import { CarouselControls } from '../components/CarouselControls'
import { googleReviewsUrl, reviewSummary, reviews } from '../data/reviews'

export function ReviewsSection() {
  const [start, setStart] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setStart((value) => (value + 1) % reviews.length), 6000)
    return () => window.clearInterval(timer)
  }, [paused])

  const visible = useMemo(
    () => Array.from({ length: Math.min(3, reviews.length) }, (_, index) => reviews[(start + index) % reviews.length]),
    [start],
  )

  const move = (direction: number) => {
    setStart((value) => (value + direction + reviews.length) % reviews.length)
  }

  return (
    <section
      className="reviews-section"
      aria-labelledby="reviews-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="reviews-header">
        <h2 id="reviews-heading">რას ამბობენ ჩვენზე</h2>
        <div className="reviews-header__actions">
          <a className="reviews-google-summary" href={googleReviewsUrl} target="_blank" rel="noreferrer">
            <span>★★★★★</span>
            <strong>{reviewSummary.rating.toFixed(1)}</strong>
            <small>· {reviewSummary.publicReviewCount} Google შეფასება ↗</small>
          </a>
          <CarouselControls label="Google შეფასებები" onPrevious={() => move(-1)} onNext={() => move(1)} />
        </div>
      </div>
      <div className="reviews-grid" key={start} aria-live="polite">
        {visible.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card__rating" aria-label={`${review.rating} ვარსკვლავი 5-დან`}>
              <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              <strong>{review.rating.toFixed(1)}</strong>
            </div>
            <p>{review.text}</p>
            <strong>{review.customerName}</strong>
            <small className="review-card__source">
              <img src="/assets/icons/check-blue.svg" alt="" />
              <span>{review.sourceLabel}</span>
              <time>{review.date}</time>
            </small>
          </article>
        ))}
      </div>
    </section>
  )
}
