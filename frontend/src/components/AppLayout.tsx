import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services'
import { getAuthSession } from '../utils/authStorage'

const drawerWidth = 280

interface NavItem {
  to: string
  label: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/profile', label: 'Meu Perfil' },
  { to: '/sessions', label: 'Sessões' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/memberships', label: 'Memberships' },
  { to: '/tenant-roles', label: 'Tenant Roles' },
  { to: '/applications', label: 'Applications' },
  { to: '/audit-logs', label: 'Audit Logs' },
  { to: '/jwks', label: 'JWKS' },
]

export function AppLayout() {
  const location = useLocation()
  const { logoutLocal } = useAuth()
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
    <List sx={{ px: 1, pt: 2 }}>
      {navItems.map((item) => (
        <ListItemButton
          key={item.to}
          component={Link}
          to={item.to}
          selected={currentPath === item.to || currentPath.startsWith(`${item.to}/`)}
          onClick={() => setOpenMobileDrawer(false)}
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="inherit">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpenMobileDrawer((prev) => !prev)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            IdP Platform
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Button color="inherit" onClick={() => void handleLogout()}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={openMobileDrawer}
          onClose={() => setOpenMobileDrawer(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, pt: 8 },
          }}
        >
          {navList}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, pt: 8 },
          }}
          open
        >
          {navList}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
