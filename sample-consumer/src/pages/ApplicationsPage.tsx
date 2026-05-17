import { Alert, Button, MenuItem, Stack, TableCell, TableRow, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { DataTable, FeedbackAlerts, FormGrid, FormGridItem, PageHeader, SectionCard } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { createApplication, listApplications } from '../services'
import { ApplicationType, type Application } from '../types'
import { getApiErrorMessage } from '../utils/apiError'

const typeOptions: Array<{ label: string; value: ApplicationType }> = [
  { label: 'Web', value: ApplicationType.Web },
  { label: 'Mobile', value: ApplicationType.Mobile },
  { label: 'Backend', value: ApplicationType.Backend },
]

export function ApplicationsPage() {
  const { platformRoles } = useAuth()
  const isPlatformAdministrator = platformRoles.includes('plat_admin')
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
    <Stack spacing={3}>
      <PageHeader title="Applications" description="Gerencie aplicações OAuth registradas na plataforma." />
      <FeedbackAlerts success={success} error={error} />

      <SectionCard title="Lista de aplicações">
        <DataTable
          columns={[
            { id: 'id', label: 'Id', minWidth: 120 },
            { id: 'name', label: 'Nome' },
            { id: 'slug', label: 'Slug' },
            { id: 'type', label: 'Tipo' },
            { id: 'actions', label: 'Ações', align: 'right' },
          ]}
          rows={items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.slug}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell align="right">
                <Button component={Link} to={`/applications/${item.id}`} size="small" variant="outlined">
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
          emptyDescription="Nenhuma application cadastrada ainda."
        />
      </SectionCard>

      <SectionCard title="Criar application">
        {isPlatformAdministrator ? (
          <Stack spacing={2} component="form" onSubmit={handleCreate}>
            <FormGrid>
              <FormGridItem>
                <TextField label="Nome" value={name} onChange={(event) => setName(event.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem>
                <TextField label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} required fullWidth />
              </FormGridItem>
              <FormGridItem>
                <TextField
                  select
                  label="Tipo"
                  value={type}
                  onChange={(event) => setType(Number(event.target.value) as ApplicationType)}
                  fullWidth
                >
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </FormGridItem>
            </FormGrid>
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Criar
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">Apenas administradores de plataforma podem criar applications.</Alert>
        )}
      </SectionCard>
    </Stack>
  )
}
