import { ArrowRight, BellRing, BriefcaseBusiness, CalendarClock, HeartHandshake, Newspaper, ShieldAlert, CarFront, Truck, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getNotificationTarget } from '../../lib/notificationRouting'
import type { NotificationItem } from '../../types'
import { Card, EmptyState, StatusBadge } from '../Ui'

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
              const href = getNotificationTarget(item)

              return (
                <Link key={item.id} to={href} className="block">
                  <Card interactive className={`p-4 ${item.read_at ? '' : 'border border-lokals-purple/16 bg-[linear-gradient(180deg,#f8f8ff,#ffffff)]'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] shadow-card ${item.read_at ? 'bg-white text-lokals-purple' : 'bg-lokals-purple-soft text-lokals-purple'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                          <StatusBadge value={item.read_at ? 'Read' : 'Unread'} tone={item.read_at ? 'neutral' : 'accent'} />
                        </div>
                        <p className="mt-1 text-sm text-lokals-muted">{item.body}</p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{item.created_at ?? 'Recent'}</p>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-lokals-purple">
                            Open
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
