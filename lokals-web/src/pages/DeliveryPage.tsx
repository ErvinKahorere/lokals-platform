import type { FormEvent } from 'react'
import { AlertTriangle, ChevronDown, LocateFixed, MapPinned, Package, Phone, ShieldCheck, Truck, UserRound } from 'lucide-react'
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
const popularParcelRoutes = [
  { pickup: 'Home', dropoff: 'Okahandja taxi rank', label: 'Home to Taxi rank' },
  { pickup: 'Okahandja Town Council', dropoff: 'Okahandja State Clinic', label: 'Town Council to Clinic' },
  { pickup: 'Work', dropoff: 'Five Rand', label: 'Work to Five Rand' },
]
const deliverySteps = [
  { key: 'route', label: 'Route' },
  { key: 'parcel', label: 'Parcel' },
  { key: 'review', label: 'Review' },
] as const

const deliveryTabs = [
  { label: 'New Delivery', value: 'request' },
  { label: 'Recent Deliveries', value: 'recent' },
  { label: 'Saved Routes', value: 'saved' },
  { label: 'Active Delivery', value: 'active' },
]

export function DeliveryPage() {
  const [activeTab, setActiveTab] = useState('request')
  const [requestStep, setRequestStep] = useState<(typeof deliverySteps)[number]['key']>('route')
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
  const courierPreview = useMemo(
    () => (deliveriesQuery.data?.data ?? []).filter((delivery) => delivery.driver?.id != null).slice(0, 3),
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
      setRequestStep('review')
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
            title="Send local parcel"
            description="A calmer local parcel flow with route, parcel details, and one clear review step before you confirm pickup."
            aside={<StatusBadge value={`${selectedParcel.label} selected`} tone="accent" />}
          >
            <form className="space-y-5" onSubmit={submit}>
              <div className="flex flex-wrap gap-2">
                {deliverySteps.map((step, index) => {
                  const active = requestStep === step.key
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setRequestStep(step.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active ? 'bg-lokals-purple text-white shadow-card' : 'bg-slate-100 text-lokals-charcoal hover:bg-slate-200'
                      }`}
                    >
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-white/20 text-white' : 'bg-white text-lokals-purple'}`}>{index + 1}</span>
                      {step.label}
                    </button>
                  )
                })}
              </div>

              {(requestStep === 'route' || requestStep === 'review') ? (
                <div className="space-y-5 rounded-[24px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-lokals-charcoal">Pickup</span>
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
                    {popularParcelRoutes.map((route) => (
                      <button
                        key={route.label}
                        type="button"
                        onClick={() => {
                          setPickupLocation(route.pickup)
                          setDropoffLocation(route.dropoff)
                        }}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-lokals-charcoal transition hover:bg-slate-200"
                      >
                        {route.label}
                      </button>
                    ))}
                  </div>

                  <details className="group rounded-[24px] border border-lokals-border bg-slate-50 px-4 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lokals-charcoal">Advanced map options</p>
                        <p className="mt-1 text-sm text-lokals-muted">One optional pin surface for pickup or drop-off, without crowding the booking flow.</p>
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

                  {requestStep === 'route' ? (
                    <div className="flex justify-end">
                      <Button type="button" onClick={() => setRequestStep('parcel')}>Continue to parcel details</Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {(requestStep === 'parcel' || requestStep === 'review') ? (
                <div className="space-y-5 rounded-[24px] border border-lokals-border bg-white p-5">
                  <div>
                    <p className="text-sm font-medium text-lokals-charcoal">Parcel details</p>
                    <p className="text-sm text-lokals-muted">Choose parcel size, urgency, handling notes, and photo support in one place.</p>
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
                  <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional handoff notes or safe handling instructions" rows={3} />
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
                  {requestStep === 'parcel' ? (
                    <div className="flex justify-between gap-3">
                      <Button type="button" variant="secondary" onClick={() => setRequestStep('route')}>Back to route</Button>
                      <Button type="button" onClick={() => setRequestStep('review')}>Review parcel request</Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {requestStep === 'review' ? (
                <div className="space-y-4 rounded-[24px] bg-lokals-charcoal p-5 text-white shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Review and confirm</p>
                      <p className="mt-1 text-xl font-semibold">Send local parcel</p>
                      <p className="mt-1 text-sm text-white/70">Nearby couriers receive the route, parcel type, urgency, and any handling notes you provide.</p>
                    </div>
                    <StatusBadge value={urgency.replaceAll('_', ' ')} tone="success" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[20px] bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Route</p>
                      <p className="mt-2 font-semibold">{pickupLocation} to {dropoffLocation}</p>
                    </div>
                    <div className="rounded-[20px] bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Parcel</p>
                      <p className="mt-2 font-semibold">{selectedParcel.label} | {weightKg} kg</p>
                    </div>
                    <div className="rounded-[20px] bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Estimate</p>
                      <p className="mt-2 font-semibold">N$ {estimate} | {estimatedDurationMinutes} min</p>
                    </div>
                    <div className="rounded-[20px] bg-white/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Tracking</p>
                      <p className="mt-2 font-semibold">Track parcel status in your active delivery workspace</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[20px] bg-white/10 p-4 text-sm text-white/80">Verified courier details appear after assignment when available.</div>
                    <div className="rounded-[20px] bg-white/10 p-4 text-sm text-white/80">Call or WhatsApp actions show up once a courier accepts the parcel.</div>
                    <div className="rounded-[20px] bg-white/10 p-4 text-sm text-white/80">Add safe handling notes for fragile or time-sensitive items.</div>
                  </div>
                  {error ? <p className="text-sm font-medium text-rose-200">{error}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" onClick={() => setRequestStep('parcel')}>Edit parcel</Button>
                    <Button className="min-w-[220px]" disabled={createDelivery.isPending}>
                      {createDelivery.isPending ? 'Requesting delivery...' : isDemoMode ? 'Simulate delivery request' : 'Confirm delivery request'}
                    </Button>
                  </div>
                </div>
              ) : null}
            </form>
          </TransportPanel>

          <TransportSummaryCard
            title="Parcel snapshot"
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
                <div className="rounded-[22px] border border-lokals-border bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-lokals-charcoal">Safe handling note</p>
                      <p className="mt-1 text-sm text-lokals-muted">Share fragile-item notes clearly and track parcel status once a courier accepts.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[22px] border border-lokals-border bg-white p-4">
                  <p className="font-semibold text-lokals-charcoal">Available courier operators</p>
                  <p className="mt-1 text-sm text-lokals-muted">Recent local courier contacts, if we already have them from past deliveries.</p>
                  <div className="mt-3 space-y-3">
                    {courierPreview.length > 0 ? courierPreview.map((delivery) => (
                      <div key={delivery.id} className="rounded-[18px] bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-lokals-charcoal">{delivery.driver?.name ?? 'Local courier'}</p>
                            <p className="mt-1 text-sm text-lokals-muted">{delivery.courier_profile?.vehicle_type ?? delivery.courier_profile?.vehicle_registration ?? 'Courier details appear when assigned'}</p>
                          </div>
                          <StatusBadge value={delivery.courier_profile?.is_verified ? 'Verified' : 'Recent courier'} tone={delivery.courier_profile?.is_verified ? 'success' : 'neutral'} />
                        </div>
                        {delivery.driver?.phone ? (
                          <a href={`tel:${delivery.driver.phone}`} className="mt-3 inline-flex">
                            <Button variant="secondary"><Phone className="h-4 w-4" />Call courier</Button>
                          </a>
                        ) : null}
                      </div>
                    )) : (
                      <div className="rounded-[18px] bg-slate-50 p-3 text-sm text-lokals-muted">
                        Courier previews will appear here after accepted or completed local parcel requests.
                      </div>
                    )}
                  </div>
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
              title="Parcel request sent"
              body="Your local parcel request is in the queue. A nearby courier can confirm, share operator details, and update the tracking status shortly."
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
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Reference</p>
                    <p className="mt-1 font-semibold text-lokals-charcoal">{successItem.reference_code ?? `Delivery ${successItem.id}`}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Status</p>
                    <p className="mt-1 font-semibold text-lokals-charcoal">{formatTransportStatus(successItem.tracking_status ?? successItem.status, successItem.status_label)}</p>
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
          { title: 'Guided parcel flow', body: 'Move from route to parcel details to review without losing the delivery estimate or tracking context.', icon: MapPinned },
          { title: 'Local courier trust', body: 'Operator previews, safe handling cues, and clearer status messaging make delivery feel more dependable.', icon: Truck },
          { title: 'Clear tracking path', body: 'Estimate, urgency, and tracking cues stay visible before and after confirmation so the flow feels traceable.', icon: ShieldCheck },
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
