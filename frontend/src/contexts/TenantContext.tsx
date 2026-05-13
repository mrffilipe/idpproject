import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { getSelectedTenantId, setSelectedTenantId } from '../utils/tenantStorage'

interface TenantContextValue {
  tenantId: string | null
  selectTenant: (tenantId: string | null) => void
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: PropsWithChildren) {
  const [tenantId, setTenantId] = useState<string | null>(getSelectedTenantId())

  const selectTenant = useCallback((nextTenantId: string | null) => {
    setSelectedTenantId(nextTenantId)
    setTenantId(nextTenantId)
  }, [])

  const value = useMemo(
    () => ({
      tenantId,
      selectTenant,
    }),
    [selectTenant, tenantId],
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
