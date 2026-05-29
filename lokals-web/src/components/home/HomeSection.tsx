import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'

export function HomeSection({
  eyebrow,
  title,
  action,
  isLoading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  emptyAction,
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
  emptyAction?: ReactNode
  onRetry?: () => void
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{eyebrow}</p> : null}
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal md:text-2xl">{title}</h2>
        </div>
        {action}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} variant="dashboard" className="space-y-4 p-5">
              <LoadingSkeleton className="h-3 w-24 rounded-full" />
              <LoadingSkeleton className="h-7 w-2/3 rounded-2xl" />
              <LoadingSkeleton className="h-4 w-full rounded-2xl" />
              <LoadingSkeleton className="h-4 w-4/5 rounded-2xl" />
              <div className="flex items-center gap-3 pt-2">
                <LoadingSkeleton className="h-11 w-11 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <LoadingSkeleton className="h-4 w-1/2 rounded-2xl" />
                  <LoadingSkeleton className="h-3 w-2/3 rounded-2xl" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card variant="dashboard" className="p-5 md:p-6">
          <p className="font-semibold text-lokals-charcoal">Could not load this section</p>
          <p className="mt-2 text-sm text-lokals-muted">Please try again in a moment.</p>
          {onRetry ? <Button className="mt-4" variant="secondary" onClick={onRetry}>Retry</Button> : null}
        </Card>
      ) : empty ? (
        <Card variant="dashboard" className="p-5 md:p-6">
          <p className="font-semibold text-lokals-charcoal">{emptyTitle ?? 'Nothing here yet'}</p>
          <p className="mt-2 text-sm text-lokals-muted">{emptyBody ?? 'This section will fill as local activity grows.'}</p>
          {emptyAction ? <div className="mt-4">{emptyAction}</div> : null}
        </Card>
      ) : (
        children
      )}
    </section>
  )
}
