import type { ReactNode } from 'react'
import { Card } from './Card'

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lokals-muted">{label}</p>
        {icon ? <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">{icon}</div> : null}
      </div>
      <p className="mt-3 text-3xl font-bold text-lokals-charcoal">{value}</p>
      {hint ? <p className="mt-2 text-sm text-lokals-muted">{hint}</p> : null}
    </Card>
  )
}
