import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotificationBell({ count = 0, to = '/notifications' }: { count?: number; to?: string }) {
  return (
    <Link to={to} aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-lokals-border bg-white shadow-card">
      <Bell className="h-5 w-5 text-lokals-charcoal" />
      {count > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lokals-danger px-1 text-[10px] font-bold text-white">{count}</span> : null}
    </Link>
  )
}
