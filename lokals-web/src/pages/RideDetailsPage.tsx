import { AlertCircle, AlertTriangle, CarFront, Clock3, ShieldCheck, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ContactActions } from '../components/experience/ContactActions'
import { LocationPreviewMap } from '../components/maps/LocationPreviewMap'
import { Button, EmptyState, Input, QueryState, StatusBadge, TextArea } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { TransportPanel, TransportSummaryCard, TransportTabs } from '../components/transport/TransportSurface'
import { useCancelRide, useDriverRideAction, useRateRide, useRide } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import type { LocationPoint } from '../lib/location'
import { formatTransportStatus, formatTransportTimestamp, normalizeTransportTimeline, transportStatusTone } from '../lib/transportStatus'
import { useAuthStore } from '../store/auth'

const rideSteps = ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']
const detailTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Route', value: 'route' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'Contact', value: 'contact' },
]

export function RideDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const rideQuery = useRide(id)
  const ride = rideQuery.data
  const cancelRide = useCancelRide()
  const rateRide = useRateRide()
  const rideActionMutation = useDriverRideAction()
  const [activeTab, setActiveTab] = useState('overview')
  const [rideActionState, setRideActionState] = useState<Record<number, { action: string; pending: boolean; error?: string }>>({})
  const [cancelReason, setCancelReason] = useState('')
  const [rating, setRating] = useState('5')
  const [ratingComment, setRatingComment] = useState('')

  const rideErrorStatus = (rideQuery.error as { response?: { status?: number } })?.response?.status
  const isRideUnauthorized = rideErrorStatus === 401
  const isRideForbidden = rideErrorStatus === 403
  const isRideAccessError = isRideUnauthorized || isRideForbidden

  const isResident = ride?.user?.id != null && ride.user.id === user?.id
  const isDriver = Boolean(user?.roles?.includes('driver'))
  const canAcceptRide = Boolean(isDriver && ride && ride.status != null && ['requested', 'searching'].includes(ride.status) && !ride.driver?.id)
  const isAssignedDriver = Boolean(isDriver && ride?.driver?.id === user?.id)
  const canCancel = isResident && ride?.status != null && ['requested', 'searching', 'accepted', 'arrived'].includes(ride.status)
  const canRate = isResident && ride?.status === 'completed' && !ride?.rating

  const timeline = useMemo(
    () => normalizeTransportTimeline(ride?.timeline, [
      { key: 'requested', label: 'Requested', timestamp: ride?.created_at },
      { key: 'assigned', label: 'Assigned', timestamp: ride?.assigned_at },
      { key: 'arrived', label: 'Driver arrived', timestamp: ride?.arrived_at },
      { key: 'started', label: 'Trip started', timestamp: ride?.started_at },
      { key: 'completed', label: 'Trip completed', timestamp: ride?.completed_at },
    ]),
    [ride],
  )
  const pickupPoint: LocationPoint | null = ride?.pickup_latitude != null && ride?.pickup_longitude != null ? { lat: ride.pickup_latitude, lng: ride.pickup_longitude } : null
  const dropoffPoint: LocationPoint | null = ride?.dropoff_latitude != null && ride?.dropoff_longitude != null ? { lat: ride.dropoff_latitude, lng: ride.dropoff_longitude } : null

  const handleRideAction = (action: 'accept' | 'decline' | 'arrived' | 'start' | 'complete') => {
    if (!ride?.id) return

    setRideActionState((prev) => ({
      ...prev,
      [ride.id]: { action, pending: true, error: undefined },
    }))

    rideActionMutation.mutate({ rideId: ride.id, action }, {
      onSuccess: () => {
        setRideActionState((prev) => ({
          ...prev,
          [ride.id]: { action, pending: false, error: undefined },
        }))
      },
      onError: (error) => {
        const errorMessage = getApiErrorMessage(error, 'Unable to update ride status. Please try again.')
        setRideActionState((prev) => ({
          ...prev,
          [ride.id]: { action, pending: false, error: errorMessage },
        }))
      },
    })
  }

  return (
    <div className="space-y-5">
      <TransportPanel
        title="Ride workspace"
        description="A clearer ride-hailing style status surface with route, timeline, and contact separated into focused views."
        aside={<Link to="/ride"><Button variant="secondary">Back to rides</Button></Link>}
      >
        {isRideAccessError ? (
          <EmptyState
            title={isRideUnauthorized ? 'Please login to view this ride.' : 'You do not have access to this ride.'}
            body={isRideUnauthorized ? 'Sign in to continue and access your ride details.' : 'This ride is private or reserved for another account.'}
            action={isRideUnauthorized ? <Link to="/login"><Button>Login</Button></Link> : <Link to="/ride"><Button>Back to rides</Button></Link>}
          />
        ) : (
          <QueryState isLoading={rideQuery.isLoading} error={rideQuery.error} empty={!ride}>
            {!ride ? (
              <EmptyState title="Ride not found" body="We could not find this ride request." action={<Link to="/ride"><Button>Back</Button></Link>} />
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                          <CarFront className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Active-state focus</p>
                          <h1 className="mt-1 text-2xl font-semibold text-lokals-charcoal">{ride.ride_type === 'local_taxi' ? 'Standard local taxi' : ride.ride_type ?? 'Standard'} ride</h1>
                          <p className="mt-2 text-sm text-lokals-muted">{ride.pickup_location} to {ride.dropoff_location}</p>
                        </div>
                      </div>
                      <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                    </div>
                    {ride.status === 'accepted' && ride.estimated_eta_minutes != null ? (
                      <div className="mt-4 rounded-[22px] bg-violet-50 px-4 py-4">
                        <p className="inline-flex items-center gap-2 font-semibold text-lokals-charcoal"><Clock3 className="h-4 w-4 text-lokals-purple" />Driver en route</p>
                        <p className="mt-2 text-sm text-lokals-muted">Estimated arrival is about {ride.estimated_eta_minutes} minutes.</p>
                      </div>
                    ) : null}
                  </div>
                  <TransportSummaryCard
                    title="Trip summary"
                    items={[
                      { label: 'Fare estimate', value: ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare', accent: true },
                      { label: 'Distance', value: ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : 'Address-based estimate' },
                      { label: 'Trip purpose', value: ride.trip_purpose ?? 'General trip' },
                      { label: 'Reference', value: ride.reference_code ?? 'Pending' },
                    ]}
                  />
                </div>

                <TransportTabs items={detailTabs} value={activeTab} onChange={setActiveTab} />

                {activeTab === 'overview' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          ['Pickup', ride.pickup_location],
                          ['Destination', ride.dropoff_location],
                          ['Trip purpose', ride.trip_purpose ?? 'General trip'],
                          ['Fare estimate', ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare'],
                          ['Estimated distance', ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : 'Address-based estimate'],
                          ['Notes', ride.notes ?? 'No extra rider notes'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-[22px] bg-slate-50 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{label}</p>
                            <p className="mt-2 font-semibold text-lokals-charcoal">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(canAcceptRide || isAssignedDriver) ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">{canAcceptRide ? 'Driver response' : 'Driver workflow'}</p>
                          <p className="mt-1 text-sm text-lokals-muted">
                            {canAcceptRide ? 'Accept or decline this ride request if you can take it now.' : 'Move the active ride through arrival, start, and completion.'}
                          </p>
                          {rideActionState[ride.id]?.error ? (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                              <p>{rideActionState[ride.id]?.error}</p>
                            </div>
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {canAcceptRide ? (
                              <>
                                <Button disabled={rideActionState[ride.id]?.pending} onClick={() => handleRideAction('accept')}>
                                  {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'accept' ? 'Accepting...' : 'Accept ride'}
                                </Button>
                                <Button variant="secondary" disabled={rideActionState[ride.id]?.pending} onClick={() => handleRideAction('decline')}>
                                  {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'decline' ? 'Declining...' : 'Decline'}
                                </Button>
                              </>
                            ) : null}
                            {isAssignedDriver && ride.status === 'accepted' ? <Button disabled={rideActionState[ride.id]?.pending} onClick={() => handleRideAction('arrived')}>{rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'arrived' ? 'Updating...' : 'Mark arrived'}</Button> : null}
                            {isAssignedDriver && ride.status === 'arrived' ? <Button disabled={rideActionState[ride.id]?.pending} onClick={() => handleRideAction('start')}>{rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'start' ? 'Updating...' : 'Start trip'}</Button> : null}
                            {isAssignedDriver && ride.status === 'in_progress' ? <Button disabled={rideActionState[ride.id]?.pending} onClick={() => handleRideAction('complete')}>{rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'complete' ? 'Updating...' : 'Complete trip'}</Button> : null}
                          </div>
                        </div>
                      ) : null}

                      {canCancel ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">Cancel ride</p>
                          <div className="mt-3 flex flex-col gap-3">
                            <Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Optional reason" />
                            <Button variant="danger" disabled={cancelRide.isPending} onClick={() => cancelRide.mutate({ rideId: ride.id, reason: cancelReason || undefined })}>
                              {cancelRide.isPending ? 'Cancelling...' : 'Cancel ride'}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {canRate ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">Rate this driver</p>
                          <div className="mt-3 grid gap-3">
                            <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min="1" max="5" />
                            <TextArea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} rows={3} placeholder="Share a short note about the trip." />
                            <Button disabled={rateRide.isPending} onClick={() => rateRide.mutate({ rideId: ride.id, rating: Number(rating), comment: ratingComment || undefined })}>
                              {rateRide.isPending ? 'Saving rating...' : <span className="inline-flex items-center gap-2"><Star className="h-4 w-4" />Submit rating</span>}
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {activeTab === 'route' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <LocationPreviewMap
                        primary={pickupPoint}
                        secondary={dropoffPoint}
                        primaryLabel={ride.pickup_location}
                        secondaryLabel={ride.dropoff_location}
                      />
                    </div>
                    <TransportSummaryCard
                      title="Route context"
                      items={[
                        { label: 'Pickup', value: ride.pickup_location },
                        { label: 'Drop-off', value: ride.dropoff_location },
                        { label: 'Estimated ETA', value: ride.estimated_eta_minutes != null ? `${ride.estimated_eta_minutes} min` : 'Pending' },
                        { label: 'Distance', value: ride.estimated_distance_km ? `${ride.estimated_distance_km} km` : 'Address-based estimate' },
                      ]}
                    />
                  </div>
                ) : null}

                {activeTab === 'timeline' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="space-y-3">
                        {timeline.map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-3 rounded-[22px] bg-slate-50 px-4 py-4">
                            <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                            <p className="text-sm text-lokals-muted">{formatTransportTimestamp(item.timestamp) ?? 'Recently'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <StatusStepper steps={rideSteps} current={ride.status} updatedAt={ride.updated_at} />
                  </div>
                ) : null}

                {activeTab === 'contact' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-lokals-charcoal">{ride.driver?.name ?? 'Verified taxi operator pending'}</p>
                        {ride.driver_profile?.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lokals-green-soft px-2.5 py-1 text-[11px] font-semibold text-lokals-green">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-lokals-muted">{ride.driver?.phone ?? 'A driver contact will appear after a nearby taxi accepts your request.'}</p>
                      {ride.vehicle_label ? <p className="mt-3 text-sm text-lokals-muted">Vehicle: {ride.vehicle_label}</p> : null}
                      {ride.driver_profile?.vehicle_registration ? <p className="mt-1 text-sm text-lokals-muted">Plate: {ride.driver_profile.vehicle_registration}</p> : null}
                      {ride.driver_profile?.rating != null ? <p className="mt-1 text-sm text-lokals-muted">Driver rating: {ride.driver_profile.rating}/5</p> : null}
                      <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
                        <p className="font-semibold text-lokals-charcoal">Safety note</p>
                        <p className="mt-1 text-sm text-lokals-muted">Match the driver, vehicle, and plate before boarding. If anything feels wrong, use SOS immediately.</p>
                      </div>
                      <div className="mt-4">
                        <ContactActions
                          className="flex flex-wrap gap-2"
                          name={ride.driver?.name ?? 'Driver'}
                          phone={ride.driver?.phone}
                          conversationUserId={ride.driver?.id ?? null}
                          conversationContext="ride"
                          conversationSubject={ride.reference_code ?? `Ride ${ride.id}`}
                          whatsappMessage={`Hi, I am checking on ride ${ride.reference_code ?? ride.id}.`}
                        />
                      </div>
                      <div className="mt-3">
                        <Link to="/sos"><Button variant="danger"><AlertTriangle className="h-4 w-4" />Emergency shortcut</Button></Link>
                      </div>
                    </div>
                    <TransportSummaryCard
                      title="Ride trust"
                      items={[
                        { label: 'Passenger', value: ride.user?.name ?? 'Resident' },
                        { label: 'Trip purpose', value: ride.trip_purpose ?? 'General trip' },
                        { label: 'Current status', value: formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label), accent: true },
                        { label: 'Operator check', value: ride.driver_profile?.is_verified ? 'Verified operator' : 'Verification shown when available' },
                      ]}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </QueryState>
        )}
      </TransportPanel>
    </div>
  )
}
