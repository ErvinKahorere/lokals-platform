import type { ReactNode } from 'react'
import { Activity, Bell, ChartColumn, ClipboardList } from 'lucide-react'
import { PageHeader, QueryState, StatCard } from '../Ui'
import { SidebarLayout } from './SidebarLayout'
import type { DashboardMode } from '../../lib/dashboardConfig'
import { useDashboardRealtimeState } from '../../lib/dashboardRealtime'

function DashboardShellContent({
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
  const realtime = useDashboardRealtimeState()

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <QueryState isLoading={isLoading} error={error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(stats).map(([key, value], index) => (
            <StatCard
              key={key}
              label={key.replaceAll('_', ' ')}
              value={String(value)}
              hint={realtime.updatedKeys.includes(key) ? 'Updated now' : 'Role snapshot'}
              className={realtime.updatedKeys.includes(key) ? 'ring-1 ring-lokals-green/30 bg-[linear-gradient(180deg,#ffffff,#f4fff6)]' : undefined}
              icon={
                index === 0 ? <ClipboardList className="h-4 w-4" /> : index === 1 ? <Bell className="h-4 w-4" /> : index === 2 ? <Activity className="h-4 w-4" /> : <ChartColumn className="h-4 w-4" />
              }
            />
          ))}
        </div>
        <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-4 shadow-card md:p-5">
          {children}
        </div>
      </QueryState>
    </div>
  )
}

export function DashboardShell({
  eyebrow,
  title,
  description,
  actions,
  isLoading,
  error,
  stats,
  children,
  mode,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  isLoading?: boolean
  error?: unknown
  stats: Record<string, number | string>
  children: ReactNode
  mode?: DashboardMode
}) {
  if (mode) {
    return (
      <SidebarLayout mode={mode}>
        <DashboardShellContent
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          isLoading={isLoading}
          error={error}
          stats={stats}
        >
          {children}
        </DashboardShellContent>
      </SidebarLayout>
    )
  }

  return (
    <DashboardShellContent
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={actions}
      isLoading={isLoading}
      error={error}
      stats={stats}
    >
      {children}
    </DashboardShellContent>
  )
}
