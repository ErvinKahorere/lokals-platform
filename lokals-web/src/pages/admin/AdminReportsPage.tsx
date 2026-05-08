import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminReports, useUpdateReportStatus } from '../../hooks/queries'
import { PageHeader, QueryState, SectionCard, Select, StatusBadge } from '../../components/Ui'

const reportFilters = ['all', 'open', 'in_progress', 'resolved', 'urgent'] as const

function formatLabel(value?: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ')
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Recently'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Recently'
  return parsed.toLocaleString()
}

export function AdminReportsPage() {
  const [filter, setFilter] = useState<(typeof reportFilters)[number]>('all')
  const reportsQuery = useAdminReports()
  const updateStatus = useUpdateReportStatus()
  const reports = (reportsQuery.data?.data ?? []).filter((report: any) => {
    if (filter === 'urgent') {
      return report.priority === 'high' && !['resolved', 'rejected'].includes(report.status)
    }

    if (filter === 'all') {
      return true
    }

    return report.status === filter
  })

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Okahandja"
        title="View Reports"
        description="Filter by status, open the details, and keep the resident response loop moving."
        actions={(
          <div className="flex flex-wrap gap-2">
            {reportFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === item ? (item === 'urgent' ? 'bg-red-600 text-white' : 'bg-lokals-purple text-white') : 'border border-lokals-border bg-white text-lokals-charcoal'}`}
              >
                {item === 'all' ? 'All' : item === 'in_progress' ? 'In Progress' : item === 'resolved' ? 'Resolved' : item === 'urgent' ? 'Urgent' : 'Open'}
              </button>
            ))}
          </div>
        )}
      />
      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} empty={reports.length === 0}>
        <div className="space-y-3">
          {reports.map((report: any) => (
            <SectionCard key={report.id} className="bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/reports/${report.id}`} className="font-semibold text-lokals-charcoal hover:text-lokals-purple">
                    {report.title}
                  </Link>
                  <p className="mt-1 text-sm text-lokals-muted">
                    {formatLabel(report.category)} | {(report.location ?? [report.area, report.town].filter(Boolean).join(', ')) || 'Okahandja'}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">{formatTimestamp(report.created_at)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge value={formatLabel(report.priority ?? 'normal')} tone={report.priority === 'high' ? 'danger' : 'info'} />
                  <StatusBadge value={formatLabel(report.status)} tone={report.status === 'resolved' ? 'success' : report.status === 'rejected' ? 'danger' : 'warn'} />
                  <Select
                    defaultValue={report.status}
                    onChange={(event) => updateStatus.mutate({ reportId: report.id, status: event.target.value })}
                    className="w-44"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
