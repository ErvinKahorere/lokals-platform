import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CalendarPlus2, ClipboardList, Megaphone, Newspaper, ShieldCheck, Siren, Truck } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, Input, Select, StatusBadge, TextArea } from '../../components/Ui'
import { useCreateMunicipalAlert } from '../../hooks/queries'
import { useTownManagerDashboardData } from '../../lib/dashboardDataProvider'
import { OKAHANDJA_AREAS } from '../../lib/pilot'
import type { TownManagerDashboardData } from '../../lib/dashboardTypes'
import type { AlertItem, EventItem, MunicipalityDashboard, Report, RoleDashboardPayload } from '../../types'

const areaOptions = ['', ...OKAHANDJA_AREAS]

function formatLabel(value?: string | null) {
  if (!value) return 'Unknown'
  return value.replaceAll('_', ' ')
}

function formatLocation(...parts: Array<string | null | undefined>) {
  const compact = parts.filter(Boolean)
  return compact.length > 0 ? compact.join(', ') : 'Okahandja'
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'Recently'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Recently'
  return parsed.toLocaleString()
}

function priorityTone(priority?: string) {
  if (priority === 'critical' || priority === 'high') return 'danger'
  if (priority === 'medium') return 'warning'
  if (priority === 'resolved') return 'success'
  return 'info'
}

function getAlertTypeLabel(value: string) {
  if (value === 'emergency_alert') return 'Emergency'
  if (value === 'service_update') return 'Service Update'
  return 'Announcement'
}

export function MunicipalityDashboardPage() {
  const dashboardQuery = useTownManagerDashboardData()
  const createAlert = useCreateMunicipalAlert()
  const data = dashboardQuery.data as TownManagerDashboardData | undefined
  const dashboard = data?.dashboard as (RoleDashboardPayload & MunicipalityDashboard) | null | undefined
  const alertFormRef = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('public_notice')
  const [area, setArea] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const reportStatusRows = useMemo(() => {
    if (Array.isArray(dashboard?.reports_by_status)) {
      return dashboard.reports_by_status
    }

    return Object.entries(dashboard?.reports_by_status ?? {}).map(([status, count]) => ({ status, count: Number(count) }))
  }, [dashboard?.reports_by_status])

  const stats = useMemo(() => ({
    open_reports: dashboard?.stats?.open_reports ?? 0,
    in_progress: dashboard?.stats?.in_progress_reports ?? 0,
    resolved: dashboard?.stats?.resolved_reports ?? 0,
    urgent_issues: dashboard?.stats?.urgent_reports ?? 0,
    alerts_sent: dashboard?.stats?.municipal_alerts_sent ?? 0,
  }), [dashboard?.stats])

  const recentReports = (data?.reports ?? dashboard?.recent_reports ?? []) as Report[]
  const activeAlerts = (data?.alerts ?? dashboard?.active_alerts ?? []) as AlertItem[]
  const upcomingEvents = (dashboard?.upcoming_events ?? []) as EventItem[]
  const pendingApprovals = data?.approvals ?? []
  const analyticsSummary = data?.analyticsSummary ?? {}
  const reportCategories = Array.isArray(dashboard?.report_categories) ? dashboard.report_categories as Array<{ category?: string; total?: number }> : []
  const localDirectoryStats = (dashboard?.local_directory_stats ?? {}) as Record<string, number | string>
  const transportActivity = (dashboard?.transport_activity ?? {}) as Record<string, number | string>
  const residentEngagement = (dashboard?.resident_engagement ?? {}) as Record<string, number | string>
  const communicationStats = (dashboard?.communication_stats ?? {}) as Record<string, number | string>
  const townActivityOverview = Array.isArray(dashboard?.town_activity_overview) ? dashboard.town_activity_overview as Array<{ area?: string; reports?: number; residents?: number; providers?: number }> : []

  const focusAlertForm = (nextType: string) => {
    setType(nextType)
    setSuccessMessage('')
    alertFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <DashboardShell
      mode="town_manager"
      eyebrow="Okahandja"
      title="Okahandja Town Manager Portal"
      description="Real communication with residents, issue tracking, and municipal control in one official workspace."
      actions={(
        <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-3 text-right shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Current time</p>
          <p className="mt-1 text-base font-semibold text-lokals-charcoal">{now.toLocaleDateString()}</p>
          <p className="text-sm text-lokals-muted">{now.toLocaleTimeString()}</p>
        </div>
      )}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={{
        ...stats,
        pending_approvals: pendingApprovals.length,
        role_applications: data?.roleApplicationsPending ?? 0,
        feed_pending: data?.feedPending.length ?? 0,
      }}
    >
      <DashboardSection title="Primary actions" description="These are the fastest paths to a strong live demo.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={() => focusAlertForm('public_notice')} className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Send Announcement</p>
              <p className="mt-1 text-sm text-lokals-muted">Share a public notice or service update with residents.</p>
            </div>
          </button>
          <button type="button" onClick={() => focusAlertForm('emergency_alert')} className="flex min-h-24 items-start gap-3 rounded-[22px] border border-red-100 bg-red-50 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-red-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Siren className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Send Emergency Alert</p>
              <p className="mt-1 text-sm text-lokals-muted">Push an urgent alert that appears instantly across the app.</p>
            </div>
          </button>
          <Link to="/dashboard/town-manager/reports" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">View Reports</p>
              <p className="mt-1 text-sm text-lokals-muted">Open the live issue desk and keep response moving.</p>
            </div>
          </Link>
          <Link to="/dashboard/events/create" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <CalendarPlus2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Create Event</p>
              <p className="mt-1 text-sm text-lokals-muted">Publish municipal events if you need them during the pitch.</p>
            </div>
          </Link>
          <Link to="/dashboard/town-manager/community-impact/pending" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Impact approvals</p>
              <p className="mt-1 text-sm text-lokals-muted">Review verified positive contribution points privately.</p>
            </div>
          </Link>
          <Link to="/dashboard/town-manager/feed/pending" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Feed approvals</p>
              <p className="mt-1 text-sm text-lokals-muted">Moderate local posts before they reach the public feed.</p>
            </div>
          </Link>
          <Link to="/dashboard/town-manager/role-applications" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Approve role applications</p>
              <p className="mt-1 text-sm text-lokals-muted">Review local operators, drivers, and couriers waiting for approval.</p>
            </div>
          </Link>
          <Link to="/dashboard/town-manager/community-projects" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">Review community projects</p>
              <p className="mt-1 text-sm text-lokals-muted">Follow up on pending local projects and community impact work.</p>
            </div>
          </Link>
          <Link to="/dashboard/town-manager/analytics" className="flex min-h-24 items-start gap-3 rounded-[22px] border border-lokals-border bg-lokals-bg px-4 py-4 transition hover:-translate-y-0.5 hover:border-lokals-purple/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-lokals-charcoal">View town analytics</p>
              <p className="mt-1 text-sm text-lokals-muted">Track local transport, engagement, and communications health.</p>
            </div>
          </Link>
        </div>
      </DashboardSection>

      <div ref={alertFormRef} className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection title="Send alert" description="This flow should work cleanly in front of a live audience.">
          {successMessage ? (
            <div className="mb-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {successMessage}
            </div>
          ) : null}
          <form
            className="grid gap-3 md:grid-cols-[1fr_0.9fr] xl:grid-cols-[1fr_0.85fr]"
            onSubmit={async (event) => {
              event.preventDefault()
              await createAlert.mutateAsync({
                title,
                body,
                type,
                area: area || undefined,
                town: 'Okahandja',
                location: area ? `${area}, Okahandja` : 'Okahandja',
                priority: type === 'emergency_alert' ? 'critical' : type === 'service_update' ? 'medium' : 'low',
              })
              setSuccessMessage('Alert sent successfully')
              setTitle('')
              setBody('')
              setType('public_notice')
              setArea('')
            }}
          >
            <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
              Title
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Water outage notice" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
              Type
              <Select value={type} onChange={(event) => setType(event.target.value)}>
                <option value="public_notice">Announcement</option>
                <option value="emergency_alert">Emergency</option>
                <option value="service_update">Service Update</option>
              </Select>
            </label>
            <div className="md:col-span-2">
              <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
                Message
                <TextArea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Tell residents what is happening, where it affects them, and what they should expect next." rows={4} required />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
              Area (optional)
              <Select value={area} onChange={(event) => setArea(event.target.value)}>
                {areaOptions.map((option) => (
                  <option key={option || 'all-okahandja'} value={option}>
                    {option || 'All of Okahandja'}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={createAlert.isPending} className="w-full">
                {createAlert.isPending ? 'Sending alert...' : 'Send alert'}
              </Button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => focusAlertForm('public_notice')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${type === 'public_notice' ? 'bg-lokals-purple text-white' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}>Announcement</button>
            <button type="button" onClick={() => focusAlertForm('service_update')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${type === 'service_update' ? 'bg-lokals-purple text-white' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}>Service Update</button>
            <button type="button" onClick={() => focusAlertForm('emergency_alert')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${type === 'emergency_alert' ? 'bg-red-600 text-white' : 'border border-red-200 bg-white text-red-600'}`}>Emergency</button>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-lokals-muted">Selected: {getAlertTypeLabel(type)}</span>
          </div>
        </DashboardSection>

        <DashboardSection title="Report snapshot" description="Keep the status mix readable and current.">
          {reportStatusRows.length > 0 ? (
            <StatusBreakdownCard items={reportStatusRows.map((item) => ({ label: formatLabel(item.status), value: item.count }))} />
          ) : (
            <p className="text-sm text-lokals-muted">No city reports have been submitted for this municipality yet.</p>
          )}
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="Pending approvals" description="The highest-value moderation and approval queue across the town." action={<Link to="/dashboard/town-manager/pending-approvals" className="text-sm font-semibold text-lokals-green">View queue</Link>}>
          {pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovals.slice(0, 4).map((approval) => (
                <div key={approval.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{approval.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{approval.type.replaceAll('_', ' ')} | {approval.source}</p>
                    </div>
                    <StatusBadge value={approval.status.replaceAll('_', ' ')} tone="warning" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No pending approvals are waiting right now.</p>
          )}
        </DashboardSection>
        <DashboardSection title="Recent reports" description="New issues from residents that need attention first." action={<Link to="/dashboard/town-manager/reports" className="text-sm font-semibold text-lokals-green">View reports</Link>}>
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.slice(0, 4).map((report) => (
                <Link key={report.id} to={`/dashboard/town-manager/reports/${report.id}`} className="block rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25 hover:bg-emerald-50/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{report.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{formatLabel(report.category)} | {formatLocation(report.location, report.area, report.town)}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">{formatTimestamp(report.created_at)}</p>
                    </div>
                    <StatusBadge value={formatLabel(report.status)} tone={priorityTone(report.status === 'resolved' ? 'resolved' : report.priority)} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No recent reports are waiting here right now.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Active alerts" description="Recent notices already reaching residents.">
          {activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{alert.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{formatLocation(alert.location)}</p>
                    </div>
                    <StatusBadge value={formatLabel(alert.priority)} tone={priorityTone(alert.priority)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No active municipality alerts are published right now.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Upcoming municipal events" description="Available if you want to show local event control too.">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                  <p className="font-semibold text-lokals-charcoal">{event.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{formatLabel(event.category)} | {formatLocation(event.area, event.town)}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-muted">{event.starts_at ? new Date(event.starts_at).toLocaleString() : 'Schedule pending'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No upcoming municipal events are scheduled yet.</p>
          )}
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Operations at a glance" description="Live counts from active moderation and reward workflows.">
          <StatusBreakdownCard
            items={[
              { label: 'Driver and courier applications', value: data?.roleApplicationsPending ?? 0 },
              { label: 'Community projects pending', value: data?.communityProjectsPending.length ?? 0 },
              { label: 'Feed moderation queue', value: data?.feedPending.length ?? 0 },
              { label: 'Reward verifications', value: data?.rewardsPending.length ?? 0 },
            ]}
          />
        </DashboardSection>
        <DashboardSection title="Priority controls" description="Fast access to the town workflows that need human review.">
          <div className="space-y-3">
            {[
              { label: 'Role applications', value: data?.roleApplicationsPending ?? 0, icon: Truck, to: '/dashboard/town-manager/role-applications' },
              { label: 'Community projects', value: data?.communityProjectsPending.length ?? 0, icon: ShieldCheck, to: '/dashboard/town-manager/community-projects' },
              { label: 'Feed moderation', value: data?.feedPending.length ?? 0, icon: Newspaper, to: '/dashboard/town-manager/feed/pending' },
              { label: 'Reward approvals', value: data?.rewardsPending.length ?? 0, icon: Megaphone, to: '/dashboard/town-manager/community-impact/pending' },
            ].map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                </div>
                <span className="text-sm font-semibold text-lokals-charcoal">{item.value}</span>
              </Link>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Analytics summary" description="Keep the top-level town performance signals readable.">
          <StatusBreakdownCard items={Object.entries(analyticsSummary).slice(0, 5).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Issue categories" description="Which issue types are currently driving the municipal workload.">
          {reportCategories.length > 0 ? (
            <StatusBreakdownCard items={reportCategories.map((item) => ({ label: formatLabel(item.category), value: item.total ?? 0 }))} />
          ) : (
            <p className="text-sm text-lokals-muted">Issue category trends will appear here as more town reports are filed.</p>
          )}
        </DashboardSection>
        <DashboardSection title="Local directory" description="A quick view of visible businesses, providers, and public services in town.">
          <StatusBreakdownCard items={Object.entries(localDirectoryStats).map(([label, value]) => ({ label: formatLabel(label), value }))} />
        </DashboardSection>
        <DashboardSection title="Transport activity" description="Rides, deliveries, and operator readiness across the town.">
          <StatusBreakdownCard items={Object.entries(transportActivity).map(([label, value]) => ({ label: formatLabel(label), value }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Resident engagement" description="Signals that help explain current local activity and response pressure.">
          <StatusBreakdownCard items={Object.entries(residentEngagement).map(([label, value]) => ({ label: formatLabel(label), value }))} />
        </DashboardSection>
        <DashboardSection title="Communication stats" description="Announcements and emergency communications currently sent to residents.">
          <StatusBreakdownCard items={Object.entries(communicationStats).map(([label, value]) => ({ label: formatLabel(label), value }))} />
        </DashboardSection>
      </div>

      <DashboardSection title="Town activity by area" description="A neighborhood-level view for local pressure and service coverage.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {townActivityOverview.map((area) => (
            <div key={area.area ?? 'town-area'} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-lokals-charcoal">{area.area ?? 'Area'}</p>
                <StatusBadge value={`${area.reports ?? 0} reports`} tone={Number(area.reports ?? 0) > 0 ? 'warning' : 'success'} />
              </div>
              <p className="mt-2 text-sm text-lokals-muted">{area.residents ?? 0} residents and {area.providers ?? 0} providers currently associated with this area.</p>
            </div>
          ))}
          {townActivityOverview.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-lokals-border bg-white px-4 py-4 text-sm text-lokals-muted">
              Area-level activity will appear here when enough local data is available to group by neighborhood.
            </div>
          ) : null}
        </div>
      </DashboardSection>

      <DashboardSection title="Recent activity" description="Fresh report and alert movement across the town.">
        <RecentActivityList items={dashboard?.recent_activity ?? []} />
      </DashboardSection>
    </DashboardShell>
  )
}
