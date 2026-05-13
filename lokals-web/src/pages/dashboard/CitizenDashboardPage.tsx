import { AlertTriangle, Award, Bell, CalendarDays, Heart, MessageSquare, Package, Search, ShieldAlert, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button } from '../../components/Ui'
import { useResidentDashboardData } from '../../lib/dashboardDataProvider'
import type { FollowingUpdateSummary, ResidentDashboardData } from '../../lib/dashboardTypes'
import type { Booking, CommunityImpactAccount, Report, RoleDashboardPayload, SavedItemEntry } from '../../types'

const unwrapRewardAccount = (
  account?: CommunityImpactAccount | { data: CommunityImpactAccount } | null,
): CommunityImpactAccount | undefined => {
  if (!account) return undefined
  return 'data' in account ? account.data : account
}

export function CitizenDashboardPage() {
  const dashboardQuery = useResidentDashboardData()
  const data = dashboardQuery.data as ResidentDashboardData | undefined
  const dashboard = data?.dashboard as RoleDashboardPayload | null | undefined
  const upcomingBookings = data?.activeRequests.bookings ?? []
  const myReports = data?.issues ?? []
  const unreadSummary = data?.unread ?? { notifications: 0, messages: 0 }
  const savedItems = data?.savedItems ?? []
  const followedUpdates = data?.followedUpdates ?? []
  const rewardAccount = unwrapRewardAccount(data?.rewards?.account)

  const savedCardRows = savedItems.slice(0, 3)
  const followedRows = followedUpdates.slice(0, 3)
  const activityRows = data?.activity ?? []
  const bookingsAndRequests = [
    { label: 'Bookings', value: upcomingBookings.length },
    { label: 'Rides', value: data?.activeRequests.rides.length ?? 0 },
    { label: 'Deliveries', value: data?.activeRequests.deliveries.length ?? 0 },
  ]

  return (
    <DashboardShell
      mode="resident"
      eyebrow="Resident"
      title="Your local dashboard"
      description="Bookings, tickets, alerts, reports, and followed updates in one simple place."
      actions={<Link to="/services"><Button variant="secondary">Book service</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={{
        ...(dashboard?.stats ?? {}),
        unread_notifications: unreadSummary.notifications,
        unread_messages: unreadSummary.messages,
        saved_items: savedItems.length,
        available_points: rewardAccount?.available_points ?? 0,
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardSection title="Quick actions" description="Jump into the things you do most often.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/services" title="Book Service" body="Find and book trusted local providers." icon={Search} />
            <QuickActionTile to="/report-issue" title="Report Issue" body="Send a city issue or public concern fast." icon={AlertTriangle} />
            <QuickActionTile to="/delivery" title="Send Parcel" body="Request a delivery with a few taps." icon={Package} />
            <QuickActionTile to="/alerts" title="View Alerts" body="Keep up with urgent and followed updates." icon={CalendarDays} />
            <QuickActionTile to="/community-impact" title="Community Impact" body="See approved points, rewards, and privacy-first visibility settings." icon={Award} />
          </div>
        </DashboardSection>
        <DashboardSection title="Active requests" description="A practical summary of the things already moving for you.">
          <StatusBreakdownCard items={bookingsAndRequests} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Upcoming bookings" description="Your next confirmed or pending appointments.">
          <div className="space-y-3">
            {upcomingBookings.slice(0, 4).map((booking: Booking) => (
              <div key={booking.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Booking'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{booking.service_provider?.name ?? 'Provider'} - {booking.booking_date}</p>
              </div>
            ))}
            {!upcomingBookings.length ? <p className="text-sm text-lokals-muted">Your next bookings will show up here once you start booking local services.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="My reports" description="Recent civic issues and where they stand.">
          <div className="space-y-3">
            {myReports.slice(0, 4).map((report: Report) => (
              <div key={report.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{report.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{report.status ?? 'open'} | {report.priority ?? 'standard'}</p>
              </div>
            ))}
            {!myReports.length ? <p className="text-sm text-lokals-muted">Reports you send through LOKALS will appear here.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Messages, alerts, and rewards" description="Keep attention on the things that need a follow-up.">
          <div className="space-y-3">
            {[
              { label: 'Unread notifications', value: unreadSummary.notifications, icon: Bell },
              { label: 'Unread messages', value: unreadSummary.messages, icon: MessageSquare },
              { label: 'Reward points available', value: rewardAccount?.available_points ?? 0, icon: Award },
              { label: 'Saved items', value: savedItems.length, icon: Star },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                </div>
                <span className="text-sm font-semibold text-lokals-charcoal">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Saved items" description="Recent things you wanted to come back to.">
          <div className="space-y-3">
            {savedCardRows.map((item: SavedItemEntry) => (
              <div key={`${item.group}-${item.id}`} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{item.group} | {item.town ?? 'Okahandja'}</p>
              </div>
            ))}
            {!savedCardRows.length ? <p className="text-sm text-lokals-muted">Items you save across the platform will show up here.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Followed organisation updates" description="Recent updates from organisations you already follow.">
          <div className="space-y-3">
            {followedRows.map((item: FollowingUpdateSummary) => (
              <div key={item.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{item.source}</p>
                <p className="mt-2 text-sm text-lokals-muted">{item.body}</p>
              </div>
            ))}
            {!followedRows.length ? <p className="text-sm text-lokals-muted">Followed organisations will appear here once updates are available.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Issue and request summary" description="A quick read on practical progress across your local activity.">
          <div className="space-y-3">
            {[
              { label: 'Open issue reports', value: myReports.filter((report) => report.status !== 'resolved').length, icon: ShieldAlert },
              { label: 'Active rides', value: data?.activeRequests.rides.length ?? 0, icon: CalendarDays },
              { label: 'Active deliveries', value: data?.activeRequests.deliveries.length ?? 0, icon: Package },
              { label: 'Followed updates', value: followedUpdates.length, icon: Heart },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lokals-green/10 text-lokals-green">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                </div>
                <span className="text-sm font-semibold text-lokals-charcoal">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Recent activity" description="Recent account movement across bookings, tickets, and reports.">
          <RecentActivityList items={activityRows} />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
