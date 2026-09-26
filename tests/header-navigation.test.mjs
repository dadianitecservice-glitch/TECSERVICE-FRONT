import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getPrimaryLinkCurrent } from '../src/utils/navigation.ts'

const root = new URL('../', import.meta.url)
const servicePaths = [
  '/services/laptop-repair/',
  '/services/computer-repair/',
  '/services/data-recovery/',
  '/services/console-repair/',
  '/services/drone-repair/',
  '/services/mobile-tablet-repair/',
  '/services/other-electronics/',
]

test('current page links match Georgian and English routes with either trailing-slash form', () => {
  for (const page of ['contact', 'about', 'blog']) {
    for (const href of [`/${page}`, `/${page}/`, `/en/${page}/`]) {
      for (const pathname of [`/${page}`, `/${page}/`, `/en/${page}`, `/en/${page}/`]) {
        assert.equal(getPrimaryLinkCurrent(href, pathname), 'page', `${href} on ${pathname}`)
        assert.equal(getPrimaryLinkCurrent(href, pathname, '#contact'), 'page', `${pathname} with a fragment`)
      }
    }
    for (const pathname of ['/', '/en/', `/${page}s`, `/${page}/team`, `/en/${page}/team`, '/no-such-page']) {
      assert.equal(getPrimaryLinkCurrent(`/${page}/`, pathname), undefined, pathname)
    }
  }
  assert.equal(getPrimaryLinkCurrent('/about/', '/contact/'), undefined)
  assert.equal(getPrimaryLinkCurrent('/contact/', '/about/'), undefined)
})

test('homepage section links follow the selected hash in both languages', () => {
  for (const pathname of ['/', '/en', '/en/']) {
    assert.equal(getPrimaryLinkCurrent('#blog', pathname, '#blog'), 'location', pathname)
    assert.equal(getPrimaryLinkCurrent('#contact', pathname, '#contact'), 'location', pathname)
    assert.equal(getPrimaryLinkCurrent('#blog', pathname, '#contact'), undefined, pathname)
    assert.equal(getPrimaryLinkCurrent('#contact', pathname, '#blog'), undefined, pathname)
    for (const hash of ['', '#ticket', '#unknown']) {
      assert.equal(getPrimaryLinkCurrent('#blog', pathname, hash), undefined, `${pathname}${hash}`)
      assert.equal(getPrimaryLinkCurrent('#contact', pathname, hash), undefined, `${pathname}${hash}`)
    }
  }
})

test('matching hashes never select homepage links on another page or an unknown route', () => {
  for (const pathname of ['/contact/', '/en/contact/', '/about/', '/en/about/', ...servicePaths, ...servicePaths.map(path => `/en${path}`), '/unknown', '/en/unknown', '/en/en/', '/english/']) {
    for (const hash of ['#blog', '#contact']) {
      assert.equal(getPrimaryLinkCurrent(hash, pathname, hash), undefined, `${pathname}${hash}`)
    }
  }
  for (const pathname of ['/', '/en/', '/contact/']) {
    assert.equal(getPrimaryLinkCurrent('https://shop.tecservice.ge', pathname), undefined, pathname)
  }
})

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]))
}

for (const prefix of ['', '/en']) {
  for (const path of ['/', ...servicePaths, '/contact/', '/about/']) {
    const pathname = `${prefix}${path}`
    test(`prerendered header marks only the current navigation entry on ${pathname}`, async () => {
      const html = await readFile(new URL(`dist${pathname}index.html`, root), 'utf8')
      const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0]
      assert.ok(header, `Missing header on ${pathname}`)
      const headerHoursLink = header.match(/<a\b[^>]*class="site-header__hours-link"[^>]*>/)?.[0]
      assert.ok(headerHoursLink, `Missing opening-hours link on ${pathname}`)
      assert.equal(attributes(headerHoursLink).href, `${prefix}/contact/#working-hours`)
      const mobileUtility = header.match(/<div class="site-header__mobile-utility">[\s\S]*?<\/div>/)?.[0]
      assert.ok(mobileUtility?.includes(`href="${prefix}/contact/#working-hours"`), `Missing mobile opening-hours link on ${pathname}`)
      const nav = header.match(/<nav\b[^>]*class="site-header__primary-nav"[^>]*>[\s\S]*?<\/nav>/)?.[0]
      assert.ok(nav, `Missing primary navigation on ${pathname}`)
      const links = [...nav.matchAll(/<a\b[^>]*>/g)].map(([tag]) => attributes(tag))
      const buttons = [...nav.matchAll(/<button\b[^>]*>/g)].map(([tag]) => attributes(tag))
      const isService = servicePaths.includes(path)
      const isContact = path === '/contact/'
      const isAbout = path === '/about/'
      const currentLinks = links.filter(link => link['aria-current'])
      const serviceButton = buttons.find(button => button['aria-controls'] === 'site-services-dropdown')
      assert.ok(serviceButton)
      assert.equal(serviceButton['aria-current'], isService ? 'true' : undefined)
      assert.equal(currentLinks.length, isService || isContact || isAbout ? 1 : 0)
      if (isService || isContact || isAbout) {
        assert.equal(currentLinks[0].href, pathname)
        assert.equal(currentLinks[0]['aria-current'], 'page')
      }
      for (const servicePath of servicePaths) {
        assert.ok(links.some(link => link.href === `${prefix}${servicePath}`), `Missing service ${servicePath}`)
      }
      for (const pagePath of ['/about/', '/contact/', '/blog/']) {
        assert.ok(links.some(link => link.href === `${prefix}${pagePath}`), `Missing page ${pagePath}`)
      }
      assert.ok(!links.some(link => link.href?.endsWith('#blog')), 'Blog navigation must link to its dedicated page')
      assert.ok(!links.some(link => link.href?.endsWith('#contact')), 'About navigation must link to its dedicated page')
    })
  }
}
