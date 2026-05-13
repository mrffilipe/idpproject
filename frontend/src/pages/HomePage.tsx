import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'
import { PageCard } from '../components/PageCard'

const links = [
  { to: '/profile', label: 'Meu Perfil' },
  { to: '/sessions', label: 'Sessões Ativas' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/memberships', label: 'Memberships' },
  { to: '/tenant-roles', label: 'Tenant Roles' },
  { to: '/applications', label: 'Applications' },
  { to: '/audit-logs', label: 'Audit Logs' },
  { to: '/jwks', label: 'JWKS' },
]

export function HomePage() {
  return (
    <PageCard
      title="Dashboard"
      subtitle="Acesso rápido para todos os módulos integrados com os endpoints do backend."
    >
      <Typography color="text.secondary">
        Esta tela centraliza os fluxos de CRUD e consultas implementados com React Router Data Mode, MUI
        e Axios.
      </Typography>
      <Stack spacing={1.5}>
        {links.map((link) => (
          <Button key={link.to} component={Link} to={link.to} variant="contained">
            {link.label}
          </Button>
        ))}
      </Stack>
    </PageCard>
  )
}
