import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useAuth } from './AuthContext'
import { switchTenant } from '../services'
import type { AuthTenantSummary } from '../types'
import { getAuthSession } from '../utils/authStorage'
import { setSelectedTenantId } from '../utils/tenantStorage'

interface TenantContextValue {
  tenantId: string | null
  tenantName: string | null
  availableTenants: AuthTenantSummary[]
  hasMultipleTenants: boolean
  isResolving: boolean
  selectTenant: (tenantId: string) => Promise<void>
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, tenantId: jwtTenantId, tenants: availableTenants, syncFromAuthResult } = useAuth()
  const [isResolving, setIsResolving] = useState(false)
  const autoSwitchAttempted = useRef(false)

  const tenantId = useMemo((): string | null => {
    if (jwtTenantId) {
      return jwtTenantId
    }
    if (availableTenants.length === 1) {
      return availableTenants[0].tenantId
    }
    return null
  }, [availableTenants, jwtTenantId])

  const tenantName = useMemo(() => {
    if (!tenantId) {
      return null
    }
    return availableTenants.find((tenant) => tenant.tenantId === tenantId)?.tenantName ?? null
  }, [availableTenants, tenantId])

  const hasMultipleTenants = availableTenants.length > 1

  const selectTenant = useCallback(
    async (nextTenantId: string) => {
      const refreshToken = getAuthSession()?.refreshToken
      if (!refreshToken) {
        throw new Error('Sessão inválida.')
      }

      setIsResolving(true)
      try {
        const result = await switchTenant({ tenantId: nextTenantId, refreshToken })
        syncFromAuthResult(result)
        setSelectedTenantId(nextTenantId)
      } finally {
        setIsResolving(false)
      }
    },
    [syncFromAuthResult],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      autoSwitchAttempted.current = false
      setSelectedTenantId(null)
      return
    }

    if (jwtTenantId) {
      setSelectedTenantId(jwtTenantId)
      return
    }

    if (availableTenants.length !== 1 || autoSwitchAttempted.current) {
      return
    }

    autoSwitchAttempted.current = true
    void selectTenant(availableTenants[0].tenantId).catch(() => {
      autoSwitchAttempted.current = false
    })
  }, [availableTenants, isAuthenticated, jwtTenantId, selectTenant])

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
      tenantName,
      availableTenants,
      hasMultipleTenants,
      isResolving,
      selectTenant,
    }),
    [availableTenants, hasMultipleTenants, isResolving, selectTenant, tenantId, tenantName],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}
