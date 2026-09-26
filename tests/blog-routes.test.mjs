import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { blogPosts, getBlogPost, getBlogPosts } from '../src/data/blogPosts.ts'
import { blogPath, getBlogPaths, isBlogPath, getBlogArticleSlug, getRouteMetadata, isKnownPublicPath } from '../src/utils/routes.ts'
import { getPrimaryLinkCurrent } from '../src/utils/navigation.ts'
import { getBlogStructuredData, serializeBlogStructuredData } from '../src/seo/blogStructuredData.ts'

const origin = 'https://tecservice.ge'
const root = new URL('../', import.meta.url)
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
  if (code.startsWith('#x')) return String.fromCodePoint(parseInt(code.slice(2), 16))
  if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)))
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[code.toLowerCase()] ?? entity
})
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), decode(value)]))

test('blog route helpers accept only the index and existing article slugs in both languages', () => {
  assert.equal(blogPath, '/blog')
  assert.deepEqual(getBlogPaths(), ['/blog', ...blogPosts.map(post => `/blog/${post.slug}`)])
  assert.equal(new Set(getBlogPaths()).size, blogPosts.length + 1)
  for (const prefix of ['', '/en']) {
    for (const suffix of ['', '/']) {
      assert.equal(isBlogPath(`${prefix}/blog${suffix}`), true)
      assert.equal(isKnownPublicPath(`${prefix}/blog${suffix}`), true)
      assert.equal(getBlogArticleSlug(`${prefix}/blog${suffix}`), null)
      for (const post of blogPosts) {
        const path = `${prefix}/blog/${post.slug}${suffix}`
        assert.equal(isBlogPath(path), false)
        assert.equal(getBlogArticleSlug(path), post.slug)
        assert.equal(isKnownPublicPath(path), true)
        assert.equal(getPrimaryLinkCurrent(`${prefix}/blog/`, path), 'location')
      }
      assert.equal(getPrimaryLinkCurrent('/blog/', `${prefix}/blog${suffix}`), 'page')
    }
    for (const path of ['/blog/no-such-post/', '/blogs/', '/blog//', '/blog/no-such-post/child/', `/blog/${blogPosts[0].slug}//`, '/blog/%2e%2e/', '/blog/<script>/']) {
      assert.equal(isBlogPath(`${prefix}${path}`), false)
      assert.equal(getBlogArticleSlug(`${prefix}${path}`), null)
      assert.equal(isKnownPublicPath(`${prefix}${path}`), false)
      assert.equal(getRouteMetadata(`${prefix}${path}`), null)
      assert.equal(getBlogStructuredData(`${prefix}${path}`), null)
      assert.equal(getPrimaryLinkCurrent('/blog/', `${prefix}${path}`), undefined)
    }
  }
})

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  for (const route of getBlogPaths()) {
    const path = `${prefix}${route}/`
    const slug = getBlogArticleSlug(path)
    const post = slug ? getBlogPost(slug, locale) : undefined

    test(`${path} source metadata and schema describe its own localized index or article`, () => {
      const metadata = getRouteMetadata(path)
      assert.ok(metadata)
      assert.equal(metadata.canonical, `${origin}${path}`)
      assert.equal(metadata.ogType, post ? 'article' : 'website')
      assert.match(metadata.robots, /^index, follow/)
      assert.deepEqual(metadata, getRouteMetadata(path.slice(0, -1)))
      const graph = getBlogStructuredData(path)['@graph']
      const page = graph.find(node => node['@type'] === 'WebPage')
      const website = graph.find(node => node['@type'] === 'WebSite')
      const breadcrumbs = graph.find(node => node['@type'] === 'BreadcrumbList').itemListElement
      assert.equal(page.url, metadata.canonical)
      assert.equal(page.inLanguage, locale)
      assert.equal(website.inLanguage, locale)
      assert.equal(breadcrumbs[1].item, `${origin}${prefix}/blog/`)
      assert.equal(breadcrumbs.at(-1).item, metadata.canonical)
      if (post) {
        const article = graph.find(node => node['@type'] === 'BlogPosting')
        assert.ok(article)
        assert.equal(article.headline, post.title)
        assert.equal(article.description, post.excerpt)
        assert.equal(article.datePublished, post.dateTime)
        assert.equal(article.inLanguage, locale)
        assert.equal(article.url, metadata.canonical)
        assert.equal(article.image.url, `${origin}${post.image}`)
        assert.equal(article.author['@id'], `${origin}/#business`)
        assert.deepEqual(article.mainEntityOfPage, { '@id': page['@id'] })
        assert.equal(article.isPartOf['@id'], `${origin}${prefix}/blog/#blog`)
        for (const section of post.sections) for (const paragraph of section.paragraphs) assert.ok(article.articleBody.includes(paragraph))
        assert.equal(graph.some(node => node['@type'] === 'Service'), false)
      } else {
        const blog = graph.find(node => node['@type'] === 'Blog')
        assert.equal(blog.blogPost.length, getBlogPosts(locale).length)
        assert.deepEqual(blog.blogPost.map(item => item.url), getBlogPosts(locale).map(item => `${origin}${prefix}/blog/${item.slug}/`))
      }
      if (locale === 'en') {
        assert.doesNotMatch(JSON.stringify(metadata), georgian)
        assert.doesNotMatch(JSON.stringify(graph), georgian)
      }
      assert.doesNotMatch(serializeBlogStructuredData(path), /<script|<\/script/i)
    })

    test(`${path} prerenders translated content, metadata, article links and active Blog navigation`, async () => {
      const html = await readFile(new URL(`dist${path}index.html`, root), 'utf8')
      const metadata = getRouteMetadata(path)
      const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attributes(tag))
      const contentOf = name => meta.filter(tag => tag.name === name || tag.property === name)
      const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0]
      assert.ok(main)
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1)
      assert.ok(html.includes(`<html lang="${locale}">`))
      assert.equal(decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]), metadata.title)
      for (const [key, value] of [['description', metadata.description], ['og:type', metadata.ogType], ['og:url', metadata.canonical], ['og:image', metadata.image], ['twitter:image', metadata.image]]) {
        assert.equal(contentOf(key).length, 1, `${path}: ${key}`)
        assert.equal(contentOf(key)[0].content, value)
      }
      const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag))
      assert.deepEqual(links.filter(link => link.rel === 'canonical').map(link => link.href), [metadata.canonical])
      assert.deepEqual(Object.fromEntries(links.filter(link => link.hreflang).map(link => [link.hreflang, link.href])), {
        ka: `${origin}${route}/`, en: `${origin}/en${route}/`, 'x-default': `${origin}${route}/`,
      })
      const schemas = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      assert.equal(schemas.length, 1)
      assert.deepEqual(JSON.parse(schemas[0][1]), getBlogStructuredData(path))
      const header = html.match(/<header\b[\s\S]*?<\/header>/)[0]
      const blogLink = [...header.matchAll(/<a\b[^>]*>/g)].map(([tag]) => attributes(tag)).find(link => link.href === `${prefix}/blog/`)
      assert.ok(blogLink)
      assert.equal(blogLink['aria-current'], post ? 'location' : 'page')
      const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)[0]
      assert.ok(footer.includes(`href="${prefix}/blog/"`))
      assert.doesNotMatch(main, /სტატია მზადდება|Article coming soon/i)
      if (post) {
        const visible = decode(main.replace(/<[^>]+>/g, ' '))
        for (const section of post.sections) for (const paragraph of section.paragraphs) assert.ok(visible.includes(paragraph), `${path} missing article paragraph`)
      } else {
        for (const article of getBlogPosts(locale)) assert.ok(main.includes(`href="${prefix}/blog/${article.slug}/"`))
      }
      if (locale === 'en') assert.doesNotMatch(main, georgian)
      for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
        const anchor = attributes(tag)
        if (!anchor.href || !anchor.href.startsWith('/') || anchor.href.startsWith('//')) continue
        const expectedEnglish = anchor.hreflang ? anchor.hreflang === 'en' : locale === 'en'
        assert.equal(anchor.href.startsWith('/en/'), expectedEnglish, `${path}: ${anchor.href}`)
      }
      await access(new URL(`public${new URL(metadata.image).pathname}`, root))
    })
  }
}

test('published Blog URLs appear exactly once in both source and built sitemaps, with legal drafts still excluded', async () => {
  for (const file of ['public/sitemap.xml', 'dist/sitemap.xml']) {
    const sitemap = await readFile(new URL(file, root), 'utf8')
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url)
    assert.equal(new Set(urls).size, urls.length)
    for (const route of getBlogPaths()) for (const prefix of ['', '/en']) assert.equal(urls.filter(url => url === `${origin}${prefix}${route}/`).length, 1)
    assert.doesNotMatch(sitemap, /\/terms\/|\/privacy\/|\/blog\/no-such-post/)
  }
})

test('production Blog paths serve real static files and retain genuine missing-article 404s', async () => {
  const config = await readFile(new URL('docs/nginx-seo-routes.conf', root), 'utf8')
  for (const prefix of ['', '/en']) {
    assert.ok(config.includes(`location = ${prefix}/blog { return 308 ${prefix}/blog/$is_args$args; }`))
    assert.ok(config.includes(`location = ${prefix}/blog/ { try_files ${prefix}/blog/index.html =404; }`))
  }
  assert.match(config, /location \/blog\/ \{\s*try_files \$uri \$uri\/index\.html =404;/)
})
