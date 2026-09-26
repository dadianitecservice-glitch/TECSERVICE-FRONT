import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { blogSlugs } from '../src/data/blogSlugs.ts'
import { getBlogPosts } from '../src/data/blogPosts.ts'
import * as paths from '../src/utils/routePaths.ts'
import * as metadata from '../src/utils/routes.ts'

test('the lightweight blog route manifest exactly matches published articles in both languages', () => {
  assert.equal(new Set(blogSlugs).size, blogSlugs.length)
  for (const locale of ['ka', 'en']) {
    assert.deepEqual([...blogSlugs], getBlogPosts(locale).map(post => post.slug))
  }
  assert.deepEqual(paths.getBlogPaths(), ['/blog', ...blogSlugs.map(slug => `/blog/${slug}`)])
})

test('metadata module preserves the original route API through exact re-exports', () => {
  for (const [name, value] of Object.entries(paths)) assert.equal(metadata[name], value, name)
})

test('lightweight predicates recognize every public route without accepting unknown or malformed paths', () => {
  const known = [
    paths.accountPath, paths.aboutPath, paths.contactPath, paths.termsPath, paths.privacyPath,
    paths.laptopRepairPath, paths.computerRepairPath, paths.dataRecoveryPath,
    paths.consoleRepairPath, paths.droneRepairPath, paths.mobileTabletRepairPath,
    paths.otherElectronicsPath, ...paths.getBlogPaths(),
  ]
  for (const prefix of ['', '/en']) {
    assert.equal(paths.isKnownPublicPath(`${prefix}/`), true)
    for (const path of known) {
      assert.equal(paths.isKnownPublicPath(`${prefix}${path}`), true)
      assert.equal(paths.isKnownPublicPath(`${prefix}${path}/`), true)
      assert.equal(paths.isKnownPublicPath(`${prefix}${path}//`), false)
      assert.equal(paths.isKnownPublicPath(`${prefix}${path}/unknown`), false)
    }
    for (const slug of blogSlugs) {
      assert.equal(paths.getBlogArticleSlug(`${prefix}/blog/${slug}/`), slug)
      assert.equal(paths.getBlogArticleSlug(`${prefix}/blog/${slug}`), slug)
    }
    for (const path of ['/blog/not-published/', '/blog/%2e%2e/', '/Blog/', '/services/missing/', '/account/settings/', '/terms-of-service/', '/en/en/blog/']) {
      assert.equal(paths.isKnownPublicPath(`${prefix}${path}`), false, `${prefix}${path}`)
      assert.equal(paths.getBlogArticleSlug(`${prefix}${path}`), null, `${prefix}${path}`)
    }
  }
})

test('navigation and route predicates do not import heavy page content at runtime', async () => {
  const source = await readFile(new URL('../src/utils/routePaths.ts', import.meta.url), 'utf8')
  const runtimeImports = [...source.matchAll(/^import (?!type\b).*?from ['"]([^'"]+)['"]/gm)].map(([, path]) => path)
  assert.deepEqual(runtimeImports, ['../i18n/locale.ts', '../data/blogSlugs.ts'])
  assert.doesNotMatch(source, /getBlogPost\(|blogArticleCopy|legalDocuments|translateText/)
  const navigation = await readFile(new URL('../src/utils/navigation.ts', import.meta.url), 'utf8')
  assert.match(navigation, /from '\.\/routePaths\.ts'/)
  assert.doesNotMatch(navigation, /from '\.\/routes\.ts'/)
})
