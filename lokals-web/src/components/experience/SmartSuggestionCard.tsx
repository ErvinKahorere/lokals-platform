import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SmartSuggestionCard({
  title,
  body,
  to,
  icon: Icon,
  badge,
}: {
  title: string
  body: string
  to: string
  icon: LucideIcon
  badge?: string
}) {
  return (
    <Link to={to} className="block rounded-[24px] border border-lokals-border bg-white p-5 shadow-card transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">
          <Icon className="h-5 w-5" />
        </div>
        {badge ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{badge}</span> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-lokals-charcoal">{title}</h3>
      <p className="mt-2 text-sm text-lokals-muted">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lokals-green">
        Open now
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}

