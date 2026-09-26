import { stripLocale } from '../i18n/locale.ts'
import { getBlogArticleSlug, isBlogPath } from './routePaths.ts'

/** Page links match exactly; homepage section links match the current fragment. */
export function getPrimaryLinkCurrent(href: string, pathname: string, hash = ''): 'page' | 'location' | undefined {
  const currentPath = stripLocale(pathname).replace(/\/+$/, '') || '/'
  if (href.startsWith('#')) {
    return currentPath === '/' && href === hash ? 'location' : undefined
  }
  if (!href.startsWith('/') || href.startsWith('//')) return undefined
  const targetPath = stripLocale(href).replace(/\/+$/, '') || '/'
  if (targetPath === '/blog') {
    if (getBlogArticleSlug(pathname)) return 'location'
    return isBlogPath(pathname) ? 'page' : undefined
  }
  return currentPath === targetPath ? 'page' : undefined
}
