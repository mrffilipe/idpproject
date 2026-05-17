import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard } from '../components/ui'
import { env } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { provisionApplicationTenant } from '../services'
import { getApiErrorMessage } from '../utils/apiError'

export function OnboardingPage() {
  const { userId, platformRoles } = useAuth()
  const isPlatformAdmin = platformRoles.includes('plat_admin')

  const [applicationId, setApplicationId] = useState(env.applicationId ?? '')
  const [tenantName, setTenantName] = useState('Acme Corp')
  const [tenantKey, setTenantKey] = useState(`acme-${Date.now().toString(36)}`)
  const [planCode, setPlanCode] = useState('pro')
  const [externalCustomerId, setExternalCustomerId] = useState('')
  const [initialAdministratorUserId, setInitialAdministratorUserId] = useState(userId ?? '')
  const [resultJson, setResultJson] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleProvision(event: React.FormEvent): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setResultJson(null)

    if (!applicationId.trim()) {
      setError('Informe o Application ID (VITE_APPLICATION_ID ou campo abaixo).')
      return
    }

    setLoading(true)
    try {
      const result = await provisionApplicationTenant(applicationId.trim(), {
        tenantName,
        tenantKey,
        planCode: planCode || null,
        externalCustomerId: externalCustomerId || null,
        initialAdministratorUserId: initialAdministratorUserId || userId || null,
      })
      setResultJson(JSON.stringify(result, null, 2))
      setSuccess('Tenant provisionado. Faça switch-tenant em Token ou faça login novamente para listar o novo tenant.')
    } catch (provisionError) {
      setError(getApiErrorMessage(provisionError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Assinatura / plano (provision)"
        description="Simula onboarding SaaS: POST /Applications/{id}/tenants/provision após contratação de um plano."
      />

      {!isPlatformAdmin ? (
        <Alert severity="warning">
          Este endpoint exige <strong>plat_admin</strong>. Use uma conta bootstrap ou troque de usuário.
        </Alert>
      ) : null}

      {!env.applicationId ? (
        <Alert severity="info">
          Defina <code>VITE_APPLICATION_ID</code> no <code>.env</code> com o GUID da aplicação Sample CRM no IdP.
        </Alert>
      ) : null}

      <SectionCard title="Provisionar tenant da aplicação">
        <Stack component="form" spacing={2} onSubmit={(e) => void handleProvision(e)}>
          <FeedbackAlerts error={error} success={success} />
          <FormGrid>
            <FormGridItem xs={12}>
              <TextField
                label="Application ID"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                required
                fullWidth
                helperText="GUID da Application no catálogo IdP"
              />
            </FormGridItem>
            <FormGridItem>
              <TextField label="Nome do tenant" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem>
              <TextField label="Tenant key" value={tenantKey} onChange={(e) => setTenantKey(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem>
              <TextField label="Plan code" value={planCode} onChange={(e) => setPlanCode(e.target.value)} fullWidth placeholder="pro, starter, …" />
            </FormGridItem>
            <FormGridItem>
              <TextField
                label="External customer ID"
                value={externalCustomerId}
                onChange={(e) => setExternalCustomerId(e.target.value)}
                fullWidth
                placeholder="stripe_cus_…"
              />
            </FormGridItem>
            <FormGridItem xs={12}>
              <TextField
                label="Admin inicial (user GUID)"
                value={initialAdministratorUserId}
                onChange={(e) => setInitialAdministratorUserId(e.target.value)}
                fullWidth
                helperText="Padrão: usuário logado"
              />
            </FormGridItem>
          </FormGrid>
          <Button type="submit" variant="contained" disabled={loading || !isPlatformAdmin} sx={{ alignSelf: 'flex-start' }}>
            Provisionar tenant
          </Button>
        </Stack>
      </SectionCard>

      {resultJson ? (
        <SectionCard title="Resposta da API">
          <Typography variant="body2" component="pre" sx={{ m: 0, overflow: 'auto', fontFamily: 'monospace', fontSize: 13 }}>
            {resultJson}
          </Typography>
        </SectionCard>
      ) : null}
    </Stack>
  )
}
