import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../../components/Ui'
import { useReport, useUpdateReportStatus } from '../../hooks/queries'
import { useAuthStore } from '../../store/auth'

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

export function ReportDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const reportQuery = useReport(id)
  const updateStatus = useUpdateReportStatus()
  const report = reportQuery.data
  const canManage = Boolean(user?.roles?.some((role) => ['town_manager', 'municipality_admin', 'operator', 'super_admin'].includes(role)))
  const manageBackRoute =
    user?.current_role === 'town_manager' || user?.current_role === 'municipality_admin'
      ? '/dashboard/town-manager/reports'
      : '/admin/reports'
  const [note, setNote] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const timeline = report ? [
    { label: 'Submitted', value: report.created_at },
    ...(report.status && report.status !== 'open' ? [{ label: formatLabel(report.status), value: report.updated_at ?? report.created_at }] : []),
  ] : []

  const submitStatus = async (status: 'in_progress' | 'resolved' | 'rejected') => {
    if (!report) return
    setSuccessMessage('')
    await updateStatus.mutateAsync({
      reportId: report.id,
      status,
      resolution_notes: note.trim() || undefined,
    })
    await reportQuery.refetch()
    setSuccessMessage(`Report marked ${formatLabel(status)} successfully.`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={canManage ? 'Okahandja report desk' : 'Reports'}
        title={report?.title ?? 'Report details'}
        description="Track issue progress and keep the reporting loop clear for residents."
        actions={canManage ? <Button variant="secondary" onClick={() => navigate(manageBackRoute)}>Back to reports</Button> : undefined}
      />
      <QueryState isLoading={reportQuery.isLoading} error={reportQuery.error} empty={!report}>
        {report ? (
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard className="bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">{formatLabel(report.category)}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-lokals-charcoal">{report.title}</h2>
                  <p className="mt-2 text-sm text-lokals-muted">{report.location ?? ([report.area, report.town].filter(Boolean).join(', ') || 'Okahandja')}</p>
                </div>
                <StatusBadge value={formatLabel(report.status)} tone={report.status === 'resolved' ? 'success' : report.status === 'rejected' ? 'danger' : 'warn'} />
              </div>
              <p className="mt-5 text-sm leading-6 text-lokals-charcoal">{report.description}</p>
              {report.photo_url ? <img src={report.photo_url} alt={report.title} className="mt-5 h-64 w-full rounded-[24px] object-cover" /> : null}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Resident</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{report.user?.name ?? 'Resident'}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{report.user?.phone ?? 'Contact hidden'}</p>
                </div>
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Created</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{formatTimestamp(report.created_at)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">Priority: {formatLabel(report.priority ?? 'normal')}</p>
                </div>
              </div>
              {report.resolution_notes ? (
                <div className="mt-5 rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Latest update</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-lokals-charcoal">{report.resolution_notes}</p>
                </div>
              ) : null}
              {timeline.length ? (
                <div className="mt-5 rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Status timeline</p>
                  <div className="mt-3 space-y-3">
                    {timeline.map((item) => (
                      <div key={`${item.label}-${item.value ?? 'now'}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                        <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                        <p className="text-sm text-lokals-muted">{formatTimestamp(item.value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <SectionCard className="bg-white">
              <p className="text-sm font-semibold text-lokals-charcoal">{canManage ? 'Manage report' : 'Report status'}</p>
              <p className="mt-2 text-sm text-lokals-muted">
                {canManage ? 'Use one clear action at a time so the resident immediately gets the right update.' : 'You will see updates here when the city team responds.'}
              </p>
              {canManage ? (
                <div className="mt-4 space-y-4">
                  {successMessage ? <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div> : null}
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button type="button" disabled={updateStatus.isPending} onClick={() => submitStatus('in_progress')}>
                      {updateStatus.isPending ? 'Saving...' : 'Mark In Progress'}
                    </Button>
                    <Button type="button" variant="secondary" disabled={updateStatus.isPending} onClick={() => submitStatus('resolved')}>
                      Mark Resolved
                    </Button>
                    <Button type="button" variant="danger" disabled={updateStatus.isPending} onClick={() => submitStatus('rejected')}>
                      Reject
                    </Button>
                  </div>
                  <TextArea rows={5} placeholder="Optional note for the resident" value={note} onChange={(event) => setNote(event.target.value)} />
                </div>
              ) : (
                <div className="mt-4 rounded-[20px] border border-lokals-border bg-lokals-surface px-4 py-4 text-sm text-lokals-muted">
                  Current status: <span className="font-semibold text-lokals-charcoal">{formatLabel(report.status)}</span>
                </div>
              )}
            </SectionCard>
          </div>
        ) : null}
      </QueryState>
    </div>
  )
}
