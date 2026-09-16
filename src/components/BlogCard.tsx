import type { BlogPost } from '../data/blogPosts'
import { toGeorgianMtavruli } from '../utils/text'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card" aria-labelledby={`blog-card-${post.id}`}>
      <div className="blog-card__image">
        <img src={post.image} alt={post.imageAlt} width={post.imageWidth} height={post.imageHeight} loading="lazy" decoding="async" />
      </div>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span>{post.category}</span>
          <time dateTime={post.dateTime}>{post.date}</time>
        </div>
        <h3 className="display-title" id={`blog-card-${post.id}`}>{toGeorgianMtavruli(post.title)}</h3>
        <p>{post.excerpt}</p>
        <span className="blog-card__link">{toGeorgianMtavruli('სტატია მზადდება')}</span>
      </div>
    </article>
  )
}
