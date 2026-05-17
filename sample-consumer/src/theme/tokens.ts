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

/** Tema âmbar/teal — distinto do admin IdP (índigo). */
export const paletteTokens = {
  light: {
    primary: { main: '#d97706', dark: '#b45309', light: '#fbbf24', contrastText: '#ffffff' },
    secondary: { main: '#0891b2', dark: '#0e7490', light: '#22d3ee', contrastText: '#ffffff' },
    background: { default: '#faf8f5', paper: '#ffffff' },
    gradient: 'linear-gradient(160deg, #faf8f5 0%, #fff7ed 45%, #f0fdfa 100%)',
    authPattern:
      'radial-gradient(circle at 15% 25%, rgba(217, 119, 6, 0.14) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(8, 145, 178, 0.12) 0%, transparent 42%)',
  },
  dark: {
    primary: { main: '#fbbf24', dark: '#f59e0b', light: '#fde68a', contrastText: '#1c1917' },
    secondary: { main: '#22d3ee', dark: '#06b6d4', light: '#67e8f9', contrastText: '#0f172a' },
    background: { default: '#1c1917', paper: '#292524' },
    gradient: 'linear-gradient(160deg, #1c1917 0%, #451a03 40%, #1c1917 100%)',
    authPattern:
      'radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 40%)',
  },
} as const
