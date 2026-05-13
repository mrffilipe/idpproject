import { Alert, Button, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageCard } from '../components/PageCard'
import { createApplication, listApplications } from '../services'
import { ApplicationType, type Application } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const typeOptions: Array<{ label: string; value: ApplicationType }> = [
  { label: 'Web', value: ApplicationType.Web },
  { label: 'Mobile', value: ApplicationType.Mobile },
  { label: 'Backend', value: ApplicationType.Backend },
]

export function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [type, setType] = useState<ApplicationType>(ApplicationType.Web)

  useEffect(() => {
    void loadApplications()
  }, [])

  async function loadApplications(): Promise<void> {
    setError(null)
    try {
      const result = await listApplications({ page: 1, pageSize: 100 })
      setItems(result.items)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await createApplication({ name, slug, type })
      setSuccess(`Application criada: ${created.id}`)
      setName('')
      setSlug('')
      setType(ApplicationType.Web)
      await loadApplications()
    } catch (createError) {
      setError(getApiErrorMessage(createError))
    }
  }

  return (
    <Stack spacing={2}>
      <PageCard title="Applications" subtitle="POST/GET /v1.0/Applications">
        <Stack spacing={2}>
          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell align="right">
                    <Button component={Link} to={`/applications/${item.id}`} size="small">
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </PageCard>

      <PageCard title="Criar Application" subtitle="POST /v1.0/Applications">
        <Stack spacing={2} component="form" onSubmit={handleCreate}>
          <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} required />
          <TextField label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          <TextField
            select
            label="Type"
            value={type}
            onChange={(event) => setType(Number(event.target.value) as ApplicationType)}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained">
            Criar
          </Button>
        </Stack>
      </PageCard>
    </Stack>
  )
}
