import { publicApi } from '../config'
import type { BootstrapPlatformBody, BootstrapPlatformResult, PlatformStatus } from '../types'
import { apiPaths } from './httpPaths'

export async function getPlatformStatus(): Promise<PlatformStatus> {
  const { data } = await publicApi.get<PlatformStatus>(`${apiPaths.platform}/status`)
  return data
}

export async function bootstrapPlatform(body: BootstrapPlatformBody): Promise<BootstrapPlatformResult> {
  const { data } = await publicApi.post<BootstrapPlatformResult>(`${apiPaths.platform}/bootstrap`, body)
  return data
}
