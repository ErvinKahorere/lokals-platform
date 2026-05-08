import { CalendarDays, Clock3 } from 'lucide-react'

function formatDate(value?: string | null) {
  if (!value) return 'Date TBC'
  return new Intl.DateTimeFormat('en-NA', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value))
}

function formatTime(value?: string | null) {
  if (!value) return 'Time TBC'
  return new Intl.DateTimeFormat('en-NA', { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function EventDateBadge({ startsAt, endsAt }: { startsAt?: string | null; endsAt?: string | null }) {
  return (
    <div className="inline-flex flex-col gap-1 rounded-[18px] bg-slate-100 px-4 py-3 text-sm text-lokals-charcoal">
      <span className="inline-flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-lokals-green" />{formatDate(startsAt)}</span>
      <span className="inline-flex items-center gap-2 text-lokals-muted"><Clock3 className="h-4 w-4" />{formatTime(startsAt)}{endsAt ? ` - ${formatTime(endsAt)}` : ''}</span>
    </div>
  )
}
