import { Alert, Stack, Typography } from '@mui/material'
import { jwtDecode } from 'jwt-decode'
import { useMemo } from 'react'
import { PageHeader, SectionCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import { getAuthSession } from '../utils/authStorage'

export function TokenPage() {
  const { tenantId, email } = useAuth()
  const { tenantName, hasMultipleTenants } = useTenant()
  const session = getAuthSession()

  const jwtClaims = useMemo(() => {
    if (!session?.accessToken) {
      return null
    }
    try {
      return jwtDecode<Record<string, unknown>>(session.accessToken)
    } catch {
      return { error: 'Não foi possível decodificar o JWT' }
    }
  }, [session?.accessToken])

  if (!session) {
    return <Alert severity="warning">Faça login para visualizar tokens.</Alert>
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Token & contexto"
        description="Claims do access token. Troca de organização fica no menu superior quando você tem mais de um tenant."
      />

      {hasMultipleTenants ? (
        <Alert severity="info">Você tem várias organizações. Use o seletor &quot;Organização&quot; no topo para alternar.</Alert>
      ) : null}

      <SectionCard title="Sessão resumida">
        <Typography variant="body2" component="pre" sx={{ m: 0, overflow: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {JSON.stringify(
            {
              email,
              userId: session.userId,
              tenantId,
              tenantName,
              membershipId: session.membershipId,
              tenantRoles: session.tenantRoles,
              platformRoles: session.platformRoles,
              expiresInSeconds: session.expiresInSeconds,
            },
            null,
            2,
          )}
        </Typography>
      </SectionCard>

      <SectionCard title="Claims do access token (JWT)">
        <Typography variant="body2" component="pre" sx={{ m: 0, overflow: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
          {JSON.stringify(jwtClaims, null, 2)}
        </Typography>
      </SectionCard>

      <SectionCard title="Tokens (somente dev)">
        <Typography variant="body2" component="pre" sx={{ m: 0, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
          {JSON.stringify(
            { accessToken: session.accessToken, refreshToken: session.refreshToken },
            null,
            2,
          )}
        </Typography>
      </SectionCard>
    </Stack>
  )
}
