import test from 'node:test'
import assert from 'node:assert/strict'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import { getBlogStructuredData } from '../src/seo/blogStructuredData.ts'

for (const locale of ['ka', 'en']) {
  const prefix = locale === 'en' ? '/en' : ''
  test(`${locale} Blog previews share truthful image, authorship and dates with their article schema`, () => {
    const graph = getBlogStructuredData(`${prefix}/blog/`)['@graph']
    const blog = graph.find(node => node['@type'] === 'Blog')
    const organization = graph.find(node => node['@type'] === 'Organization')
    const posts = getBlogPosts(locale)
    assert.equal(blog.blogPost.length, posts.length)
    for (const [index, preview] of blog.blogPost.entries()) {
      const post = posts[index]
      const article = getBlogStructuredData(`${prefix}/blog/${post.slug}/`)['@graph'].find(node => node['@type'] === 'BlogPosting')
      const { articleBody, ...articlePreview } = article
      assert.ok(articleBody)
      assert.deepEqual(preview, articlePreview)
      assert.equal(preview.inLanguage, locale)
      assert.equal(preview.datePublished, post.dateTime)
      assert.equal(preview.image.url, `https://tecservice.ge${post.image}`)
      assert.equal(preview.image.width, post.imageWidth)
      assert.equal(preview.image.height, post.imageHeight)
      assert.equal(preview.author['@id'], organization['@id'])
      assert.equal(preview.publisher['@id'], organization['@id'])
      assert.equal(preview.mainEntityOfPage['@id'], `${preview.url}#webpage`)
      assert.equal(preview.isPartOf['@id'], blog['@id'])
      assert.equal('dateModified' in preview, false, 'Do not invent modification dates for unchanged articles')
      assert.equal('aggregateRating' in preview, false)
    }
  })
}
