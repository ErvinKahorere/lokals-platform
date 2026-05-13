import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export function QuickActionCard({
  to,
  label,
  icon: Icon,
  accentClass = 'bg-lokals-purple-soft text-lokals-purple',
}: {
  to: string
  label: string
  icon: LucideIcon
  accentClass?: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-[22px] border border-lokals-border bg-white px-4 py-4 shadow-card transition hover:-translate-y-0.5 hover:border-lokals-purple/20"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 text-sm font-semibold text-lokals-charcoal">{label}</span>
    </Link>
  )
}
