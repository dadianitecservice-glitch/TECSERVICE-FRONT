import { useEffect, useMemo, useState } from 'react'
import { BlogCard } from '../components/BlogCard'
import { CarouselControls } from '../components/CarouselControls'
import { SectionHeader } from '../components/SectionHeader'
import { blogPosts } from '../data/blogPosts'
import { toGeorgianMtavruli } from '../utils/text'
import { useResponsiveHome } from '../hooks/useResponsiveHome'
import { useSwipeCarousel } from '../hooks/useSwipeCarousel'

export function BlogSection() {
  const responsive = useResponsiveHome()
  const swipe = useSwipeCarousel(responsive, blogPosts.length)
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  // Responsive tracks render all articles; desktop keeps four per page.
  const postsPerPage = 4
  const pageCount = Math.ceil(blogPosts.length / postsPerPage)
  const indicatorCount = responsive ? swipe.pageCount : pageCount
  const visiblePosts = useMemo(
    () => Array.from(
      { length: Math.min(postsPerPage, blogPosts.length) },
      (_, offset) => blogPosts[(page * postsPerPage + offset) % blogPosts.length],
    ),
    [page, postsPerPage],
  )

  const move = (direction: number) => setPage((current) => (current + direction + pageCount) % pageCount)

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1))
  }, [pageCount])

  useEffect(() => {
    if (responsive || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => move(1), 6000)
    return () => window.clearInterval(timer)
  }, [responsive, paused, pageCount])

  return (
    <section
      className="blog-section"
      id="blog"
      aria-labelledby="blog-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <SectionHeader
        headingId="blog-title"
        title={toGeorgianMtavruli('ბლოგი')}
        description="პრაქტიკული რჩევები ტექნიკის მოვლის, დიაგნოსტიკისა და შეკეთების შესახებ."
        actions={(
          <div className="blog-header-actions">
            <a href="/blog">{toGeorgianMtavruli('ყველა სტატია')} →</a>
            <CarouselControls label="ბლოგის სტატიები" onPrevious={() => responsive ? swipe.move(-1) : move(-1)} onNext={() => responsive ? swipe.move(1) : move(1)} />
          </div>
        )}
      />
      <div className="blog-grid" ref={swipe.ref} onScroll={swipe.onScroll} key={responsive ? 'swipe' : page}>
        {(responsive ? blogPosts : visiblePosts).map((post) => <BlogCard post={post} key={post.id} />)}
      </div>
      <div className="carousel-pagination" aria-label="ბლოგის გვერდები">
        {Array.from({ length: indicatorCount }, (_, index) => (
          <button key={index} className={index === (responsive ? swipe.page : page) ? 'is-active' : ''} type="button" onClick={() => responsive ? swipe.goTo(index) : setPage(index)} aria-label={`${index + 1} გვერდი`} aria-current={index === (responsive ? swipe.page : page) ? 'page' : undefined} />
        ))}
      </div>
    </section>
  )
}
