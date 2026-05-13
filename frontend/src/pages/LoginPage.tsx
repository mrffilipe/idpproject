import { Alert, Box, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageCard } from '../components/PageCard'
import { useAuth } from '../contexts/AuthContext'
import { exchangeToken } from '../services'
import { getApiErrorMessage } from '../utils/apiError'

export function LoginPage() {
  const navigate = useNavigate()
  const { syncFromAuthResult } = useAuth()

  const [identityToken, setIdentityToken] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await exchangeToken({
        identityToken,
        clientId,
        clientSecret: clientSecret || null,
        redirectUri: redirectUri || null,
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
    <Box sx={{ maxWidth: 720, mx: 'auto', mt: 6 }}>
      <PageCard
        title="Login"
        subtitle="Fluxo de Exchange Token (POST /v1.0/auth/exchange) com persistência de sessão."
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Identity Token"
              value={identityToken}
              onChange={(event) => setIdentityToken(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Client Id"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Client Secret"
              value={clientSecret}
              onChange={(event) => setClientSecret(event.target.value)}
              fullWidth
            />
            <TextField
              label="Redirect Uri"
              value={redirectUri}
              onChange={(event) => setRedirectUri(event.target.value)}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Stack>
        </Box>
      </PageCard>
    </Box>
  )
}
