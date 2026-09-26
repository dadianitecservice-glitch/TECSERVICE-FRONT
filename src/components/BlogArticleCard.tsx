import type { BlogPost } from '../data/blogPosts'
import { blogPageCopy } from '../data/blogPageCopy'
import { useTranslation } from '../i18n/LocaleProvider'
import { LaptopIcon } from './LaptopIcon'

export function BlogArticleCard({ post, compact = false, priority = false }: { post: BlogPost; compact?: boolean; priority?: boolean }) {
  const l10n = useTranslation()
  const copy = blogPageCopy[l10n.locale]
  const headingId = `journal-card-title-${post.id}`
  return <article className={`journal-card${compact ? ' journal-card--compact' : ''}`}>
    <a className="journal-card__link" href={l10n.href(`/blog/${post.slug}/`)} aria-labelledby={headingId}>
      <div className="journal-card__image">
        <img src={post.image} alt="" width={post.imageWidth} height={post.imageHeight} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />
      </div>
      <div className="journal-card__body">
        <div className="journal-card__meta"><span>{post.category}</span>{!compact && <span>{copy.minutes(post.readMinutes)}</span>}</div>
        <h3 id={headingId}>{post.title}</h3>
        {!compact && <p>{post.excerpt}</p>}
        <div className="journal-card__bottom"><time dateTime={post.dateTime}>{post.date}</time><span className="journal-card__arrow" aria-hidden="true"><LaptopIcon name="arrow" /></span></div>
      </div>
    </a>
  </article>
}
