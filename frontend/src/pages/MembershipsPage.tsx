import DeleteIcon from '@mui/icons-material/Delete'
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { PageCard } from '../components/PageCard'
import { useTenant } from '../contexts/TenantContext'
import { createMembership, listMembershipsByTenant, revokeMembership, updateMembershipRole } from '../services'
import type { Membership } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const roles = ['owner', 'admin', 'member', 'viewer']

export function MembershipsPage() {
  const { tenantId } = useTenant()
  const [items, setItems] = useState<Membership[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [userId, setUserId] = useState('')
  const [createRole, setCreateRole] = useState('member')

  const [membershipId, setMembershipId] = useState('')
  const [updateRole, setUpdateRole] = useState('viewer')

  useEffect(() => {
    if (!tenantId) {
      setItems([])
      return
    }
    void loadMemberships(tenantId)
  }, [tenantId])

  async function loadMemberships(currentTenantId: string): Promise<void> {
    setError(null)
    try {
      const result = await listMembershipsByTenant(currentTenantId, { page: 1, pageSize: 100 })
      setItems(result.items)
      if (!membershipId && result.items.length > 0) {
        setMembershipId(result.items[0].id)
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!tenantId) {
      setError('Selecione um tenant primeiro na tela de Tenants.')
      return
    }

    try {
      const created = await createMembership(tenantId, { userId, roles: [createRole] })
      setSuccess(`Membership criado: ${created.id}`)
      setUserId('')
      await loadMemberships(tenantId)
    } catch (createError) {
      setError(getApiErrorMessage(createError))
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!membershipId) {
      return
    }

    try {
      await updateMembershipRole(membershipId, { roles: [updateRole] })
      setSuccess('Role da membership atualizada.')
      if (tenantId) {
        await loadMemberships(tenantId)
      }
    } catch (updateError) {
      setError(getApiErrorMessage(updateError))
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setError(null)
    setSuccess(null)
    try {
      await revokeMembership(id)
      setSuccess('Membership revogada.')
      if (tenantId) {
        await loadMemberships(tenantId)
      }
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError))
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard title="Memberships por Tenant" subtitle="POST/GET /v1.0/tenants/{tenantId}/memberships">
        <Stack spacing={2}>
          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Tenant selecionado"
            value={tenantId ?? 'Nenhum tenant selecionado'}
            slotProps={{ input: { readOnly: true } }}
          />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>UserId</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.userId}</TableCell>
                  <TableCell>{item.roles.join(', ')}</TableCell>
                  <TableCell>{item.isActive ? 'Sim' : 'Não'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => void handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </PageCard>

      <PageCard title="Criar Membership" subtitle="POST /v1.0/tenants/{tenantId}/memberships">
        <Stack spacing={2} component="form" onSubmit={handleCreate}>
          <TextField
            label="User Id"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
          />
          <TextField
            select
            label="Role"
            value={createRole}
            onChange={(event) => setCreateRole(event.target.value)}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Criar
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Atualizar Role da Membership" subtitle="PATCH /v1.0/Memberships/{id}">
        <Stack spacing={2} component="form" onSubmit={handleUpdate}>
          <TextField
            select
            label="Membership"
            value={membershipId}
            onChange={(event) => setMembershipId(event.target.value)}
          >
            {items.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.id}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Role"
            value={updateRole}
            onChange={(event) => setUpdateRole(event.target.value)}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Atualizar
          </Button>
        </Stack>
      </PageCard>
    </Stack>
  )
}
