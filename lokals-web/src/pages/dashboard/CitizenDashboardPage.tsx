import { AlertTriangle, CalendarDays, Package, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button } from '../../components/Ui'
import { useCitizenDashboard } from '../../hooks/queries'

export function CitizenDashboardPage() {
  const dashboardQuery = useCitizenDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      eyebrow="Citizen"
      title="Your local dashboard"
      description="Bookings, tickets, alerts, reports, and followed updates in one simple place."
      actions={<Link to="/services"><Button variant="secondary">Book service</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection title="Quick actions" description="Jump into the things you do most often.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/services" title="Book Service" body="Find and book trusted local providers." icon={Search} />
            <QuickActionTile to="/report-issue" title="Report Issue" body="Send a city issue or public concern fast." icon={AlertTriangle} />
            <QuickActionTile to="/delivery" title="Send Parcel" body="Request a delivery with a few taps." icon={Package} />
            <QuickActionTile to="/alerts" title="View Alerts" body="Keep up with urgent and followed updates." icon={CalendarDays} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="What still needs your attention.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Upcoming bookings" description="Your next confirmed or pending appointments.">
          <div className="space-y-3">
            {((dashboard?.upcoming_bookings as any[]) ?? []).slice(0, 4).map((booking) => (
              <div key={booking.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Booking'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{booking.service_provider?.name ?? 'Provider'} - {booking.booking_date}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent activity" description="Recent account movement across bookings, tickets, and reports.">
          <RecentActivityList items={(dashboard?.recent_activity as any[]) ?? []} />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
