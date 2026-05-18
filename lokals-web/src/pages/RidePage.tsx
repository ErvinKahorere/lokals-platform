import type { FormEvent } from 'react'
import { CarFront, ChevronDown, LocateFixed, MapPinned, ShieldCheck, UserRound } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, Select, StatusBadge } from '../components/Ui'
import { LocationPickerMap } from '../components/maps/LocationPickerMap'
import { RequestSuccessState } from '../components/transport/RequestSuccessState'
import { TransportMapHero, TransportMiniMetric, TransportPanel, TransportSummaryCard, TransportTabs } from '../components/transport/TransportSurface'
import { GlassPanel } from '../components/glass/GlassPanel'
import { isDemoMode } from '../config/appMode'
import { useCreateRide, useRides } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { navigateToLogin } from '../lib/authNavigation'
import { estimatedRideMinutes, haversineDistanceKm, type LocationPoint } from '../lib/location'
import { formatTransportStatus, transportStatusTone } from '../lib/transportStatus'
import { useAuthStore } from '../store/auth'
import type { RideItem } from '../types'

const rideOptions = [
  { name: 'Standard', eta: '3 min', baseFare: 35, detail: 'Best for everyday town trips' },
  { name: 'Comfort', eta: '5 min', baseFare: 48, detail: 'Extra room and a calmer pickup' },
  { name: 'XL', eta: '7 min', baseFare: 70, detail: 'Larger vehicle for groups or bags' },
]

const savedStops = [
  'Current location',
  'Home',
  'Work',
  'Okahandja taxi rank',
  'Okahandja Town Council',
  'Okahandja State Clinic',
  'Gross Barmen Road',
]

const tripPurposes = ['Daily commute', 'Clinic visit', 'School pickup', 'Airport trip', 'Late shift ride']

const rideTabs = [
  { label: 'Request', value: 'request' },
  { label: 'Recent Rides', value: 'recent' },
  { label: 'Saved Drivers', value: 'saved' },
  { label: 'Active Ride', value: 'active' },
]

export function RidePage() {
  const [activeTab, setActiveTab] = useState('request')
  const [pickupLocation, setPickupLocation] = useState(savedStops[0])
  const [dropoffLocation, setDropoffLocation] = useState('Okahandja Town Council')
  const [pickupPoint, setPickupPoint] = useState<LocationPoint | null>(null)
  const [dropoffPoint, setDropoffPoint] = useState<LocationPoint | null>(null)
  const [rideType, setRideType] = useState(rideOptions[0].name)
  const [tripPurpose, setTripPurpose] = useState(tripPurposes[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [successItem, setSuccessItem] = useState<RideItem | null>(null)
  const [pinTarget, setPinTarget] = useState<'pickup' | 'dropoff'>('pickup')
  const createRide = useCreateRide()
  const token = useAuthStore((state) => state.token)
  const ridesQuery = useRides(Boolean(token))
  const navigate = useNavigate()

  const selectedRide = useMemo(
    () => rideOptions.find((option) => option.name === rideType) ?? rideOptions[0],
    [rideType],
  )
  const distanceKm = useMemo(() => haversineDistanceKm(pickupPoint, dropoffPoint), [dropoffPoint, pickupPoint])
  const estimatedDurationMinutes = useMemo(() => estimatedRideMinutes(distanceKm) ?? 11, [distanceKm])
  const estimatedFare = useMemo(() => {
    const routeBonus = pickupLocation === dropoffLocation ? 0 : 12
    const purposeBonus = tripPurpose === 'Airport trip' ? 85 : tripPurpose === 'Late shift ride' ? 20 : 0
    const distanceBonus = distanceKm ? Math.round(distanceKm * 4) : 0
    return selectedRide.baseFare + routeBonus + purposeBonus + distanceBonus
  }, [distanceKm, dropoffLocation, pickupLocation, selectedRide.baseFare, tripPurpose])
  const recentRides = useMemo(() => (ridesQuery.data?.data ?? []).slice(0, 6), [ridesQuery.data?.data])
  const activeRide = useMemo(
    () => (ridesQuery.data?.data ?? []).find((ride) => !['completed', 'cancelled'].includes(String(ride.status ?? '').toLowerCase())) ?? null,
    [ridesQuery.data?.data],
  )
  const savedDrivers = useMemo(
    () => Array.from(new Map((ridesQuery.data?.data ?? []).filter((ride) => ride.driver?.id != null).map((ride) => [ride.driver?.id, ride])).values()).slice(0, 5),
    [ridesQuery.data?.data],
  )

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
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
        pickup_address: pickupLocation,
        pickup_latitude: pickupPoint?.lat,
        pickup_longitude: pickupPoint?.lng,
        dropoff_location: dropoffLocation,
        dropoff_address: dropoffLocation,
        dropoff_latitude: dropoffPoint?.lat,
        dropoff_longitude: dropoffPoint?.lng,
        ride_type: rideType,
        trip_purpose: tripPurpose,
        notes: notes.trim() || undefined,
        fare_estimate: estimatedFare,
        estimated_distance_km: distanceKm ?? undefined,
      })
      setSuccessItem(created)
      setNotes('')
      setActiveTab('active')
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to request a ride right now.'))
    }
  }, [createRide, distanceKm, dropoffLocation, dropoffPoint, estimatedFare, notes, pickupLocation, pickupPoint, rideType, tripPurpose])

  const setCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Current location is not available in this browser. Enter the address manually or use advanced map options.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupLocation('Current location (near me)')
        setPickupPoint({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        })
      },
      () => {
        setError('We could not read your location. Enter the address manually or place a pin through advanced map options.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const tabContent = (
    <>
      {activeTab === 'request' ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <TransportPanel
            title="Request a ride"
            description="Move through the route, ride type, and confirmation steps without the extra admin-style clutter."
            aside={<StatusBadge value={`${selectedRide.eta} pickup`} tone="accent" />}
          >
            <form className="space-y-5" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">1. Pickup</span>
                  <Input value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} placeholder="Enter pickup address or landmark" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">2. Destination</span>
                  <Input value={dropoffLocation} onChange={(event) => setDropoffLocation(event.target.value)} placeholder="Enter destination address or landmark" />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={setCurrentLocation}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <LocateFixed className="h-4 w-4" />
                  Use current location
                </button>
                {['Home', 'Work', 'Taxi rank', 'Clinic'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const nextValue = label === 'Taxi rank' ? 'Okahandja taxi rank' : label === 'Clinic' ? 'Okahandja State Clinic' : label
                      setDropoffLocation(nextValue)
                    }}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:bg-slate-200"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <details className="group rounded-[24px] border border-lokals-border bg-slate-50 px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">Advanced map options</p>
                    <p className="mt-1 text-sm text-lokals-muted">Use a single map surface to fine-tune pickup or destination pins when needed.</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-lokals-muted transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Edit pickup pin', value: 'pickup' as const },
                      { label: 'Edit destination pin', value: 'dropoff' as const },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setPinTarget(item.value)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${pinTarget === item.value ? 'bg-lokals-purple text-white' : 'bg-white text-lokals-charcoal shadow-soft'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <LocationPickerMap
                    label={pinTarget === 'pickup' ? 'Pickup pin' : 'Destination pin'}
                    value={pinTarget === 'pickup' ? pickupPoint : dropoffPoint}
                    onChange={(value) => {
                      if (pinTarget === 'pickup') {
                        setPickupPoint(value)
                        return
                      }
                      setDropoffPoint(value)
                    }}
                    helpText={pinTarget === 'pickup' ? 'Tap to place a more precise pickup pin. Manual address entry above still works.' : 'Tap to place a more precise destination pin. Manual address entry above still works.'}
                  />
                </div>
              </details>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-lokals-charcoal">3. Ride type</p>
                    <p className="text-sm text-lokals-muted">Compact options with pricing and pickup timing up front.</p>
                  </div>
                  <StatusBadge value={`N$ ${selectedRide.baseFare}+`} tone="accent" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {rideOptions.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setRideType(option.name)}
                      className={`rounded-[24px] border p-4 text-left transition ${rideType === option.name ? 'border-lokals-purple bg-violet-50 shadow-card' : 'border-lokals-border bg-white hover:border-violet-200'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${rideType === option.name ? 'bg-white text-lokals-purple' : 'bg-slate-50 text-lokals-charcoal'}`}>
                          <CarFront className="h-5 w-5" />
                        </div>
                        <StatusBadge value={option.eta} tone={rideType === option.name ? 'accent' : 'neutral'} />
                      </div>
                      <p className="mt-4 font-semibold text-lokals-charcoal">{option.name}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{option.detail}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">4. Trip purpose</span>
                  <Select value={tripPurpose} onChange={(event) => setTripPurpose(event.target.value)}>
                    {tripPurposes.map((option) => <option key={option} value={option}>{option}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">Notes</span>
                  <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Gate number, landmark, or timing note" />
                </label>
              </div>

              {error ? <p className="text-sm font-medium text-lokals-danger">{error}</p> : null}
              <div className="rounded-[24px] bg-lokals-charcoal p-4 text-white shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">5. Confirm</p>
                    <p className="mt-1 text-xl font-semibold">Request {selectedRide.name.toLowerCase()} ride</p>
                    <p className="mt-1 text-sm text-white/70">The route stays editable until you submit. Maps never block the request.</p>
                  </div>
                  <Button className="min-w-[220px]" disabled={createRide.isPending}>
                    {createRide.isPending ? 'Requesting ride...' : isDemoMode ? 'Simulate taxi request' : 'Confirm ride request'}
                  </Button>
                </div>
              </div>
            </form>
          </TransportPanel>

          <TransportSummaryCard
            title="Trip summary"
            sticky
            items={[
              { label: 'Route', value: pickupLocation === dropoffLocation ? pickupLocation : `${pickupLocation} -> ${dropoffLocation}` },
              { label: 'Ride type', value: selectedRide.name },
              { label: 'Estimated fare', value: `N$ ${estimatedFare}`, accent: true },
              { label: 'Estimated time', value: `${estimatedDurationMinutes} min` },
            ]}
            cta={
              <div className="grid gap-3">
                <TransportMiniMetric label="Distance" value={distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'Address-based estimate'} />
                <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-lokals-muted">
                  Pickup and drop-off can be typed manually first, then refined with advanced map options only if needed.
                </div>
              </div>
            }
          />
        </div>
      ) : null}

      {activeTab === 'recent' ? (
        <TransportPanel title="Recent rides" description="Your latest ride requests with clearer status and next-action context.">
          <QueryState isLoading={ridesQuery.isLoading} error={ridesQuery.error} empty={recentRides.length === 0}>
            <div className="space-y-3">
              {recentRides.map((ride) => (
                <Link key={ride.id} to={`/ride/${ride.id}`} className="block rounded-[24px] border border-lokals-border bg-white px-4 py-4 transition hover:border-violet-200 hover:shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} to {ride.dropoff_location}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{ride.ride_type ?? 'Standard'} | {ride.trip_purpose ?? 'General trip'} | {ride.driver?.name ?? 'Waiting for driver'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lokals-charcoal">{ride.fare_estimate ? `N$ ${ride.fare_estimate}` : 'Open fare'}</p>
                      <StatusBadge value={formatTransportStatus(ride.tracking_status ?? ride.status, ride.status_label)} tone={transportStatusTone(ride.status)} className="mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </QueryState>
        </TransportPanel>
      ) : null}

      {activeTab === 'saved' ? (
        <TransportPanel title="Saved drivers" description="Drivers from completed or accepted rides that residents are likely to contact again.">
          {savedDrivers.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {savedDrivers.map((ride) => (
                <div key={ride.id} className="rounded-[24px] border border-lokals-border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-lokals-charcoal">{ride.driver?.name ?? 'Saved driver'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{ride.vehicle_label ?? ride.driver_profile?.vehicle_registration ?? 'Local taxi operator'}</p>
                      <p className="mt-2 text-sm text-lokals-muted">{ride.driver?.phone ?? 'Phone appears once assigned on a live ride.'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved drivers yet"
              body="Once you complete rides with trusted local operators, they will appear here for faster repeat bookings."
              action={<Button onClick={() => setActiveTab('request')}>Request a ride</Button>}
            />
          )}
        </TransportPanel>
      ) : null}

      {activeTab === 'active' ? (
        <TransportPanel title="Active ride" description="The ride that currently needs attention, with the next action kept obvious.">
          {successItem ? (
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
          ) : activeRide ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[24px] border border-lokals-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Live trip</p>
                    <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">{activeRide.pickup_location} to {activeRide.dropoff_location}</h3>
                    <p className="mt-2 text-sm text-lokals-muted">{activeRide.driver?.name ?? 'Waiting for driver'} | {activeRide.ride_type ?? 'Standard'} | {activeRide.trip_purpose ?? 'General trip'}</p>
                  </div>
                  <StatusBadge value={formatTransportStatus(activeRide.tracking_status ?? activeRide.status, activeRide.status_label)} tone={transportStatusTone(activeRide.status)} />
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate(`/ride/${activeRide.id}`)}>Open ride workspace</Button>
                </div>
              </div>
              <TransportSummaryCard
                title="Next action"
                items={[
                  { label: 'Status', value: formatTransportStatus(activeRide.tracking_status ?? activeRide.status, activeRide.status_label), accent: true },
                  { label: 'Fare', value: activeRide.fare_estimate ? `N$ ${activeRide.fare_estimate}` : 'Open fare' },
                  { label: 'Driver', value: activeRide.driver?.name ?? 'Pending assignment' },
                ]}
              />
            </div>
          ) : (
            <EmptyState
              title="No active ride"
              body="When a ride is searching, accepted, or in progress, it will show up here with the next action made obvious."
              action={<Button onClick={() => setActiveTab('request')}>Start a ride request</Button>}
            />
          )}
        </TransportPanel>
      ) : null}
    </>
  )

  return (
    <div className="space-y-5">
      <GlassPanel>
        <PageHeader
          eyebrow="Ride"
          title="A calmer, guided ride request flow"
          description="One dominant map surface, a clearer trip hierarchy, and focused next actions instead of stacked transport forms."
          actions={<Link to="/sos"><Button variant="danger">Open SOS</Button></Link>}
        />
      </GlassPanel>

      <TransportMapHero
        eyebrow="Okahandja transport"
        title="Set the route first, then confirm the ride"
        description="The route preview stays primary, while advanced pin placement only opens when you really need it."
        primary={pickupPoint}
        secondary={dropoffPoint}
        primaryLabel={pickupLocation}
        secondaryLabel={dropoffLocation}
        meta={
          <div className="grid gap-3 sm:grid-cols-2">
            <TransportMiniMetric label="Estimated time" value={`${estimatedDurationMinutes} min`} />
            <TransportMiniMetric label="Estimated fare" value={`N$ ${estimatedFare}`} />
          </div>
        }
      />

      <TransportTabs items={rideTabs} value={activeTab} onChange={setActiveTab} />

      {token ? (
        tabContent
      ) : (
        <EmptyState
          title="Login to request a taxi"
          body="Ride requests work best with your saved profile and contact details."
          action={<Button onClick={() => navigateToLogin(navigate)}>Login</Button>}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'One route surface', body: 'The route preview now does the orientation work first, before you ever open advanced controls.', icon: MapPinned },
          { title: 'Fewer repeated controls', body: 'Current location stays visible once, while pin placement lives in an optional advanced drawer.', icon: LocateFixed },
          { title: 'Clear confirm step', body: 'Pricing, timing, and the primary CTA stay grouped so the request flow feels guided instead of stacked.', icon: ShieldCheck },
        ].map((item) => (
          <div key={item.title} className="rounded-[24px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-semibold text-lokals-charcoal">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-lokals-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
