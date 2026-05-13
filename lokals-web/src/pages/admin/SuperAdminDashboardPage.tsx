import { Building2, ShieldCheck, UserRoundCog, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button } from '../../components/Ui'
import { useSuperAdminDashboard } from '../../hooks/queries'

export function SuperAdminDashboardPage() {
  const dashboardQuery = useSuperAdminDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      mode="admin"
      eyebrow="Super Admin"
      title="Platform control center"
      description="Users, directory growth, moderation pressure, and platform health in one high-signal dashboard."
      actions={<Link to="/admin/users"><Button variant="secondary">Manage users</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Jump straight into platform-level operations.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/admin/users" title="Manage Users" body="Review users, roles, and account ownership." icon={UserRoundCog} />
            <QuickActionTile to="/admin/providers" title="Manage Directory" body="Review businesses, organizations, and providers." icon={Building2} />
            <QuickActionTile to="/admin/reports" title="Moderate Content" body="Handle reports and flagged content." icon={ShieldCheck} />
            <QuickActionTile to="/admin/overview" title="View System Health" body="Check platform counts and operational pressure." icon={Wrench} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Top admin pressure points right now.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Moderation queue" description="Recent flags waiting for review.">
          <div className="space-y-3">
            {(((dashboard as any)?.moderation_flags as any[]) ?? []).slice(0, 6).map((flag) => (
              <div key={flag.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{flag.reason}</p>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{flag.status}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{flag.notes ?? 'Pending moderator review.'}</p>
              </div>
            ))}
            {!((((dashboard as any)?.moderation_flags as any[]) ?? []).length) ? <p className="text-sm text-lokals-muted">Moderation flags will appear here when the platform needs review attention.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="System overview" description="High-level platform totals that help you read operational pressure quickly.">
          <div className="space-y-3">
            {Object.entries(((dashboard as any)?.system_overview ?? {}) as Record<string, string | number>).map(([key, value]) => (
              <div key={key} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold capitalize text-lokals-charcoal">{key.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-sm text-lokals-muted">{value}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Recent reports" description="Latest platform-visible civic reports and escalation points.">
          <div className="space-y-3">
            {(((dashboard as any)?.recent_reports as any[]) ?? []).slice(0, 5).map((report) => (
              <div key={report.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{report.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{report.status ?? 'open'} | {report.priority ?? 'standard'}</p>
              </div>
            ))}
            {!((((dashboard as any)?.recent_reports as any[]) ?? []).length) ? <p className="text-sm text-lokals-muted">Recent reports will appear here as platform issues are filed.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent activity" description="Platform movement across flags, reports, and content.">
          <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
