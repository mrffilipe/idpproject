import DeleteIcon from '@mui/icons-material/Delete'
import {
  Button,
  IconButton,
  MenuItem,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { DataTable, FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard, StatusChip } from '../components/ui'
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
      setError('Nenhum tenant ativo. Assine um plano ou selecione a organização no menu superior.')
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
      setSuccess('Papel da membership atualizado.')
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
    <Stack spacing={3}>
      <PageHeader title="Memberships" description="Membros e papéis vinculados ao tenant selecionado." />
      <FeedbackAlerts success={success} error={error} />

      <SectionCard title="Membros do tenant">
        <Stack spacing={2}>
          <TextField
            label="Tenant selecionado"
            value={tenantId ?? 'Nenhum tenant selecionado'}
            slotProps={{ input: { readOnly: true } }}
            size="small"
            sx={{ maxWidth: 480 }}
          />
          <DataTable
            columns={[
              { id: 'id', label: 'Id', minWidth: 120 },
              { id: 'userId', label: 'UserId', minWidth: 120 },
              { id: 'roles', label: 'Papéis' },
              { id: 'active', label: 'Ativo' },
              { id: 'actions', label: 'Ações', align: 'right' },
            ]}
            rows={items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.id}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.userId}</TableCell>
                <TableCell>{item.roles.join(', ')}</TableCell>
                <TableCell>
                  <StatusChip label={item.isActive ? 'Ativo' : 'Inativo'} variant={item.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Revogar membership">
                    <IconButton color="error" size="small" onClick={() => void handleDelete(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            emptyDescription={tenantId ? 'Nenhuma membership neste tenant.' : 'Assine um plano ou selecione a organização no menu superior.'}
          />
        </Stack>
      </SectionCard>

      <SectionCard title="Criar membership">
        <Stack spacing={2} component="form" onSubmit={handleCreate}>
          <FormGrid>
            <FormGridItem>
              <TextField label="User Id" value={userId} onChange={(e) => setUserId(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem>
              <TextField select label="Papel" value={createRole} onChange={(e) => setCreateRole(e.target.value)} fullWidth>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </FormGridItem>
          </FormGrid>
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Criar
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard title="Atualizar papel">
        <Stack spacing={2} component="form" onSubmit={handleUpdate}>
          <FormGrid>
            <FormGridItem>
              <TextField select label="Membership" value={membershipId} onChange={(e) => setMembershipId(e.target.value)} fullWidth>
                {items.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.id}
                  </MenuItem>
                ))}
              </TextField>
            </FormGridItem>
            <FormGridItem>
              <TextField select label="Papel" value={updateRole} onChange={(e) => setUpdateRole(e.target.value)} fullWidth>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
            </FormGridItem>
          </FormGrid>
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Atualizar
          </Button>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
