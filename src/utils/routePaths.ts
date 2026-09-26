import { stripLocale } from '../i18n/locale.ts'
import { blogSlugs } from '../data/blogSlugs.ts'
import type { LegalPageKind } from '../data/legalPages.ts'

export const laptopRepairPath = '/services/laptop-repair'
export const computerRepairPath = '/services/computer-repair'
export const dataRecoveryPath = '/services/data-recovery'
export const consoleRepairPath = '/services/console-repair'
export const droneRepairPath = '/services/drone-repair'
export const mobileTabletRepairPath = '/services/mobile-tablet-repair'
export const otherElectronicsPath = '/services/other-electronics'
export const contactPath = '/contact'
export const aboutPath = '/about'
export const termsPath = '/terms'
export const privacyPath = '/privacy'
export const blogPath = '/blog'
export const accountPath = '/account'

export function isAccountPath(pathname: string) {
  const path = stripLocale(pathname)
  return path === accountPath || path === `${accountPath}/`
}

export function isBlogPath(pathname: string) {
  const path = stripLocale(pathname)
  return path === blogPath || path === `${blogPath}/`
}

export function getBlogArticleSlug(pathname: string): string | null {
  const match = stripLocale(pathname).match(/^\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)
  return match && blogSlugs.some(slug => slug === match[1]) ? match[1] : null
}

export function getBlogPaths(): string[] {
  return [blogPath, ...blogSlugs.map(slug => `${blogPath}/${slug}`)]
}

export function getLegalPageKind(pathname: string): LegalPageKind | null {
  const path = stripLocale(pathname).replace(/\/$/, '')
  if (path === termsPath) return 'terms'
  if (path === privacyPath) return 'privacy'
  return null
}

export function isHomePath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === '' || pathname === '/'
}

export function isLaptopRepairPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === laptopRepairPath || pathname === `${laptopRepairPath}/`
}

export function isComputerRepairPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === computerRepairPath || pathname === `${computerRepairPath}/`
}

export function isDataRecoveryPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === dataRecoveryPath || pathname === `${dataRecoveryPath}/`
}

export function isConsoleRepairPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === consoleRepairPath || pathname === `${consoleRepairPath}/`
}

export function isDroneRepairPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === droneRepairPath || pathname === `${droneRepairPath}/`
}

export function isMobileTabletRepairPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === mobileTabletRepairPath || pathname === `${mobileTabletRepairPath}/`
}

export function isOtherElectronicsPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === otherElectronicsPath || pathname === `${otherElectronicsPath}/`
}

export function isContactPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === contactPath || pathname === `${contactPath}/`
}

export function isAboutPath(pathname: string) {
  pathname = stripLocale(pathname)
  return pathname === aboutPath || pathname === `${aboutPath}/`
}

export function isKnownPublicPath(pathname: string) {
  return isHomePath(pathname)
    || isLaptopRepairPath(pathname)
    || isComputerRepairPath(pathname)
    || isDataRecoveryPath(pathname)
    || isConsoleRepairPath(pathname)
    || isDroneRepairPath(pathname)
    || isMobileTabletRepairPath(pathname)
    || isOtherElectronicsPath(pathname)
    || isContactPath(pathname)
    || isAboutPath(pathname)
    || isBlogPath(pathname)
    || isAccountPath(pathname)
    || getBlogArticleSlug(pathname) !== null
    || getLegalPageKind(pathname) !== null
}
