import { BriefcaseBusiness, PencilLine, TimerReset } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useWorkerDashboard } from '../../hooks/queries'
import { getDashboardActivity, getDashboardArray, getDashboardObject } from '../../lib/dashboardTypes'
import type { Job, RoleDashboardPayload } from '../../types'

export function WorkerDashboardPage() {
  const dashboardQuery = useWorkerDashboard()
  const dashboard = dashboardQuery.data as RoleDashboardPayload | undefined
  const workerProfile = getDashboardObject(dashboard, 'worker_profile')

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
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Jobs near me" description="Open jobs that fit your current role.">
          <div className="space-y-3">
            {getDashboardArray(dashboard, 'jobs_near_me').slice(0, 5).map((job: Job) => (
              <div key={job.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{job.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{job.location ?? 'Okahandja'} - {job.compensation ?? 'Budget on request'}</p>
              </div>
            ))}
            {!getDashboardArray(dashboard, 'jobs_near_me').length ? <p className="text-sm text-lokals-muted">Nearby jobs will appear here when local demand is available.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Applications and profile status" description="Track your worker readiness and active applications.">
          <div className="space-y-3">
            <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <p className="font-semibold text-lokals-charcoal">Worker profile</p>
              <p className="mt-1 text-sm text-lokals-muted">
                {workerProfile.headline ?? 'Profile setup still needs attention.'}
              </p>
            </div>
            {getDashboardArray(dashboard, 'applications').slice(0, 4).map((application) => (
              <div key={application.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{application.job?.title ?? 'Application'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{application.status ?? 'pending'} | {application.job?.location ?? 'Okahandja'}</p>
              </div>
            ))}
            {!getDashboardArray(dashboard, 'applications').length ? <p className="text-sm text-lokals-muted">Applications you send through LOKALS will appear here.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Applications and worker profile movement.">
        <RecentActivityList items={getDashboardActivity(dashboard)} />
      </DashboardSection>
    </DashboardShell>
  )
}
