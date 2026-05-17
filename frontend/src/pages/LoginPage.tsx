import { Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { FeedbackAlerts, GoogleSignInButton } from '../components/ui'
import { env, signInWithGoogleAndGetIdToken } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { exchangeToken, getPlatformStatus } from '../services'
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

      const status = await getPlatformStatus()
      const clientId = status.oauthClientId?.trim() || env.oauthClientId

      const result = await exchangeToken({
        identityToken,
        clientId,
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
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre com sua conta Google para acessar o painel">
      <Stack spacing={2.5}>
        <Typography variant="body2" color="text.secondary">
          Autenticação segura via Firebase e troca de token PKCE com o backend.
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
