import { api, publicApi } from '../config'
import type {
  AuthResult,
  AuthSession,
  ExchangeTokenBody,
  RefreshTokenBody,
  SubscribeTenantBody,
  SwitchTenantBody,
} from '../types'
import { apiPaths } from './httpPaths'

export async function exchangeToken(body: ExchangeTokenBody): Promise<AuthResult> {
  const { data } = await publicApi.post<AuthResult>(`${apiPaths.auth}/exchange`, body)
  return data
}

export async function refreshToken(body: RefreshTokenBody): Promise<AuthResult> {
  const { data } = await publicApi.post<AuthResult>(`${apiPaths.auth}/refresh`, body)
  return data
}

export async function switchTenant(body: SwitchTenantBody): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>(`${apiPaths.auth}/switch-tenant`, body)
  return data
}

/** Onboarding SaaS: cria tenant para a Application do OAuth client da sessão atual. */
export async function subscribeTenant(body: SubscribeTenantBody): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>(`${apiPaths.auth}/subscribe`, body)
  return data
}

export async function listActiveSessions(): Promise<AuthSession[]> {
  const { data } = await api.get<AuthSession[]>(`${apiPaths.auth}/sessions`)
  return data
}

export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`${apiPaths.auth}/sessions/${sessionId}`)
}

export async function logout(body: RefreshTokenBody): Promise<void> {
  await publicApi.post(`${apiPaths.auth}/logout`, body)
}
