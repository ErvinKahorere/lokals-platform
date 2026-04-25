import { Activity, AlertTriangle, BadgeCheck } from 'lucide-react'
import { useAdminOverview, useModerationFlags } from '../../hooks/queries'
import { PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'

export function AdminOverviewPage() {
  const overviewQuery = useAdminOverview()
  const flagsQuery = useModerationFlags()
  const metrics = overviewQuery.data
  const flags = flagsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Beta operations overview" description="Counts, moderation pressure, and booking volume in one glance." />
      <QueryState isLoading={overviewQuery.isLoading} error={overviewQuery.error} empty={!metrics}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(metrics ?? {}).map(([key, value]) => (
            <StatCard key={key} label={key.replaceAll('_', ' ')} value={String(value)} hint="Live platform count" />
          ))}
        </div>
      </QueryState>
      <SectionCard className="bg-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Moderation queue</h3>
          <StatusBadge value={`${flags.length} open flags`} tone={flags.length > 0 ? 'warn' : 'success'} />
        </div>
        <div className="mt-4 space-y-3">
          {flags.slice(0, 5).map((flag: any) => (
            <div key={flag.id} className="rounded-2xl bg-[var(--bg)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{flag.reason}</p>
                <StatusBadge value={flag.status} tone={flag.status === 'open' ? 'warn' : 'success'} />
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{flag.notes ?? 'Pending moderator review.'}</p>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-lokals-charcoal">Moderation queue</p>
              <p className="text-xs text-lokals-muted">Review flagged listings and providers fast</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><BadgeCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-lokals-charcoal">Trusted operations</p>
              <p className="text-xs text-lokals-muted">Clear status, counts, and safe defaults</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><Activity className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-semibold text-lokals-charcoal">Live activity</p>
              <p className="text-xs text-lokals-muted">Bookings, reports, and alerts in one place</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
