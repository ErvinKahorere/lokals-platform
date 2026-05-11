import { Bell, CalendarClock, BriefcaseBusiness, CalendarRange, Newspaper, Tag, ShieldAlert } from 'lucide-react'

const notificationItems = [
  ['alerts_from_followed_entities', 'Alerts from followed sources', Bell],
  ['booking_updates', 'Booking updates', CalendarClock],
  ['job_updates', 'Jobs and applications', BriefcaseBusiness],
  ['event_updates', 'Events and tickets', CalendarRange],
  ['news_updates', 'Local news', Newspaper],
  ['promotions', 'Promotions and sale alerts', Tag],
  ['city_alerts', 'Municipal alerts and safety updates', ShieldAlert],
] as const

export function NotificationPreferences({
  values,
  onToggle,
}: {
  values: Record<string, boolean>
  onToggle: (key: string, checked: boolean) => void
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {notificationItems.map(([key, label, Icon]) => (
        <label key={key} className="flex items-center justify-between gap-3 rounded-[22px] border border-lokals-border bg-white px-4 py-4 shadow-card">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-lokals-purple/10 text-lokals-purple">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-lokals-charcoal">{label}</span>
          </span>
          <input type="checkbox" checked={Boolean(values[key])} onChange={(event) => onToggle(key, event.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
        </label>
      ))}
    </div>
  )
}
