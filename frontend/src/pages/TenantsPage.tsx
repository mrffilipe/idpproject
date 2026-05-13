import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { PageCard } from '../components/PageCard'
import { useAuth } from '../contexts/AuthContext'
import { useTenant } from '../contexts/TenantContext'
import { createTenant, getTenantById, inviteMember, listTenants, switchTenant, updateTenant } from '../services'
import type { Tenant } from '../types'
import { getAuthSession } from '../utils/authStorage'
import { getApiErrorMessage } from '../utils/apiError'

const roleOptions = ['owner', 'admin', 'member', 'viewer']

export function TenantsPage() {
  const { syncFromAuthResult } = useAuth()
  const { tenantId: selectedTenantId, selectTenant } = useTenant()

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantKey, setNewTenantKey] = useState('')

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
      const created = await createTenant({ name: newTenantName, key: newTenantKey })
      setSuccess(`Tenant criado: ${created.id}`)
      setNewTenantName('')
      setNewTenantKey('')
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
    <Stack spacing={2}>
      <PageCard title="Tenants" subtitle="CRUD e fluxos de convite/switch tenant">
        <Stack spacing={2}>
          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Key</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.id}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.key}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {selectedTenantId === tenant.id ? (
                        <Chip size="small" color="success" label="Selecionado" />
                      ) : (
                        <Button size="small" onClick={() => void handleSelectTenant(tenant.id)}>
                          Selecionar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </PageCard>

      <PageCard title="Criar Tenant" subtitle="POST /v1.0/Tenants">
        <Stack spacing={2} component="form" onSubmit={handleCreateTenant}>
          <TextField
            label="Nome"
            value={newTenantName}
            onChange={(event) => setNewTenantName(event.target.value)}
            required
          />
          <TextField
            label="Key"
            value={newTenantKey}
            onChange={(event) => setNewTenantKey(event.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Criar
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Atualizar Tenant" subtitle="PATCH /v1.0/Tenants/{id}">
        <Stack spacing={2} component="form" onSubmit={handleUpdateTenant}>
          <TextField
            select
            label="Tenant"
            value={editingTenantId}
            onChange={(event) => {
              const tenant = tenants.find((item) => item.id === event.target.value)
              setEditingTenantId(event.target.value)
              setEditingTenantName(tenant?.name ?? '')
            }}
          >
            {tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Nome"
            value={editingTenantName}
            onChange={(event) => setEditingTenantName(event.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Atualizar
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Buscar Tenant por Id" subtitle="GET /v1.0/Tenants/{id}">
        <Stack spacing={2} component="form" onSubmit={handleLookupTenant}>
          <TextField
            label="Tenant Id"
            value={lookupTenantId}
            onChange={(event) => setLookupTenantId(event.target.value)}
            required
          />
          <TextField label="Nome encontrado" value={lookupTenantName} slotProps={{ input: { readOnly: true } }} />
          <Button type="submit" variant="contained">
            Buscar
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Convidar Membro" subtitle="POST /v1.0/Tenants/{id}/invites">
        <Stack spacing={2} component="form" onSubmit={handleInviteMember}>
          <Typography variant="body2" color="text.secondary">
            O fluxo de aceite anônimo está na página de convite: <strong>/accept-invite</strong>.
          </Typography>
          <TextField
            select
            label="Tenant"
            value={inviteTenantId}
            onChange={(event) => setInviteTenantId(event.target.value)}
          >
            {tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email do convidado"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            required
          />
          <TextField
            select
            label="Role"
            value={inviteRole}
            onChange={(event) => setInviteRole(event.target.value)}
          >
            {roleOptions.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Enviar convite
          </Button>
        </Stack>
      </PageCard>
    </Stack>
  )
}
