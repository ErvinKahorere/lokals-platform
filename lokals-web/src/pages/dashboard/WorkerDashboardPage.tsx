import { BriefcaseBusiness, PencilLine, TimerReset } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useWorkerDashboard } from '../../hooks/queries'

export function WorkerDashboardPage() {
  const dashboardQuery = useWorkerDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      eyebrow="Worker"
      title="Worker dashboard"
      description="Stay on top of jobs near you, applications, and availability."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Keep your worker profile active and visible.">
          <div className="grid gap-3 md:grid-cols-3">
            <QuickActionTile to="/jobs" title="View Jobs" body="Browse nearby quick-help opportunities." icon={BriefcaseBusiness} />
            <QuickActionTile to="/workers" title="Edit Worker Profile" body="Refine your skills, rate, and profile." icon={PencilLine} />
            <QuickActionTile to="/dashboard/worker" title="Update Availability" body="Keep your current availability visible." icon={TimerReset} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Where you can improve readiness right now.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Jobs near me" description="Open jobs that fit your current role.">
          <div className="space-y-3">
            {((dashboard?.jobs_near_me as any[]) ?? []).slice(0, 5).map((job) => (
              <div key={job.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{job.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{job.location ?? 'Windhoek'} - {job.compensation ?? 'Budget on request'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent activity" description="Applications and worker profile movement.">
          <RecentActivityList items={(dashboard?.recent_activity as any[]) ?? []} />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
