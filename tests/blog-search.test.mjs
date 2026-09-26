import test from 'node:test'
import assert from 'node:assert/strict'
import { getBlogPost } from '../src/data/blogPosts.ts'
import { matchesBlogQuery } from '../src/utils/blogSearch.ts'

test('blog search accepts Georgian title inflections and Mtavruli input', () => {
  const post = getBlogPost('laptop-battery-replacement-signs')
  assert.equal(matchesBlogQuery(post, 'ბატარეა'), true)
  assert.equal(matchesBlogQuery(post, 'ᲑᲐᲢᲐᲠᲔᲐ'), true)
  assert.equal(matchesBlogQuery(post, 'ლეპტოპი ბატარეა'), true)
})

test('blog search includes body text, ignores case and rejects missing terms', () => {
  const post = getBlogPost('laptop-battery-replacement-signs', 'en')
  assert.equal(matchesBlogQuery(post, '  BATTERY  '), true)
  assert.equal(matchesBlogQuery(post, post.sections[1].title), true)
  assert.equal(matchesBlogQuery(post, 'battery xyz-no-match'), false)
  assert.equal(matchesBlogQuery(post, '   '), true)
})
