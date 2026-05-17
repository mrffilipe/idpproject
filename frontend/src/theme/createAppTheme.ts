import { alpha, createTheme, type Theme } from '@mui/material/styles'
import { ptBR } from '@mui/material/locale'
import type { PaletteMode } from '@mui/material'
import { paletteTokens, radius } from './tokens'

export function createAppTheme(mode: PaletteMode): Theme {
  const tokens = mode === 'dark' ? paletteTokens.dark : paletteTokens.light

  return createTheme(
    ptBR,
    {
      palette: {
        mode,
        primary: tokens.primary,
        secondary: tokens.secondary,
        background: tokens.background,
        divider: mode === 'dark' ? alpha('#94a3b8', 0.16) : alpha('#0f172a', 0.08),
      },
      shape: {
        borderRadius: radius.md,
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
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
            html: {
              scrollBehavior: 'smooth',
            },
            body: {
              margin: 0,
              minHeight: '100vh',
              background: tokens.gradient,
              backgroundAttachment: 'fixed',
            },
          },
        },
        MuiPaper: {
          defaultProps: {
            elevation: 0,
          },
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.16) : alpha('#0f172a', 0.08)}`,
            },
          },
        },
        MuiCard: {
          defaultProps: {
            elevation: 0,
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: radius.sm,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            },
            contained: {
              '&:hover': {
                boxShadow: mode === 'dark' ? '0 4px 14px rgba(129, 140, 248, 0.25)' : '0 4px 14px rgba(79, 70, 229, 0.2)',
              },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: radius.sm,
            },
          },
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: radius.sm,
              border: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.16) : alpha('#0f172a', 0.08)}`,
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              '& .MuiTableCell-head': {
                fontWeight: 600,
                backgroundColor: mode === 'dark' ? alpha('#94a3b8', 0.08) : alpha('#0f172a', 0.04),
              },
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:last-child td': {
                borderBottom: 0,
              },
              '&:hover': {
                backgroundColor: mode === 'dark' ? alpha('#94a3b8', 0.06) : alpha('#4f46e5', 0.04),
              },
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.16) : alpha('#0f172a', 0.08)}`,
              backgroundImage: 'none',
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: radius.sm,
              marginBottom: 4,
              '&.Mui-selected': {
                backgroundColor: alpha(tokens.primary.main, mode === 'dark' ? 0.2 : 0.12),
                color: tokens.primary.main,
                '&:hover': {
                  backgroundColor: alpha(tokens.primary.main, mode === 'dark' ? 0.28 : 0.16),
                },
                '& .MuiListItemIcon-root': {
                  color: tokens.primary.main,
                },
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${mode === 'dark' ? alpha('#94a3b8', 0.16) : alpha('#0f172a', 0.08)}`,
              backgroundImage: 'none',
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 500,
            },
          },
        },
        MuiStepper: {
          styleOverrides: {
            root: {
              background: 'transparent',
            },
          },
        },
      },
    },
  )
}

export function getAuthBackground(mode: PaletteMode): string {
  return mode === 'dark' ? paletteTokens.dark.authPattern : paletteTokens.light.authPattern
}
