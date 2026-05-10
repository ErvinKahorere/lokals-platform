import { BellRing, BriefcaseBusiness, CalendarClock, CarFront, ClipboardList, Newspaper, Package, ShieldAlert, Store, Ticket } from 'lucide-react'
import { Button } from '../Ui'
import type { NotificationItem } from '../../types'

const notificationIconMap = {
  municipal_alert: ShieldAlert,
  report_update: ClipboardList,
  booking_update: CalendarClock,
  booking_status: CalendarClock,
  job_update: BriefcaseBusiness,
  job_application: BriefcaseBusiness,
  event_reminder: Ticket,
  ticket_update: Ticket,
  event_ticket: Ticket,
  delivery_update: Package,
  ride_update: CarFront,
  news_update: Newspaper,
  system: BellRing,
} as const

function formatTypeLabel(type?: string) {
  return (type ?? 'system').replaceAll('_', ' ')
}

export function FloatingNotificationToast({
  notification,
  onOpen,
  onDismiss,
}: {
  notification: NotificationItem
  onOpen: () => void
  onDismiss: () => void
}) {
  const Icon = notificationIconMap[notification.type as keyof typeof notificationIconMap] ?? Store

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-[28px] border border-violet-100 bg-white/98 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{formatTypeLabel(notification.type)}</p>
              <p className="mt-1 line-clamp-1 text-sm font-semibold text-lokals-charcoal">{notification.title}</p>
            </div>
            <button type="button" onClick={onDismiss} className="text-xs font-semibold text-lokals-muted transition hover:text-lokals-charcoal">Dismiss</button>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-lokals-muted">{notification.body}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="truncate text-xs font-medium text-lokals-muted">
              {notification.target?.title ?? notification.target?.source_name ?? 'LOKALS'}
            </span>
            <Button className="min-h-9 px-3 py-2 text-xs" onClick={onOpen}>Open</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
