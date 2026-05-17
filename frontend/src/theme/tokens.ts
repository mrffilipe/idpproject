export const layout = {
  sidebarWidth: 280,
  contentMaxWidth: 1400,
  authMaxWidth: 480,
  bootstrapMaxWidth: 720,
} as const

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
} as const

export const paletteTokens = {
  light: {
    primary: { main: '#4f46e5', dark: '#4338ca', light: '#818cf8', contrastText: '#ffffff' },
    secondary: { main: '#0d9488', dark: '#0f766e', light: '#2dd4bf', contrastText: '#ffffff' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
    gradient: 'linear-gradient(160deg, #f4f6fb 0%, #eef2ff 45%, #f8fafc 100%)',
    authPattern:
      'radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 0%, rgba(13, 148, 136, 0.1) 0%, transparent 40%)',
  },
  dark: {
    primary: { main: '#818cf8', dark: '#6366f1', light: '#a5b4fc', contrastText: '#0f172a' },
    secondary: { main: '#2dd4bf', dark: '#14b8a6', light: '#5eead4', contrastText: '#0f172a' },
    background: { default: '#0f172a', paper: '#1e293b' },
    gradient: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    authPattern:
      'radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 0%, rgba(45, 212, 191, 0.08) 0%, transparent 40%)',
  },
} as const
