import axios from 'axios'
import { env } from './env'
import { clearAuthSession, getAuthSession, updateAccessTokenFromRefresh } from '../utils/authStorage'
import type { AuthResult, RefreshTokenBody } from '../types'
import { apiPaths } from '../services/httpPaths'

const baseURL = env.apiBaseUrl

export const publicApi = axios.create({
  baseURL,
  timeout: env.apiTimeoutMs,
})

export const api = axios.create({
  baseURL,
  timeout: env.apiTimeoutMs,
})

let refreshPromise: Promise<AuthResult> | null = null

async function refreshAccessToken(refreshToken: string): Promise<AuthResult> {
  const payload: RefreshTokenBody = { refreshToken }
  const response = await publicApi.post<AuthResult>(`${apiPaths.auth}/refresh`, payload)
  return response.data
}

api.interceptors.request.use((config) => {
  const session = getAuthSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const statusCode = error.response?.status

    if (!originalRequest || statusCode !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const session = getAuthSession()
    if (!session?.refreshToken) {
      clearAuthSession()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(session.refreshToken)
      }

      const refreshed = await refreshPromise
      updateAccessTokenFromRefresh(refreshed)
      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`
      return await api.request(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }
  },
)
