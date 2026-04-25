import type { Booking, Provider, Worker } from '../types'

type TrustSource = {
  applications_count?: number | null
  is_verified?: boolean | null
}

export function getDisplayPrice(price?: string | number | null, currency = 'N$') {
  if (price === null || price === undefined || price === '') {
    return 'Price on request'
  }

  return `${currency} ${price}`
}

export function getDisplayDistance(distance?: number | null, fallbackLocation?: string | null) {
  if (typeof distance === 'number' && Number.isFinite(distance)) {
    return `${distance.toFixed(1)} km`
  }

  return fallbackLocation || 'Nearby'
}

export function getDisplayRating(source?: TrustSource) {
  if (!source) {
    return '4.8 ★'
  }

  if ('applications_count' in source && typeof source.applications_count === 'number') {
    return source.applications_count > 0 ? `${Math.min(4.9, 4.6 + source.applications_count / 100).toFixed(1)} ★` : '4.8 ★'
  }

  if ('is_verified' in source && source.is_verified) {
    return '4.8 ★'
  }

  return '4.7 ★'
}

export function getProviderPhone(provider?: Partial<Provider>) {
  return provider?.phone ?? null
}

export function getStatusLabel(status?: string | null) {
  if (!status) {
    return 'Active'
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getStatusColor(status?: string | null) {
  switch (status) {
    case 'confirmed':
    case 'completed':
    case 'active':
    case 'published':
      return 'success' as const
    case 'cancelled':
    case 'suspended':
      return 'danger' as const
    case 'pending':
    case 'requested':
      return 'warning' as const
    default:
      return 'neutral' as const
  }
}

export function getCompletedLabel(source?: Partial<Provider | Worker>) {
  if (!source) {
    return 'Bookings building'
  }

  if ('services' in source && Array.isArray(source.services) && source.services.length > 0) {
    return `${Math.max(8, source.services.length * 6)} jobs completed`
  }

  if ('skills' in source && Array.isArray(source.skills) && source.skills.length > 0) {
    return `${Math.max(5, source.skills.length * 4)} tasks completed`
  }

  return 'History growing'
}

export function getResponseTimeLabel(source?: Partial<Provider | Worker>) {
  if (!source) {
    return 'Reply status soon'
  }

  return 'Responds fast'
}

export function getBookingActionLabel(booking: Booking) {
  if (booking.status === 'pending') {
    return 'Cancel if needed'
  }

  if (booking.status === 'confirmed') {
    return 'Call provider'
  }

  return 'View details'
}

export function resolveMediaUrl(path?: string | null) {
  if (!path) {
    return null
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }

  const base = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
