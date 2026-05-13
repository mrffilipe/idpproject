import { Alert, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import { useState } from 'react'
import { PageCard } from '../components/PageCard'
import { listAuditLogs } from '../services'
import type { AuditLogItem } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export function AuditLogsPage() {
  const [items, setItems] = useState<AuditLogItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [userId, setUserId] = useState('')

  async function handleSearch(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    try {
      const data = await listAuditLogs({
        action: action || undefined,
        resourceType: resourceType || undefined,
        userId: userId || undefined,
        page: 1,
        pageSize: 100,
      })
      setItems(data.items)
    } catch (searchError) {
      setError(getApiErrorMessage(searchError))
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard title="Audit Logs" subtitle="GET /v1.0/AuditLogs (com regra de acesso por role)">
        <Stack component="form" onSubmit={handleSearch} spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Action" value={action} onChange={(event) => setAction(event.target.value)} />
          <TextField
            label="Resource Type"
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value)}
          />
          <TextField label="User Id" value={userId} onChange={(event) => setUserId(event.target.value)} />
          <Button variant="contained" type="submit">
            Buscar logs
          </Button>
        </Stack>
      </PageCard>

      <PageCard title="Resultado" subtitle="Lista paginada de logs de auditoria">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>TenantId</TableCell>
              <TableCell>UserId</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource Type</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.tenantId}</TableCell>
                <TableCell>{item.userId ?? '-'}</TableCell>
                <TableCell>{item.action}</TableCell>
                <TableCell>{item.resourceType}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageCard>
    </Stack>
  )
}
