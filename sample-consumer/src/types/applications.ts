import type { PagedResult } from './common'

export const ApplicationType = {
  Web: 0,
  Mobile: 1,
  Backend: 2,
} as const

export type ApplicationType = (typeof ApplicationType)[keyof typeof ApplicationType]

export const ClientType = {
  Public: 0,
  Confidential: 1,
} as const

export type ClientType = (typeof ClientType)[keyof typeof ClientType]

export interface Application {
  id: string
  name: string
  slug: string
  type: ApplicationType
}

export interface CreateApplicationBody {
  name: string
  slug: string
  type: ApplicationType
}

export interface CreateApplicationResponse {
  id: string
}

export interface CreateApplicationClientBody {
  clientId: string
  clientSecretHash?: string | null
  clientType: ClientType
  redirectUris: string
  allowedScopes: string
  accessTokenTtlSeconds: number
}

export interface CreateApplicationClientResponse {
  id: string
}

export interface ProvisionApplicationTenantBody {
  tenantName: string
  tenantKey: string
  initialAdministratorUserId?: string | null
  externalCustomerId?: string | null
  planCode?: string | null
}

export interface ProvisionApplicationTenantResponse {
  applicationId: string
  tenantId: string
  membershipId: string
}

export type ListApplicationsResponse = PagedResult<Application>
