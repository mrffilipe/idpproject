import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { Alert, Button, Card, CardActionArea, CardContent, Grid, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui'
import { env } from '../config'
import { useAuth } from '../contexts/AuthContext'

const modules = [
  { to: '/subscribe', label: 'Assinar plano', description: 'Simula checkout → tenant no IdP', icon: <CardMembershipOutlinedIcon /> },
  { to: '/token', label: 'Token / JWT', description: 'Claims e contexto de tenant', icon: <KeyOutlinedIcon /> },
  { to: '/profile', label: 'Meu perfil', description: 'GET/PATCH /Users/me', icon: <PersonOutlinedIcon /> },
  { to: '/sessions', label: 'Sessões', description: 'Sessões OAuth ativas', icon: <SecurityOutlinedIcon /> },
  { to: '/memberships', label: 'Memberships', description: 'Membros do tenant atual', icon: <GroupOutlinedIcon /> },
]

export function HomePage() {
  const { tenantId, email, platformRoles } = useAuth()
  const isPlatformAdmin = platformRoles.includes('plat_admin')

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Sample CRM"
        description="App consumidora de demonstração — o browser só conhece OAuth (client_id + redirect). A Application no IdP é inferida na sessão."
      />

      <Alert severity="info">
        <strong>Fluxo típico:</strong> (1) Login Google + exchange com <code>{env.oauthClientId}</code> → (2) Assinar plano →
        IdP cria tenant vinculado à Application → (3) JWT já vem com <code>tid</code> / <code>mid</code> → (4) usar CRM
        (memberships, convites, etc.).
      </Alert>

      {!tenantId ? (
        <Alert severity="warning" action={
          <Button color="inherit" size="small" component={Link} to="/subscribe">
            Assinar
          </Button>
        }>
          Você está autenticado como {email}, mas ainda sem tenant no token. Assine um plano para provisionar sua organização.
        </Alert>
      ) : (
        <Alert severity="success">Tenant ativo no token: <code>{tenantId}</code></Alert>
      )}

      <Grid container spacing={2}>
        {modules.map((module) => (
          <Grid key={module.to} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to={module.to} sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Typography color="primary">{module.icon}</Typography>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {module.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isPlatformAdmin ? (
        <Alert severity="info">
          Você tem <code>plat_admin</code>. Ferramentas extras de operação do IdP estão em{' '}
          <Link to="/dev">/dev</Link> (bootstrap, applications, audit).
        </Alert>
      ) : null}
    </Stack>
  )
}
