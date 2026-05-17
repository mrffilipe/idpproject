import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { DataTable, FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard, StatusChip } from '../components/ui'
import { useTenant } from '../contexts/TenantContext'
import { createTenantRole, listTenantRoles, updateTenantRole } from '../services'
import type { TenantRole } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export function TenantRolesPage() {
  const { tenantId } = useTenant()
  const [roles, setRoles] = useState<TenantRole[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [roleId, setRoleId] = useState('')
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [roleIsActive, setRoleIsActive] = useState(true)

  useEffect(() => {
    if (!tenantId) {
      setRoles([])
      return
    }
    void loadRoles(tenantId)
  }, [tenantId])

  async function loadRoles(currentTenantId: string): Promise<void> {
    setError(null)
    try {
      const data = await listTenantRoles(currentTenantId, { includeInactive: true, page: 1, pageSize: 100 })
      setRoles(data.items)
      if (!roleId && data.items.length > 0) {
        const first = data.items[0]
        setRoleId(first.id)
        setRoleName(first.name)
        setRoleDescription(first.description ?? '')
        setRoleIsActive(first.isActive)
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
      const result = await createTenantRole(tenantId, {
        key,
        name,
        description: description || null,
      })
      setSuccess(`Papel criado: ${result.id}`)
      setKey('')
      setName('')
      setDescription('')
      await loadRoles(tenantId)
    } catch (createError) {
      setError(getApiErrorMessage(createError))
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    if (!roleId) {
      return
    }
    try {
      await updateTenantRole(roleId, {
        name: roleName,
        description: roleDescription || null,
        isActive: roleIsActive,
      })
      setSuccess('Papel atualizado com sucesso.')
      if (tenantId) {
        await loadRoles(tenantId)
      }
    } catch (updateError) {
      setError(getApiErrorMessage(updateError))
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader title="Papéis do tenant" description="Papéis customizados para controle de acesso no tenant selecionado." />
      <FeedbackAlerts success={success} error={error} />

      <SectionCard title="Papéis cadastrados">
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
              { id: 'key', label: 'Chave' },
              { id: 'name', label: 'Nome' },
              { id: 'description', label: 'Descrição' },
              { id: 'system', label: 'Sistema' },
              { id: 'active', label: 'Ativo' },
            ]}
            rows={roles.map((role) => (
              <TableRow key={role.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{role.id}</TableCell>
                <TableCell>{role.key}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description ?? '-'}</TableCell>
                <TableCell>
                  <StatusChip label={role.isSystem ? 'Sistema' : 'Custom'} variant={role.isSystem ? 'info' : 'default'} />
                </TableCell>
                <TableCell>
                  <StatusChip label={role.isActive ? 'Ativo' : 'Inativo'} variant={role.isActive ? 'success' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
            emptyDescription={tenantId ? 'Nenhum papel cadastrado.' : 'Assine um plano ou selecione a organização no menu superior.'}
          />
        </Stack>
      </SectionCard>

      <SectionCard title="Criar papel">
        <Stack spacing={2} component="form" onSubmit={handleCreate}>
          <FormGrid>
            <FormGridItem>
              <TextField label="Chave" value={key} onChange={(e) => setKey(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem>
              <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem xs={12} md={12}>
              <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
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
              <TextField
                select
                label="Papel"
                value={roleId}
                onChange={(event) => {
                  const selected = roles.find((role) => role.id === event.target.value)
                  setRoleId(event.target.value)
                  setRoleName(selected?.name ?? '')
                  setRoleDescription(selected?.description ?? '')
                  setRoleIsActive(selected?.isActive ?? true)
                }}
                fullWidth
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormGridItem>
            <FormGridItem>
              <TextField label="Nome" value={roleName} onChange={(e) => setRoleName(e.target.value)} required fullWidth />
            </FormGridItem>
            <FormGridItem xs={12} md={12}>
              <TextField label="Descrição" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} fullWidth />
            </FormGridItem>
          </FormGrid>
          <FormControlLabel
            control={<Checkbox checked={roleIsActive} onChange={(e) => setRoleIsActive(e.target.checked)} />}
            label="Papel ativo"
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            Atualizar
          </Button>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
