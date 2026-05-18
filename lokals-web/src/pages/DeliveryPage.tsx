import type { FormEvent } from 'react'
import { ChevronDown, LocateFixed, MapPinned, Package, ShieldCheck, Truck, UserRound } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, Select, StatusBadge, TextArea } from '../components/Ui'
import { LocationPickerMap } from '../components/maps/LocationPickerMap'
import { RequestSuccessState } from '../components/transport/RequestSuccessState'
import { TransportMapHero, TransportMiniMetric, TransportPanel, TransportSummaryCard, TransportTabs } from '../components/transport/TransportSurface'
import { GlassPanel } from '../components/glass/GlassPanel'
import { isDemoMode } from '../config/appMode'
import { useCreateDelivery, useDeliveries } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { navigateToLogin } from '../lib/authNavigation'
import { estimatedDeliveryMinutes, haversineDistanceKm, type LocationPoint } from '../lib/location'
import { formatTransportStatus, transportStatusTone } from '../lib/transportStatus'
import { useAuthStore } from '../store/auth'
import type { DeliveryItem } from '../types'

const parcelSizes = [
  { value: 'small', label: 'Small envelope', detail: 'Light documents or medicine', estimate: 45 },
  { value: 'medium', label: 'Medium parcel', detail: 'Groceries, gifts, or boxed goods', estimate: 75 },
  { value: 'large', label: 'Large box', detail: 'Bulkier items needing extra care', estimate: 120 },
]

const quickLocations = ['Home', 'Work', 'Okahandja taxi rank', 'Okahandja State Clinic', 'Okahandja Town Council', 'Five Rand']
const urgencyOptions = ['standard', 'express', 'priority']

const deliveryTabs = [
  { label: 'New Delivery', value: 'request' },
  { label: 'Recent Deliveries', value: 'recent' },
  { label: 'Saved Routes', value: 'saved' },
  { label: 'Active Delivery', value: 'active' },
]

export function DeliveryPage() {
  const [activeTab, setActiveTab] = useState('request')
  const [pickupLocation, setPickupLocation] = useState(quickLocations[0])
  const [dropoffLocation, setDropoffLocation] = useState(quickLocations[5])
  const [pickupPoint, setPickupPoint] = useState<LocationPoint | null>(null)
  const [dropoffPoint, setDropoffPoint] = useState<LocationPoint | null>(null)
  const [parcelSize, setParcelSize] = useState('medium')
  const [urgency, setUrgency] = useState('standard')
  const [weightKg, setWeightKg] = useState('2')
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [successItem, setSuccessItem] = useState<DeliveryItem | null>(null)
  const [pinTarget, setPinTarget] = useState<'pickup' | 'dropoff'>('pickup')
  const createDelivery = useCreateDelivery()
  const token = useAuthStore((state) => state.token)
  const deliveriesQuery = useDeliveries(Boolean(token))
  const navigate = useNavigate()

  const selectedParcel = useMemo(
    () => parcelSizes.find((item) => item.value === parcelSize) ?? parcelSizes[1],
    [parcelSize],
  )
  const distanceKm = useMemo(() => haversineDistanceKm(pickupPoint, dropoffPoint), [dropoffPoint, pickupPoint])
  const estimatedDurationMinutes = useMemo(() => estimatedDeliveryMinutes(distanceKm) ?? 18, [distanceKm])
  const estimate = useMemo(() => {
    const urgencyBonus = urgency === 'express' ? 25 : urgency === 'priority' ? 40 : 0
    const weightBonus = Number(weightKg) > 5 ? 18 : Number(weightKg) > 2 ? 10 : 0
    const distanceBonus = distanceKm ? Math.round(distanceKm * 4) : 0
    return selectedParcel.estimate + urgencyBonus + weightBonus + distanceBonus
  }, [distanceKm, selectedParcel.estimate, urgency, weightKg])
  const recentDeliveries = useMemo(() => (deliveriesQuery.data?.data ?? []).slice(0, 6), [deliveriesQuery.data?.data])
  const activeDelivery = useMemo(
    () => (deliveriesQuery.data?.data ?? []).find((delivery) => !['delivered', 'cancelled'].includes(String(delivery.status ?? '').toLowerCase())) ?? null,
    [deliveriesQuery.data?.data],
  )
  const savedRoutes = useMemo(
    () => Array.from(new Map((deliveriesQuery.data?.data ?? []).map((delivery) => [`${delivery.pickup_address ?? delivery.pickup_location}|${delivery.dropoff_address ?? delivery.dropoff_location}`, delivery])).values()).slice(0, 5),
    [deliveriesQuery.data?.data],
  )

  const submit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const description = String(form.get('parcel_description') ?? '').trim()

    if (!description) {
      setError('Add a short item description first.')
      return
    }

    if (isDemoMode) {
      setSuccessItem({
        id: Date.now(),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        parcel_description: description,
        parcel_size: parcelSize,
        urgency,
        weight_kg: weightKg,
        estimated_price: estimate,
        status: 'requested',
      })
      setActiveTab('active')
      return
    }

    const payload = new FormData()
    payload.append('pickup_location', pickupLocation)
    payload.append('pickup_address', pickupLocation)
    payload.append('dropoff_location', dropoffLocation)
    payload.append('dropoff_address', dropoffLocation)
    payload.append('parcel_description', description)
    payload.append('parcel_size', parcelSize)
    payload.append('estimated_price', String(estimate))
    payload.append('urgency', urgency)
    payload.append('weight_kg', weightKg)
    if (pickupPoint) {
      payload.append('pickup_latitude', String(pickupPoint.lat))
      payload.append('pickup_longitude', String(pickupPoint.lng))
    }
    if (dropoffPoint) {
      payload.append('dropoff_latitude', String(dropoffPoint.lat))
      payload.append('dropoff_longitude', String(dropoffPoint.lng))
    }
    if (notes.trim()) {
      payload.append('notes', notes.trim())
    }
    const file = form.get('photo')
    if (file instanceof File && file.size > 0) {
      payload.append('photo', file)
    }

    try {
      const created = await createDelivery.mutateAsync(payload)
      setSuccessItem(created)
      setNotes('')
      setPreview('')
      setActiveTab('active')
      event.currentTarget.reset()
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to request delivery right now.'))
    }
  }, [createDelivery, dropoffLocation, dropoffPoint, estimate, notes, parcelSize, pickupLocation, pickupPoint, urgency, weightKg])

  const setCurrentPickup = useCallback(() => {
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
            title="New delivery"
            description="Keep pickup, parcel details, estimate, and confirmation in one guided flow instead of a long stacked request form."
            aside={<StatusBadge value={`${selectedParcel.label} selected`} tone="accent" />}
          >
            <form className="space-y-5" onSubmit={submit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">1. Pickup</span>
                  <Input value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)} placeholder="Enter pickup address or landmark" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-lokals-charcoal">Drop-off</span>
                  <Input value={dropoffLocation} onChange={(event) => setDropoffLocation(event.target.value)} placeholder="Enter drop-off address or landmark" />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={setCurrentPickup}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <LocateFixed className="h-4 w-4" />
                  Use current location
                </button>
                {quickLocations.slice(0, 4).map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => setDropoffLocation(location)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:bg-slate-200"
                  >
                    {location}
                  </button>
                ))}
              </div>

              <details className="group rounded-[24px] border border-lokals-border bg-slate-50 px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">Advanced map options</p>
                    <p className="mt-1 text-sm text-lokals-muted">One optional pin-placement surface for pickup or drop-off, without duplicating route maps.</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-lokals-muted transition group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Edit pickup pin', value: 'pickup' as const },
                      { label: 'Edit drop-off pin', value: 'dropoff' as const },
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
                    label={pinTarget === 'pickup' ? 'Pickup pin' : 'Drop-off pin'}
                    value={pinTarget === 'pickup' ? pickupPoint : dropoffPoint}
                    onChange={(value) => {
                      if (pinTarget === 'pickup') {
                        setPickupPoint(value)
                        return
                      }
                      setDropoffPoint(value)
                    }}
                    helpText={pinTarget === 'pickup' ? 'Tap to place a more precise pickup pin. Manual address entry above still works.' : 'Tap to place a more precise drop-off pin. Manual address entry above still works.'}
                  />
                </div>
              </details>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-lokals-charcoal">2. Parcel details</p>
                  <p className="text-sm text-lokals-muted">Cleaner parcel sizing, urgency, and notes with less visual noise.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {parcelSizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setParcelSize(size.value)}
                      className={`rounded-[24px] border p-4 text-left transition ${parcelSize === size.value ? 'border-lokals-purple bg-violet-50 shadow-card' : 'border-lokals-border bg-white hover:border-violet-200'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${parcelSize === size.value ? 'bg-white text-lokals-purple' : 'bg-slate-50 text-lokals-charcoal'}`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <StatusBadge value={`N$ ${size.estimate}`} tone={parcelSize === size.value ? 'accent' : 'neutral'} />
                      </div>
                      <p className="mt-4 font-semibold text-lokals-charcoal">{size.label}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{size.detail}</p>
                    </button>
                  ))}
                </div>
                <TextArea name="parcel_description" placeholder="What are you sending?" rows={3} required />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Urgency</span>
                    <Select value={urgency} onChange={(event) => setUrgency(event.target.value)}>
                      {urgencyOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Weight (kg)</span>
                    <Input value={weightKg} onChange={(event) => setWeightKg(event.target.value)} type="number" min="0.1" step="0.1" />
                  </label>
                </div>
                <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional handoff notes or landmarks" rows={3} />
              </div>

              <div className="rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">Parcel photo</p>
                    <p className="mt-1 text-sm text-lokals-muted">Optional proof or recognition aid for fragile or high-value items.</p>
                  </div>
                  <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal shadow-soft">
                    {preview ? 'Change photo' : 'Add photo'}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        setPreview(file ? URL.createObjectURL(file) : '')
                      }}
                    />
                  </label>
                </div>
                {preview ? <img src={preview} alt="Parcel preview" className="mt-4 h-48 w-full rounded-[20px] object-cover" /> : null}
              </div>

              {error ? <p className="text-sm font-medium text-lokals-danger">{error}</p> : null}
              <div className="rounded-[24px] bg-lokals-charcoal p-4 text-white shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">3. Confirm</p>
                    <p className="mt-1 text-xl font-semibold">Request courier pickup</p>
                    <p className="mt-1 text-sm text-white/70">The estimate stays visible, while maps remain optional and non-blocking.</p>
                  </div>
                  <Button className="min-w-[220px]" disabled={createDelivery.isPending}>
                    {createDelivery.isPending ? 'Requesting delivery...' : isDemoMode ? 'Simulate delivery request' : 'Confirm delivery request'}
                  </Button>
                </div>
              </div>
            </form>
          </TransportPanel>

          <TransportSummaryCard
            title="Delivery summary"
            sticky
            items={[
              { label: 'Route', value: pickupLocation === dropoffLocation ? pickupLocation : `${pickupLocation} -> ${dropoffLocation}` },
              { label: 'Parcel size', value: selectedParcel.label },
              { label: 'Estimated total', value: `N$ ${estimate}`, accent: true },
              { label: 'Urgency', value: urgency.replaceAll('_', ' ') },
            ]}
            cta={
              <div className="grid gap-3">
                <TransportMiniMetric label="Estimated time" value={`${estimatedDurationMinutes} min`} />
                <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-lokals-muted">
                  Add map pins only if the route needs more precision. Manual addresses remain the primary flow.
                </div>
              </div>
            }
          />
        </div>
      ) : null}

      {activeTab === 'recent' ? (
        <TransportPanel title="Recent deliveries" description="Your latest parcel requests with clearer status and delivery context.">
          <QueryState isLoading={deliveriesQuery.isLoading} error={deliveriesQuery.error} empty={recentDeliveries.length === 0}>
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <Link key={delivery.id} to={`/delivery/${delivery.id}`} className="block rounded-[24px] border border-lokals-border bg-white px-4 py-4 transition hover:border-violet-200 hover:shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-lokals-charcoal">{delivery.pickup_address ?? delivery.pickup_location} to {delivery.dropoff_address ?? delivery.dropoff_location}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{delivery.parcel_description ?? delivery.item_description ?? 'Parcel request'} | {delivery.driver?.name ?? 'Waiting for courier'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lokals-charcoal">{delivery.estimated_price || delivery.price ? `N$ ${delivery.estimated_price ?? delivery.price}` : 'Open fare'}</p>
                      <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} className="mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </QueryState>
        </TransportPanel>
      ) : null}

      {activeTab === 'saved' ? (
        <TransportPanel title="Saved routes" description="Recent pickup and drop-off combinations for repeat parcel requests.">
          {savedRoutes.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {savedRoutes.map((delivery) => (
                <button
                  key={delivery.id}
                  type="button"
                  onClick={() => {
                    setPickupLocation(delivery.pickup_address ?? delivery.pickup_location ?? pickupLocation)
                    setDropoffLocation(delivery.dropoff_address ?? delivery.dropoff_location ?? dropoffLocation)
                    setActiveTab('request')
                  }}
                  className="rounded-[24px] border border-lokals-border bg-white p-4 text-left transition hover:border-violet-200 hover:shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-semibold text-lokals-charcoal">{delivery.pickup_address ?? delivery.pickup_location}</p>
                  <p className="mt-1 text-sm text-lokals-muted">to {delivery.dropoff_address ?? delivery.dropoff_location}</p>
                  <p className="mt-3 text-sm text-lokals-muted">Tap to reuse this route in a new delivery request.</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No saved routes yet"
              body="When you repeat local pickup and drop-off pairs, they will appear here for faster delivery requests."
              action={<Button onClick={() => setActiveTab('request')}>Create a delivery</Button>}
            />
          )}
        </TransportPanel>
      ) : null}

      {activeTab === 'active' ? (
        <TransportPanel title="Active delivery" description="The delivery that currently needs attention, with the next action kept obvious.">
          {successItem ? (
            <RequestSuccessState
              title="Delivery requested"
              body="Your parcel request is in the queue. A nearby driver can confirm shortly."
              meta={
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Route</p>
                    <p className="mt-1 font-semibold text-lokals-charcoal">{successItem.pickup_location} to {successItem.dropoff_location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Estimate</p>
                    <p className="mt-1 font-semibold text-lokals-charcoal">N$ {successItem.estimated_price ?? estimate}</p>
                  </div>
                </div>
              }
              primaryLabel="View status"
              onPrimary={() => navigate(`/delivery/${successItem.id}`)}
              secondaryLabel="Back home"
              onSecondary={() => navigate('/')}
            />
          ) : activeDelivery ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[24px] border border-lokals-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Live delivery</p>
                    <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">{activeDelivery.pickup_address ?? activeDelivery.pickup_location} to {activeDelivery.dropoff_address ?? activeDelivery.dropoff_location}</h3>
                    <p className="mt-2 text-sm text-lokals-muted">{activeDelivery.parcel_description ?? activeDelivery.item_description ?? 'Parcel request'} | {activeDelivery.driver?.name ?? 'Waiting for courier'}</p>
                  </div>
                  <StatusBadge value={formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label)} tone={transportStatusTone(activeDelivery.status)} />
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate(`/delivery/${activeDelivery.id}`)}>Open delivery workspace</Button>
                </div>
              </div>
              <TransportSummaryCard
                title="Next action"
                items={[
                  { label: 'Status', value: formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label), accent: true },
                  { label: 'Estimate', value: activeDelivery.estimated_price || activeDelivery.price ? `N$ ${activeDelivery.estimated_price ?? activeDelivery.price}` : 'Open fare' },
                  { label: 'Courier', value: activeDelivery.driver?.name ?? 'Pending assignment' },
                ]}
              />
            </div>
          ) : (
            <EmptyState
              title="No active delivery"
              body="When a delivery is searching, accepted, or in transit, it will show up here with a clearer next action."
              action={<Button onClick={() => setActiveTab('request')}>Start a delivery request</Button>}
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
          eyebrow="Delivery"
          title="A simpler parcel request flow"
          description="One route surface, cleaner parcel options, and a stronger estimate-and-confirm sequence instead of stacked transport cards."
          actions={<Link to="/marketplace"><Button variant="secondary">Browse local sellers</Button></Link>}
        />
      </GlassPanel>

      <TransportMapHero
        eyebrow="Local courier"
        title="Set pickup and drop-off, then confirm the parcel"
        description="The route preview stays dominant, while advanced pin placement remains optional and out of the way."
        primary={pickupPoint}
        secondary={dropoffPoint}
        primaryLabel={pickupLocation}
        secondaryLabel={dropoffLocation}
        meta={
          <div className="grid gap-3 sm:grid-cols-2">
            <TransportMiniMetric label="Estimated time" value={`${estimatedDurationMinutes} min`} />
            <TransportMiniMetric label="Estimated total" value={`N$ ${estimate}`} />
          </div>
        }
      />

      <TransportTabs items={deliveryTabs} value={activeTab} onChange={setActiveTab} />

      {token ? (
        tabContent
      ) : (
        <EmptyState
          title="Login to request delivery"
          body="Delivery requests use your saved contact details so handoff stays quick."
          action={<Button onClick={() => navigateToLogin(navigate)}>Login</Button>}
        />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Single route preview', body: 'Pickup and drop-off stay visible on one dominant map surface instead of separate stacked panels.', icon: MapPinned },
          { title: 'Cleaner parcel choices', body: 'Parcel size, urgency, and notes are grouped into a calmer, guided request flow.', icon: Truck },
          { title: 'Estimate first', body: 'Delivery amount and timing stay visible next to the main CTA so the request feels operational and clear.', icon: ShieldCheck },
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
