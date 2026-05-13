import { redirect } from 'react-router'
import { getAuthSession } from '../utils/authStorage'
import { getSelectedTenantId } from '../utils/tenantStorage'

export async function requireAuthLoader(): Promise<null> {
  const session = getAuthSession()
  if (!session?.accessToken) {
    throw redirect('/login')
  }

  return null
}

export async function loginLoader(): Promise<null> {
  const session = getAuthSession()
  if (session?.accessToken) {
    throw redirect('/')
  }

  return null
}

export async function requireTenantLoader(): Promise<null> {
  await requireAuthLoader()

  const tenantId = getSelectedTenantId()
  if (!tenantId) {
    throw redirect('/tenants')
  }

  return null
}
