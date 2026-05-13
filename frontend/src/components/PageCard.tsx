import type { PropsWithChildren } from 'react'
import { Paper, Stack, Typography } from '@mui/material'

interface PageCardProps extends PropsWithChildren {
  title: string
  subtitle?: string
}

export function PageCard({ title, subtitle, children }: PageCardProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5">{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        {children}
      </Stack>
    </Paper>
  )
}
