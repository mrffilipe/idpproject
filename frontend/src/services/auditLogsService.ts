import { api } from '../config'
import type { ListAuditLogsFilters, ListAuditLogsResponse } from '../types'
import { compactQuery } from '../utils/queryParams'
import { apiPaths } from './httpPaths'

export async function listAuditLogs(filters: ListAuditLogsFilters = {}): Promise<ListAuditLogsResponse> {
  const { data } = await api.get<ListAuditLogsResponse>(apiPaths.auditLogs, {
    params: compactQuery({
      ...filters,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 20,
    }),
  })
  return data
}
