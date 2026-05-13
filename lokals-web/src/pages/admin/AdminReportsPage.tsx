import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, Select, StatusBadge } from '../../components/Ui'
import { useAdminReports, useUpdateReportStatus } from '../../hooks/queries'
import type { Report } from '../../types'

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'received', label: 'Received' },
  { value: 'in_review', label: 'In Review' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
] as const

const categoryOptions = [
  { value: 'all', label: 'All categories' },
  { value: 'water', label: 'Water' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'roads', label: 'Roads' },
  { value: 'waste', label: 'Waste' },
  { value: 'safety', label: 'Safety' },
  { value: 'other', label: 'Other' },
] as const

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

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

function badgeTone(status: string) {
  if (status === 'resolved' || status === 'closed') return 'success' as const
  if (status === 'rejected') return 'danger' as const
  if (status === 'assigned' || status === 'in_progress') return 'accent' as const
  return 'warning' as const
}

export function AdminReportsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [priority, setPriority] = useState('all')
  const [department, setDepartment] = useState('')

  const params = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== 'all' ? { status } : {}),
      ...(category !== 'all' ? { category } : {}),
      ...(priority !== 'all' ? { priority } : {}),
      ...(department.trim() ? { department: department.trim() } : {}),
    }),
    [category, department, priority, search, status],
  )

  const reportsQuery = useAdminReports(params)
  const updateStatus = useUpdateReportStatus()
  const reports = reportsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Town issue desk"
        title="Issue management"
        description="Review incoming reports, search by operational signals, and keep the resident response loop moving."
      />

      <SectionCard className="bg-white">
        <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr]">
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Search reports</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, category, or town"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Status</span>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Category</span>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Priority</span>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Department</span>
            <Input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="Water operations"
            />
          </label>
        </div>
      </SectionCard>

      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} empty={false}>
        {reports.length === 0 ? (
          <EmptyState title="No reports found" body="Try another filter combination or check back once new resident reports come in." />
        ) : (
          <div className="space-y-3">
            {reports.map((report: Report) => {
              const latestResidentUpdate = report.updates?.find((update) => update.visibility === 'resident')
              return (
                <SectionCard key={report.id} className="bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to={`/dashboard/town-manager/reports/${report.id}`} className="font-semibold text-lokals-charcoal hover:text-lokals-purple">
                          {report.title}
                        </Link>
                        {report.reference_code ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-lokals-muted">
                            {report.reference_code}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-lokals-muted">
                        {formatLabel(report.category)} | {(report.location ?? [report.area, report.town].filter(Boolean).join(', ')) || 'Okahandja'}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">{formatTimestamp(report.created_at)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <StatusBadge value={formatLabel(report.priority ?? 'normal')} tone={report.priority === 'high' ? 'danger' : 'info'} />
                      <StatusBadge value={formatLabel(report.status)} tone={badgeTone(report.status)} />
                      <Select
                        value={report.status}
                        onChange={(event) => updateStatus.mutate({ reportId: report.id, status: event.target.value })}
                        className="w-44"
                      >
                        {statusOptions.filter((option) => option.value !== 'all').map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-4">
                    <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Resident</p>
                      <p className="mt-1 text-sm font-medium text-lokals-charcoal">{report.user?.name ?? 'Resident'}</p>
                    </div>
                    <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Department</p>
                      <p className="mt-1 text-sm font-medium text-lokals-charcoal">{report.department_name ?? 'Unassigned'}</p>
                    </div>
                    <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Assigned officer</p>
                      <p className="mt-1 text-sm font-medium text-lokals-charcoal">{report.assigned_officer?.name ?? 'Pending assignment'}</p>
                    </div>
                    <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Attachments</p>
                      <p className="mt-1 text-sm font-medium text-lokals-charcoal">{report.attachments?.length ?? 0} file(s)</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-lokals-muted">
                      {latestResidentUpdate?.message ? latestResidentUpdate.message : 'Open details to add a resident-facing update.'}
                    </span>
                    <Link to={`/dashboard/town-manager/reports/${report.id}`}>
                      <Button variant="secondary">Open report</Button>
                    </Link>
                  </div>
                </SectionCard>
              )
            })}
          </div>
        )}
      </QueryState>
    </div>
  )
}
