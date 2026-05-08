import type { ReactNode } from 'react'
import { PageHeader, QueryState, StatCard } from '../Ui'

export function DashboardShell({
  eyebrow,
  title,
  description,
  actions,
  isLoading,
  error,
  stats,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  isLoading?: boolean
  error?: unknown
  stats: Record<string, number | string>
  children: ReactNode
}) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <QueryState isLoading={isLoading} error={error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <StatCard key={key} label={key.replaceAll('_', ' ')} value={String(value)} hint="Role snapshot" />
          ))}
        </div>
        {children}
      </QueryState>
    </div>
  )
}
