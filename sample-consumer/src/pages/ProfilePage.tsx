import { Alert, Avatar, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard, StatusChip } from '../components/ui'
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

  const initials = (user?.displayName ?? user?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <Stack spacing={3}>
      <PageHeader title="Meu perfil" description="Gerencie suas informações pessoais e visualize suas memberships." />
      <FeedbackAlerts success={message} error={error} />

      <SectionCard title="Identidade">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' }, mb: 2 }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: '1.5rem' }}>{initials}</Avatar>
          <Box>
            <Typography variant="h6">{user?.displayName ?? '—'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email ?? '—'}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <FormGrid>
            <FormGridItem>
              <TextField label="Nome de exibição" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem>
              <TextField label="URL da foto" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} fullWidth />
            </FormGridItem>
          </FormGrid>
          <Button type="submit" variant="contained" disabled={loading} sx={{ alignSelf: 'flex-start' }}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Memberships">
        {memberships.length === 0 ? (
          <Alert severity="info">Você ainda não possui memberships ativas.</Alert>
        ) : (
          <Stack spacing={1.5} divider={<Divider flexItem />}>
            {memberships.map((membership) => (
              <Stack key={membership.membershipId} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{membership.tenantName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {membership.tenantKey}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {membership.roles.map((role) => (
                    <StatusChip key={role} label={role} variant="primary" />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  )
}
