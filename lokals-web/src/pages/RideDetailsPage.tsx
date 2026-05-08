import { CarFront, PhoneCall } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { useRide } from '../hooks/queries'

const rideSteps = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled']

export function RideDetailsPage() {
  const { id } = useParams()
  const rideQuery = useRide(id)
  const ride = rideQuery.data

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
                    <h2 className="text-2xl font-semibold text-lokals-charcoal">{ride.ride_type ?? 'Standard'} ride</h2>
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
                    <p className="font-semibold text-lokals-charcoal">{ride.driver?.name ?? 'Driver assignment pending'}</p>
                    <p className="text-sm text-lokals-muted">{ride.driver?.phone ?? 'A driver contact will appear after acceptance.'}</p>
                  </div>
                  {ride.driver?.phone ? (
                    <a href={`tel:${ride.driver.phone}`}>
                      <Button variant="secondary"><PhoneCall className="mr-2 h-4 w-4" />Call</Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <StatusStepper steps={rideSteps} current={ride.status} updatedAt={ride.updated_at} />
          </div>
        )}
      </QueryState>
    </div>
  )
}
