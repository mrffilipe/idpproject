import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthLayout } from '../components/AuthLayout'
import { FeedbackAlerts, FormGrid, FormGridItem, GoogleSignInButton } from '../components/ui'
import { signInWithGoogleAndGetIdToken } from '../config'
import { bootstrapPlatform } from '../services'
import { layout } from '../theme'
import {
  ApplicationType,
  ClientType,
  type ApplicationType as ApplicationTypeValue,
  type BootstrapPlatformBody,
  type ClientType as ClientTypeValue,
} from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const defaultTenantName = 'Platform'
const defaultTenantKey = 'platform'
const defaultApplicationName = 'Platform Admin'
const defaultApplicationSlug = 'platform-admin'
const defaultClientId = 'platform-admin-web'

const steps = ['Identidade', 'Configuração']

export function BootstrapPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [identityToken, setIdentityToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [tenantName, setTenantName] = useState(defaultTenantName)
  const [tenantKey, setTenantKey] = useState(defaultTenantKey)
  const [applicationName, setApplicationName] = useState(defaultApplicationName)
  const [applicationSlug, setApplicationSlug] = useState(defaultApplicationSlug)
  const [applicationType, setApplicationType] = useState<ApplicationTypeValue>(ApplicationType.Web)
  const [clientId, setClientId] = useState(defaultClientId)
  const [clientType, setClientType] = useState<ClientTypeValue>(ClientType.Public)
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUrisRaw, setRedirectUrisRaw] = useState(window.location.origin)
  const [allowedScopesRaw, setAllowedScopesRaw] = useState('openid, profile, email')
  const [accessTokenTtlSeconds, setAccessTokenTtlSeconds] = useState('900')

  const requiresClientSecret = clientType === ClientType.Confidential

  const parsedBody = useMemo<BootstrapPlatformBody | null>(() => {
    const redirectUris = redirectUrisRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const allowedScopes = allowedScopesRaw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const ttl = Number(accessTokenTtlSeconds)
    if (!identityToken || !Number.isFinite(ttl)) {
      return null
    }

    return {
      identityToken,
      tenantName: tenantName.trim(),
      tenantKey: tenantKey.trim(),
      applicationName: applicationName.trim(),
      applicationSlug: applicationSlug.trim(),
      applicationType,
      clientId: clientId.trim(),
      clientType,
      clientSecret: clientSecret.trim() || null,
      redirectUris,
      allowedScopes,
      accessTokenTtlSeconds: ttl,
    }
  }, [
    accessTokenTtlSeconds,
    allowedScopesRaw,
    applicationName,
    applicationSlug,
    applicationType,
    clientId,
    clientSecret,
    clientType,
    identityToken,
    redirectUrisRaw,
    tenantKey,
    tenantName,
  ])

  async function handleIdentityStep(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const token = await signInWithGoogleAndGetIdToken()
      setIdentityToken(token)
      setActiveStep(1)
    } catch (identityError) {
      setError(getApiErrorMessage(identityError))
    } finally {
      setLoading(false)
    }
  }

  async function handleBootstrapSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!parsedBody) {
      setError('Preencha os campos obrigatórios do bootstrap.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await bootstrapPlatform(parsedBody)
      setSuccess('Bootstrap concluído com sucesso. Faça login para acessar a plataforma.')
      navigate('/login?bootstrapped=1')
    } catch (bootstrapError) {
      setError(getApiErrorMessage(bootstrapError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      maxWidth={layout.bootstrapMaxWidth}
      title="Bootstrap inicial"
      subtitle="Configuração única e irreversível da plataforma"
    >
        <Stack spacing={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Alert severity="warning">
            Após confirmar, o administrador raiz será definido permanentemente e não poderá ser alterado.
          </Alert>

          <FeedbackAlerts success={success} error={error} />

          {activeStep === 0 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Autentique-se com Google para definir a identidade do administrador raiz.
              </Typography>
              <GoogleSignInButton
                loading={loading}
                loadingLabel="Validando identidade..."
                label="Continuar com Google"
                onClick={() => void handleIdentityStep()}
              />
            </Stack>
          ) : (
            <Stack spacing={2} component="form" onSubmit={handleBootstrapSubmit}>
              <Typography variant="body2" color="text.secondary">
                Ajuste os dados iniciais da plataforma, tenant e aplicação OAuth.
              </Typography>

              <FormGrid>
                <FormGridItem>
                  <TextField label="Nome do tenant" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem>
                  <TextField label="Chave do tenant" value={tenantKey} onChange={(e) => setTenantKey(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem>
                  <TextField label="Nome da aplicação" value={applicationName} onChange={(e) => setApplicationName(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem>
                  <TextField label="Slug da aplicação" value={applicationSlug} onChange={(e) => setApplicationSlug(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem>
                  <FormControl fullWidth>
                    <InputLabel id="application-type-label">Tipo da aplicação</InputLabel>
                    <Select
                      labelId="application-type-label"
                      value={applicationType}
                      label="Tipo da aplicação"
                      onChange={(e) => setApplicationType(Number(e.target.value) as ApplicationTypeValue)}
                    >
                      <MenuItem value={ApplicationType.Web}>Web</MenuItem>
                      <MenuItem value={ApplicationType.Mobile}>Mobile</MenuItem>
                      <MenuItem value={ApplicationType.Backend}>Backend</MenuItem>
                    </Select>
                  </FormControl>
                </FormGridItem>
                <FormGridItem>
                  <TextField label="Client ID OAuth" value={clientId} onChange={(e) => setClientId(e.target.value)} required fullWidth />
                </FormGridItem>
                <FormGridItem>
                  <FormControl fullWidth>
                    <InputLabel id="client-type-label">Tipo do client</InputLabel>
                    <Select
                      labelId="client-type-label"
                      value={clientType}
                      label="Tipo do client"
                      onChange={(e) => setClientType(Number(e.target.value) as ClientTypeValue)}
                    >
                      <MenuItem value={ClientType.Public}>Público</MenuItem>
                      <MenuItem value={ClientType.Confidential}>Confidencial</MenuItem>
                    </Select>
                  </FormControl>
                </FormGridItem>
                {requiresClientSecret ? (
                  <FormGridItem>
                    <TextField label="Client secret" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} required fullWidth />
                  </FormGridItem>
                ) : null}
                <FormGridItem xs={12} md={12}>
                  <TextField
                    label="Redirect URIs (separadas por vírgula)"
                    value={redirectUrisRaw}
                    onChange={(e) => setRedirectUrisRaw(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem xs={12} md={12}>
                  <TextField
                    label="Scopes permitidos (separados por vírgula)"
                    value={allowedScopesRaw}
                    onChange={(e) => setAllowedScopesRaw(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
                <FormGridItem>
                  <TextField
                    type="number"
                    label="TTL do access token (segundos)"
                    value={accessTokenTtlSeconds}
                    onChange={(e) => setAccessTokenTtlSeconds(e.target.value)}
                    required
                    fullWidth
                  />
                </FormGridItem>
              </FormGrid>

              <FormControlLabel
                control={<Checkbox checked={isConfirmed} onChange={(_, checked) => setIsConfirmed(checked)} />}
                label="Entendo que esta configuração é irreversível e define o master permanentemente."
              />

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" disabled={loading} onClick={() => setActiveStep(0)}>
                  Voltar
                </Button>
                <Button type="submit" variant="contained" disabled={!isConfirmed || loading}>
                  {loading ? 'Aplicando bootstrap...' : 'Concluir bootstrap'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
    </AuthLayout>
  )
}
