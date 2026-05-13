import type { FormEvent } from 'react'
import { Camera, Clock3, LocateFixed, MapPin, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, Select, StatusBadge, TextArea } from '../components/Ui'
import { RequestSuccessState } from '../components/transport/RequestSuccessState'
import { GlassPanel } from '../components/glass/GlassPanel'
import { isDemoMode } from '../config/appMode'
import { useCreateDelivery, useDeliveries } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { navigateToLogin } from '../lib/authNavigation'
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

const deliverySteps = ['requested', 'accepted', 'picked_up', 'delivered', 'cancelled']

export function DeliveryPage() {
  const [pickupLocation, setPickupLocation] = useState(quickLocations[0])
  const [dropoffLocation, setDropoffLocation] = useState(quickLocations[5])
  const [parcelSize, setParcelSize] = useState('medium')
  const [urgency, setUrgency] = useState('standard')
  const [weightKg, setWeightKg] = useState('2')
  const [notes, setNotes] = useState('')
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [successItem, setSuccessItem] = useState<DeliveryItem | null>(null)
  const createDelivery = useCreateDelivery()
  const token = useAuthStore((state) => state.token)
  const deliveriesQuery = useDeliveries(Boolean(token))
  const navigate = useNavigate()

  const estimate = useMemo(
    () => {
      const base = parcelSizes.find((item) => item.value === parcelSize)?.estimate ?? 75
      const urgencyBonus = urgency === 'express' ? 25 : urgency === 'priority' ? 40 : 0
      const weightBonus = Number(weightKg) > 5 ? 18 : Number(weightKg) > 2 ? 10 : 0
      return base + urgencyBonus + weightBonus
    },
    [parcelSize, urgency, weightKg],
  )

  const submit = async (event: FormEvent<HTMLFormElement>) => {
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
      return
    }

    const payload = new FormData()
    payload.append('pickup_location', pickupLocation)
    payload.append('dropoff_location', dropoffLocation)
    payload.append('parcel_description', description)
    payload.append('parcel_size', parcelSize)
    payload.append('estimated_price', String(estimate))
    payload.append('urgency', urgency)
    payload.append('weight_kg', weightKg)
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
      event.currentTarget.reset()
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to request delivery right now.'))
    }
  }

  const setCurrentPickup = () => {
    setPickupLocation('Current location (near me)')
  }

  return (
    <div className="space-y-5">
      <GlassPanel>
        <PageHeader
          eyebrow="Delivery"
          title="Move a parcel with fewer taps"
          description="Pick a route, choose parcel size, add notes if needed, and send a trusted local delivery request."
          actions={<Link to="/marketplace"><Button variant="secondary">Browse local sellers</Button></Link>}
        />
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Fast handoff', body: 'Choose common pickup and drop-off spots without typing every field.', Icon: Truck, className: 'bg-lokals-gold-soft text-lokals-charcoal' },
          { title: 'Visible estimate', body: 'Parcel size keeps the likely delivery amount visible before you submit.', Icon: Clock3, className: 'bg-sky-50 text-sky-700' },
          { title: 'Trusted routing', body: 'You can jump into request status right after submit instead of waiting blindly.', Icon: MapPin, className: 'bg-emerald-50 text-emerald-700' },
        ].map(({ title, body, Icon, className }) => (
          <SectionCard key={title} className="bg-white">
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-lokals-charcoal">{title}</h3>
                <p className="mt-2 text-sm text-lokals-muted">{body}</p>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>

      {token ? (
        successItem ? (
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
        ) : (
          <SectionCard className="bg-white">
            <form className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={submit}>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Pickup location</span>
                    <Select value={pickupLocation} onChange={(event) => setPickupLocation(event.target.value)}>
                      {quickLocations.map((option) => <option key={`pickup-${option}`} value={option}>{option}</option>)}
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Drop-off location</span>
                    <Select value={dropoffLocation} onChange={(event) => setDropoffLocation(event.target.value)}>
                      {quickLocations.map((option) => <option key={`dropoff-${option}`} value={option}>{option}</option>)}
                    </Select>
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
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {parcelSizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setParcelSize(size.value)}
                      className={`rounded-[22px] border p-4 text-left transition ${parcelSize === size.value ? 'border-lokals-purple bg-violet-50 shadow-card' : 'border-lokals-border bg-white hover:border-violet-200'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-lokals-charcoal">{size.label}</span>
                        <StatusBadge value={`N$ ${size.estimate}`} tone={parcelSize === size.value ? 'accent' : 'neutral'} />
                      </div>
                      <p className="mt-2 text-sm text-lokals-muted">{size.detail}</p>
                    </button>
                  ))}
                </div>

                <TextArea name="parcel_description" placeholder="What are you sending?" rows={4} required />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Urgency</span>
                    <Select value={urgency} onChange={(event) => setUrgency(event.target.value)}>
                      {urgencyOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                    </Select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-lokals-charcoal">Weight (kg)</span>
                    <input
                      value={weightKg}
                      onChange={(event) => setWeightKg(event.target.value)}
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="w-full rounded-2xl border border-lokals-border bg-white px-4 py-3 text-sm text-lokals-charcoal outline-none transition focus:border-lokals-purple"
                    />
                  </label>
                </div>
                <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional handoff notes or landmarks" rows={3} />

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
                  {preview ? <img src={preview} alt="Parcel preview" className="mb-4 h-40 w-full rounded-[20px] object-cover" /> : <Camera className="mb-3 h-8 w-8 text-lokals-purple" />}
                  <span className="font-semibold text-lokals-charcoal">Add parcel photo</span>
                  <span className="mt-2 text-sm text-lokals-muted">Useful for fragile items or easy driver recognition.</span>
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

              <SectionCard className="self-start bg-slate-50">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Summary</p>
                <h3 className="mt-2 text-xl font-semibold text-lokals-charcoal">Estimated delivery</h3>
                <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">N$ {estimate}</p>
                <p className="mt-3 text-sm text-lokals-muted">The final amount can adjust once a driver accepts the route and parcel details.</p>

                <div className="mt-4 space-y-3">
                  <article className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Route</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">{pickupLocation} to {dropoffLocation}</p>
                  </article>
                  <article className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Status path</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {deliverySteps.slice(0, 4).map((step) => <StatusBadge key={step} value={step.replaceAll('_', ' ')} tone={step === 'requested' ? 'accent' : 'neutral'} />)}
                    </div>
                  </article>
                  <article className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Delivery details</p>
                    <p className="mt-2 text-sm text-lokals-charcoal">Urgency: <span className="font-semibold capitalize">{urgency}</span></p>
                    <p className="mt-1 text-sm text-lokals-charcoal">Weight: <span className="font-semibold">{weightKg} kg</span></p>
                  </article>
                </div>

                {error ? <p className="mt-4 text-sm font-medium text-lokals-danger">{error}</p> : null}
                <Button className="mt-5 w-full" disabled={createDelivery.isPending}>
                  {createDelivery.isPending ? 'Requesting delivery...' : isDemoMode ? 'Simulate delivery request' : 'Request delivery'}
                </Button>
              </SectionCard>
            </form>
          </SectionCard>
        )
      ) : (
        <EmptyState
          title="Login to request delivery"
          body="Delivery requests use your saved contact details so handoff stays quick."
          action={<Button onClick={() => navigateToLogin(navigate)}>Login</Button>}
        />
      )}

      {token ? (
        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Recent delivery requests</h3>
            <StatusBadge value={`${(deliveriesQuery.data?.data ?? []).length} total`} tone="accent" />
          </div>
          <QueryState isLoading={deliveriesQuery.isLoading} error={deliveriesQuery.error} empty={(deliveriesQuery.data?.data ?? []).length === 0}>
            <div className="mt-4 space-y-3">
              {(deliveriesQuery.data?.data ?? []).slice(0, 5).map((delivery) => (
                <Link key={delivery.id} to={`/delivery/${delivery.id}`} className="block rounded-2xl border border-lokals-border p-4 transition hover:border-violet-200 hover:shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{delivery.pickup_address ?? delivery.pickup_location} to {delivery.dropoff_address ?? delivery.dropoff_location}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{delivery.parcel_description ?? delivery.item_description ?? 'Parcel request'}</p>
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
        </SectionCard>
      ) : null}
    </div>
  )
}
