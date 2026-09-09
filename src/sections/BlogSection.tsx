import { useEffect, useMemo, useState } from 'react'
import { BlogCard } from '../components/BlogCard'
import { CarouselControls } from '../components/CarouselControls'
import { SectionHeader } from '../components/SectionHeader'
import { blogPosts } from '../data/blogPosts'
import { toGeorgianMtavruli } from '../utils/text'

const getPostsPerPage = () => {
  if (typeof window === 'undefined') return 4
  if (window.innerWidth <= 760) return 1
  if (window.innerWidth <= 1023) return 2
  if (window.innerWidth <= 1199) return 3
  return 4
}

export function BlogSection() {
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const [postsPerPage, setPostsPerPage] = useState(getPostsPerPage)
  const pageCount = Math.ceil(blogPosts.length / postsPerPage)
  const visiblePosts = useMemo(
    () => Array.from(
      { length: Math.min(postsPerPage, blogPosts.length) },
      (_, offset) => blogPosts[(page * postsPerPage + offset) % blogPosts.length],
    ),
    [page, postsPerPage],
  )

  const move = (direction: number) => setPage((current) => (current + direction + pageCount) % pageCount)

  useEffect(() => {
    const updatePostsPerPage = () => setPostsPerPage(getPostsPerPage())
    window.addEventListener('resize', updatePostsPerPage)
    return () => window.removeEventListener('resize', updatePostsPerPage)
  }, [])

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1))
  }, [pageCount])

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => move(1), 6000)
    return () => window.clearInterval(timer)
  }, [paused, pageCount])

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
            <CarouselControls label="ბლოგის სტატიები" onPrevious={() => move(-1)} onNext={() => move(1)} />
          </div>
        )}
      />
      <div className="blog-grid" key={page}>
        {visiblePosts.map((post) => <BlogCard post={post} key={post.id} />)}
      </div>
      <div className="carousel-pagination" aria-label="ბლოგის გვერდები">
        {Array.from({ length: pageCount }, (_, index) => (
          <button key={index} className={index === page ? 'is-active' : ''} type="button" onClick={() => setPage(index)} aria-label={`${index + 1} გვერდი`} aria-current={index === page ? 'page' : undefined} />
        ))}
      </div>
    </section>
  )
}
