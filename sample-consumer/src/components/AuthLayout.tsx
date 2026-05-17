import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Box, Paper, Stack, Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { useThemeMode } from '../contexts/ThemeModeContext'
import { getAuthBackground, layout } from '../theme'

interface AuthLayoutProps extends PropsWithChildren {
  maxWidth?: number
  title?: string
  subtitle?: string
}

export function AuthLayout({
  children,
  maxWidth = layout.authMaxWidth,
  title = 'IdP Platform',
  subtitle = 'Identity Provider centralizado para suas aplicações',
}: AuthLayoutProps) {
  const { mode } = useThemeMode()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: getAuthBackground(mode),
      }}
    >
      <Box sx={{ width: '100%', maxWidth }}>
        <Stack spacing={3} sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            sx={{
              mx: 'auto',
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
        </Stack>
        <Paper sx={{ p: { xs: 2.5, sm: 3.5 } }}>{children}</Paper>
      </Box>
    </Box>
  )
}
