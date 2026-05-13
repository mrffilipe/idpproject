import { Alert, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { PageCard } from '../components/PageCard'
import { acceptInvite } from '../services'
import { getApiErrorMessage } from '../utils/apiError'

export function AcceptInvitePage() {
  const [token, setToken] = useState('')
  const [identityToken, setIdentityToken] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSuccess(null)
    setError(null)
    try {
      const data = await acceptInvite({
        token,
        identityToken,
      })
      setSuccess(`Convite aceito, membershipId: ${data.membershipId}`)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  return (
    <PageCard title="Aceitar Convite" subtitle="POST /v1.0/invites/accept (anônimo)">
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        {success ? <Alert severity="success">{success}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField label="Token do convite" value={token} onChange={(event) => setToken(event.target.value)} required />
        <TextField
          label="Identity Token"
          value={identityToken}
          onChange={(event) => setIdentityToken(event.target.value)}
          required
        />
        <Button type="submit" variant="contained">
          Aceitar convite
        </Button>
      </Stack>
    </PageCard>
  )
}
