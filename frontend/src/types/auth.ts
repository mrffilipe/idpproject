export const SessionStatus = {
  Active: 0,
  Revoked: 1,
  Expired: 2,
} as const

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus]

export interface AuthTenantSummary {
  tenantId: string
  tenantName: string
  tenantKey: string
  roles: string[]
}

export interface AuthResult {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  userId: string
  email: string
  tenantId?: string | null
  membershipId?: string | null
  tenantRoles: string[]
  tenants: AuthTenantSummary[]
}

export interface AuthSession {
  sessionId: string
  tenantId?: string | null
  membershipId?: string | null
  clientId?: string | null
  status: SessionStatus
  userAgent?: string | null
  ipAddress?: string | null
  expiresAt: string
  lastActivityAt: string
}

export interface ExchangeTokenBody {
  identityToken: string
  clientId: string
  clientSecret?: string | null
  redirectUri?: string | null
  requestedScopes?: string[] | null
  codeChallenge?: string | null
  codeChallengeMethod?: string | null
}

export interface RefreshTokenBody {
  refreshToken: string
}

export interface SwitchTenantBody {
  tenantId: string
  refreshToken?: string | null
}
