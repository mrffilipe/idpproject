import type { AuthResult } from '../types'

const SESSION_STORAGE_KEY = 'idp.auth.session'

export interface AuthSessionStorage {
  accessToken: string
  refreshToken: string
  expiresAtIso: string
  userId: string
  email: string
  tenantId?: string | null
  membershipId?: string | null
  tenantRoles: string[]
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function getAuthSession(): AuthSessionStorage | null {
  if (!isBrowser()) {
    return null
  }

  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSessionStorage
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveAuthSessionFromResult(result: AuthResult): AuthSessionStorage {
  const expiresAt = new Date(Date.now() + result.expiresInSeconds * 1000).toISOString()
  const session: AuthSessionStorage = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAtIso: expiresAt,
    userId: result.userId,
    email: result.email,
    tenantId: result.tenantId,
    membershipId: result.membershipId,
    tenantRoles: result.tenantRoles,
  }

  if (isBrowser()) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }

  return session
}

export function updateAccessTokenFromRefresh(result: AuthResult): void {
  const current = getAuthSession()
  if (!current) {
    saveAuthSessionFromResult(result)
    return
  }

  const updated: AuthSessionStorage = {
    ...current,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAtIso: new Date(Date.now() + result.expiresInSeconds * 1000).toISOString(),
    tenantId: result.tenantId,
    membershipId: result.membershipId,
    tenantRoles: result.tenantRoles,
  }

  if (isBrowser()) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated))
  }
}

export function clearAuthSession(): void {
  if (isBrowser()) {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}

export function isAuthenticated(): boolean {
  const session = getAuthSession()
  return Boolean(session?.accessToken)
}
