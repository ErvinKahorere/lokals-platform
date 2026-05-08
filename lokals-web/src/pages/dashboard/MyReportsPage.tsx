import { Link } from 'react-router-dom'
import { useMyReports } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

export function MyReportsPage() {
  const reportsQuery = useMyReports()
  const reports = reportsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="My reports" description="Track city service issues after submission." />
      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} empty={reports.length === 0}>
        {reports.length === 0 ? (
          <EmptyState title="No reports yet" body="Reported issues will show here together with status updates." />
        ) : (
          <div className="space-y-4">
            {reports.map((report: any) => (
              <Link key={report.id} to={`/dashboard/reports/${report.id}`}>
              <SectionCard className="bg-white transition hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{report.title}</h3>
                  <StatusBadge value={report.status} tone={report.status === 'resolved' ? 'success' : report.status === 'rejected' ? 'danger' : 'warn'} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{report.description}</p>
                <p className="mt-3 text-xs text-lokals-muted">{report.location ?? [report.area, report.town].filter(Boolean).join(', ')}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{report.category}</p>
              </SectionCard>
              </Link>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
