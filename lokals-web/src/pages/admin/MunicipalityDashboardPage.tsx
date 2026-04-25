import { AlertTriangle, BarChart3, ClipboardList, MapPinned, ShieldAlert, TimerReset } from 'lucide-react'
import { Button, PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'
import { useMunicipalityDashboard } from '../../hooks/queries'

export function MunicipalityDashboardPage() {
  const dashboardQuery = useMunicipalityDashboard()
  const dashboard = dashboardQuery.data
  const reportStatusRows = Array.isArray(dashboard?.reports_by_status)
    ? dashboard?.reports_by_status
    : Object.entries(dashboard?.reports_by_status ?? {}).map(([status, count]) => ({ status, count: Number(count) }))

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Town Manager"
        title="Municipality dashboard"
        description="Track reports, alerts, service coverage, and city activity from one place."
        actions={<Button>Send alert</Button>}
      />

      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} empty={!dashboard}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Object.entries(dashboard?.stats ?? {}).map(([key, value]) => (
            <StatCard key={key} label={key.replaceAll('_', ' ')} value={String(value)} hint="Live city overview" />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-lokals-charcoal">Reports management</h2>
                <p className="mt-1 text-sm text-lokals-muted">Keep response time visible and triage the issues residents feel most.</p>
              </div>
              <StatusBadge value={`${dashboard?.recent_reports?.length ?? 0} recent`} tone="accent" />
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.recent_reports ?? []).slice(0, 5).map((report) => (
                <div key={report.id} className="rounded-[20px] bg-[var(--bg)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{report.title}</p>
                      <p className="text-sm text-lokals-muted">{report.category}{report.location ? ` • ${report.location}` : ''}</p>
                    </div>
                    <StatusBadge value={report.status} tone={report.status === 'resolved' ? 'success' : 'warn'} />
                  </div>
                  <p className="mt-2 text-sm text-lokals-muted">{report.description ?? 'Resident-submitted city issue awaiting the next action.'}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {[
                { title: 'Create city alert', body: 'Send outage, event, or emergency notices quickly.', icon: AlertTriangle },
                { title: 'Verify directory entries', body: 'Keep public services and businesses trustworthy.', icon: ShieldAlert },
                { title: 'Track response time', body: 'Spot slow-moving issues before they escalate.', icon: TimerReset },
              ].map(({ title, body, icon: Icon }) => (
                <div key={title} className="rounded-[20px] bg-[var(--bg)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Reports by status</h3>
                <p className="text-sm text-lokals-muted">Submitted, in review, and resolved volume.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {reportStatusRows.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-lokals-muted">{item.status.replaceAll('_', ' ')}</span>
                  <span className="font-semibold text-lokals-charcoal">{item.count}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-amber-700">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Most active areas</h3>
                <p className="text-sm text-lokals-muted">Where reports and alerts are clustering fastest.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.most_active_areas ?? []).map((item) => (
                <div key={item.area} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{item.area}</span>
                  <span className="font-semibold text-lokals-charcoal">{item.total ?? ((item.users ?? 0) + (item.reports ?? 0))}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Trending issues</h3>
                <p className="text-sm text-lokals-muted">The biggest service and city pressure points.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.trending_issues ?? []).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-lokals-muted">{item.category}</span>
                  <span className="font-semibold text-lokals-charcoal">{item.total}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </QueryState>
    </div>
  )
}
