import type { PagedResult } from './common'

export interface Tenant {
  id: string
  name: string
  key: string
}

export interface CreateTenantBody {
  name: string
  key: string
}

export interface UpdateTenantBody {
  name: string
}

export interface InviteMemberBody {
  email: string
  roles: string[]
}

export interface AcceptInviteBody {
  token: string
  identityToken: string
}

export interface InviteMemberResponse {
  id: string
}

export interface AcceptInviteResponse {
  membershipId: string
}

export type ListTenantsResponse = PagedResult<Tenant>
