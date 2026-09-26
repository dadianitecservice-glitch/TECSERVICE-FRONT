import { createElement, type ComponentType, type ComponentProps } from 'react'
import type { Header } from './components/Header'
import { localeFromPath } from './i18n/locale'
import { prepareTranslations } from './i18n/translateRuntime'
import {
  aboutPath, blogPath, contactPath, computerRepairPath, consoleRepairPath,
  dataRecoveryPath, droneRepairPath, laptopRepairPath, mobileTabletRepairPath,
  otherElectronicsPath, getBlogArticleSlug, getLegalPageKind, isAccountPath,
  isAboutPath, isBlogPath, isComputerRepairPath, isConsoleRepairPath, isContactPath,
  isDataRecoveryPath, isDroneRepairPath, isHomePath, isLaptopRepairPath,
  isMobileTabletRepairPath, isOtherElectronicsPath,
} from './utils/routePaths'

// Both browser and prerenderer await the same route before rendering. Crawlers
// receive full content, not a Suspense placeholder; other pages stay unloaded.
const pageLoaders = {
  'src/pages/HomePage.tsx': () => import('./pages/HomePage'),
  'src/pages/AccountPage.tsx': () => import('./pages/AccountPage'),
  'src/pages/AboutPage.tsx': () => import('./pages/AboutPage'),
  'src/pages/ContactPage.tsx': () => import('./pages/ContactPage'),
  'src/pages/BlogPage.tsx': () => import('./pages/BlogPage'),
  'src/pages/BlogArticlePage.tsx': () => import('./pages/BlogArticlePage'),
  'src/pages/LegalPage.tsx': () => import('./pages/LegalPage'),
  'src/pages/LaptopRepairPage.tsx': () => import('./pages/LaptopRepairPage'),
  'src/pages/ComputerRepairPage.tsx': () => import('./pages/ComputerRepairPage'),
  'src/pages/DataRecoveryPage.tsx': () => import('./pages/DataRecoveryPage'),
  'src/pages/ConsoleRepairPage.tsx': () => import('./pages/ConsoleRepairPage'),
  'src/pages/DroneRepairPage.tsx': () => import('./pages/DroneRepairPage'),
  'src/pages/MobileTabletRepairPage.tsx': () => import('./pages/MobileTabletRepairPage'),
  'src/pages/OtherElectronicsRepairPage.tsx': () => import('./pages/OtherElectronicsRepairPage'),
  'src/pages/NotFoundPage.tsx': () => import('./pages/NotFoundPage'),
}

type PageSelection = {
  entry: keyof typeof pageLoaders
  header: ComponentProps<typeof Header>
  props?: { slug: string } | { kind: 'terms' | 'privacy' }
}

function selectPage(pathname: string): PageSelection {
  const header = { homePath: '/' as const }
  if (isHomePath(pathname)) return { entry: 'src/pages/HomePage.tsx', header: {} }
  if (isAccountPath(pathname)) return { entry: 'src/pages/AccountPage.tsx', header: { ...header, activePagePath: '/account/' } }
  if (isAboutPath(pathname)) return { entry: 'src/pages/AboutPage.tsx', header: { ...header, activePagePath: aboutPath } }
  if (isContactPath(pathname)) return { entry: 'src/pages/ContactPage.tsx', header: { ...header, activePagePath: contactPath } }
  if (isBlogPath(pathname)) return { entry: 'src/pages/BlogPage.tsx', header: { ...header, activePagePath: blogPath } }
  const slug = getBlogArticleSlug(pathname)
  if (slug) return { entry: 'src/pages/BlogArticlePage.tsx', header: { ...header, activePagePath: pathname }, props: { slug } }
  const kind = getLegalPageKind(pathname)
  if (kind) return { entry: 'src/pages/LegalPage.tsx', header, props: { kind } }
  for (const [matches, entry, activeServicePath] of [
    [isLaptopRepairPath, 'src/pages/LaptopRepairPage.tsx', laptopRepairPath],
    [isComputerRepairPath, 'src/pages/ComputerRepairPage.tsx', computerRepairPath],
    [isDataRecoveryPath, 'src/pages/DataRecoveryPage.tsx', dataRecoveryPath],
    [isConsoleRepairPath, 'src/pages/ConsoleRepairPage.tsx', consoleRepairPath],
    [isDroneRepairPath, 'src/pages/DroneRepairPage.tsx', droneRepairPath],
    [isMobileTabletRepairPath, 'src/pages/MobileTabletRepairPage.tsx', mobileTabletRepairPath],
    [isOtherElectronicsPath, 'src/pages/OtherElectronicsRepairPage.tsx', otherElectronicsPath],
  ] as const) {
    if (matches(pathname)) return { entry, header: { ...header, activeServicePath } }
  }
  return { entry: 'src/pages/NotFoundPage.tsx', header }
}

export function getPageModuleId(pathname: string) {
  return selectPage(pathname).entry
}

export async function loadPage(pathname: string) {
  const selection = selectPage(pathname)
  const [module] = await Promise.all([
    pageLoaders[selection.entry](),
    prepareTranslations(localeFromPath(pathname)),
  ])
  const Page = module.default as ComponentType<{ slug?: string; kind?: 'terms' | 'privacy' }>
  return { content: createElement(Page, selection.props ?? {}), header: selection.header }
}

export type LoadedPage = Awaited<ReturnType<typeof loadPage>>
