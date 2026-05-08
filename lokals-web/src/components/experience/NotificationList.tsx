import { BellRing, BriefcaseBusiness, CalendarClock, HeartHandshake, Newspaper, ShieldAlert, CarFront, Truck, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NotificationItem } from '../../types'
import { EmptyState, StatusBadge } from '../Ui'

const iconMap = {
  booking_update: CalendarClock,
  job_update: BriefcaseBusiness,
  alert_from_followed: ShieldAlert,
  news_update: Newspaper,
  event_reminder: CalendarClock,
  ticket_update: CalendarClock,
  delivery_update: Truck,
  ride_update: CarFront,
  new_follower: HeartHandshake,
  system: Settings2,
}

const targetHref = (notification: NotificationItem) => {
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

  switch (notification.type) {
    case 'booking_update':
      return '/dashboard/bookings'
    case 'job_update':
      return '/jobs'
    case 'news_update':
      return '/news'
    case 'alert_from_followed':
      return '/alerts'
    case 'event_reminder':
    case 'ticket_update':
      return '/dashboard/tickets'
    case 'delivery_update':
      return '/delivery'
    case 'ride_update':
      return '/ride'
    default:
      return '/notifications'
  }
}

const sectionLabel = (createdAt?: string | null) => {
  if (!createdAt) return 'Earlier'
  const date = new Date(createdAt)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay ? 'Today' : 'Earlier'
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No notifications yet." body="Booking updates, alerts, reminders, and local activity will show here." />
  }

  return (
    <div className="space-y-5">
      {['Today', 'Earlier'].map((section) => {
        const sectionItems = items.filter((item) => sectionLabel(item.created_at) === section)
        if (sectionItems.length === 0) {
          return null
        }

        return (
          <div key={section} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{section}</p>
            {sectionItems.map((item) => {
              const Icon = iconMap[item.type as keyof typeof iconMap] ?? BellRing
              const href = targetHref(item)

              return (
                <Link key={item.id} to={href} className={`block rounded-[20px] border p-4 transition hover:-translate-y-0.5 ${item.read_at ? 'border-lokals-border bg-white' : 'border-violet-200 bg-violet-50/40'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lokals-purple shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                        <StatusBadge value={item.read_at ? 'Read' : 'Unread'} tone={item.read_at ? 'neutral' : 'accent'} />
                      </div>
                      <p className="mt-1 text-sm text-lokals-muted">{item.body}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{item.created_at ?? 'Recent'}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
