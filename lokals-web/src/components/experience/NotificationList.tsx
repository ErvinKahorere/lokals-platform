import { BellRing, BriefcaseBusiness, CalendarClock, HeartHandshake, ShieldAlert, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NotificationItem } from '../../types'
import { EmptyState, StatusBadge } from '../Ui'

const iconMap = {
  booking_update: CalendarClock,
  job_update: BriefcaseBusiness,
  new_follower: HeartHandshake,
  alert_from_followed: ShieldAlert,
  system: Settings2,
}

const hrefFor = (notification: NotificationItem) => {
  if (notification.target?.href) {
    return notification.target.href
  }

  return matchType(notification)
}

const matchType = (notification: NotificationItem) => {
  switch (notification.type) {
    case 'booking_update':
      return '/dashboard/bookings'
    case 'job_update':
      return '/jobs'
    case 'new_follower':
      return '/dashboard/business'
    case 'alert_from_followed':
      return '/alerts'
    default:
      return '/activity'
  }
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No alerts right now. You're all caught up." body="Notifications will show here when bookings, follows, and city updates change." />
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = iconMap[item.type as keyof typeof iconMap] ?? BellRing
        const href = hrefFor(item)

        return (
          <Link key={item.id} to={href} className="block rounded-[20px] border border-lokals-border bg-white p-4 transition hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
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
}
