import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import {
  DataTable,
  FeedbackAlerts,
  FormGrid,
  FormGridItem,
  PageHeader,
  SectionCard,
  StatusChip,
} from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import { createTenant, getTenantById, inviteMember, listTenants, switchTenant, updateTenant } from '../services'
import type { Tenant } from '../types'
import { getAuthSession } from '../utils/authStorage'
import { getApiErrorMessage } from '../utils/apiError'

const roleOptions = ['owner', 'admin', 'member', 'viewer']

export function TenantsPage() {
  const { syncFromAuthResult, platformRoles, tenantRoles } = useAuth()
  const { tenantId: selectedTenantId, selectTenant } = useTenant()
  const isPlatformAdministrator = platformRoles.includes('plat_admin')
  const hasTenantAdministrativeRole = tenantRoles.includes('owner') || tenantRoles.includes('admin')
  const canManageTenant = isPlatformAdministrator || hasTenantAdministrativeRole

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantKey, setNewTenantKey] = useState('')
  const [newTenantInitialAdministratorUserId, setNewTenantInitialAdministratorUserId] = useState('')

  const [editingTenantId, setEditingTenantId] = useState('')
  const [editingTenantName, setEditingTenantName] = useState('')

  const [inviteTenantId, setInviteTenantId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [lookupTenantId, setLookupTenantId] = useState('')
  const [lookupTenantName, setLookupTenantName] = useState('')

  useEffect(() => {
    void loadTenants()
  }, [])

  async function loadTenants(): Promise<void> {
    setError(null)
    try {
      const data = await listTenants({ page: 1, pageSize: 100 })
      setTenants(data.items)
      if (!editingTenantId && data.items.length > 0) {
        setEditingTenantId(data.items[0].id)
        setEditingTenantName(data.items[0].name)
        setInviteTenantId(data.items[0].id)
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleCreateTenant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await createTenant({
        name: newTenantName,
        key: newTenantKey,
        initialAdministratorUserId: newTenantInitialAdministratorUserId.trim() || null,
      })
      setSuccess(`Tenant criado: ${created.id}`)
      setNewTenantName('')
      setNewTenantKey('')
      setNewTenantInitialAdministratorUserId('')
      await loadTenants()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  async function handleUpdateTenant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!editingTenantId) {
      return
    }

    try {
      await updateTenant(editingTenantId, { name: editingTenantName })
      setSuccess('Tenant atualizado com sucesso.')
      await loadTenants()
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  async function handleInviteMember(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!inviteTenantId) {
      return
    }

    try {
      const result = await inviteMember(inviteTenantId, { email: inviteEmail, roles: [inviteRole] })
      setSuccess(`Convite criado: ${result.id}`)
      setInviteEmail('')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  async function handleSelectTenant(tenantId: string): Promise<void> {
    setError(null)
    setSuccess(null)
    try {
      const refreshToken = getAuthSession()?.refreshToken ?? null
      const result = await switchTenant({ tenantId, refreshToken })
      syncFromAuthResult(result)
      selectTenant(tenantId)
      setSuccess('Tenant selecionado e sessão atualizada.')
    } catch (selectError) {
      setError(getApiErrorMessage(selectError))
    }
  }

  async function handleLookupTenant(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const found = await getTenantById(lookupTenantId)
      setLookupTenantName(found.name)
      setSuccess(`Tenant encontrado: ${found.key}`)
    } catch (lookupError) {
      setLookupTenantName('')
      setError(getApiErrorMessage(lookupError))
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Tenants"
        description="Organizações isoladas na plataforma. Selecione um tenant para operações contextuais."
      />
      <FeedbackAlerts success={success} error={error} />

      <SectionCard title="Tenants cadastrados">
        <DataTable
          columns={[
            { id: 'id', label: 'Id', minWidth: 120 },
            { id: 'name', label: 'Nome' },
            { id: 'key', label: 'Chave' },
            { id: 'actions', label: 'Ações', align: 'right' },
          ]}
          rows={tenants.map((tenant) => (
            <TableRow key={tenant.id} hover>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{tenant.id}</TableCell>
              <TableCell>{tenant.name}</TableCell>
              <TableCell>{tenant.key}</TableCell>
              <TableCell align="right">
                {selectedTenantId === tenant.id ? (
                  <StatusChip label="Selecionado" variant="success" />
                ) : (
                  <Button size="small" variant="outlined" onClick={() => void handleSelectTenant(tenant.id)}>
                    Selecionar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          emptyDescription="Nenhum tenant cadastrado."
        />
      </SectionCard>

      <SectionCard title="Criar tenant">
        {isPlatformAdministrator ? (
          <Stack spacing={2} component="form" onSubmit={handleCreateTenant}>
            <FormGrid>
              <FormGridItem>
                <TextField label="Nome" value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem>
                <TextField label="Chave" value={newTenantKey} onChange={(e) => setNewTenantKey(e.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem xs={12} md={12}>
                <TextField
                  label="Administrador inicial (UserId opcional)"
                  helperText="Se vazio, o administrador global autenticado vira owner."
                  value={newTenantInitialAdministratorUserId}
                  onChange={(e) => setNewTenantInitialAdministratorUserId(e.target.value)}
                  fullWidth
                />
              </FormGridItem>
            </FormGrid>
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Criar
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">Apenas administradores de plataforma podem criar tenants.</Alert>
        )}
      </SectionCard>

      <SectionCard title="Atualizar tenant">
        {canManageTenant ? (
          <Stack spacing={2} component="form" onSubmit={handleUpdateTenant}>
            <FormGrid>
              <FormGridItem>
                <TextField
                  select
                  label="Tenant"
                  value={editingTenantId}
                  onChange={(event) => {
                    const tenant = tenants.find((item) => item.id === event.target.value)
                    setEditingTenantId(event.target.value)
                    setEditingTenantName(tenant?.name ?? '')
                  }}
                  fullWidth
                >
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormGridItem>
              <FormGridItem>
                <TextField label="Nome" value={editingTenantName} onChange={(e) => setEditingTenantName(e.target.value)} required fullWidth />
              </FormGridItem>
            </FormGrid>
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Atualizar
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">Apenas administradores de plataforma ou owner/admin do tenant podem atualizar.</Alert>
        )}
      </SectionCard>

      <SectionCard title="Buscar tenant por ID">
        {canManageTenant ? (
          <Stack spacing={2} component="form" onSubmit={handleLookupTenant}>
            <FormGrid>
              <FormGridItem>
                <TextField label="Tenant Id" value={lookupTenantId} onChange={(e) => setLookupTenantId(e.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem>
                <TextField label="Nome encontrado" value={lookupTenantName} slotProps={{ input: { readOnly: true } }} fullWidth />
              </FormGridItem>
            </FormGrid>
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Buscar
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">Apenas administradores de plataforma ou owner/admin do tenant podem consultar por id.</Alert>
        )}
      </SectionCard>

      <SectionCard title="Convidar membro">
        {canManageTenant ? (
          <Stack spacing={2} component="form" onSubmit={handleInviteMember}>
            <Typography variant="body2" color="text.secondary">
              O fluxo de aceite anônimo está em <strong>/accept-invite</strong>.
            </Typography>
            <FormGrid>
              <FormGridItem>
                <TextField select label="Tenant" value={inviteTenantId} onChange={(e) => setInviteTenantId(e.target.value)} fullWidth>
                  {tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormGridItem>
              <FormGridItem>
                <TextField label="E-mail do convidado" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem>
                <TextField select label="Papel" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} fullWidth>
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </FormGridItem>
            </FormGrid>
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Enviar convite
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">Apenas administradores de plataforma ou owner/admin do tenant podem convidar.</Alert>
        )}
      </SectionCard>
    </Stack>
  )
}
