import type { ApplicationType, ClientType } from './applications'

export interface PlatformStatus {
  isConfigured: boolean
  requiresBootstrap: boolean
  oauthClientId?: string | null
}

export interface BootstrapPlatformBody {
  identityToken: string
  tenantName: string
  tenantKey: string
  applicationName: string
  applicationSlug: string
  applicationType: ApplicationType
  clientId: string
  clientType: ClientType
  clientSecret?: string | null
  redirectUris: string[]
  allowedScopes: string[]
  accessTokenTtlSeconds: number
}

export interface BootstrapPlatformResult {
  isConfigured: boolean
  rootUserId: string
  tenantId: string
  applicationId: string
  oauthClientId: string
}
