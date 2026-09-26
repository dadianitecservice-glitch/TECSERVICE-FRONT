import { useTranslation } from '../i18n/LocaleProvider'
import { getBlogPost, type BlogPost } from '../data/blogPosts'
import { toGeorgianMtavruli } from '../utils/text'

export function BlogCard({ post }: { post: BlogPost }) {
  const l10n = useTranslation()
  post = getBlogPost(post.slug, l10n.locale) ?? post
  return (
    <article className="blog-card" aria-labelledby={`blog-card-${post.id}`}>
      <div className="blog-card__image">
        <a href={l10n.href(`/blog/${post.slug}/`)} tabIndex={-1} aria-hidden="true"><img src={post.image} alt="" width={post.imageWidth} height={post.imageHeight} loading="lazy" decoding="async" /></a>
      </div>
      <div className="blog-card__body">
        <div className="blog-card__meta">
          <span>{post.category}</span>
          <time dateTime={post.dateTime}>{post.date}</time>
        </div>
        <h3 className="display-title" id={`blog-card-${post.id}`}><a href={l10n.href(`/blog/${post.slug}/`)}>{l10n.locale === 'ka' ? toGeorgianMtavruli(post.title) : post.title}</a></h3>
        <p>{post.excerpt}</p>
        <a className="blog-card__link" href={l10n.href(`/blog/${post.slug}/`)} aria-label={`${l10n.locale === 'en' ? 'Read article' : 'წაიკითხეთ სტატია'}: ${post.title}`}>{l10n.locale === 'en' ? 'Read article →' : 'წაიკითხეთ სტატია →'}</a>
      </div>
    </article>
  )
}
