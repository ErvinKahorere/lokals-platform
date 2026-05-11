import type { NotificationItem } from '../types'

export function normalizeNotificationHref(href?: string | null) {
  if (!href) return '/activity'

  if (href === '/dashboard/bookings') return '/my-bookings'
  if (href === '/dashboard/tickets') return '/my-tickets'
  if (href === '/dashboard/jobs') return '/jobs'
  if (href === '/dashboard/reports') return '/dashboard/reports'

  return href
}

export function resolveNotificationHref(notification: NotificationItem) {
  if (notification.target?.external_url) {
    return `/article?${new URLSearchParams({
      url: notification.target.external_url,
      source: notification.target.source_name ?? 'external source',
      title: notification.target.title ?? notification.title,
    }).toString()}`
  }

  const href = notification.target?.href
  if (href) {
    return normalizeNotificationHref(href)
  }

  switch (notification.type) {
    case 'municipal_alert':
      return '/alerts'
    case 'report_update':
    case 'report_created':
      return notification.target_id ? `/dashboard/reports/${notification.target_id}` : '/dashboard/reports'
    case 'booking_update':
    case 'booking_status':
      return '/my-bookings'
    case 'job_update':
    case 'job_application':
      return notification.target_id ? `/jobs/${notification.target_id}` : '/jobs'
    case 'event_reminder':
      return notification.target_id ? `/events/${notification.target_id}` : '/events'
    case 'ticket_update':
    case 'event_ticket':
      return '/my-tickets'
    case 'delivery_update':
      return notification.target_id ? `/delivery/${notification.target_id}` : '/delivery'
    case 'ride_update':
      return notification.target_id ? `/ride/${notification.target_id}` : '/ride'
    case 'news_update':
      return notification.target_id ? `/news/${notification.target_id}` : '/news'
    default:
      return '/activity'
  }
}
