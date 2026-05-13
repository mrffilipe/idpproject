import { api, publicApi } from '../config'
import type {
  AcceptInviteBody,
  AcceptInviteResponse,
  CreateTenantBody,
  InviteMemberBody,
  InviteMemberResponse,
  ListTenantsResponse,
  Tenant,
  UpdateTenantBody,
} from '../types'
import { apiPaths } from './httpPaths'

export interface ListTenantsParams {
  page?: number
  pageSize?: number
}

export async function createTenant(body: CreateTenantBody): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>(apiPaths.tenants, body)
  return data
}

export async function listTenants(params: ListTenantsParams = {}): Promise<ListTenantsResponse> {
  const { data } = await api.get<ListTenantsResponse>(apiPaths.tenants, {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })
  return data
}

export async function getTenantById(id: string): Promise<Tenant> {
  const { data } = await api.get<Tenant>(`${apiPaths.tenants}/${id}`)
  return data
}

export async function updateTenant(id: string, body: UpdateTenantBody): Promise<void> {
  await api.patch(`${apiPaths.tenants}/${id}`, body)
}

export async function inviteMember(id: string, body: InviteMemberBody): Promise<InviteMemberResponse> {
  const { data } = await api.post<InviteMemberResponse>(`${apiPaths.tenants}/${id}/invites`, body)
  return data
}

export async function acceptInvite(body: AcceptInviteBody): Promise<AcceptInviteResponse> {
  const { data } = await publicApi.post<AcceptInviteResponse>(`${apiPaths.invites}/accept`, body)
  return data
}
