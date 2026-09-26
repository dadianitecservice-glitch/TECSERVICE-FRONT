import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { customerApi, CustomerApiError } from './customerApi'
import type { CustomerUser } from './types'

export type AuthMode = 'login' | 'register' | 'help'
type CustomerAuth = {
  user: CustomerUser | null
  checking: boolean
  authMode: AuthMode | null
  openAuth: (mode?: AuthMode) => void
  closeAuth: () => void
  acceptUser: (user: CustomerUser) => void
  clearUser: () => void
  logout: () => Promise<void>
}
const AuthContext = createContext<CustomerAuth>({ user: null, checking: false, authMode: null, openAuth: () => {}, closeAuth: () => {}, acceptUser: () => {}, clearUser: () => {}, logout: async () => {} })

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const generation = useRef(0)
  useEffect(() => {
    const controller = new AbortController()
    const currentGeneration = generation.current
    customerApi.me(controller.signal).then(value => {
      if (!controller.signal.aborted && generation.current === currentGeneration) setUser(value)
    }).catch(() => {
      // Public pages remain usable if the account service is offline.
    }).finally(() => {
      if (!controller.signal.aborted && generation.current === currentGeneration) setChecking(false)
    })
    return () => controller.abort()
  }, [])

  const clearUser = () => { generation.current++; setUser(null); setChecking(false) }
  const acceptUser = (value: CustomerUser) => { generation.current++; setUser(value); setChecking(false) }
  const logout = async () => {
    try { await customerApi.logout() }
    catch (error) { if (!(error instanceof CustomerApiError && error.status === 401)) throw error }
    clearUser()
  }
  return <AuthContext.Provider value={{ user, checking, authMode, openAuth: (mode = 'login') => setAuthMode(mode), closeAuth: () => setAuthMode(null), acceptUser, clearUser, logout }}>{children}</AuthContext.Provider>
}

export function useCustomerAuth() { return useContext(AuthContext) }
