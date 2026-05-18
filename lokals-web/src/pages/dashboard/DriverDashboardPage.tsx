import { AlertCircle, Bell, CarFront, MessageSquare, Power, Star, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { TransportPanel, TransportTabs } from '../../components/transport/TransportSurface'
import { useDriverRideAction, useUpdateDriverAvailability } from '../../hooks/queries'
import { useDriverOperationalData } from '../../lib/dashboardDataProvider'
import { type DriverDashboardData, getDashboardActivity } from '../../lib/dashboardTypes'
import { getApiErrorMessage } from '../../lib/api'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'

const dashboardTabs = [
  { label: 'Available', value: 'available' },
  { label: 'Active', value: 'active' },
  { label: 'Earnings', value: 'earnings' },
  { label: 'History', value: 'history' },
]

export function DriverDashboardPage() {
  const dashboardQuery = useDriverOperationalData()
  const data = dashboardQuery.data as DriverDashboardData | undefined
  const [activeTab, setActiveTab] = useState('available')
  const availability = data?.availability ?? 'unknown'
  const availabilityTone = availability === 'online' ? 'success' : availability === 'offline' ? 'warning' : 'neutral'
  const availabilityLabel = availability === 'online' ? 'online' : availability === 'offline' ? 'offline' : 'unknown'

  const updateAvailabilityMutation = useUpdateDriverAvailability()
  const rideActionMutation = useDriverRideAction()
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
      title="Driver workspace"
      description="A cleaner operational workspace built around available requests, the active trip, and the next required action."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={{
        availability: availabilityLabel,
        available_requests: availableRequests.length,
        active_trip: activeTrip ? 1 : 0,
        unread_notifications: unreadNotifications,
      }}
      actions={
        <Button variant={availability === 'online' ? 'secondary' : 'primary'} onClick={handleAvailabilityToggle} disabled={updateAvailabilityMutation.isPending}>
          <Power className="mr-2 h-4 w-4" />
          {updateAvailabilityMutation.isPending ? 'Updating...' : availability === 'online' ? 'Go offline' : 'Go online'}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#f9faff)] p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Operational focus</p>
              <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">{activeTrip ? 'Active trip in progress' : 'Waiting for the next request'}</h3>
              <p className="mt-2 text-sm text-lokals-muted">
                {activeTrip ? `${activeTrip.pickup_location} to ${activeTrip.dropoff_location}` : 'Stay online and the next nearby rider request will appear here.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={availabilityLabel} tone={availabilityTone} />
              <StatusBadge value={`${availableRequests.length} open requests`} tone="accent" />
            </div>
          </div>
        </div>

        <TransportTabs items={dashboardTabs} value={activeTab} onChange={setActiveTab} />

        {activeTab === 'available' ? (
          <TransportPanel title="Available requests" description="Accept or decline from a compact request list with clearer status and stronger action hierarchy.">
            <div className="space-y-3">
              {availability !== 'online' && availableRequests.length > 0 ? (
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You are offline and will not receive new ride alerts until you go online.
                </div>
              ) : null}
              {availableRequests.map((ride, index) => {
                const rideState = rideActionState[ride.id]
                const isPending = rideState?.pending ?? false
                const isPriority = index === 0

                return (
                  <div key={ride.id} className={`rounded-[24px] border px-4 py-4 ${isPriority ? 'border-lokals-purple/20 bg-violet-50' : 'border-lokals-border bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isPriority ? <StatusBadge value="Priority" tone="accent" /> : null}
                          <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} to {ride.dropoff_location}</p>
                        </div>
                        <p className="mt-2 text-sm text-lokals-muted">{ride.user?.name ?? 'Resident'} | {ride.ride_type ?? 'Standard'} | N$ {ride.fare_estimate ?? '0'}</p>
                      </div>
                      <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                    </div>
                    {rideState?.error ? (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <p>{rideState.error}</p>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button disabled={isPending} onClick={() => handleRideAction(ride.id, 'accept')}>
                        {isPending && rideState?.action === 'accept' ? 'Accepting...' : 'Accept'}
                      </Button>
                      <Button variant="secondary" disabled={isPending} onClick={() => handleRideAction(ride.id, 'decline')}>
                        {isPending && rideState?.action === 'decline' ? 'Declining...' : 'Decline'}
                      </Button>
                      <Link to={`/ride/${ride.id}`}><Button variant="secondary">Details</Button></Link>
                      {ride.user?.phone ? (
                        <Button variant="secondary" onClick={() => { window.location.href = `tel:${ride.user?.phone}` }}>
                          Call rider
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
              {!availableRequests.length ? (
                <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                  No ride requests right now. Stay online and the next nearby request will appear here.
                </div>
              ) : null}
            </div>
          </TransportPanel>
        ) : null}

        {activeTab === 'active' ? (
          <TransportPanel title="Active trip" description="Keep the current trip and its next required action in one focused workspace.">
            {activeTrip ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[24px] border border-lokals-border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{activeTrip.pickup_location} to {activeTrip.dropoff_location}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{activeTrip.user?.name ?? 'Resident'} | {activeTrip.user?.phone ?? 'No phone yet'}</p>
                    </div>
                    <StatusBadge value={formatTransportStatus(activeTrip.tracking_status ?? activeTrip.status, activeTrip.status_label)} tone={transportStatusTone(activeTrip.status)} />
                  </div>
                  {rideActionState[activeTrip.id]?.error ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{rideActionState[activeTrip.id]?.error}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/ride/${activeTrip.id}`}><Button variant="secondary">Open details</Button></Link>
                    {activeTrip.user?.phone ? <Button variant="secondary" onClick={() => { window.location.href = `tel:${activeTrip.user?.phone}` }}>Call rider</Button> : null}
                    {activeTrip.status === 'accepted' ? <Button disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'arrived')}>{rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'arrived' ? 'Updating...' : 'Mark arrived'}</Button> : null}
                    {activeTrip.status === 'arrived' ? <Button disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'start')}>{rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'start' ? 'Updating...' : 'Start trip'}</Button> : null}
                    {activeTrip.status === 'in_progress' ? <Button disabled={rideActionState[activeTrip.id]?.pending} onClick={() => handleRideAction(activeTrip.id, 'complete')}>{rideActionState[activeTrip.id]?.pending && rideActionState[activeTrip.id]?.action === 'complete' ? 'Updating...' : 'Complete trip'}</Button> : null}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Status', value: formatTransportStatus(activeTrip.tracking_status ?? activeTrip.status, activeTrip.status_label), icon: CarFront },
                    { label: 'Ride type', value: activeTrip.ride_type ?? 'Standard', icon: CarFront },
                    { label: 'Fare estimate', value: activeTrip.fare_estimate ? `N$ ${activeTrip.fare_estimate}` : 'Open fare', icon: Wallet },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-lokals-border bg-white px-4 py-4">
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
              </div>
            ) : (
              <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                No active trip yet. Once you accept a rider request it will appear here.
              </div>
            )}
          </TransportPanel>
        ) : null}

        {activeTab === 'earnings' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <TransportPanel title="Earnings visibility" description="Keep today, total, and trust signals in a compact operational view.">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(earningsSummary).slice(0, 6).map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{label.replaceAll('_', ' ')}</p>
                    <p className="mt-2 text-xl font-semibold text-lokals-charcoal">{String(value)}</p>
                  </div>
                ))}
                {!Object.keys(earningsSummary).length ? (
                  <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-sm text-lokals-muted">
                    No earnings yet. Complete your first ride to see totals here.
                  </div>
                ) : null}
              </div>
            </TransportPanel>

            <div className="space-y-3">
              {[
                { label: 'Average rating', value: String(ratingsSummary.average ?? '0'), icon: Star },
                { label: 'Total ratings', value: String(ratingsSummary.total ?? '0'), icon: Star },
                { label: 'Unread notifications', value: String(unreadNotifications), icon: Bell },
                { label: 'Unread messages', value: String(unreadMessages), icon: MessageSquare },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-lokals-border bg-white px-4 py-4">
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
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <TransportPanel title="Trip history" description="A lighter history view focused on route, outcome, and quick detail access.">
              <div className="space-y-3">
                {tripHistory.slice(0, 8).map((ride) => (
                  <div key={ride.id} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} to {ride.dropoff_location}</p>
                        <p className="mt-1 text-sm text-lokals-muted">{ride.user?.name ?? 'Resident'} | {ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare'}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                        <div className="mt-2">
                          <Link to={`/ride/${ride.id}`}><Button variant="secondary">Details</Button></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!tripHistory.length ? (
                  <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                    Completed and cancelled trips will appear here as you start working rides.
                  </div>
                ) : null}
              </div>
            </TransportPanel>

            <TransportPanel title="Recent activity" description="Latest movement across your driver workspace.">
              {recentActivity.length ? (
                <RecentActivityList items={recentActivity} />
              ) : (
                <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                  No recent activity yet. Your driver dashboard will populate as ride requests and trips update.
                </div>
              )}
            </TransportPanel>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
