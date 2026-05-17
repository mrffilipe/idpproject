import { createBrowserRouter } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { RouteHydrateFallback } from './components/RouteHydrateFallback'
import { bootstrapLoader, requireAuthLoader, loginLoader } from './routes/loaders'
import {
  AcceptInvitePage,
  ApplicationDetailPage,
  ApplicationsPage,
  AuditLogsPage,
  BootstrapPage,
  HomePage,
  JwksPage,
  LoginPage,
  MembershipsPage,
  NotFoundPage,
  ProfilePage,
  SessionsPage,
  TenantRolesPage,
  TenantsPage,
} from './pages'

export const router = createBrowserRouter([
  {
    path: '/bootstrap',
    loader: bootstrapLoader,
    HydrateFallback: RouteHydrateFallback,
    Component: BootstrapPage,
  },
  {
    path: '/login',
    loader: loginLoader,
    HydrateFallback: RouteHydrateFallback,
    Component: LoginPage,
  },
  {
    path: '/accept-invite',
    Component: AcceptInvitePage,
  },
  {
    path: '/',
    loader: requireAuthLoader,
    HydrateFallback: RouteHydrateFallback,
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'profile', Component: ProfilePage },
      { path: 'sessions', Component: SessionsPage },
      { path: 'tenants', Component: TenantsPage },
      { path: 'memberships', Component: MembershipsPage },
      { path: 'tenant-roles', Component: TenantRolesPage },
      { path: 'applications', Component: ApplicationsPage },
      { path: 'applications/:applicationId', Component: ApplicationDetailPage },
      { path: 'audit-logs', Component: AuditLogsPage },
      { path: 'jwks', Component: JwksPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
