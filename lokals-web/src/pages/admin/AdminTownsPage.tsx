import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'

type TownRow = {
  town?: string
  areas?: number
  users?: number
  businesses?: number
  providers?: number
  open_reports?: number
  active_alerts?: number
  active_rides?: number
  active_deliveries?: number
}

type TownsPayload = {
  data?: TownRow[]
}

export function AdminTownsPage() {
  const query = useQuery({
    queryKey: ['admin-towns-page'],
    queryFn: async () => (await api.get('/admin/towns')).data as TownsPayload,
  })

  const towns = query.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Towns management" description="Pilot town readiness, local workload, and service coverage in one operational view." />
      <QueryState isLoading={query.isLoading} error={query.error} empty={towns.length === 0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tracked towns" value={String(towns.length)} hint="Operational footprint" />
          <StatCard label="Open reports" value={String(towns.reduce((sum, town) => sum + Number(town.open_reports ?? 0), 0))} hint="Current civic workload" />
          <StatCard label="Active alerts" value={String(towns.reduce((sum, town) => sum + Number(town.active_alerts ?? 0), 0))} hint="Live communications" />
          <StatCard label="Active deliveries" value={String(towns.reduce((sum, town) => sum + Number(town.active_deliveries ?? 0), 0))} hint="Transport activity" />
        </div>
        <div className="space-y-4">
          {towns.map((town) => (
            <SectionCard key={town.town ?? 'town'} className="bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-lokals-charcoal">{town.town ?? 'Pilot town'}</p>
                  <p className="mt-1 text-sm text-lokals-muted">
                    {town.areas ?? 0} areas, {town.users ?? 0} users, {town.businesses ?? 0} businesses, {town.providers ?? 0} providers
                  </p>
                </div>
                <StatusBadge value={`${town.open_reports ?? 0} open reports`} tone={Number(town.open_reports ?? 0) > 0 ? 'warning' : 'success'} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-[16px] bg-[var(--bg)] px-4 py-3 text-sm text-lokals-muted">Alerts: <span className="font-semibold text-lokals-charcoal">{town.active_alerts ?? 0}</span></div>
                <div className="rounded-[16px] bg-[var(--bg)] px-4 py-3 text-sm text-lokals-muted">Rides: <span className="font-semibold text-lokals-charcoal">{town.active_rides ?? 0}</span></div>
                <div className="rounded-[16px] bg-[var(--bg)] px-4 py-3 text-sm text-lokals-muted">Deliveries: <span className="font-semibold text-lokals-charcoal">{town.active_deliveries ?? 0}</span></div>
                <div className="rounded-[16px] bg-[var(--bg)] px-4 py-3 text-sm text-lokals-muted">Coverage: <span className="font-semibold text-lokals-charcoal">{town.providers ?? 0} providers</span></div>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
