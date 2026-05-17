import { Alert, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'
import { PageHeader } from '../components/ui'

export function DevToolsPage() {
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Ferramentas IdP (dev)"
        description="Endpoints de operação da plataforma — não fazem parte de um CRM em produção."
      />
      <Alert severity="warning">
        Um app consumidor real não expõe bootstrap nem cadastro de Applications no browser. Use o admin IdP (
        <code>frontend/</code>) ou estas rotas só em desenvolvimento.
      </Alert>
      <Typography component="ul" sx={{ pl: 2.5 }}>
        <li>
          <Link to="/dev/bootstrap">Bootstrap da plataforma</Link>
        </li>
        <li>
          <Link to="/dev/applications">Applications & clients OAuth</Link>
        </li>
        <li>
          <Link to="/dev/tenants">Tenants (plat_admin)</Link>
        </li>
        <li>
          <Link to="/dev/audit-logs">Audit logs</Link>
        </li>
        <li>
          <Link to="/dev/jwks">JWKS</Link>
        </li>
        <li>
          <Link to="/dev/onboarding-legacy">Provision manual (legado — exige Application ID)</Link>
        </li>
      </Typography>
    </Stack>
  )
}
