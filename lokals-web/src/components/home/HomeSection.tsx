import type { ReactNode } from 'react'
import { Button } from '../ui/Button'

export function HomeSection({
  eyebrow,
  title,
  action,
  isLoading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  onRetry,
  children,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  isLoading?: boolean
  error?: unknown
  empty?: boolean
  emptyTitle?: string
  emptyBody?: string
  onRetry?: () => void
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{eyebrow}</p> : null}
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">{title}</h2>
        </div>
        {action}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[24px] border border-lokals-border bg-white shadow-card" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
          <p className="font-semibold text-lokals-charcoal">Could not load this section</p>
          <p className="mt-2 text-sm text-lokals-muted">Please try again in a moment.</p>
          {onRetry ? <Button className="mt-4" variant="secondary" onClick={onRetry}>Retry</Button> : null}
        </div>
      ) : empty ? (
        <div className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
          <p className="font-semibold text-lokals-charcoal">{emptyTitle ?? 'Nothing here yet'}</p>
          <p className="mt-2 text-sm text-lokals-muted">{emptyBody ?? 'This section will fill as local activity grows.'}</p>
        </div>
      ) : (
        children
      )}
    </section>
  )
}
