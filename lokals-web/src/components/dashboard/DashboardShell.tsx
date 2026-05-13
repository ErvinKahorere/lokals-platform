import type { ReactNode } from 'react'
import { Activity, Bell, ChartColumn, ClipboardList } from 'lucide-react'
import { PageHeader, QueryState, StatCard } from '../Ui'
import { SidebarLayout } from './SidebarLayout'
import type { DashboardMode } from '../../lib/dashboardConfig'

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
  const content = (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      <QueryState isLoading={isLoading} error={error}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(stats).map(([key, value], index) => (
            <StatCard
              key={key}
              label={key.replaceAll('_', ' ')}
              value={String(value)}
              hint="Role snapshot"
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

  if (mode) {
    return <SidebarLayout mode={mode}>{content}</SidebarLayout>
  }

  return content
}
