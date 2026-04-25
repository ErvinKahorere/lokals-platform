import { useAdminOverview } from '../../hooks/queries'
import { PageHeader, QueryState, SectionCard } from '../../components/Ui'

export function AdminUsersPage() {
  const overviewQuery = useAdminOverview()
  const metrics = overviewQuery.data

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Users and platform health" description="Quick operational snapshot for staff running the beta." />
      <QueryState isLoading={overviewQuery.isLoading} error={overviewQuery.error} empty={!metrics}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(metrics ?? {}).map(([key, value]) => (
            <SectionCard key={key} className="bg-white">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">{key.replaceAll('_', ' ')}</p>
              <p className="mt-3 text-3xl font-semibold">{String(value)}</p>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
