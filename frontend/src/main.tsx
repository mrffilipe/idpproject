import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/pt-br'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { router } from './routes'
import { theme } from './theme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <AuthProvider>
          <TenantProvider>
            <RouterProvider router={router} />
          </TenantProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
