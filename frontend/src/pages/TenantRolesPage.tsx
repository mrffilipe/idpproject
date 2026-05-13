import { Alert, Button, Checkbox, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { PageCard } from '../components/PageCard'
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
      setError('Selecione um tenant na tela de Tenants.')
      return
    }

    try {
      const result = await createTenantRole(tenantId, {
        key,
        name,
        description: description || null,
      })
      setSuccess(`Role criada: ${result.id}`)
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
      setSuccess('Role atualizada com sucesso.')
      if (tenantId) {
        await loadRoles(tenantId)
      }
    } catch (updateError) {
      setError(getApiErrorMessage(updateError))
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard title="Tenant Roles" subtitle="GET/POST /v1.0/tenants/{tenantId}/roles">
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
                <TableCell>Key</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Sistema</TableCell>
                <TableCell>Ativo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.key}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description ?? '-'}</TableCell>
                  <TableCell>{role.isSystem ? 'Sim' : 'Não'}</TableCell>
                  <TableCell>{role.isActive ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </PageCard>

      <PageCard title="Criar Tenant Role" subtitle="POST /v1.0/tenants/{tenantId}/roles">
        <Stack spacing={2} component="form" onSubmit={handleCreate}>
          <TextField label="Key" value={key} onChange={(event) => setKey(event.target.value)} required />
          <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} required />
          <TextField
            label="Descrição"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Button type="submit" variant="contained">
            Criar
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Atualizar Tenant Role" subtitle="PATCH /v1.0/TenantRoles/{id}">
        <Stack spacing={2} component="form" onSubmit={handleUpdate}>
          <TextField
            select
            label="Role"
            value={roleId}
            onChange={(event) => {
              const selected = roles.find((role) => role.id === event.target.value)
              setRoleId(event.target.value)
              setRoleName(selected?.name ?? '')
              setRoleDescription(selected?.description ?? '')
              setRoleIsActive(selected?.isActive ?? true)
            }}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Nome" value={roleName} onChange={(event) => setRoleName(event.target.value)} required />
          <TextField
            label="Descrição"
            value={roleDescription}
            onChange={(event) => setRoleDescription(event.target.value)}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Checkbox checked={roleIsActive} onChange={(event) => setRoleIsActive(event.target.checked)} />
            Ativo
          </Stack>
          <Button type="submit" variant="contained">
            Atualizar
          </Button>
        </Stack>
      </PageCard>
    </Stack>
  )
}
