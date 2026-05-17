import { env } from '../config/env'

const versionPrefix = `/v${env.apiVersion}`

export const apiPaths = {
  versionPrefix,
  auth: `${versionPrefix}/auth`,
  platform: `${versionPrefix}/platform`,
  users: `${versionPrefix}/Users`,
  tenants: `${versionPrefix}/Tenants`,
  memberships: `${versionPrefix}/Memberships`,
  tenantRoles: `${versionPrefix}/TenantRoles`,
  applications: `${versionPrefix}/Applications`,
  auditLogs: `${versionPrefix}/AuditLogs`,
  invites: `${versionPrefix}/invites`,
  wellKnown: '/.well-known',
} as const
