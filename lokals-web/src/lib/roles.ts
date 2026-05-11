import type { Role, User } from '../types'

const municipalityRoles: Role[] = ['town_manager', 'municipality_admin']
const adminRoles: Role[] = ['super_admin', 'operator']
const businessRoles: Role[] = ['seller', 'business_owner', 'service_provider']

export function getActiveRole(user?: User | null): Role | 'guest' {
  if (!user) return 'guest'
  return user.current_role ?? user.roles?.[0] ?? 'citizen'
}

export function getRoleHomePath(user?: User | null): string {
  const activeRole = getActiveRole(user)

  if (municipalityRoles.includes(activeRole as Role)) return '/dashboard/town-manager'
  if (activeRole === 'organization_admin') return '/dashboard/organization'
  if (adminRoles.includes(activeRole as Role)) return '/admin'
  if (activeRole === 'service_provider') return '/dashboard/service-provider'
  if (activeRole === 'seller') return '/dashboard/seller'
  if (businessRoles.includes(activeRole as Role)) return '/dashboard/business'
  if (activeRole === 'worker') return '/dashboard/worker'
  if (activeRole === 'citizen') return '/home'
  return '/home'
}

export function hasActiveRole(user: User | null | undefined, allowedRoles: Role[]): boolean {
  const activeRole = getActiveRole(user)
  if (activeRole === 'guest') return false
  return allowedRoles.includes(activeRole as Role)
}

export function hasAnyAssignedRole(user: User | null | undefined, allowedRoles: Role[]): boolean {
  const roles = user?.roles ?? []
  return roles.some((role) => allowedRoles.includes(role))
}
