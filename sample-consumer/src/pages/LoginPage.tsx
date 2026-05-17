import { Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { FeedbackAlerts, GoogleSignInButton } from '../components/ui'
import { env, signInWithGoogleAndGetIdToken } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { exchangeToken } from '../services'
import { getApiErrorMessage } from '../utils/apiError'
import { generatePkcePair } from '../utils/pkce'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { syncFromAuthResult } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLoginWithGoogle(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const identityToken = await signInWithGoogleAndGetIdToken()
      const { codeVerifier, codeChallenge } = await generatePkcePair()
      if (!codeVerifier) {
        throw new Error('Falha ao preparar PKCE para login.')
      }

      const result = await exchangeToken({
        identityToken,
        clientId: env.oauthClientId,
        redirectUri: env.oauthRedirectUri,
        codeChallenge,
        codeChallengeMethod: 'S256',
      })
      syncFromAuthResult(result)
      navigate('/')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Sample CRM" subtitle="App consumidora — login OAuth + PKCE">
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Client: <strong>{env.oauthClientId}</strong> — redirect: {env.oauthRedirectUri}
        </Typography>
        <FeedbackAlerts
          success={searchParams.get('bootstrapped') === '1' ? 'Bootstrap concluído. Faça login para acessar a plataforma.' : null}
          error={error}
        />
        <GoogleSignInButton loading={loading} onClick={() => void handleLoginWithGoogle()} />
      </Stack>
    </AuthLayout>
  )
}
