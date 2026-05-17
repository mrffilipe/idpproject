import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { useThemeMode } from '../contexts/ThemeModeContext'
import { useTenant } from '../contexts/TenantContext'
import { logout } from '../services'
import { layout } from '../theme'
import { getAuthSession } from '../utils/authStorage'

interface NavItem {
  to: string
  label: string
  icon: ReactElement
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function buildNavGroups(showDevTools: boolean): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: 'CRM',
      items: [
        { to: '/', label: 'Início', icon: <DashboardOutlinedIcon /> },
        { to: '/subscribe', label: 'Assinar plano', icon: <CardMembershipOutlinedIcon /> },
        { to: '/token', label: 'Token / JWT', icon: <KeyOutlinedIcon /> },
      ],
    },
    {
      label: 'Conta',
      items: [
        { to: '/profile', label: 'Meu perfil', icon: <PersonOutlinedIcon /> },
        { to: '/sessions', label: 'Sessões', icon: <SecurityOutlinedIcon /> },
      ],
    },
    {
      label: 'Organização',
      items: [
        { to: '/memberships', label: 'Memberships', icon: <GroupOutlinedIcon /> },
        { to: '/tenant-roles', label: 'Papéis do tenant', icon: <VpnKeyOutlinedIcon /> },
      ],
    },
  ]

  if (showDevTools) {
    groups.push({
      label: 'IdP (dev)',
      items: [{ to: '/dev', label: 'Ferramentas', icon: <BuildOutlinedIcon /> }],
    })
  }

  return groups
}

function isNavActive(pathname: string, to: string): boolean {
  if (to === '/') {
    return pathname === '/'
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function AppLayout() {
  const location = useLocation()
  const { logoutLocal, email, platformRoles } = useAuth()
  const navGroups = useMemo(
    () => buildNavGroups(platformRoles.includes('plat_admin')),
    [platformRoles],
  )
  const { tenantId, tenantName, hasMultipleTenants, availableTenants, selectTenant, isResolving } = useTenant()
  const { mode, toggleMode } = useThemeMode()
  const [openMobileDrawer, setOpenMobileDrawer] = useState(false)

  const currentPath = useMemo(() => location.pathname, [location.pathname])

  async function handleLogout(): Promise<void> {
    const refreshToken = getAuthSession()?.refreshToken
    try {
      if (refreshToken) {
        await logout({ refreshToken })
      }
    } finally {
      logoutLocal()
      window.location.assign('/login')
    }
  }

  const navList = (
    <List sx={{ px: 1.5, py: 1 }}>
      {navGroups.map((group, groupIndex) => (
        <Box key={group.label}>
          {groupIndex > 0 ? <Divider sx={{ my: 1.5 }} /> : null}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1.5, py: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {group.label}
          </Typography>
          {group.items.map((item) => (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              selected={isNavActive(currentPath, item.to)}
              onClick={() => setOpenMobileDrawer(false)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 500 } } }} />
            </ListItemButton>
          ))}
        </Box>
      ))}
    </List>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            onClick={() => setOpenMobileDrawer((prev) => !prev)}
            sx={{ display: { md: 'none' } }}
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Sample CRM
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasMultipleTenants ? (
              <TextField
                select
                size="small"
                label="Organização"
                value={tenantId ?? ''}
                onChange={(event) => void selectTenant(event.target.value)}
                disabled={isResolving}
                sx={{ minWidth: 200, display: { xs: 'none', sm: 'flex' } }}
              >
                {availableTenants.map((tenant) => (
                  <MenuItem key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.tenantName}
                  </MenuItem>
                ))}
              </TextField>
            ) : tenantId ? (
              <Chip
                size="small"
                label={tenantName ?? `Tenant ${tenantId.slice(0, 8)}…`}
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
            ) : (
              <Chip size="small" label="Sem tenant" variant="outlined" color="warning" sx={{ display: { xs: 'none', sm: 'flex' } }} />
            )}
            <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
              <IconButton onClick={toggleMode} aria-label="Alternar tema">
                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
              </IconButton>
            </Tooltip>
            {email ? (
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: 180 }} noWrap>
                {email}
              </Typography>
            ) : null}
            <Tooltip title="Sair">
              <IconButton onClick={() => void handleLogout()} aria-label="Logout" color="inherit">
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: layout.sidebarWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={openMobileDrawer}
          onClose={() => setOpenMobileDrawer(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: layout.sidebarWidth,
              pt: 8,
            },
          }}
        >
          {navList}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: layout.sidebarWidth,
              pt: 8,
            },
          }}
          open
        >
          {navList}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${layout.sidebarWidth}px)` },
          mt: 8,
          px: { xs: 2, md: 4 },
          py: 3,
        }}
      >
        <Box sx={{ maxWidth: layout.contentMaxWidth, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
