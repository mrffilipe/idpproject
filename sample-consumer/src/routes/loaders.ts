import { redirect } from 'react-router'
import { getPlatformStatus } from '../services'
import type { PlatformStatus } from '../types'
import { getAuthSession } from '../utils/authStorage'
import { getSelectedTenantId } from '../utils/tenantStorage'

let platformStatusCache: (PlatformStatus & { fetchedAt: number }) | null = null
const platformStatusCacheTtlMs = 3000

async function loadPlatformStatus(): Promise<PlatformStatus> {
  const now = Date.now()
  if (platformStatusCache && now - platformStatusCache.fetchedAt < platformStatusCacheTtlMs) {
    return platformStatusCache
  }

  const result = await getPlatformStatus()
  platformStatusCache = {
    fetchedAt: now,
    ...result,
  }
  return platformStatusCache
}

export async function requireAuthLoader(): Promise<null> {
  const platformStatus = await loadPlatformStatus()
  if (platformStatus.requiresBootstrap) {
    throw redirect('/bootstrap')
  }

  const session = getAuthSession()
  if (!session?.accessToken) {
    throw redirect('/login')
  }

  return null
}

export async function loginLoader(): Promise<null> {
  const platformStatus = await loadPlatformStatus()
  if (platformStatus.requiresBootstrap) {
    throw redirect('/bootstrap')
  }

  const session = getAuthSession()
  if (session?.accessToken) {
    throw redirect('/')
  }

  return null
}

export async function bootstrapLoader(): Promise<null> {
  const platformStatus = await loadPlatformStatus()
  if (!platformStatus.requiresBootstrap) {
    throw redirect('/login')
  }

  return null
}

export async function requireTenantLoader(): Promise<null> {
  await requireAuthLoader()

  const tenantId = getSelectedTenantId()
  if (!tenantId) {
    throw redirect('/tenants')
  }

  return null
}
