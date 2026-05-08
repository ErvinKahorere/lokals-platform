import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function QuickActionTile({
  to,
  title,
  body,
  icon: Icon,
}: {
  to: string
  title: string
  body: string
  icon: LucideIcon
}) {
  return (
    <Link to={to} className="flex items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-lokals-charcoal">{title}</p>
        <p className="mt-1 text-sm text-lokals-muted">{body}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-lokals-muted" />
    </Link>
  )
}
