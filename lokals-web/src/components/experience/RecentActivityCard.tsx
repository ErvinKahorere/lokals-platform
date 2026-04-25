import type { LucideIcon } from 'lucide-react'

export function RecentActivityCard({
  icon: Icon,
  title,
  body,
  time,
  statusLabel,
}: {
  icon: LucideIcon
  title: string
  body: string
  time: string
  statusLabel: string
}) {
  return (
    <article className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lokals-charcoal">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-lokals-charcoal">{title}</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{statusLabel}</span>
          </div>
          <p className="mt-2 text-sm text-lokals-muted">{body}</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-lokals-muted">{time}</p>
        </div>
      </div>
    </article>
  )
}

