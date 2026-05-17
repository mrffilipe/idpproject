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
  DevToolsPage,
  HomePage,
  JwksPage,
  LoginPage,
  MembershipsPage,
  NotFoundPage,
  OnboardingPage,
  ProfilePage,
  SessionsPage,
  SubscribePage,
  TenantRolesPage,
  TenantsPage,
  TokenPage,
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
      { path: 'subscribe', Component: SubscribePage },
      { path: 'token', Component: TokenPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'sessions', Component: SessionsPage },
      { path: 'memberships', Component: MembershipsPage },
      { path: 'tenant-roles', Component: TenantRolesPage },
      { path: 'dev', Component: DevToolsPage },
      { path: 'dev/bootstrap', Component: BootstrapPage },
      { path: 'dev/applications', Component: ApplicationsPage },
      { path: 'dev/applications/:applicationId', Component: ApplicationDetailPage },
      { path: 'dev/tenants', Component: TenantsPage },
      { path: 'dev/audit-logs', Component: AuditLogsPage },
      { path: 'dev/jwks', Component: JwksPage },
      { path: 'dev/onboarding-legacy', Component: OnboardingPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
