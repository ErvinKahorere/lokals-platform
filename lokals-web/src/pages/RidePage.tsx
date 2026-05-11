import type { FormEvent } from 'react'
import { CarFront, Clock3, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, Select, StatusBadge } from '../components/Ui'
import { RequestSuccessState } from '../components/transport/RequestSuccessState'
import { GlassPanel } from '../components/glass/GlassPanel'
import { isDemoMode } from '../config/appMode'
import { useCreateRide, useRides } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { navigateToLogin } from '../lib/authNavigation'
import { PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'
import type { RideItem } from '../types'

const rideOptions = [
  { name: 'Standard', eta: '3 min', baseFare: 35 },
  { name: 'Comfort', eta: '5 min', baseFare: 48 },
  { name: 'XL', eta: '7 min', baseFare: 70 },
]

const savedStops = [
  'Current location',
  'Home',
  'Work',
  'Okahandja taxi rank',
  'Okahandja Town Council',
  'Okahandja State Clinic',
  'Nau-Aib Community Hall',
  'Osona Village entrance',
]

const tripPurposes = ['Daily commute', 'Clinic visit', 'School pickup', 'Town errand', 'Late shift ride']

export function RidePage() {
  const [pickupLocation, setPickupLocation] = useState(savedStops[0])
  const [dropoffLocation, setDropoffLocation] = useState('Okahandja Town Council')
  const [rideType, setRideType] = useState(rideOptions[0].name)
  const [tripPurpose, setTripPurpose] = useState(tripPurposes[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [successItem, setSuccessItem] = useState<RideItem | null>(null)
  const createRide = useCreateRide()
  const token = useAuthStore((state) => state.token)
  const ridesQuery = useRides(Boolean(token))
  const navigate = useNavigate()

  const selectedRide = useMemo(
    () => rideOptions.find((option) => option.name === rideType) ?? rideOptions[0],
    [rideType],
  )

  const estimatedFare = useMemo(() => {
    const routeBonus = pickupLocation === dropoffLocation ? 0 : 12
    const purposeBonus = tripPurpose === 'Town errand' ? 18 : tripPurpose === 'Late shift ride' ? 20 : 0
    return selectedRide.baseFare + routeBonus + purposeBonus
  }, [dropoffLocation, pickupLocation, selectedRide.baseFare, tripPurpose])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (isDemoMode) {
      setSuccessItem({
        id: Date.now(),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        ride_type: rideType,
        trip_purpose: tripPurpose,
        fare_estimate: estimatedFare,
        status: 'requested',
      })
      return
    }

    try {
      const created = await createRide.mutateAsync({
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        ride_type: rideType,
        trip_purpose: tripPurpose,
        notes: notes.trim() || undefined,
        fare_estimate: estimatedFare,
      })
      setSuccessItem(created)
      setNotes('')
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to request a ride right now.'))
    }
  }

  return (
    <div className="space-y-5">
      <GlassPanel>
        <PageHeader
          eyebrow="Ride"
          title="Request a taxi with trusted local defaults"
          description={`Pick your route, choose a ride type, and confirm a clear fare range before sending the request in ${PILOT_TOWN}.`}
          actions={<Link to="/sos"><Button variant="danger">Open SOS</Button></Link>}
        />
      </GlassPanel>

      {token ? (
        successItem ? (
          <RequestSuccessState
            title="Ride requested"
            body="Your taxi request is now live. A nearby driver can accept and update the trip shortly."
            meta={
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Route</p>
                  <p className="mt-1 font-semibold text-lokals-charcoal">{successItem.pickup_location} to {successItem.dropoff_location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Estimate</p>
                  <p className="mt-1 font-semibold text-lokals-charcoal">N$ {successItem.fare_estimate ?? estimatedFare}</p>
                </div>
              </div>
            }
            primaryLabel="View ride status"
            onPrimary={() => navigate(`/ride/${successItem.id}`)}
            secondaryLabel="Back home"
            onSecondary={() => navigate('/')}
          />
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
              <SectionCard className="bg-white">
                <form className="space-y-4" onSubmit={submit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-lokals-charcoal">Pickup</span>
                      <Select value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)}>
                        {savedStops.map((stop) => <option key={`pickup-${stop}`} value={stop}>{stop}</option>)}
                      </Select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-lokals-charcoal">Drop-off</span>
                      <Select value={dropoffLocation} onChange={(event) => setDropoffLocation(event.target.value)}>
                        {savedStops.filter((stop) => stop !== 'Current location').map((stop) => <option key={`dropoff-${stop}`} value={stop}>{stop}</option>)}
                      </Select>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['Home', 'Work', 'Clinic'].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setDropoffLocation(label === 'Clinic' ? 'Okahandja State Clinic' : label)}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:bg-slate-200"
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-lokals-border bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Operator</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">Verified local taxi operator</p>
                    <p className="mt-1 text-sm text-lokals-muted">Ride requests are prioritised around Okahandja service corridors.</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {rideOptions.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setRideType(option.name)}
                        className={`rounded-[22px] border p-4 text-left transition ${rideType === option.name ? 'border-lokals-purple bg-violet-50 shadow-card' : 'border-lokals-border bg-white hover:border-violet-200'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-lokals-charcoal">{option.name}</span>
                          <StatusBadge value={`N$ ${option.baseFare}+`} tone={rideType === option.name ? 'accent' : 'neutral'} />
                        </div>
                        <p className="mt-2 text-sm text-lokals-muted">{option.eta}</p>
                      </button>
                    ))}
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Trip purpose</span>
                    <Select value={tripPurpose} onChange={(event) => setTripPurpose(event.target.value)}>
                      {tripPurposes.map((option) => <option key={option} value={option}>{option}</option>)}
                    </Select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Extra notes</span>
                    <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gate number, landmark, or timing note" />
                  </label>

                  {error ? <p className="text-sm font-medium text-lokals-danger">{error}</p> : null}
                  <Button className="w-full" disabled={createRide.isPending}>
                    {createRide.isPending ? 'Requesting ride...' : isDemoMode ? 'Simulate taxi request' : 'Request taxi'}
                  </Button>
                </form>
              </SectionCard>

              <SectionCard className="bg-white">
                <div className="rounded-[24px] bg-[linear-gradient(180deg,#eef2ff,#f8fafc)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Route preview</p>
                  <div className="mt-4 rounded-[20px] bg-white p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lokals-charcoal">{pickupLocation}</p>
                        <p className="text-sm text-lokals-muted">Pickup</p>
                      </div>
                    </div>
                    <div className="mx-5 my-3 h-10 border-l-2 border-dashed border-lokals-purple/40" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-lokals-charcoal">{dropoffLocation}</p>
                        <p className="text-sm text-lokals-muted">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {rideOptions.map((option) => (
                    <article key={option.name} className={`rounded-2xl border p-4 ${option.name === rideType ? 'border-violet-200 bg-violet-50' : 'border-lokals-border bg-white'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lokals-purple shadow-card">
                            <CarFront className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lokals-charcoal">{option.name}</h4>
                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-lokals-muted"><Clock3 className="h-4 w-4" />{option.eta}</p>
                          </div>
                        </div>
                        <StatusBadge value={`N$ ${option.baseFare}+`} tone={option.name === rideType ? 'accent' : 'neutral'} />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 rounded-[24px] border border-dashed border-lokals-border bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Estimated fare</p>
                  <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">N$ {estimatedFare}</p>
                  <p className="mt-3 text-sm text-lokals-muted">This range reflects the selected ride type and likely route complexity.</p>
                </div>
              </SectionCard>
            </div>

            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-lokals-charcoal">Recent ride requests</h3>
                <StatusBadge value={`${(ridesQuery.data?.data ?? []).length} total`} tone="accent" />
              </div>
              <QueryState isLoading={ridesQuery.isLoading} error={ridesQuery.error} empty={(ridesQuery.data?.data ?? []).length === 0}>
                <div className="mt-4 space-y-3">
                  {(ridesQuery.data?.data ?? []).slice(0, 5).map((ride) => (
                    <Link key={ride.id} to={`/ride/${ride.id}`} className="block rounded-2xl border border-lokals-border p-4 transition hover:border-violet-200 hover:shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} to {ride.dropoff_location}</p>
                          <p className="mt-1 text-sm text-lokals-muted">{ride.ride_type ?? 'Standard'} - {ride.trip_purpose ?? 'General trip'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lokals-charcoal">{ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare'}</p>
                          <StatusBadge value={(ride.status ?? 'requested').replaceAll('_', ' ')} tone={ride.status === 'completed' ? 'success' : ride.status === 'cancelled' ? 'danger' : 'accent'} className="mt-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </QueryState>
            </SectionCard>
          </>
        )
      ) : (
        <EmptyState
          title="Login to request a taxi"
          body="Ride requests work best with your saved profile and contact details."
          action={<Button onClick={() => navigateToLogin(navigate)}>Login</Button>}
        />
      )}
    </div>
  )
}
