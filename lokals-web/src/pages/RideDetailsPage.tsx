import { CarFront, PhoneCall, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { useCancelRide, useRateRide, useRide } from '../hooks/queries'
import { useAuthStore } from '../store/auth'

const rideSteps = ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']

function formatTimestamp(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleString()
}

export function RideDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const rideQuery = useRide(id)
  const ride = rideQuery.data
  const cancelRide = useCancelRide()
  const rateRide = useRateRide()
  const [cancelReason, setCancelReason] = useState('')
  const [rating, setRating] = useState('5')
  const [ratingComment, setRatingComment] = useState('')

  const isResident = ride?.user?.id != null && ride.user.id === user?.id
  const canCancel = isResident && ride?.status != null && ['requested', 'searching', 'accepted', 'arrived'].includes(ride.status)
  const canRate = isResident && ride?.status === 'completed' && !ride?.rating

  const timeline = [
    { label: 'Requested', timestamp: ride?.created_at },
    { label: 'Assigned', timestamp: ride?.assigned_at },
    { label: 'Driver arrived', timestamp: ride?.arrived_at },
    { label: 'Trip started', timestamp: ride?.started_at },
    { label: 'Trip completed', timestamp: ride?.completed_at },
  ].filter((item) => item.timestamp)

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
                    <StatusBadge value={(ride.status ?? 'requested').replaceAll('_', ' ')} tone={ride.status === 'cancelled' ? 'danger' : ride.status === 'completed' ? 'success' : 'accent'} />
                  </div>
                  <p className="mt-3 text-sm text-lokals-muted">{ride.pickup_location} to {ride.dropoff_location}</p>
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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{ride.driver?.name ?? 'Verified taxi operator pending'}</p>
                    <p className="text-sm text-lokals-muted">{ride.driver?.phone ?? 'A driver contact will appear after a nearby taxi accepts your request.'}</p>
                    {ride.vehicle_label ? <p className="mt-1 text-sm text-lokals-muted">Vehicle: {ride.vehicle_label}</p> : null}
                  </div>
                  {ride.driver?.phone ? (
                    <a href={`tel:${ride.driver.phone}`}>
                      <Button variant="secondary"><PhoneCall className="mr-2 h-4 w-4" />Call</Button>
                    </a>
                  ) : null}
                </div>
              </div>

              {timeline.length ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Status timeline</p>
                  <div className="mt-3 space-y-3">
                    {timeline.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                        <p className="text-sm text-lokals-muted">{formatTimestamp(item.timestamp) ?? 'Recently'}</p>
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
                    <Button variant="danger" disabled={cancelRide.isPending} onClick={() => ride.id ? cancelRide.mutate({ rideId: ride.id, reason: cancelReason || undefined }) : undefined}>
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
                    <Button disabled={rateRide.isPending} onClick={() => ride.id ? rateRide.mutate({ rideId: ride.id, rating: Number(rating), comment: ratingComment || undefined }) : undefined}>
                      {rateRide.isPending ? 'Saving rating...' : <><Star className="mr-2 h-4 w-4" />Submit rating</>}
                    </Button>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <StatusStepper steps={rideSteps} current={ride.status} updatedAt={ride.updated_at} />
          </div>
        )}
      </QueryState>
    </div>
  )
}
