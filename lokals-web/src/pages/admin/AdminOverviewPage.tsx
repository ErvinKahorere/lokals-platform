import { Link } from 'react-router-dom'
import { useAdminOverview } from '../../hooks/queries'
import { PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import type { DashboardActivityItem } from '../../types'

type AdminOverviewPayload = {
  stats?: Record<string, number | string>
  pending_approvals?: Record<string, number | string>
  active_workloads?: Record<string, number | string>
  health_summary?: Array<{ label: string; status: string; value?: string | number | null; detail?: string | null }>
  recent_admin_activity?: DashboardActivityItem[]
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function toneForStatus(value?: string) {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized.includes('healthy')) return 'success' as const
  if (normalized.includes('warning') || normalized.includes('monitor')) return 'warning' as const
  if (normalized.includes('degraded') || normalized.includes('locked')) return 'danger' as const
  return 'info' as const
}

export function AdminOverviewPage() {
  const overviewQuery = useAdminOverview()
  const overview = overviewQuery.data as AdminOverviewPayload | undefined
  const topStats = Object.entries(overview?.stats ?? {}).slice(0, 8)
  const approvals = Object.entries(overview?.pending_approvals ?? {})
  const workloads = Object.entries(overview?.active_workloads ?? {})

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Platform operations overview"
        description="A compact view of approval pressure, live workloads, and current health signals."
        actions={<Link to="/dashboard/admin/system-health" className="rounded-full border border-lokals-border bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal">System health</Link>}
      />

      <QueryState isLoading={overviewQuery.isLoading} error={overviewQuery.error} empty={!overview}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topStats.map(([key, value]) => (
            <StatCard key={key} label={formatLabel(key)} value={String(value)} hint="Live platform metric" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Pending approvals</h3>
            <div className="mt-4 space-y-3">
              {approvals.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{formatLabel(key)}</span>
                  <span className="font-semibold text-lokals-charcoal">{value}</span>
                </div>
              ))}
              {approvals.length === 0 ? <p className="text-sm text-lokals-muted">No approval queue data is available.</p> : null}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Active workloads</h3>
            <div className="mt-4 space-y-3">
              {workloads.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{formatLabel(key)}</span>
                  <span className="font-semibold text-lokals-charcoal">{value}</span>
                </div>
              ))}
              {workloads.length === 0 ? <p className="text-sm text-lokals-muted">No workload data is available.</p> : null}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Health summary</h3>
            <div className="mt-4 space-y-3">
              {(overview?.health_summary ?? []).map((item) => (
                <div key={item.label} className="rounded-2xl bg-[var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.label}</p>
                    <StatusBadge value={item.status} tone={toneForStatus(item.status)} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.detail ?? 'Operational health signal'}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Current value: {item.value ?? 'n/a'}</p>
                </div>
              ))}
              {(overview?.health_summary ?? []).length === 0 ? <p className="text-sm text-lokals-muted">System health details will appear here once loaded.</p> : null}
            </div>
          </SectionCard>
        </div>

        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Recent admin activity</h3>
            <Link to="/dashboard/admin/audit-logs" className="text-sm font-semibold text-lokals-green">View audit logs</Link>
          </div>
          <div className="mt-4">
            <RecentActivityList items={overview?.recent_admin_activity ?? []} />
          </div>
        </SectionCard>
      </QueryState>
    </div>
  )
}
