import { BellRing, BriefcaseBusiness, CalendarClock, HeartHandshake, Newspaper, ShieldAlert, CarFront, Truck, Settings2, ClipboardList, Ticket, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { NotificationItem } from '../../types'
import { EmptyState, StatusBadge } from '../Ui'
import { resolveNotificationHref } from '../../lib/notificationRoutes'

const iconMap = {
  booking_update: CalendarClock,
  booking_status: CalendarClock,
  job_update: BriefcaseBusiness,
  job_application: BriefcaseBusiness,
  municipal_alert: ShieldAlert,
  report_update: ClipboardList,
  report_created: ClipboardList,
  alert_from_followed: Megaphone,
  news_update: Newspaper,
  event_reminder: CalendarClock,
  ticket_update: Ticket,
  event_ticket: Ticket,
  delivery_update: Truck,
  ride_update: CarFront,
  new_follower: HeartHandshake,
  system: Settings2,
}

const typeLabel = (type?: string) => {
  switch (type) {
    case 'municipal_alert':
      return 'Municipal alert'
    case 'report_update':
    case 'report_created':
      return 'Report update'
    case 'booking_update':
    case 'booking_status':
      return 'Booking update'
    case 'job_update':
    case 'job_application':
      return 'Job update'
    case 'event_reminder':
      return 'Event reminder'
    case 'ticket_update':
    case 'event_ticket':
      return 'Ticket update'
    case 'delivery_update':
      return 'Delivery update'
    case 'ride_update':
      return 'Ride update'
    case 'news_update':
      return 'News update'
    default:
      return 'System'
  }
}

const sectionLabel = (createdAt?: string | null) => {
  if (!createdAt) return 'Earlier'
  const date = new Date(createdAt)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  return sameDay ? 'Today' : 'Earlier'
}

export function NotificationList({
  items,
  onMarkRead,
  onOpen,
}: {
  items: NotificationItem[]
  onMarkRead?: (id: string) => void
  onOpen?: (notification: NotificationItem) => void
}) {
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
              const href = resolveNotificationHref(item)

              return (
                <Link
                  key={item.id}
                  to={href}
                  onClick={() => onOpen?.(item)}
                  className={`block rounded-[20px] border p-4 transition hover:-translate-y-0.5 ${item.read_at ? 'border-lokals-border bg-white' : 'border-violet-200 bg-violet-50/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lokals-purple shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lokals-muted">{typeLabel(item.type)}</p>
                          <p className="mt-1 font-semibold text-lokals-charcoal">{item.title}</p>
                        </div>
                        <StatusBadge value={item.read_at ? 'Read' : 'Unread'} tone={item.read_at ? 'neutral' : 'accent'} />
                      </div>
                      <p className="mt-1 text-sm text-lokals-muted">{item.body}</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{item.created_at ?? 'Recent'}</p>
                        {!item.read_at && onMarkRead ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              onMarkRead(item.id)
                            }}
                            className="text-xs font-semibold text-lokals-purple transition hover:text-lokals-charcoal"
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
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
