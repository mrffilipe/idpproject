import { Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { AuthLayout } from '../components/AuthLayout'
import { FeedbackAlerts } from '../components/ui'
import { acceptInvite } from '../services'
import { getApiErrorMessage } from '../utils/apiError'

export function AcceptInvitePage() {
  const [token, setToken] = useState('')
  const [identityToken, setIdentityToken] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSuccess(null)
    setError(null)
    setLoading(true)
    try {
      const data = await acceptInvite({
        token,
        identityToken,
      })
      setSuccess(`Convite aceito com sucesso. Membership: ${data.membershipId}`)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Aceitar convite" subtitle="Use o token recebido por e-mail para entrar no tenant">
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Typography variant="body2" color="text.secondary">
          Informe o token do convite e o identity token obtido após autenticação com Google/Firebase.
        </Typography>
        <FeedbackAlerts success={success} error={error} />
        <TextField label="Token do convite" value={token} onChange={(event) => setToken(event.target.value)} required fullWidth />
        <TextField
          label="Identity token"
          value={identityToken}
          onChange={(event) => setIdentityToken(event.target.value)}
          required
          fullWidth
          multiline
          minRows={2}
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? 'Processando...' : 'Aceitar convite'}
        </Button>
      </Stack>
    </AuthLayout>
  )
}
