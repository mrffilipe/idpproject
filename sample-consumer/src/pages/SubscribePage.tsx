import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { FeedbackAlerts, PageHeader, SectionCard } from '../components/ui'
import { env } from '../config'
import { useAuth } from '../contexts/AuthContext'
import { subscribeTenant } from '../services'
import { getApiErrorMessage } from '../utils/apiError'

const plans = [
  {
    code: 'starter',
    name: 'Starter',
    price: 'R$ 49/mês',
    features: ['Até 5 usuários', 'Suporte por e-mail'],
  },
  {
    code: 'pro',
    name: 'Pro',
    price: 'R$ 149/mês',
    features: ['Usuários ilimitados', 'API', 'Suporte prioritário'],
    highlighted: true,
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    features: ['SLA', 'SSO avançado', 'Onboarding dedicado'],
  },
] as const

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function SubscribePage() {
  const navigate = useNavigate()
  const { syncFromAuthResult, tenantId } = useAuth()
  const [companyName, setCompanyName] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number]['code']>('pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tenantKeyPreview = useMemo(() => {
    const base = slugify(companyName) || 'minha-empresa'
    return `${base}-${Date.now().toString(36).slice(-4)}`
  }, [companyName])

  async function handleSubscribe(): Promise<void> {
    if (!companyName.trim()) {
      setError('Informe o nome da empresa.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await subscribeTenant({
        tenantName: companyName.trim(),
        tenantKey: tenantKeyPreview,
        planCode: selectedPlan,
        externalCustomerId: `sample_${selectedPlan}_${Date.now()}`,
      })
      syncFromAuthResult(result)
      navigate('/')
    } catch (subscribeError) {
      setError(getApiErrorMessage(subscribeError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Assinar plano"
        description="Fluxo real de um CRM: após o pagamento, o backend do produto provisiona o tenant no IdP. Aqui simulamos isso com um clique — sem informar Application ID."
      />

      <Alert severity="info">
        OAuth client desta sessão: <strong>{env.oauthClientId}</strong>. O IdP resolve a Application a partir da sessão
        criada no login (<code>POST /auth/subscribe</code>).
      </Alert>

      {tenantId ? (
        <Alert severity="success" icon={<CheckCircleOutlinedIcon />}>
          Você já tem um tenant ativo no token. Pode assinar outro plano para criar uma organização adicional.
        </Alert>
      ) : null}

      <SectionCard title="Dados da empresa">
        <Stack spacing={2}>
          <TextField
            label="Nome da empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            fullWidth
            placeholder="Acme Corp"
          />
          <Typography variant="body2" color="text.secondary">
            Tenant key gerada: <code>{tenantKeyPreview}</code>
          </Typography>
        </Stack>
      </SectionCard>

      <Typography variant="h6">Escolha o plano</Typography>
      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid key={plan.code} size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: selectedPlan === plan.code ? 'primary.main' : undefined,
                borderWidth: selectedPlan === plan.code ? 2 : 1,
              }}
            >
              <CardContent>
                <Stack spacing={1}>
                  {plan.highlighted ? <Chip size="small" color="primary" label="Popular" /> : <Box sx={{ height: 24 }} />}
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="subtitle1" color="primary">
                    {plan.price}
                  </Typography>
                  <Stack component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {plan.features.map((feature) => (
                      <Typography key={feature} component="li" variant="body2" color="text.secondary">
                        {feature}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant={selectedPlan === plan.code ? 'contained' : 'outlined'}
                  onClick={() => setSelectedPlan(plan.code)}
                >
                  {selectedPlan === plan.code ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <FeedbackAlerts error={error} />

      <Button variant="contained" size="large" disabled={loading} onClick={() => void handleSubscribe()} sx={{ alignSelf: 'flex-start' }}>
        {loading ? 'Provisionando…' : 'Confirmar assinatura (simular pagamento)'}
      </Button>
    </Stack>
  )
}
