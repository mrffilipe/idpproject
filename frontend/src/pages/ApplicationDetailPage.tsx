import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { PageCard } from '../components/PageCard'
import { createApplicationClient, getApplicationById } from '../services'
import { ClientType, type Application } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const clientTypeOptions: Array<{ label: string; value: ClientType }> = [
  { label: 'Public', value: ClientType.Public },
  { label: 'Confidential', value: ClientType.Confidential },
]

export function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [tenantId, setTenantId] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecretHash, setClientSecretHash] = useState('')
  const [clientType, setClientType] = useState<ClientType>(ClientType.Public)
  const [redirectUris, setRedirectUris] = useState('')
  const [allowedScopes, setAllowedScopes] = useState('')
  const [accessTokenTtlSeconds, setAccessTokenTtlSeconds] = useState('3600')

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
    if (!applicationId) {
      return
    }

    try {
      const created = await createApplicationClient(applicationId, {
        tenantId,
        clientId,
        clientSecretHash: clientSecretHash || null,
        clientType,
        redirectUris,
        allowedScopes,
        accessTokenTtlSeconds: Number(accessTokenTtlSeconds),
      })
      setSuccess(`Client criado: ${created.id}`)
      setTenantId('')
      setClientId('')
      setClientSecretHash('')
      setRedirectUris('')
      setAllowedScopes('')
      setAccessTokenTtlSeconds('3600')
    } catch (createError) {
      setError(getApiErrorMessage(createError))
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard title="Detalhe da Application" subtitle="GET /v1.0/Applications/{id}">
        <Stack spacing={1}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography>Id: {application?.id ?? applicationId}</Typography>
          <Typography>Nome: {application?.name ?? '-'}</Typography>
          <Typography>Slug: {application?.slug ?? '-'}</Typography>
          <Typography>Type: {application?.type ?? '-'}</Typography>
        </Stack>
      </PageCard>

      <PageCard
        title="Criar Client para Application"
        subtitle="POST /v1.0/Applications/{applicationId}/clients"
      >
        <Stack spacing={2} component="form" onSubmit={handleCreateClient}>
          {success ? <Alert severity="success">{success}</Alert> : null}
          <TextField
            label="Tenant Id"
            value={tenantId}
            onChange={(event) => setTenantId(event.target.value)}
            required
          />
          <TextField
            label="Client Id"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            required
          />
          <TextField
            label="Client Secret Hash"
            value={clientSecretHash}
            onChange={(event) => setClientSecretHash(event.target.value)}
          />
          <TextField
            select
            label="Client Type"
            value={clientType}
            onChange={(event) => setClientType(Number(event.target.value) as ClientType)}
          >
            {clientTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Redirect Uris"
            value={redirectUris}
            onChange={(event) => setRedirectUris(event.target.value)}
            required
          />
          <TextField
            label="Allowed Scopes"
            value={allowedScopes}
            onChange={(event) => setAllowedScopes(event.target.value)}
            required
          />
          <TextField
            label="Access Token TTL (seconds)"
            value={accessTokenTtlSeconds}
            onChange={(event) => setAccessTokenTtlSeconds(event.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Criar client
          </Button>
        </Stack>
      </PageCard>
    </Stack>
  )
}
