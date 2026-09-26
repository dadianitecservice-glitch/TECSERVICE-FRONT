import { getBlogPost, getBlogPosts, type BlogPost } from '../data/blogPosts.ts'
import { localeFromPath, localePath } from '../i18n/locale.ts'
import { getBlogArticleSlug, getRouteMetadata, isBlogPath } from '../utils/routes.ts'

const origin = 'https://tecservice.ge'
const organizationId = `${origin}/#business`
const websiteId = `${origin}/#website`

function articlePreviewSchema(post: BlogPost, locale: 'ka' | 'en') {
  const canonical = `${origin}${localePath(`/blog/${post.slug}/`, locale)}`
  return {
    '@type': 'BlogPosting', '@id': `${canonical}#article`, url: canonical,
    headline: post.title, description: post.excerpt, datePublished: post.dateTime,
    inLanguage: locale, articleSection: post.category,
    image: {
      '@type': 'ImageObject', url: `${origin}${post.image}`, contentUrl: `${origin}${post.image}`,
      width: post.imageWidth, height: post.imageHeight, caption: post.imageAlt,
    },
    author: { '@id': organizationId }, publisher: { '@id': organizationId },
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    isPartOf: { '@id': `${origin}${localePath('/blog/', locale)}#blog` },
  }
}

export function getBlogStructuredData(pathname: string, metadata = getRouteMetadata(pathname)) {
  const slug = getBlogArticleSlug(pathname)
  if ((!isBlogPath(pathname) && !slug) || !metadata) return null
  const locale = localeFromPath(pathname)
  const post = slug ? getBlogPost(slug, locale) : undefined
  const homeUrl = `${origin}${localePath('/', locale)}`
  const blogUrl = `${origin}${localePath('/blog/', locale)}`
  const canonical = metadata.canonical
  const pageId = `${canonical}#webpage`
  const image = {
    '@type': 'ImageObject', url: metadata.image, contentUrl: metadata.image,
    width: Number(metadata.imageWidth), height: Number(metadata.imageHeight), caption: metadata.imageAlt,
  }
  const blogLabel = locale === 'en' ? 'Blog' : 'ბლოგი'
  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Home' : 'მთავარი', item: homeUrl },
    { '@type': 'ListItem', position: 2, name: blogLabel, item: blogUrl },
    ...(post ? [{ '@type': 'ListItem', position: 3, name: post.title, item: canonical }] : []),
  ]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': organizationId, name: 'TECSERVICE', url: homeUrl,
        logo: { '@type': 'ImageObject', url: `${origin}/assets/brand/tecservice-favicon-v2.png`, width: 256, height: 256 },
      },
      { '@type': 'WebSite', '@id': websiteId, url: homeUrl, name: 'TECSERVICE', inLanguage: locale, publisher: { '@id': organizationId } },
      {
        '@type': 'WebPage', '@id': pageId, url: canonical, name: metadata.title,
        description: metadata.description, inLanguage: locale, isPartOf: { '@id': websiteId },
        breadcrumb: { '@id': `${canonical}#breadcrumb` }, primaryImageOfPage: image,
        mainEntity: { '@id': `${canonical}${post ? '#article' : '#blog'}` },
      },
      { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: breadcrumb },
      post ? {
        ...articlePreviewSchema(post, locale),
        articleBody: post.sections.flatMap(section => [section.title, ...section.paragraphs, ...(section.bullets ?? [])]).join('\n\n'),
      } : {
        '@type': 'Blog', '@id': `${canonical}#blog`, url: canonical, name: locale === 'en' ? 'News' : 'სიახლეები',
        description: metadata.description, inLanguage: locale, publisher: { '@id': organizationId },
        mainEntityOfPage: { '@id': pageId },
        blogPost: getBlogPosts(locale).map(article => articlePreviewSchema(article, locale)),
      },
    ],
  }
}

export function serializeBlogStructuredData(pathname: string, metadata = getRouteMetadata(pathname)) {
  const data = getBlogStructuredData(pathname, metadata)
  return data ? JSON.stringify(data).replace(/</g, '\\u003c') : null
}
