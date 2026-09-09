import type { BlogPost } from '../data/blogPosts'
import { toGeorgianMtavruli } from '../utils/text'

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="blog-card">
      <a href={post.href} className="blog-card__image" aria-label={toGeorgianMtavruli(post.title)}>
        <img src={post.image} alt={post.imageAlt} />
      </a>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span>{post.category}</span>
          <time>{post.date}</time>
        </div>
        <h3 className="display-title"><a href={post.href}>{toGeorgianMtavruli(post.title)}</a></h3>
        <p>{post.excerpt}</p>
        <a className="blog-card__link" href={post.href}>{toGeorgianMtavruli('ვრცლად')} →</a>
      </div>
    </article>
  )
}
