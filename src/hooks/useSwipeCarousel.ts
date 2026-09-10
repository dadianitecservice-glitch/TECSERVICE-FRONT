import { useCallback, useEffect, useRef, useState } from 'react'

/** Native touch/trackpad scrolling, keyboard controls and arrows share one state. */
export function useSwipeCarousel(enabled: boolean, itemCount: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const measure = useCallback(() => {
    const track = ref.current
    if (!enabled || !track) return
    const max = Math.max(0, track.scrollWidth - track.clientWidth)
    const step = Math.max(1, track.clientWidth)
    setPageCount(Math.ceil(max / step) + 1)
    setPage(track.scrollLeft >= max - 2 ? Math.ceil(max / step) : Math.round(track.scrollLeft / step))
  }, [enabled])
  useEffect(() => {
    const track = ref.current
    if (!enabled || !track) return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    measure()
    return () => observer.disconnect()
  }, [enabled, itemCount, measure])
  const goTo = (nextPage: number) => {
    const track = ref.current
    if (!track) return
    const next = (nextPage + pageCount) % pageCount
    track.scrollTo({
      left: Math.min(next * track.clientWidth, track.scrollWidth - track.clientWidth),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }
  return { ref, page, pageCount, onScroll: measure, goTo, move: (direction: number) => goTo(page + direction) }
}
