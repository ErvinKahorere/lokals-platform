import { AlertCircle, CarFront, Clock3, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ContactActions } from '../components/experience/ContactActions'
import { Button, EmptyState, Input, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { useCancelRide, useDriverRideAction, useRateRide, useRide } from '../hooks/queries'
import { formatTransportStatus, formatTransportTimestamp, normalizeTransportTimeline, transportStatusTone } from '../lib/transportStatus'
import { getApiErrorMessage } from '../lib/api'
import { useAuthStore } from '../store/auth'

const rideSteps = ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']

export function RideDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const rideQuery = useRide(id)
  const ride = rideQuery.data
  const cancelRide = useCancelRide()
  const rateRide = useRateRide()
  const rideActionMutation = useDriverRideAction()
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
  const canAcceptRide = Boolean(isDriver && ride && ['requested', 'searching'].includes(ride.status) && !ride.driver_id)
  const isAssignedDriver = Boolean(isDriver && ride?.driver_id === user?.id)
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
      <SectionCard className="bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Ride request</p>
            <h1 className="mt-1 text-3xl font-semibold text-lokals-charcoal">Track your taxi request</h1>
          </div>
          <Link to="/ride"><Button variant="secondary">Back to rides</Button></Link>
        </div>
      </SectionCard>

      {isRideAccessError ? (
        <SectionCard className="bg-white">
          <EmptyState
            title={isRideUnauthorized ? 'Please login to view this ride.' : 'You don’t have access to this ride.'}
            body={isRideUnauthorized ? 'Sign in to continue and access your ride details.' : 'This ride is private or reserved for another account.'}
            action={isRideUnauthorized ? <Link to="/login"><Button>Login</Button></Link> : <Link to="/ride"><Button>Back to rides</Button></Link>}
          />
        </SectionCard>
      ) : (
        <QueryState isLoading={rideQuery.isLoading} error={rideQuery.error} empty={!ride}>
          {!ride ? (
            <EmptyState title="Ride not found" body="We could not find this ride request." action={<Link to="/ride"><Button>Back</Button></Link>} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <SectionCard className="bg-white">
                <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <CarFront className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-lokals-charcoal">{ride.ride_type === 'local_taxi' ? 'Standard local taxi' : ride.ride_type ?? 'Standard'} ride</h2>
                    <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} />
                  </div>
                  <p className="mt-3 text-sm text-lokals-muted">{ride.pickup_location} to {ride.dropoff_location}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ride.reference_code ? <StatusBadge value={ride.reference_code} tone="neutral" /> : null}
                    {ride.estimated_eta_minutes != null ? <StatusBadge value={`ETA ${ride.estimated_eta_minutes} min`} tone="accent" /> : null}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Pickup</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{ride.pickup_location}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Destination</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{ride.dropoff_location}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Trip purpose</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{ride.trip_purpose ?? 'General trip'}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Fare estimate</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare'}</p>
                </article>
              </div>

              {ride.notes ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Notes</p>
                  <p className="mt-2 text-sm text-lokals-charcoal">{ride.notes}</p>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{ride.driver?.name ?? 'Verified taxi operator pending'}</p>
                    <p className="text-sm text-lokals-muted">{ride.driver?.phone ?? 'A driver contact will appear after a nearby taxi accepts your request.'}</p>
                    {ride.vehicle_label ? <p className="mt-1 text-sm text-lokals-muted">Vehicle: {ride.vehicle_label}</p> : null}
                    {ride.driver_profile?.vehicle_registration ? <p className="mt-1 text-sm text-lokals-muted">Plate: {ride.driver_profile.vehicle_registration}</p> : null}
                    {ride.driver_profile?.rating != null ? <p className="mt-1 text-sm text-lokals-muted">Driver rating: {ride.driver_profile.rating}/5</p> : null}
                  </div>
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
              </div>

              {(canAcceptRide || isAssignedDriver) ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{canAcceptRide ? 'Driver response' : 'Driver workflow'}</p>
                      <p className="mt-2 text-sm text-lokals-muted">
                        {canAcceptRide
                          ? 'Accept this ride request or decline it if you are unavailable.'
                          : 'Update the ride status as you progress through pickup and drop-off.'}
                      </p>
                    </div>
                  </div>
                  {rideActionState[ride.id]?.error ? (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{rideActionState[ride.id]?.error}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canAcceptRide ? (
                      <>
                        <Button
                          className="min-h-9 px-3 py-2 text-xs"
                          disabled={rideActionState[ride.id]?.pending}
                          onClick={() => handleRideAction('accept')}
                        >
                          {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'accept' ? 'Accepting…' : 'Accept ride'}
                        </Button>
                        <Button
                          className="min-h-9 px-3 py-2 text-xs"
                          variant="secondary"
                          disabled={rideActionState[ride.id]?.pending}
                          onClick={() => handleRideAction('decline')}
                        >
                          {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'decline' ? 'Declining…' : 'Decline'}
                        </Button>
                      </>
                    ) : null}
                    {isAssignedDriver && ride.status === 'accepted' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={rideActionState[ride.id]?.pending}
                        onClick={() => handleRideAction('arrived')}
                      >
                        {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'arrived' ? 'Updating…' : 'Mark arrived'}
                      </Button>
                    ) : null}
                    {isAssignedDriver && ride.status === 'arrived' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={rideActionState[ride.id]?.pending}
                        onClick={() => handleRideAction('start')}
                      >
                        {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'start' ? 'Updating…' : 'Start trip'}
                      </Button>
                    ) : null}
                    {isAssignedDriver && ride.status === 'in_progress' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={rideActionState[ride.id]?.pending}
                        onClick={() => handleRideAction('complete')}
                      >
                        {rideActionState[ride.id]?.pending && rideActionState[ride.id]?.action === 'complete' ? 'Updating…' : 'Complete trip'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {ride.status === 'accepted' && ride.estimated_eta_minutes != null ? (
                <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50 p-4">
                  <div className="flex items-center gap-2 text-lokals-charcoal">
                    <Clock3 className="h-4 w-4 text-lokals-purple" />
                    <p className="font-semibold">Driver en route</p>
                  </div>
                  <p className="mt-2 text-sm text-lokals-muted">
                    Your driver is on the way. Estimated arrival is about {ride.estimated_eta_minutes} minutes.
                  </p>
                </div>
              ) : null}

              {timeline.length ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Status timeline</p>
                  <div className="mt-3 space-y-3">
                    {timeline.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                        <p className="text-sm text-lokals-muted">{formatTransportTimestamp(item.timestamp) ?? 'Recently'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {canCancel ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="font-semibold text-lokals-charcoal">Cancel this ride</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Optional reason" />
                    <Button variant="danger" disabled={cancelRide.isPending} onClick={() => (ride?.id ? cancelRide.mutate({ rideId: ride.id, reason: cancelReason || undefined }) : undefined)}>
                      {cancelRide.isPending ? 'Cancelling...' : 'Cancel ride'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canRate ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="font-semibold text-lokals-charcoal">Rate this driver</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                    <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min="1" max="5" />
                    <TextArea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} rows={3} placeholder="Share a short note about the trip." />
                  </div>
                  <div className="mt-3">
                    <Button disabled={rateRide.isPending} onClick={() => (ride?.id ? rateRide.mutate({ rideId: ride.id, rating: Number(rating), comment: ratingComment || undefined }) : undefined)}>
                      {rateRide.isPending ? 'Saving rating...' : <span className="inline-flex items-center gap-2"><Star className="h-4 w-4" />Submit rating</span>}
                    </Button>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <StatusStepper steps={rideSteps} current={ride.status} updatedAt={ride.updated_at} />
          </div>
            )}
          </QueryState>
      )}
    </div>
  )
}
