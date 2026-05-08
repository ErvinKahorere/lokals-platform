import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ProfileMenuItem({
  to,
  icon: Icon,
  label,
  description,
}: {
  to: string
  icon: LucideIcon
  label: string
  description: string
}) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-[22px] border border-lokals-border bg-white px-4 py-4 shadow-card transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-lokals-purple/10 text-lokals-purple">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-lokals-charcoal">{label}</p>
        <p className="mt-1 text-sm text-lokals-muted">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-lokals-muted" />
    </Link>
  )
}
