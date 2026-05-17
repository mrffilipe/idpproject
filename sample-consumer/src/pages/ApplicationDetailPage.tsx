import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Alert, Box, Button, Grid, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { createApplicationClient, getApplicationById, provisionApplicationTenant } from '../services'
import { ClientType, type Application } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const clientTypeOptions: Array<{ label: string; value: ClientType }> = [
  { label: 'Público', value: ClientType.Public },
  { label: 'Confidencial', value: ClientType.Confidential },
]

export function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const { platformRoles } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [clientId, setClientId] = useState('')
  const [clientSecretHash, setClientSecretHash] = useState('')
  const [clientType, setClientType] = useState<ClientType>(ClientType.Public)
  const [redirectUris, setRedirectUris] = useState('')
  const [allowedScopes, setAllowedScopes] = useState('')
  const [accessTokenTtlSeconds, setAccessTokenTtlSeconds] = useState('3600')
  const [tenantName, setTenantName] = useState('')
  const [tenantKey, setTenantKey] = useState('')
  const [initialAdministratorUserId, setInitialAdministratorUserId] = useState('')
  const [externalCustomerId, setExternalCustomerId] = useState('')
  const [planCode, setPlanCode] = useState('')
  const isPlatformAdministrator = platformRoles.includes('plat_admin')
  const canCreateClient = isPlatformAdministrator

  useEffect(() => {
    if (!applicationId) {
      return
    }
    void loadApplication(applicationId)
  }, [applicationId])

  async function loadApplication(id: string): Promise<void> {
    setError(null)
    try {
      const data = await getApplicationById(id)
      setApplication(data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleCreateClient(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!canCreateClient) {
      setError('Sem permissão para criar client. Use uma conta de administrador de plataforma.')
      return
    }

    if (!applicationId) {
      return
    }

    try {
      const created = await createApplicationClient(applicationId, {
        clientId,
        clientSecretHash: clientSecretHash || null,
        clientType,
        redirectUris,
        allowedScopes,
        accessTokenTtlSeconds: Number(accessTokenTtlSeconds),
      })
      setSuccess(`Client criado: ${created.id}`)
      setClientId('')
      setClientSecretHash('')
      setRedirectUris('')
      setAllowedScopes('')
      setAccessTokenTtlSeconds('3600')
    } catch (createError) {
      setError(getApiErrorMessage(createError))
    }
  }

  async function handleProvisionTenant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!applicationId) {
      return
    }

    try {
      const provisioned = await provisionApplicationTenant(applicationId, {
        tenantName,
        tenantKey,
        initialAdministratorUserId: initialAdministratorUserId.trim() || null,
        externalCustomerId: externalCustomerId.trim() || null,
        planCode: planCode.trim() || null,
      })
      setSuccess(`Tenant provisionado: ${provisioned.tenantId}`)
      setTenantName('')
      setTenantKey('')
      setInitialAdministratorUserId('')
      setExternalCustomerId('')
      setPlanCode('')
    } catch (provisionError) {
      setError(getApiErrorMessage(provisionError))
    }
  }

  async function copySecret(): Promise<void> {
    if (clientSecretHash) {
      await navigator.clipboard.writeText(clientSecretHash)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={application?.name ?? 'Application'}
        description={application ? `Slug: ${application.slug}` : 'Carregando detalhes...'}
      />
      <FeedbackAlerts success={success} error={error} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Informações">
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  ID
                </Typography>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{application?.id ?? applicationId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography>{application?.name ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Slug
                </Typography>
                <Typography>{application?.slug ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Tipo
                </Typography>
                <Typography>{application?.type ?? '—'}</Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Criar client OAuth">
            {!canCreateClient ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Para criar clients OAuth da aplicação, use uma conta de administrador de plataforma.
              </Alert>
            ) : null}
            <Stack spacing={2} component="form" onSubmit={handleCreateClient}>
              <FormGrid>
                <FormGridItem>
                  <TextField label="Client Id" value={clientId} onChange={(e) => setClientId(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem xs={12} md={12}>
                  <TextField
                    label="Hash do client secret"
                    value={clientSecretHash}
                    onChange={(e) => setClientSecretHash(e.target.value)}
                    fullWidth
                    slotProps={{
                      input: {
                        endAdornment: clientSecretHash ? (
                          <Tooltip title="Copiar">
                            <IconButton size="small" onClick={() => void copySecret()}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : undefined,
                      },
                    }}
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    select
                    label="Tipo do client"
                    value={clientType}
                    onChange={(e) => setClientType(Number(e.target.value) as ClientType)}
                    fullWidth
                  >
                    {clientTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    label="TTL do access token (segundos)"
                    value={accessTokenTtlSeconds}
                    onChange={(e) => setAccessTokenTtlSeconds(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem xs={12} md={12}>
                  <TextField label="Redirect URIs" value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem xs={12} md={12}>
                  <TextField label="Scopes permitidos" value={allowedScopes} onChange={(e) => setAllowedScopes(e.target.value)} required fullWidth />
                </FormGridItem>
              </FormGrid>
              <Button type="submit" variant="contained" disabled={!canCreateClient} sx={{ alignSelf: 'flex-start' }}>
                Criar client
              </Button>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Provisionar tenant da aplicação" subtitle="Onboarding de cliente SaaS após assinatura">
            {!isPlatformAdministrator ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Apenas administradores de plataforma podem provisionar tenants por aplicação.
              </Alert>
            ) : null}
            <Stack spacing={2} component="form" onSubmit={handleProvisionTenant}>
              <FormGrid>
                <FormGridItem>
                  <TextField
                    label="Nome do tenant"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    label="Chave do tenant"
                    value={tenantKey}
                    onChange={(e) => setTenantKey(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    label="Admin inicial (UserId opcional)"
                    value={initialAdministratorUserId}
                    onChange={(e) => setInitialAdministratorUserId(e.target.value)}
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    label="External Customer Id (opcional)"
                    value={externalCustomerId}
                    onChange={(e) => setExternalCustomerId(e.target.value)}
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField label="Plano (opcional)" value={planCode} onChange={(e) => setPlanCode(e.target.value)} fullWidth />
                </FormGridItem>
              </FormGrid>
              <Button type="submit" variant="contained" disabled={!isPlatformAdministrator} sx={{ alignSelf: 'flex-start' }}>
                Provisionar tenant
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  )
}
