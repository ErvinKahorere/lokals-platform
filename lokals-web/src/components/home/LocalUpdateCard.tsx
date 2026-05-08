import { BellRing, CalendarClock, Newspaper, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconMap = {
  alert: ShieldAlert,
  news: Newspaper,
  followed: BellRing,
  event: CalendarClock,
}

export function LocalUpdateCard({
  title,
  source,
  type,
  time,
  status,
  to,
}: {
  title: string
  source: string
  type: 'alert' | 'news' | 'followed' | 'event'
  time?: string | null
  status?: string | null
  to: string
}) {
  const Icon = iconMap[type]
  const tone = type === 'alert' ? 'text-lokals-danger bg-red-50' : type === 'followed' ? 'text-lokals-gold bg-amber-50' : 'text-lokals-green bg-lokals-green-soft'

  return (
    <Link to={to} className="block rounded-[22px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="line-clamp-2 font-semibold text-lokals-charcoal">{title}</p>
            {status ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-lokals-muted">{status}</span> : null}
          </div>
          <p className="mt-2 text-sm text-lokals-muted">{source}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{time ?? 'Recent'}</p>
        </div>
      </div>
    </Link>
  )
}
