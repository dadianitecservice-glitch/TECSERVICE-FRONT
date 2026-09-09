import { useEffect, useMemo, useRef, useState } from 'react'
import { CarouselControls } from '../components/CarouselControls'
import { googleReviewsUrl, reviewSummary, reviews, type Review } from '../data/reviews'
import { toGeorgianMtavruli } from '../utils/text'

const featuredReviews = reviews
  .filter((review) => review.rating >= 4 && review.text.trim().length >= 35 && review.text.length <= 420)

export function ReviewsSection() {
  const [start, setStart] = useState(0)
  const [paused, setPaused] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (paused || focusWithin || selectedReview || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setStart((value) => (value + 1) % featuredReviews.length), 6000)
    return () => window.clearInterval(timer)
  }, [paused, focusWithin, selectedReview])

  useEffect(() => {
    if (!selectedReview || !dialogRef.current) return

    const dialog = dialogRef.current
    const opener = openerRef.current
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setSelectedReview(null)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0 && !element.hidden)
      const first = focusable[0] ?? dialog
      const last = focusable[focusable.length - 1] ?? dialog
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
        event.preventDefault()
        first.focus()
      }
    }
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        closeButtonRef.current?.focus({ preventScroll: true })
      }
    }

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus({ preventScroll: true })
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('focusin', keepFocusInside)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('focusin', keepFocusInside)
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [selectedReview])

  const visible = useMemo(
    () => Array.from(
      { length: Math.min(3, featuredReviews.length) },
      (_, index) => featuredReviews[(start + index) % featuredReviews.length],
    ),
    [start],
  )

  const move = (direction: number) => {
    setStart((value) => (value + direction + featuredReviews.length) % featuredReviews.length)
  }

  return (
    <section
      className="reviews-section"
      aria-labelledby="reviews-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false)
      }}
    >
      <div className="reviews-header">
        <h2 id="reviews-heading">{toGeorgianMtavruli('რას ამბობენ ჩვენზე')}</h2>
        <div className="reviews-header__actions">
          <a className="reviews-google-summary" href={googleReviewsUrl} target="_blank" rel="noreferrer">
            <img src="/assets/icons/google-g.svg" alt="Google" />
            <span>★★★★★</span>
            <strong>{reviewSummary.rating.toFixed(1)}</strong>
            <small>· {reviewSummary.publicReviewCount} Google {toGeorgianMtavruli('შეფასება')}</small>
          </a>
          <CarouselControls label="Google შეფასებები" onPrevious={() => move(-1)} onNext={() => move(1)} />
        </div>
      </div>
      <div className="reviews-grid" key={start} aria-live={paused || focusWithin || selectedReview ? 'polite' : 'off'}>
        {visible.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card__meta">
              <div className="review-card__rating" aria-label={`${review.rating} ვარსკვლავი 5-დან`}>
                <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <strong>{review.rating.toFixed(1)}</strong>
              </div>
              <time>{review.date}</time>
            </div>
            <div className="review-card__text">
              <p>{review.text}</p>
              {review.text.length > 120 && (
                <button
                  type="button"
                  className="review-card__more"
                  aria-label={toGeorgianMtavruli('სრული რევიუს ნახვა')}
                  title={toGeorgianMtavruli('სრული რევიუს ნახვა')}
                  onClick={(event) => {
                    openerRef.current = event.currentTarget
                    setSelectedReview(review)
                  }}
                >
                  <span aria-hidden="true">•••</span>
                </button>
              )}
            </div>
            <strong>{review.customerName}</strong>
            <small className="review-card__source">
              <img src="/assets/icons/check-blue.svg" alt="" />
              <span>{review.sourceLabel}</span>
            </small>
          </article>
        ))}
      </div>
      <a className="reviews-all-link" href={googleReviewsUrl} target="_blank" rel="noreferrer">
        {toGeorgianMtavruli('ყველა შეფასების ნახვა')} →
      </a>

      {selectedReview && (
        <div className="review-modal" role="presentation" onMouseDown={() => setSelectedReview(null)}>
          <article
            ref={dialogRef}
            className="review-modal__dialog"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-author"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              className="review-modal__close"
              type="button"
              aria-label="რევიუს დახურვა"
              onClick={() => setSelectedReview(null)}
            >
              ×
            </button>
            <div className="review-card__rating" aria-label={`${selectedReview.rating} ვარსკვლავი 5-დან`}>
              <span aria-hidden="true">
                {'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}
              </span>
              <strong>{selectedReview.rating.toFixed(1)}</strong>
            </div>
            <p>{selectedReview.text}</p>
            <strong id="review-modal-author">{selectedReview.customerName}</strong>
            <small>
              Google Maps · {selectedReview.date}
            </small>
          </article>
        </div>
      )}
    </section>
  )
}
