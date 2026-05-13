import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { PageCard } from '../components/PageCard'
import { getMe, listMyMemberships, updateMe } from '../services'
import type { User, UserMembership } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [memberships, setMemberships] = useState<UserMembership[]>([])
  const [displayName, setDisplayName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile(): Promise<void> {
    setError(null)
    try {
      const data = await getMe()
      setUser(data)
      setDisplayName(data.displayName)
      setPhotoUrl('')
      const membershipData = await listMyMemberships({ page: 1, pageSize: 100 })
      setMemberships(membershipData.items)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      await updateMe({
        displayName,
        photoUrl: photoUrl || null,
      })
      setMessage('Perfil atualizado com sucesso.')
      await loadProfile()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageCard title="Meu Perfil" subtitle="GET/PATCH /v1.0/Users/me">
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Typography variant="body2" color="text.secondary">
          Usuário: {user?.email ?? '---'}
        </Typography>
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
        <TextField
          label="Photo URL"
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Memberships do usuário
        </Typography>
        {memberships.map((membership) => (
          <Typography key={membership.membershipId} variant="body2">
            {membership.tenantName} ({membership.tenantKey}) - {membership.roles.join(', ')}
          </Typography>
        ))}
      </Stack>
    </PageCard>
  )
}
