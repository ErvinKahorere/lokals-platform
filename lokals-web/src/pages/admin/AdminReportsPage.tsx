import { useState } from 'react'
import { useAdminReports, useUpdateReportStatus } from '../../hooks/queries'
import { PageHeader, QueryState, SectionCard, Select, StatusBadge } from '../../components/Ui'

export function AdminReportsPage() {
  const [status, setStatus] = useState('')
  const reportsQuery = useAdminReports(status ? { status } : undefined)
  const updateStatus = useUpdateReportStatus()
  const reports = reportsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Manage reports"
        description="Review city issues, move them through triage, and close the loop with citizens."
        actions={
          <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full md:w-52">
            <option value="">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </Select>
        }
      />
      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} empty={reports.length === 0}>
        <div className="space-y-3">
          {reports.map((report: any) => (
            <SectionCard key={report.id} className="bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{report.category} {report.location ? `• ${report.location}` : ''}</p>
                  <p className="mt-2 text-sm">{report.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={report.status} tone={report.status === 'resolved' ? 'success' : report.status === 'rejected' ? 'danger' : 'warn'} />
                  <Select
                    defaultValue={report.status}
                    onChange={(event) => updateStatus.mutate({ reportId: report.id, status: event.target.value })}
                    className="w-40"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="in_review">In review</option>
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
