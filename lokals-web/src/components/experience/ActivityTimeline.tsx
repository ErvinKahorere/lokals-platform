import { ArrowRight, Bell, BriefcaseBusiness, ShieldAlert, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'

const iconMap = {
  booking: Bell,
  job: BriefcaseBusiness,
  report: ShieldAlert,
  listing: ShoppingBag,
}

export interface ActivityTimelineItem {
  id: string
  kind: keyof typeof iconMap
  title: string
  message: string
  timestamp: string
  status: string
  href?: string
}

export function ActivityTimeline({ items }: { items: ActivityTimelineItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = iconMap[item.kind]

        return (
          <article key={item.id} className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lokals-charcoal">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-lokals-charcoal">{item.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                </div>
                <p className="mt-2 text-sm text-lokals-muted">{item.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-lokals-muted">{item.timestamp}</p>
                  {item.href ? <Link to={item.href} className="inline-flex items-center gap-1 text-sm font-semibold text-lokals-green">Open <ArrowRight className="h-4 w-4" /></Link> : null}
                </div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

