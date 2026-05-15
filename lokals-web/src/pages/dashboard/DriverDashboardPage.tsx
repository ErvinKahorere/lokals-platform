import { Bell, CarFront, History, MessageSquare, Power, Star, Wallet, AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useDriverOperationalData } from '../../lib/dashboardDataProvider'
import { getDashboardActivity, type DriverDashboardData } from '../../lib/dashboardTypes'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'
import { useDriverRideAction, useUpdateDriverAvailability } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'

export function DriverDashboardPage() {
  const dashboardQuery = useDriverOperationalData()
  const data = dashboardQuery.data as DriverDashboardData | undefined

  const stats = useMemo(() => data?.dashboard?.stats ?? {}, [data?.dashboard?.stats])
  const availability = data?.availability ?? 'unknown'
  const availabilityTone = availability === 'online' ? 'success' : availability === 'offline' ? 'warning' : 'neutral'
  const availabilityLabel = availability === 'online' ? 'online' : availability === 'offline' ? 'offline' : 'unknown'

  const updateAvailabilityMutation = useUpdateDriverAvailability()
  const rideActionMutation = useDriverRideAction()
  
  // Per-ride pending state and error tracking
  const [rideActionState, setRideActionState] = useState<Record<number, { action: string; pending: boolean; error?: string }>>({})

  const activeTrip = data?.activeTrip
  const availableRequests = data?.availableRequests ?? []
  const tripHistory = data?.tripHistory ?? []
  const earningsSummary = data?.earningsSummary ?? {}
  const ratingsSummary = data?.ratingsSummary ?? { average: '0', total: '0' }
  const unreadNotifications = data?.unread.notifications ?? 0
  const unreadMessages = data?.unread.messages ?? 0
  const recentActivity = getDashboardActivity(data?.dashboard ?? undefined)

  const handleAvailabilityToggle = () => {
    updateAvailabilityMutation.mutate(availability !== 'online')
  }

  const handleRideAction = (rideId: number, action: 'accept' | 'decline' | 'arrived' | 'start' | 'complete') => {
    setRideActionState((prev) => ({
      ...prev,
      [rideId]: { action, pending: true, error: undefined },
    }))

    rideActionMutation.mutate({ rideId, action }, {
      onSuccess: () => {
        setRideActionState((prev) => ({
          ...prev,
          [rideId]: { action, pending: false, error: undefined },
        }))
      },
      onError: (error) => {
        const errorMessage = getApiErrorMessage(error, 'Unable to update ride status. Please try again.')
        setRideActionState((prev) => ({
          ...prev,
          [rideId]: { action, pending: false, error: errorMessage },
        }))
      },
    })
  }

  return (
    <DashboardShell
      mode="driver"
      eyebrow="Driver mode"
      title="Driver dashboard"
      description="Go online, pick up nearby ride requests, track active trips, and keep earnings in view."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={stats}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Practical controls for your next trip.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/ride" title="Available rides" body="Review nearby resident requests." icon={CarFront} />
            <button
              type="button"
              onClick={handleAvailabilityToggle}
              className="rounded-[22px] border border-lokals-border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-lokals-purple/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                  <Power className="h-5 w-5" />
                </div>
                <StatusBadge value={availabilityLabel} tone={availabilityTone} />
              </div>
              <p className="mt-3 text-base font-semibold text-lokals-charcoal">
                {availability === 'online' ? 'Go offline' : 'Go online'}
              </p>
              <p className="mt-1 text-sm text-lokals-muted">Control whether you are visible for ride matching.</p>
            </button>
            <QuickActionTile to="/ride" title="Trip history" body="Review recently completed trips." icon={History} />
            <QuickActionTile to="/dashboard/driver" title="Earnings" body="See your latest ride totals and payouts." icon={Wallet} />
          </div>
        </DashboardSection>

        <DashboardSection title="Operational summary" description="A live view of availability, work, and communication.">
          <StatusBreakdownCard
            items={[
              { label: 'Availability', value: availabilityLabel },
              { label: 'Unread notifications', value: unreadNotifications },
              { label: 'Unread messages', value: unreadMessages },
              { label: 'Open ride requests', value: availableRequests.length },
            ]}
          />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available ride requests" description="Fresh resident requests that still need a driver.">
          <div className="space-y-3">
            {availableRequests.slice(0, 6).map((ride) => {
              const rideState = rideActionState[ride.id]
              const isPending = rideState?.pending ?? false
              const error = rideState?.error

              return (
                <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                    <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                  </div>
                  <p className="mt-1 text-sm text-lokals-muted">
                    {ride.user?.name ?? 'Resident'} | {ride.ride_type ?? 'Standard'} | N$ {ride.fare_estimate ?? '0'}
                  </p>
                  {error ? (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/ride/${ride.id}`}>
                      <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={isPending}>
                        Details
                      </Button>
                    </Link>
                    <Button className="min-h-9 px-3 py-2 text-xs" disabled={isPending} onClick={() => handleRideAction(ride.id, 'accept')}>
                      {isPending && rideState.action === 'accept' ? 'Updating…' : 'Accept'}
                    </Button>
                    <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={isPending} onClick={() => handleRideAction(ride.id, 'decline')}>
                      {isPending && rideState.action === 'decline' ? 'Updating…' : 'Decline'}
                    </Button>
                  </div>
                </div>
              )
            })}
            {!availableRequests.length ? (
              <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center">
                <p className="font-semibold text-lokals-charcoal">No ride requests right now</p>
                <p className="mt-2 text-sm text-lokals-muted">Stay online and the next request will appear as soon as a resident needs a ride.</p>
              </div>
            ) : null}
          </div>
        </DashboardSection>

        <DashboardSection title="Trip history" description="Recent trips and their current outcome.">
          <div className="space-y-3">
            {tripHistory.slice(0, 6).map((ride) => (
              <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                  <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                </div>
                <p className="mt-1 text-sm text-lokals-muted">
                  {ride.user?.name ?? 'Resident'}
                </p>
              </div>
            ))}
            {!tripHistory.length ? (
              <p className="text-sm text-lokals-muted">Completed and cancelled trips will appear here as you start working rides.</p>
            ) : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Active trip" description="The ride currently assigned to you, if any.">
          {activeTrip ? (
            <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-lokals-charcoal">{activeTrip.pickup_location} {'->'} {activeTrip.dropoff_location}</p>
                <StatusBadge value={formatTransportStatus(activeTrip.tracking_status ?? activeTrip.status, activeTrip.status_label)} tone={transportStatusTone(activeTrip.status)} />
              </div>
              <p className="mt-1 text-sm text-lokals-muted">
                {activeTrip.user?.name ?? 'Resident'}
              </p>
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-lokals-charcoal">
                  {transportStatusTone(activeTrip.status)}
                </span>
              </div>
              {rideActionState[activeTrip.id]?.error ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{rideActionState[activeTrip.id]?.error}</p>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/ride/${activeTrip.id}`}>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary">
                    Details
                  </Button>
                </Link>
                {activeTrip.status === 'accepted' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'arrived')}>
                    {rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'arrived' ? 'Updating…' : 'Mark arrived'}
                  </Button>
                ) : null}
                {activeTrip.status === 'arrived' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'start')}>
                    {rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'start' ? 'Updating…' : 'Start trip'}
                  </Button>
                ) : null}
                {activeTrip.status === 'in_progress' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'complete')}>
                    {rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'complete' ? 'Updating…' : 'Complete trip'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No active trip yet. Once you accept a resident request it will appear here.</p>
          )}
        </DashboardSection>

        <DashboardSection title="Earnings summary" description="Latest payout and trip totals from your dashboard feed.">
          {Object.keys(earningsSummary).length ? (
            <StatusBreakdownCard
              items={Object.entries(earningsSummary).slice(0, 4).map(([label, value]) => ({
                label: label.replaceAll('_', ' '),
                value,
              }))}
            />
          ) : (
            <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
              No earnings yet. Complete your first ride to see totals here.
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Ratings and comms" description="Trust and response readiness at a glance.">
          <div className="space-y-3">
            {[
              { label: 'Average rating', value: ratingsSummary.average ?? '0', icon: Star },
              { label: 'Total ratings', value: ratingsSummary.total ?? '0', icon: Star },
              { label: 'Unread notifications', value: unreadNotifications, icon: Bell },
              { label: 'Unread messages', value: unreadMessages, icon: MessageSquare },
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
        {recentActivity.length ? (
          <RecentActivityList items={recentActivity} />
        ) : (
          <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
            No recent activity yet. Your driver dashboard will populate as ride requests and trips update.
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}
