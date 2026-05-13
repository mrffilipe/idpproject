import { Alert, Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { PageCard } from '../components/PageCard'
import { getJwks } from '../services'
import type { JwksResponse } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

export function JwksPage() {
  const [data, setData] = useState<JwksResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLoad(): Promise<void> {
    setError(null)
    try {
      const response = await getJwks()
      setData(response)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  return (
    <PageCard title="JWKS" subtitle="GET /.well-known/jwks.json (anônimo)">
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Button onClick={() => void handleLoad()} variant="contained">
          Carregar JWKS
        </Button>
        <TextField
          label="Resposta"
          value={data ? JSON.stringify(data, null, 2) : ''}
          multiline
          minRows={8}
          slotProps={{ input: { readOnly: true } }}
        />
      </Stack>
    </PageCard>
  )
}
