export const roleLabel = (role?: string | null) => {
  if (!role) {
    return 'Resident'
  }

  if (role === 'citizen') {
    return 'Resident'
  }

  return role
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export const roleOptions = [
  'citizen',
  'worker',
  'seller',
  'service_provider',
  'driver',
  'organization_admin',
  'town_manager',
  'municipality_admin',
] as const

export const interestOptions = [
  'Services',
  'Jobs',
  'Marketplace',
  'Events',
  'Accommodation',
  'News',
  'Alerts',
] as const
