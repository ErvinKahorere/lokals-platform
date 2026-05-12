import type { NotificationItem } from '../types'

export function getNotificationTarget(notification: NotificationItem): string {
  if (notification.target?.href) {
    return notification.target.href
  }

  if (notification.target?.external_url) {
    return `/article?${new URLSearchParams({
      url: notification.target.external_url,
      source: notification.target.source_name ?? 'external source',
      title: notification.target.title ?? notification.title,
    }).toString()}`
  }

  const targetId = notification.target?.id ?? notification.target_id

  switch (notification.type) {
    case 'municipal_alert':
    case 'alert_from_followed':
      return '/alerts'
    case 'report_update':
    case 'report_created':
      return targetId ? `/dashboard/reports/${targetId}` : '/dashboard/reports'
    case 'booking_update':
    case 'booking_status':
      return '/my-bookings'
    case 'job_update':
    case 'job_application':
      return targetId ? `/jobs/${targetId}` : '/jobs'
    case 'event_reminder':
      return targetId ? `/events/${targetId}` : '/events'
    case 'ticket_update':
    case 'event_ticket':
      return targetId ? `/events/${targetId}` : '/my-tickets'
    case 'delivery_update':
      return targetId ? `/delivery/${targetId}` : '/delivery'
    case 'ride_update':
      return targetId ? `/ride/${targetId}` : '/ride'
    case 'news_update':
      return targetId ? `/news/${targetId}` : '/news'
    default:
      return '/activity'
  }
}
