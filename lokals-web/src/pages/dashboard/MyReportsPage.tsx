import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, Select, StatusBadge } from '../../components/Ui'
import { useMyReports } from '../../hooks/queries'
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

function formatLabel(value?: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ')
}

function badgeTone(status: string) {
  if (status === 'resolved' || status === 'closed') return 'success' as const
  if (status === 'rejected') return 'danger' as const
  if (status === 'assigned' || status === 'in_progress') return 'accent' as const
  return 'warning' as const
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Recently'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Recently' : parsed.toLocaleString()
}

export function MyReportsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')

  const params = useMemo(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(status !== 'all' ? { status } : {}),
      ...(category !== 'all' ? { category } : {}),
    }),
    [category, search, status],
  )

  const reportsQuery = useMyReports(params)
  const reports = reportsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Resident dashboard"
        title="My reports"
        description="Track issue updates, reference numbers, and the latest response from the town team."
        actions={<Link to="/report-issue"><Button>New report</Button></Link>}
      />

      <SectionCard className="bg-white">
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
            <span>Search reports</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, reference, or location"
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
        </div>
      </SectionCard>

      <QueryState isLoading={reportsQuery.isLoading} error={reportsQuery.error} empty={false}>
        {reports.length === 0 ? (
          <EmptyState
            title="No reports match these filters"
            body="Try another status or category, or create a new report if something in your area still needs attention."
            action={<Link to="/report-issue"><Button>Report an issue</Button></Link>}
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report: Report) => {
              const latestUpdate = report.updates?.find((update) => update.visibility === 'resident')
              return (
                <Link key={report.id} to={`/dashboard/reports/${report.id}`}>
                  <SectionCard className="bg-white transition hover:-translate-y-0.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lokals-charcoal">{report.title}</h3>
                          {report.reference_code ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-lokals-muted">
                              {report.reference_code}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-lokals-muted">{report.description}</p>
                      </div>
                      <StatusBadge value={formatLabel(report.status)} tone={badgeTone(report.status)} />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Location</p>
                        <p className="mt-1 text-sm font-medium text-lokals-charcoal">{report.location ?? [report.area, report.town].filter(Boolean).join(', ')}</p>
                      </div>
                      <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Category</p>
                        <p className="mt-1 text-sm font-medium text-lokals-charcoal">{formatLabel(report.category)}</p>
                      </div>
                      <div className="rounded-[18px] bg-lokals-surface px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Last update</p>
                        <p className="mt-1 text-sm font-medium text-lokals-charcoal">{formatTimestamp(report.updated_at ?? report.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="flex flex-wrap items-center gap-3 text-lokals-muted">
                        {report.department_name ? <span>Department: {report.department_name}</span> : <span>Department pending</span>}
                        {report.attachments?.length ? <span>{report.attachments.length} attachment(s)</span> : null}
                      </div>
                      <span className="text-lokals-charcoal">
                        {latestUpdate?.message ? latestUpdate.message : 'Open the report to see the full response timeline.'}
                      </span>
                    </div>
                  </SectionCard>
                </Link>
              )
            })}
          </div>
        )}
      </QueryState>
    </div>
  )
}
