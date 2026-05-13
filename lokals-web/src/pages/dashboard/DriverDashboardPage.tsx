import { Bell, CarFront, History, MessageSquare, Power, Star, Wallet } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, StatusBadge } from '../../components/Ui'
import { useDriverRideAction, useUpdateDriverAvailability } from '../../hooks/queries'
import { useDriverOperationalData } from '../../lib/dashboardDataProvider'
import type { DriverDashboardData } from '../../lib/dashboardTypes'
import type { RoleDashboardPayload } from '../../types'

export function DriverDashboardPage() {
  const dashboardQuery = useDriverOperationalData()
  const data = dashboardQuery.data as DriverDashboardData | undefined
  const dashboard = data?.dashboard as RoleDashboardPayload | null | undefined
  const availableRequests = data?.availableRequests ?? []
  const tripHistory = data?.tripHistory ?? []
  const activityRows = dashboard?.recent_activity ?? []
  const activeTrip = data?.activeTrip
  const availability = data?.availability ?? 'unknown'
  const availabilityMutation = useUpdateDriverAvailability()
  const rideActionMutation = useDriverRideAction()

  return (
    <DashboardShell
      mode="driver"
      eyebrow="Driver mode"
      title="Driver dashboard"
      description="Go online, pick up nearby ride requests, track active trips, and keep earnings in view."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={{
        ...(dashboard?.stats ?? {}),
        availability,
        unread_notifications: data?.unread.notifications ?? 0,
        unread_messages: data?.unread.messages ?? 0,
      }}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Practical controls for your next trip.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/ride" title="Available rides" body="Review nearby resident requests." icon={CarFront} />
            <button
              type="button"
              onClick={() => availabilityMutation.mutate(availability !== 'online')}
              className="rounded-[22px] border border-lokals-border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-lokals-purple/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                  <Power className="h-5 w-5" />
                </div>
                <StatusBadge value={availability === 'online' ? 'online' : 'offline'} tone={availability === 'online' ? 'success' : 'neutral'} />
              </div>
              <p className="mt-3 text-base font-semibold text-lokals-charcoal">{availability === 'online' ? 'Go offline' : 'Go online'}</p>
              <p className="mt-1 text-sm text-lokals-muted">Control whether you are visible for ride matching.</p>
            </button>
            <QuickActionTile to="/ride" title="Trip history" body="Review recently completed trips." icon={History} />
            <QuickActionTile to="/dashboard/driver" title="Earnings" body="See your latest ride totals and payouts." icon={Wallet} />
          </div>
        </DashboardSection>
        <DashboardSection title="Operational summary" description="A live view of availability, work, and communication.">
          <StatusBreakdownCard
            items={[
              { label: 'Availability', value: availability },
              { label: 'Unread notifications', value: data?.unread.notifications ?? 0 },
              { label: 'Unread messages', value: data?.unread.messages ?? 0 },
              { label: 'Open ride requests', value: availableRequests.length },
            ]}
          />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available ride requests" description="Fresh resident requests that still need a driver.">
          <div className="space-y-3">
            {availableRequests.slice(0, 6).map((ride) => (
              <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                <p className="mt-1 text-sm text-lokals-muted">{ride.user?.name ?? 'Resident'} | {ride.ride_type ?? 'Standard'} | N$ {ride.fare_estimate ?? '0'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionMutation.isPending} onClick={() => rideActionMutation.mutate({ rideId: ride.id, action: 'accept' })}>
                    Accept
                  </Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={rideActionMutation.isPending} onClick={() => rideActionMutation.mutate({ rideId: ride.id, action: 'decline' })}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            {!availableRequests.length ? <p className="text-sm text-lokals-muted">No ride requests are waiting right now. Stay online to catch the next one.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Trip history" description="Recent trips and their current outcome.">
          <div className="space-y-3">
            {tripHistory.slice(0, 6).map((ride) => (
              <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                <p className="mt-1 text-sm text-lokals-muted">{ride.status ?? 'requested'} | {ride.user?.name ?? 'Resident'}</p>
              </div>
            ))}
            {!tripHistory.length ? <p className="text-sm text-lokals-muted">Completed and cancelled trips will appear here as you start working rides.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Active trip" description="The ride currently assigned to you, if any.">
          {activeTrip ? (
            <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <p className="font-semibold text-lokals-charcoal">{activeTrip.pickup_location} {'->'} {activeTrip.dropoff_location}</p>
              <p className="mt-1 text-sm text-lokals-muted">{activeTrip.status ?? 'accepted'} | {activeTrip.user?.name ?? 'Resident'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeTrip.status === 'accepted' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionMutation.isPending} onClick={() => rideActionMutation.mutate({ rideId: activeTrip.id, action: 'arrived' })}>Mark arrived</Button> : null}
                {activeTrip.status === 'arrived' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionMutation.isPending} onClick={() => rideActionMutation.mutate({ rideId: activeTrip.id, action: 'start' })}>Start trip</Button> : null}
                {activeTrip.status === 'in_progress' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionMutation.isPending} onClick={() => rideActionMutation.mutate({ rideId: activeTrip.id, action: 'complete' })}>Complete trip</Button> : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No active trip yet. Once you accept a resident request it will appear here.</p>
          )}
        </DashboardSection>
        <DashboardSection title="Earnings summary" description="Latest payout and trip totals from your dashboard feed.">
          <StatusBreakdownCard items={Object.entries(data?.earningsSummary ?? {}).slice(0, 4).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value }))} />
        </DashboardSection>
        <DashboardSection title="Ratings and comms" description="Trust and response readiness at a glance.">
          <div className="space-y-3">
            {[
              { label: 'Average rating', value: data?.ratingsSummary.average ?? '0', icon: Star },
              { label: 'Total ratings', value: data?.ratingsSummary.total ?? '0', icon: Star },
              { label: 'Unread notifications', value: data?.unread.notifications ?? 0, icon: Bell },
              { label: 'Unread messages', value: data?.unread.messages ?? 0, icon: MessageSquare },
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

      <DashboardSection title="Recent activity" description="Latest movement across your driver workspace.">
        <RecentActivityList items={activityRows} />
      </DashboardSection>
    </DashboardShell>
  )
}
