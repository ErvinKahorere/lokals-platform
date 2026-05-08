import { BellRing, Building2, CalendarDays, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button } from '../../components/Ui'
import { useOrganizationDashboard } from '../../hooks/queries'

export function OrganizationDashboardPage() {
  const dashboardQuery = useOrganizationDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      eyebrow="Organization"
      title="Organization dashboard"
      description="Followers, public updates, directory trust, and events in one calm workspace."
      actions={<Link to="/directory"><Button variant="secondary">View directory profile</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Run your organization’s public updates from one place.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/dashboard/organization" title="Publish Alert" body="Send important notices quickly." icon={BellRing} />
            <QuickActionTile to="/dashboard/events/create" title="Add Event" body="Create a public event or meeting." icon={CalendarDays} />
            <QuickActionTile to="/directory" title="Update Directory Profile" body="Keep services and details trustworthy." icon={Building2} />
            <QuickActionTile to="/dashboard/organization" title="View Followers" body="See your current public reach." icon={UsersRound} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Where public presence can improve next.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Public updates" description="Recent alerts, notices, and public-facing posts.">
          <div className="space-y-3">
            {(((dashboard as any)?.public_updates as any[]) ?? []).slice(0, 5).map((update) => (
              <div key={update.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{update.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{update.body}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Events" description="Upcoming organization events and public meetings.">
          <div className="space-y-3">
            {(((dashboard as any)?.events as any[]) ?? []).slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{event.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{event.category} - {[event.area, event.town].filter(Boolean).join(', ')}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>
      <DashboardSection title="Recent activity" description="Latest organization-facing changes.">
        <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
      </DashboardSection>
    </DashboardShell>
  )
}
