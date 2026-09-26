import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { localeFromPath, type Locale } from './locale'
import { localizedHref, translateValue } from './translateRuntime'

const LocaleContext = createContext<{ locale: Locale; pathname: string }>({ locale: 'ka', pathname: '/' })

export function LocaleProvider({ pathname, children }: { pathname: string; children: ReactNode }) {
  const value = useMemo(() => ({ locale: localeFromPath(pathname), pathname }), [pathname])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useTranslation() {
  const { locale, pathname } = useContext(LocaleContext)
  return {
    locale,
    pathname,
    t: <T,>(value: T): T => translateValue(value, locale),
    href: (value: string | undefined) => localizedHref(value, locale),
  }
}
