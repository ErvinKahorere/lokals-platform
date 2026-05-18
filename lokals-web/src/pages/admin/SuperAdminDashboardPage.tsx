import { Building2, ClipboardCheck, ScrollText, ShieldCheck, UserRoundCog, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, StatusBadge } from '../../components/Ui'
import { useSuperAdminDashboard } from '../../hooks/queries'
import { getDashboardActivity } from '../../lib/dashboardTypes'
import type { RoleDashboardPayload } from '../../types'

type HealthItem = {
  label: string
  status: string
  value?: string | number | null
  detail?: string | null
}

type TownActivity = {
  town?: string
  users?: number
  businesses?: number
  providers?: number
  open_reports?: number
  active_alerts?: number
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function toneForStatus(value?: string) {
  const normalized = String(value ?? '').toLowerCase()
  if (normalized.includes('healthy') || normalized.includes('enabled') || normalized.includes('live')) return 'success' as const
  if (normalized.includes('warning') || normalized.includes('monitor') || normalized.includes('pending')) return 'warning' as const
  if (normalized.includes('degraded') || normalized.includes('locked')) return 'danger' as const
  return 'info' as const
}

export function SuperAdminDashboardPage() {
  const dashboardQuery = useSuperAdminDashboard()
  const dashboard = dashboardQuery.data as (RoleDashboardPayload & {
    user_mix?: Record<string, number | string>
    pending_approvals?: Record<string, number | string>
    active_workloads?: Record<string, number | string>
    health_summary?: HealthItem[]
    town_activity_overview?: TownActivity[]
  }) | undefined

  const stats = {
    total_users: dashboard?.stats?.total_users ?? 0,
    residents: dashboard?.stats?.residents ?? 0,
    town_managers: dashboard?.stats?.town_managers ?? 0,
    pending_role_applications: dashboard?.stats?.pending_role_applications ?? 0,
    active_reports: dashboard?.stats?.active_reports ?? 0,
    active_rides: dashboard?.stats?.active_rides ?? 0,
    active_deliveries: dashboard?.stats?.active_deliveries ?? 0,
    notification_volume: dashboard?.stats?.notification_volume ?? 0,
  }

  const userMix = Object.entries(dashboard?.user_mix ?? {}).map(([key, value]) => ({ label: formatLabel(key), value }))
  const pendingApprovals = Object.entries(dashboard?.pending_approvals ?? {}).map(([key, value]) => ({ label: formatLabel(key), value }))
  const activeWorkloads = Object.entries(dashboard?.active_workloads ?? {}).map(([key, value]) => ({ label: formatLabel(key), value }))
  const townActivity = (dashboard?.town_activity_overview ?? []).slice(0, 3)
  const healthSummary = dashboard?.health_summary ?? []

  return (
    <DashboardShell
      mode="admin"
      eyebrow="Super Admin"
      title="Platform control center"
      description="User growth, approval pressure, queue health, and town operations in one working admin dashboard."
      actions={<Link to="/dashboard/admin/users"><Button variant="secondary">Manage users</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={stats}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection title="Quick actions" description="Move straight into the operational areas that need decisions.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <QuickActionTile to="/dashboard/admin/towns" title="Manage towns" body="Check pilot town readiness and activity coverage." icon={Building2} />
            <QuickActionTile to="/dashboard/admin/users" title="Manage users" body="Review accounts, roles, and town assignments." icon={UserRoundCog} />
            <QuickActionTile to="/dashboard/admin/role-applications" title="Review role applications" body="Clear the verification and approval backlog." icon={ClipboardCheck} />
            <QuickActionTile to="/dashboard/admin/system-health" title="View system health" body="Monitor queues, realtime, and notification pressure." icon={Wrench} />
            <QuickActionTile to="/dashboard/admin/feature-flags" title="View feature flags" body="Check rollout posture and pilot safeguards." icon={ShieldCheck} />
            <QuickActionTile to="/dashboard/admin/audit-logs" title="View audit logs" body="Follow recent platform-level admin decisions." icon={ScrollText} />
          </div>
        </DashboardSection>

        <DashboardSection title="Pending approvals" description="The queues most likely to stall platform momentum today.">
          {pendingApprovals.length > 0 ? (
            <StatusBreakdownCard items={pendingApprovals} />
          ) : (
            <p className="text-sm text-lokals-muted">No pending approval queues are reporting pressure right now.</p>
          )}
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardSection title="User mix" description="Keep role distribution readable as the pilot expands.">
          {userMix.length > 0 ? (
            <StatusBreakdownCard items={userMix} />
          ) : (
            <p className="text-sm text-lokals-muted">User role distribution will appear here once the dashboard payload is available.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Active workloads" description="Live operational pressure across support, transport, and moderation.">
          {activeWorkloads.length > 0 ? (
            <StatusBreakdownCard items={activeWorkloads} />
          ) : (
            <p className="text-sm text-lokals-muted">No workload data is available right now.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Town activity overview" description="A quick read on the pilot town from the platform level.">
          <div className="space-y-3">
            {townActivity.map((town) => (
              <div key={town.town ?? 'pilot-town'} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{town.town ?? 'Pilot town'}</p>
                  <StatusBadge value={`${town.open_reports ?? 0} open reports`} tone={Number(town.open_reports ?? 0) > 0 ? 'warning' : 'success'} />
                </div>
                <p className="mt-2 text-sm text-lokals-muted">
                  {town.users ?? 0} users, {town.businesses ?? 0} businesses, {town.providers ?? 0} providers, {town.active_alerts ?? 0} active alerts.
                </p>
              </div>
            ))}
            {townActivity.length === 0 ? <p className="text-sm text-lokals-muted">Town activity will appear here as the pilot data grows.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="System health" description="Operational status without needing to leave the dashboard.">
          <div className="space-y-3">
            {healthSummary.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                  <StatusBadge value={item.status} tone={toneForStatus(item.status)} />
                </div>
                <p className="mt-2 text-sm text-lokals-muted">{item.detail ?? 'Operational status'}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Current value: {item.value ?? 'n/a'}</p>
              </div>
            ))}
            {healthSummary.length === 0 ? <p className="text-sm text-lokals-muted">System health checks will appear here once the API is available.</p> : null}
          </div>
        </DashboardSection>

        <DashboardSection title="Recent admin activity" description="Recent approval, alert, and moderation movement across the platform.">
          <RecentActivityList items={getDashboardActivity(dashboard)} />
        </DashboardSection>
      </div>

      <DashboardSection title="Operational follow-through" description="The dashboard now routes every high-priority admin action into a working page or live workspace.">
        <div className="grid gap-3 md:grid-cols-3">
          <Link to="/dashboard/admin/role-applications" className="rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25">
            <p className="font-semibold text-lokals-charcoal">Pending approvals</p>
            <p className="mt-1 text-sm text-lokals-muted">Resolve role requests, reward reviews, and moderation pressure fast.</p>
          </Link>
          <Link to="/admin/reports" className="rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25">
            <p className="font-semibold text-lokals-charcoal">Platform moderation</p>
            <p className="mt-1 text-sm text-lokals-muted">Review reports and follow the issues that affect resident trust.</p>
          </Link>
          <Link to="/dashboard/admin/system-health" className="rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25">
            <p className="font-semibold text-lokals-charcoal">System health and queues</p>
            <p className="mt-1 text-sm text-lokals-muted">Track queue backlog, realtime readiness, and notification volume in one place.</p>
          </Link>
        </div>
      </DashboardSection>
    </DashboardShell>
  )
}
