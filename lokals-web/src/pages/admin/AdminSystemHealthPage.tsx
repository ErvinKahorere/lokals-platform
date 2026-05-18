import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'

type HealthItem = {
  label: string
  status: string
  detail?: string | null
}

type SystemHealthPayload = {
  summary?: Record<string, number | string>
  system_health?: HealthItem[]
  queue?: Record<string, unknown>
  realtime?: Record<string, unknown>
  notifications?: Record<string, number | string>
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function toneForStatus(value?: string) {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized.includes('healthy')) return 'success' as const
  if (normalized.includes('warning') || normalized.includes('monitor')) return 'warning' as const
  if (normalized.includes('degraded')) return 'danger' as const
  return 'info' as const
}

export function AdminSystemHealthPage() {
  const query = useQuery({
    queryKey: ['admin-system-health-page'],
    queryFn: async () => (await api.get('/admin/system-health')).data as SystemHealthPayload,
  })

  const summary = Object.entries(query.data?.summary ?? {})
  const queue = Object.entries(query.data?.queue ?? {})
  const realtime = Object.entries(query.data?.realtime ?? {})

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="System health"
        description="Queue pressure, realtime readiness, and operational communication health in one admin view."
        actions={<Link to="/dashboard/admin/audit-logs" className="rounded-full border border-lokals-border bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal">Audit logs</Link>}
      />
      <QueryState isLoading={query.isLoading} error={query.error} empty={!query.data}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summary.map(([key, value]) => (
            <StatCard key={key} label={formatLabel(key)} value={String(value)} hint="Live health summary" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Health checks</h3>
            <div className="mt-4 space-y-3">
              {(query.data?.system_health ?? []).map((item) => (
                <div key={item.label} className="rounded-[18px] bg-[var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                    <StatusBadge value={item.status} tone={toneForStatus(item.status)} />
                  </div>
                  <p className="mt-2 text-sm text-lokals-muted">{item.detail ?? 'Operational health signal'}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Notification volume</h3>
            <div className="mt-4 space-y-3">
              {Object.entries(query.data?.notifications ?? {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{formatLabel(key)}</span>
                  <span className="font-semibold text-lokals-charcoal">{String(value)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Queue details</h3>
            <div className="mt-4 space-y-3">
              {queue.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{formatLabel(key)}</span>
                  <span className="font-semibold text-lokals-charcoal">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Realtime details</h3>
            <div className="mt-4 space-y-3">
              {realtime.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{formatLabel(key)}</span>
                  <span className="font-semibold text-lokals-charcoal">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </QueryState>
    </div>
  )
}
