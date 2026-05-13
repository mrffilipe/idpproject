import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Alert,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { PageCard } from '../components/PageCard'
import { listActiveSessions, revokeSession } from '../services'
import type { AuthSession } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export function SessionsPage() {
  const [sessions, setSessions] = useState<AuthSession[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void loadSessions()
  }, [])

  async function loadSessions(): Promise<void> {
    setError(null)
    try {
      const data = await listActiveSessions()
      setSessions(data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleRevoke(sessionId: string): Promise<void> {
    setError(null)
    setSuccess(null)
    try {
      await revokeSession(sessionId)
      setSuccess('Sessão revogada com sucesso.')
      await loadSessions()
    } catch (revokeError) {
      setError(getApiErrorMessage(revokeError))
    }
  }

  return (
    <PageCard title="Sessões Ativas" subtitle="GET/DELETE /v1.0/auth/sessions">
      <Stack spacing={2}>
        {success ? <Alert severity="success">{success}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Recarregar sessões">
            <IconButton onClick={() => void loadSessions()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Session Id</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>User Agent</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.sessionId}>
                <TableCell>{session.sessionId}</TableCell>
                <TableCell>{session.status}</TableCell>
                <TableCell>{session.tenantId ?? '-'}</TableCell>
                <TableCell>{session.ipAddress ?? '-'}</TableCell>
                <TableCell>{session.userAgent ?? '-'}</TableCell>
                <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Revogar sessão">
                    <IconButton color="error" onClick={() => void handleRevoke(session.sessionId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </PageCard>
  )
}
