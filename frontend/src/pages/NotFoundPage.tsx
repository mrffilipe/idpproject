import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router'
import { PageCard } from '../components/PageCard'

export function NotFoundPage() {
  return (
    <PageCard title="Página não encontrada">
      <Stack spacing={2}>
        <Typography color="text.secondary">A rota solicitada não existe nesta aplicação.</Typography>
        <Button component={Link} to="/" variant="contained">
          Voltar para dashboard
        </Button>
      </Stack>
    </PageCard>
  )
}
