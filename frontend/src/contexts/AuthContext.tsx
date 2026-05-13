import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AuthResult } from '../types'
import { clearAuthSession, getAuthSession, saveAuthSessionFromResult } from '../utils/authStorage'

interface AuthContextValue {
  isAuthenticated: boolean
  userId?: string
  email?: string
  tenantId?: string | null
  tenantRoles: string[]
  syncFromAuthResult: (result: AuthResult) => void
  logoutLocal: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(getAuthSession())

  const syncFromAuthResult = useCallback((result: AuthResult) => {
    const saved = saveAuthSessionFromResult(result)
    setSession(saved)
  }, [])

  const logoutLocal = useCallback(() => {
    clearAuthSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session?.accessToken),
      userId: session?.userId,
      email: session?.email,
      tenantId: session?.tenantId,
      tenantRoles: session?.tenantRoles ?? [],
      syncFromAuthResult,
      logoutLocal,
    }),
    [logoutLocal, session, syncFromAuthResult],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
