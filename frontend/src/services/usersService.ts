import { api } from '../config'
import type { ListUserMembershipsResponse, UpdateMeBody, User } from '../types'
import { apiPaths } from './httpPaths'

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>(`${apiPaths.users}/me`)
  return data
}

export async function updateMe(body: UpdateMeBody): Promise<void> {
  await api.patch(`${apiPaths.users}/me`, body)
}

export interface ListUserMembershipsParams {
  page?: number
  pageSize?: number
}

export async function listMyMemberships(
  params: ListUserMembershipsParams = {},
): Promise<ListUserMembershipsResponse> {
  const { data } = await api.get<ListUserMembershipsResponse>(`${apiPaths.users}/me/memberships`, {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  })
  return data
}
