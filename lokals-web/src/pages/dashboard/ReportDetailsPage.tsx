import { useMemo, useState } from 'react'
import { AudioLines, FileText, ImageIcon, MapPinned, Video } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, Select, StatusBadge, TextArea } from '../../components/Ui'
import { useAddReportUpdate, useReport, useUpdateReportStatus } from '../../hooks/queries'
import { useAuthStore } from '../../store/auth'
import type { ReportAttachment, ReportUpdate } from '../../types'

const managerStatuses = [
  'submitted',
  'received',
  'in_review',
  'assigned',
  'in_progress',
  'resolved',
  'rejected',
  'closed',
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

function attachmentIcon(attachment: ReportAttachment) {
  if (attachment.file_type === 'video') return <Video className="h-4 w-4" />
  if (attachment.file_type === 'audio') return <AudioLines className="h-4 w-4" />
  if (attachment.file_type === 'document') return <FileText className="h-4 w-4" />
  return <ImageIcon className="h-4 w-4" />
}

function isResidentVisible(update: ReportUpdate) {
  return update.visibility === 'resident'
}

export function ReportDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const reportQuery = useReport(id)
  const updateStatus = useUpdateReportStatus()
  const addReportUpdate = useAddReportUpdate()
  const report = reportQuery.data
  const canManage = Boolean(user?.roles?.some((role) => ['town_manager', 'municipality_admin', 'operator', 'super_admin'].includes(role)))
  const manageBackRoute =
    user?.current_role === 'town_manager' || user?.current_role === 'municipality_admin'
      ? '/dashboard/town-manager/reports'
      : '/admin/reports'

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [departmentName, setDepartmentName] = useState<string | null>(null)
  const [residentNote, setResidentNote] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [updateVisibility, setUpdateVisibility] = useState<'resident' | 'internal'>('resident')
  const [successMessage, setSuccessMessage] = useState('')

  const residentUpdates = useMemo(
    () => (report?.updates ?? [])
      .filter(isResidentVisible)
      .slice()
      .sort((left, right) => {
        const leftValue = left.created_at ? new Date(left.created_at).getTime() : 0
        const rightValue = right.created_at ? new Date(right.created_at).getTime() : 0
        return rightValue - leftValue
      }),
    [report?.updates],
  )
  const timeline = useMemo(
    () => (report?.updates ?? []).slice().sort((left, right) => {
      const leftValue = left.created_at ? new Date(left.created_at).getTime() : 0
      const rightValue = right.created_at ? new Date(right.created_at).getTime() : 0
      return rightValue - leftValue
    }),
    [report?.updates],
  )
  const latestResidentUpdate = residentUpdates[0]
  const activeStatus = selectedStatus ?? report?.status ?? 'received'
  const activeDepartmentName = departmentName ?? report?.department_name ?? ''

  const submitStatus = async () => {
    if (!report) return
    setSuccessMessage('')
    await updateStatus.mutateAsync({
      reportId: report.id,
      status: activeStatus,
      resident_note: residentNote.trim() || undefined,
      internal_note: internalNote.trim() || undefined,
      department_name: activeDepartmentName.trim() || undefined,
    })
    await reportQuery.refetch()
    setSuccessMessage(`Report moved to ${formatLabel(activeStatus)}.`)
    setResidentNote('')
    setInternalNote('')
  }

  const submitNote = async () => {
    if (!report || !updateMessage.trim()) return
    setSuccessMessage('')
    await addReportUpdate.mutateAsync({
      reportId: report.id,
      note: updateMessage.trim(),
      visibility: updateVisibility,
      department_name: activeDepartmentName.trim() || undefined,
    })
    await reportQuery.refetch()
    setSuccessMessage(updateVisibility === 'resident' ? 'Resident update sent successfully.' : 'Internal note added successfully.')
    setUpdateMessage('')
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={canManage ? 'Town issue desk' : 'Resident reports'}
        title={report?.title ?? 'Report details'}
        description="Track the full issue lifecycle, attachments, and the latest response from the town team."
        actions={canManage ? <Button variant="secondary" onClick={() => navigate(manageBackRoute)}>Back to reports</Button> : undefined}
      />

      <QueryState isLoading={reportQuery.isLoading} error={reportQuery.error} empty={false}>
        {!report ? (
          <EmptyState title="Report not found" body="We could not find this report right now." action={<Button onClick={() => navigate(-1)}>Go back</Button>} />
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <SectionCard className="bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">{formatLabel(report.category)}</p>
                    {report.reference_code ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-lokals-muted">
                        {report.reference_code}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-2xl font-semibold text-lokals-charcoal">{report.title}</h2>
                  <p className="text-sm text-lokals-muted">{report.description}</p>
                </div>
                <StatusBadge value={formatLabel(report.status)} tone={badgeTone(report.status)} />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Location</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{report.location ?? [report.area, report.town].filter(Boolean).join(', ')}</p>
                  {(report.lat != null && report.lng != null) ? (
                    <p className="mt-1 text-xs text-lokals-muted">{report.lat}, {report.lng}</p>
                  ) : null}
                </div>
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Created</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{formatTimestamp(report.created_at)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">Priority: {formatLabel(report.priority ?? 'normal')}</p>
                </div>
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Department</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{report.department_name ?? 'Awaiting assignment'}</p>
                </div>
                <div className="rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Assigned officer</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{report.assigned_officer?.name ?? 'Not assigned yet'}</p>
                  {report.assigned_officer?.phone ? <p className="mt-1 text-sm text-lokals-muted">{report.assigned_officer.phone}</p> : null}
                </div>
              </div>

              {latestResidentUpdate ? (
                <div className="mt-5 rounded-[20px] bg-lokals-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Latest town response</p>
                  <p className="mt-2 whitespace-pre-line text-sm text-lokals-charcoal">{latestResidentUpdate.message}</p>
                  <p className="mt-2 text-xs text-lokals-muted">{formatTimestamp(latestResidentUpdate.created_at)}</p>
                </div>
              ) : null}

              {(report.attachments?.length ?? 0) > 0 ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold text-lokals-charcoal">Attachments</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {report.attachments?.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.file_url ?? '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[20px] border border-lokals-border bg-white p-3 transition hover:border-lokals-green/30"
                      >
                        {attachment.file_type === 'image' && attachment.file_url ? (
                          <img src={attachment.file_url} alt={attachment.original_name ?? 'Report attachment'} className="h-40 w-full rounded-[16px] object-cover" />
                        ) : attachment.file_type === 'video' && attachment.file_url ? (
                          <video src={attachment.file_url} controls className="h-40 w-full rounded-[16px] object-cover" />
                        ) : attachment.file_type === 'audio' && attachment.file_url ? (
                          <div className="rounded-[16px] bg-lokals-surface p-4">
                            <audio controls className="w-full">
                              <source src={attachment.file_url} type={attachment.mime_type ?? 'audio/mpeg'} />
                            </audio>
                          </div>
                        ) : null}
                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-lokals-charcoal">
                          {attachmentIcon(attachment)}
                          <span className="truncate">{attachment.original_name ?? 'Attachment'}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 rounded-[20px] bg-lokals-surface p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-lokals-charcoal">
                  <MapPinned className="h-4 w-4 text-lokals-green" />
                  Map preview
                </div>
                <p className="mt-2 text-sm text-lokals-muted">
                  {report.location ?? [report.area, report.town].filter(Boolean).join(', ')}
                </p>
                {(report.lat != null && report.lng != null) ? (
                  <a
                    href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-lokals-green"
                  >
                    Open map directions
                  </a>
                ) : null}
              </div>
            </SectionCard>

            <div className="space-y-4">
              <SectionCard className="bg-white">
                <p className="text-sm font-semibold text-lokals-charcoal">{canManage ? 'Manage report' : 'Status timeline'}</p>
                <p className="mt-2 text-sm text-lokals-muted">
                  {canManage ? 'Keep resident-facing updates clear and use internal notes for department coordination.' : 'You will see every status change and response in the order it happened.'}
                </p>

                {successMessage ? (
                  <div className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    {successMessage}
                  </div>
                ) : null}

                {canManage ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                        <span>Update status</span>
                        <Select value={activeStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                          {managerStatuses.map((status) => (
                            <option key={status} value={status}>{formatLabel(status)}</option>
                          ))}
                        </Select>
                      </label>
                      <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                        <span>Department or team</span>
                        <Input
                          placeholder="Water operations"
                          value={activeDepartmentName}
                          onChange={(event) => setDepartmentName(event.target.value)}
                        />
                      </label>
                    </div>
                    <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                      <span>Resident-visible note</span>
                      <TextArea
                        rows={4}
                        placeholder="Let the resident know what has changed and what happens next."
                        value={residentNote}
                        onChange={(event) => setResidentNote(event.target.value)}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                      <span>Internal note</span>
                      <TextArea
                        rows={3}
                        placeholder="Add coordination notes for town teams."
                        value={internalNote}
                        onChange={(event) => setInternalNote(event.target.value)}
                      />
                    </label>
                    <Button type="button" disabled={updateStatus.isPending} onClick={submitStatus}>
                      {updateStatus.isPending ? 'Saving...' : 'Save report update'}
                    </Button>

                    <div className="rounded-[20px] border border-lokals-border p-4">
                      <p className="text-sm font-semibold text-lokals-charcoal">Post a quick update</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-[0.9fr_1.1fr]">
                        <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                          <span>Visibility</span>
                          <Select value={updateVisibility} onChange={(event) => setUpdateVisibility(event.target.value as 'resident' | 'internal')}>
                            <option value="resident">Resident-visible</option>
                            <option value="internal">Internal note</option>
                          </Select>
                        </label>
                        <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                          <span>Department</span>
                          <Input
                            placeholder="Leave blank to keep the current department"
                            value={activeDepartmentName}
                            onChange={(event) => setDepartmentName(event.target.value)}
                          />
                        </label>
                      </div>
                      <label className="mt-3 block space-y-2 text-sm font-medium text-lokals-charcoal">
                        <span>Update note</span>
                        <TextArea
                          rows={4}
                          placeholder={updateVisibility === 'resident' ? 'Tell the resident what changed or what to expect next.' : 'Internal coordination note.'}
                          value={updateMessage}
                          onChange={(event) => setUpdateMessage(event.target.value)}
                        />
                      </label>
                      <div className="mt-3">
                        <Button type="button" variant="secondary" disabled={addReportUpdate.isPending || !updateMessage.trim()} onClick={submitNote}>
                          {addReportUpdate.isPending ? 'Posting...' : 'Add update'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  {timeline.length === 0 ? (
                    <EmptyState title="No updates yet" body="You will see each report response and status change here once the town team starts working on it." />
                  ) : (
                    timeline.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-lokals-border bg-lokals-surface px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold text-lokals-charcoal">
                              {item.to_status ? `${formatLabel(item.to_status)} update` : formatLabel(item.type)}
                            </p>
                            <p className="text-sm text-lokals-charcoal">{item.message}</p>
                          </div>
                          <StatusBadge
                            value={item.visibility === 'resident' ? 'Resident' : 'Internal'}
                            tone={item.visibility === 'resident' ? 'accent' : 'neutral'}
                          />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-lokals-muted">
                          <span>{item.user?.name ?? 'System update'}</span>
                          <span>{formatTimestamp(item.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  )
}
