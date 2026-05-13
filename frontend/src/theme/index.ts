import { createTheme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'

export const theme = createTheme(
  ptBR,
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#0d47a1',
      },
      secondary: {
        main: '#00695c',
      },
      background: {
        default: '#f7f9fc',
        paper: '#ffffff',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
      allVariants: {
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            minHeight: '100vh',
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 1,
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(13, 71, 161, 0.10)',
          },
        },
      },
    },
  },
)
