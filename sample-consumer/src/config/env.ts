function optional(name: string): string | undefined {
  const value = (import.meta.env as Record<string, string | undefined>)[name]
  return value?.trim() || undefined
}

function required(name: string): string {
  const value = optional(name)
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function positiveNumber(name: string, fallback: number): number {
  const raw = optional(name)
  if (!raw) {
    return fallback
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number. Received: ${raw}`)
  }
  return parsed
}

const apiBaseUrl = (optional('VITE_API_BASE_URL') ?? '').replace(/\/$/, '')

export const env = {
  apiBaseUrl,
  apiVersion: optional('VITE_API_VERSION') ?? '1.0',
  apiTimeoutMs: positiveNumber('VITE_API_TIMEOUT_MS', 30_000),
  oauthClientId: required('VITE_OAUTH_CLIENT_ID'),
  oauthRedirectUri: required('VITE_OAUTH_REDIRECT_URI').replace(/\/$/, ''),
  /** Apenas fluxo legado em /dev/onboarding-legacy */
  applicationId: optional('VITE_APPLICATION_ID'),
  firebaseApiKey: required('VITE_FIREBASE_API_KEY'),
  firebaseAuthDomain: required('VITE_FIREBASE_AUTH_DOMAIN'),
  firebaseProjectId: required('VITE_FIREBASE_PROJECT_ID'),
  firebaseAppId: optional('VITE_FIREBASE_APP_ID') ?? '',
} as const
