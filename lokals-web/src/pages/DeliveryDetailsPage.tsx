import { AlertCircle, AlertTriangle, Package, ShieldCheck, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { ContactActions } from '../components/experience/ContactActions'
import { LocationPreviewMap } from '../components/maps/LocationPreviewMap'
import { Button, EmptyState, Input, QueryState, StatusBadge, TextArea } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { TransportPanel, TransportSummaryCard, TransportTabs } from '../components/transport/TransportSurface'
import { useCancelDelivery, useCourierDeliveryAction, useDelivery, useRateDelivery } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import type { LocationPoint } from '../lib/location'
import { formatTransportStatus, formatTransportTimestamp, normalizeTransportTimeline, transportStatusTone } from '../lib/transportStatus'
import { useAuthStore } from '../store/auth'

const deliverySteps = ['requested', 'accepted', 'pickup_confirmed', 'in_transit', 'delivered', 'cancelled']
const detailTabs = [
  { label: 'Overview', value: 'overview' },
  { label: 'Route', value: 'route' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'Contact', value: 'contact' },
  { label: 'Proof', value: 'proof' },
]

export function DeliveryDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const deliveryQuery = useDelivery(id)
  const delivery = deliveryQuery.data
  const cancelDelivery = useCancelDelivery()
  const rateDelivery = useRateDelivery()
  const deliveryActionMutation = useCourierDeliveryAction()
  const [activeTab, setActiveTab] = useState('overview')
  const [deliveryActionState, setDeliveryActionState] = useState<Record<number, { action: string; pending: boolean; error?: string }>>({})
  const [cancelReason, setCancelReason] = useState('')
  const [rating, setRating] = useState('5')
  const [ratingComment, setRatingComment] = useState('')

  const deliveryErrorStatus = (deliveryQuery.error as AxiosError)?.response?.status
  const isDeliveryUnauthorized = deliveryErrorStatus === 401
  const isDeliveryForbidden = deliveryErrorStatus === 403
  const isDeliveryAccessError = isDeliveryUnauthorized || isDeliveryForbidden

  const isResidentOrBusiness = delivery?.user?.id != null && delivery.user.id === user?.id
  const isCourier = Boolean(user?.roles?.includes('courier'))
  const canAcceptDelivery = Boolean(isCourier && delivery && delivery.status != null && ['requested', 'searching'].includes(delivery.status) && !delivery.driver?.id)
  const isAssignedCourier = Boolean(isCourier && delivery?.driver?.id === user?.id)
  const canCancel = isResidentOrBusiness && delivery?.status != null && ['requested', 'searching', 'accepted', 'pickup_confirmed'].includes(delivery.status)
  const canRate = isResidentOrBusiness && delivery?.status === 'delivered' && !delivery?.rating

  const timeline = useMemo(
    () => normalizeTransportTimeline(delivery?.timeline, [
      { key: 'requested', label: 'Requested', timestamp: delivery?.created_at },
      { key: 'assigned', label: 'Assigned', timestamp: delivery?.assigned_at },
      { key: 'pickup_confirmed', label: 'Pickup confirmed', timestamp: delivery?.picked_up_at },
      { key: 'in_transit', label: 'In transit', timestamp: delivery?.in_transit_at },
      { key: 'delivered', label: 'Delivered', timestamp: delivery?.delivered_at },
    ]),
    [delivery],
  )
  const pickupPoint: LocationPoint | null = delivery?.pickup_latitude != null && delivery?.pickup_longitude != null ? { lat: delivery.pickup_latitude, lng: delivery.pickup_longitude } : null
  const dropoffPoint: LocationPoint | null = delivery?.dropoff_latitude != null && delivery?.dropoff_longitude != null ? { lat: delivery.dropoff_latitude, lng: delivery.dropoff_longitude } : null

  const handleDeliveryAction = (action: 'accept' | 'decline' | 'pickup-confirmed' | 'in-transit' | 'delivered') => {
    if (!delivery?.id) return

    setDeliveryActionState((prev) => ({
      ...prev,
      [delivery.id]: { action, pending: true, error: undefined },
    }))

    deliveryActionMutation.mutate({ deliveryId: delivery.id, action }, {
      onSuccess: () => {
        setDeliveryActionState((prev) => ({
          ...prev,
          [delivery.id]: { action, pending: false, error: undefined },
        }))
      },
      onError: (error) => {
        const errorMessage = getApiErrorMessage(error, 'Unable to update delivery status. Please try again.')
        setDeliveryActionState((prev) => ({
          ...prev,
          [delivery.id]: { action, pending: false, error: errorMessage },
        }))
      },
    })
  }

  return (
    <div className="space-y-5">
      <TransportPanel
        title="Delivery workspace"
        description="A clearer delivery flow with overview, route, timeline, contact, and proof separated into focused tabs."
        aside={<Link to="/delivery"><Button variant="secondary">Back to delivery</Button></Link>}
      >
        {isDeliveryAccessError ? (
          <EmptyState
            title={isDeliveryUnauthorized ? 'Please login to view this delivery.' : 'You do not have access to this delivery.'}
            body={isDeliveryUnauthorized ? 'Sign in to continue and access your delivery details.' : 'This delivery is private or reserved for another account.'}
            action={isDeliveryUnauthorized ? <Link to="/login"><Button>Login</Button></Link> : <Link to="/delivery"><Button>Back to delivery</Button></Link>}
          />
        ) : (
          <QueryState isLoading={deliveryQuery.isLoading} error={deliveryQuery.error} empty={!delivery}>
            {!delivery ? (
              <EmptyState title="Delivery not found" body="We could not find this delivery request." action={<Link to="/delivery"><Button>Back</Button></Link>} />
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lokals-gold-soft text-lokals-charcoal">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Active-state focus</p>
                          <h1 className="mt-1 text-2xl font-semibold text-lokals-charcoal">{delivery.parcel_description ?? delivery.item_description ?? 'Parcel details'}</h1>
                          <p className="mt-2 text-sm text-lokals-muted">{delivery.pickup_address ?? delivery.pickup_location} to {delivery.dropoff_address ?? delivery.dropoff_location}</p>
                        </div>
                      </div>
                      <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                    </div>
                    {delivery.photo_url ? <img src={delivery.photo_url} alt="Parcel" className="mt-4 h-56 w-full rounded-[24px] object-cover" /> : null}
                  </div>
                  <TransportSummaryCard
                    title="Delivery summary"
                    items={[
                      { label: 'Estimate', value: delivery.estimated_price || delivery.price ? `N$ ${delivery.estimated_price ?? delivery.price}` : 'Open estimate', accent: true },
                      { label: 'Parcel size', value: delivery.parcel_size ?? 'Medium' },
                      { label: 'Urgency', value: delivery.urgency ?? 'standard' },
                      { label: 'Reference', value: delivery.reference_code ?? 'Pending' },
                    ]}
                  />
                </div>

                <TransportTabs items={detailTabs} value={activeTab} onChange={setActiveTab} />

                {activeTab === 'overview' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          ['Pickup', delivery.pickup_address ?? delivery.pickup_location ?? 'Pickup'],
                          ['Drop-off', delivery.dropoff_address ?? delivery.dropoff_location ?? 'Drop-off'],
                          ['Parcel size', delivery.parcel_size ?? 'Medium'],
                          ['Estimate', delivery.estimated_price || delivery.price ? `N$ ${delivery.estimated_price ?? delivery.price}` : 'Open estimate'],
                          ['Weight', delivery.weight_kg ? `${delivery.weight_kg} kg` : 'Not specified'],
                          ['Notes', delivery.notes ?? 'No extra delivery notes'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-[22px] bg-slate-50 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{label}</p>
                            <p className="mt-2 font-semibold text-lokals-charcoal">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {(canAcceptDelivery || isAssignedCourier) ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">{canAcceptDelivery ? 'Courier response' : 'Courier workflow'}</p>
                          <p className="mt-1 text-sm text-lokals-muted">
                            {canAcceptDelivery ? 'Accept or decline this delivery request if you can collect it now.' : 'Move the parcel through pickup, in-transit, and delivery.'}
                          </p>
                          {deliveryActionState[delivery.id]?.error ? (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                              <p>{deliveryActionState[delivery.id]?.error}</p>
                            </div>
                          ) : null}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {canAcceptDelivery ? (
                              <>
                                <Button disabled={deliveryActionState[delivery.id]?.pending} onClick={() => handleDeliveryAction('accept')}>
                                  {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'accept' ? 'Accepting...' : 'Accept delivery'}
                                </Button>
                                <Button variant="secondary" disabled={deliveryActionState[delivery.id]?.pending} onClick={() => handleDeliveryAction('decline')}>
                                  {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'decline' ? 'Declining...' : 'Decline'}
                                </Button>
                              </>
                            ) : null}
                            {isAssignedCourier && delivery.status === 'accepted' ? <Button disabled={deliveryActionState[delivery.id]?.pending} onClick={() => handleDeliveryAction('pickup-confirmed')}>{deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'pickup-confirmed' ? 'Updating...' : 'Confirm pickup'}</Button> : null}
                            {isAssignedCourier && delivery.status === 'pickup_confirmed' ? <Button disabled={deliveryActionState[delivery.id]?.pending} onClick={() => handleDeliveryAction('in-transit')}>{deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'in-transit' ? 'Updating...' : 'Mark in transit'}</Button> : null}
                            {isAssignedCourier && delivery.status === 'in_transit' ? <Button disabled={deliveryActionState[delivery.id]?.pending} onClick={() => handleDeliveryAction('delivered')}>{deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'delivered' ? 'Updating...' : 'Mark delivered'}</Button> : null}
                          </div>
                        </div>
                      ) : null}

                      {canCancel ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">Cancel delivery</p>
                          <div className="mt-3 flex flex-col gap-3">
                            <Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Optional reason" />
                            <Button variant="danger" disabled={cancelDelivery.isPending} onClick={() => cancelDelivery.mutate({ deliveryId: delivery.id, reason: cancelReason || undefined })}>
                              {cancelDelivery.isPending ? 'Cancelling...' : 'Cancel delivery'}
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      {canRate ? (
                        <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                          <p className="font-semibold text-lokals-charcoal">Rate this courier</p>
                          <div className="mt-3 grid gap-3">
                            <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min="1" max="5" />
                            <TextArea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} rows={3} placeholder="Share a short note about the delivery." />
                            <Button disabled={rateDelivery.isPending} onClick={() => rateDelivery.mutate({ deliveryId: delivery.id, rating: Number(rating), comment: ratingComment || undefined })}>
                              {rateDelivery.isPending ? 'Saving rating...' : <span className="inline-flex items-center gap-2"><Star className="h-4 w-4" />Submit rating</span>}
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
                        primaryLabel={delivery.pickup_address ?? delivery.pickup_location ?? 'Pickup'}
                        secondaryLabel={delivery.dropoff_address ?? delivery.dropoff_location ?? 'Drop-off'}
                      />
                    </div>
                    <TransportSummaryCard
                      title="Route context"
                      items={[
                        { label: 'Pickup', value: delivery.pickup_address ?? delivery.pickup_location ?? 'Pickup' },
                        { label: 'Drop-off', value: delivery.dropoff_address ?? delivery.dropoff_location ?? 'Drop-off' },
                        { label: 'Estimated time', value: delivery.estimated_duration_minutes != null ? `${delivery.estimated_duration_minutes} min` : 'Pending' },
                        { label: 'Distance', value: delivery.estimated_distance_km ? `${delivery.estimated_distance_km} km` : 'Address-based estimate' },
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
                    <StatusStepper steps={deliverySteps} current={delivery.status === 'assigned' ? 'accepted' : delivery.status} updatedAt={delivery.updated_at} />
                  </div>
                ) : null}

                {activeTab === 'contact' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-lokals-charcoal">{delivery.driver?.name ?? 'Courier operator pending'}</p>
                        {delivery.courier_profile?.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-lokals-green-soft px-2.5 py-1 text-[11px] font-semibold text-lokals-green">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-lokals-muted">{delivery.driver?.phone ?? 'A courier contact will appear here once the request is accepted.'}</p>
                      {delivery.courier_profile?.vehicle_type ? <p className="mt-3 text-sm text-lokals-muted">Vehicle: {delivery.courier_profile.vehicle_type}</p> : null}
                      {delivery.courier_profile?.vehicle_registration ? <p className="mt-1 text-sm text-lokals-muted">Plate: {delivery.courier_profile.vehicle_registration}</p> : null}
                      {delivery.courier_profile?.rating != null ? <p className="mt-1 text-sm text-lokals-muted">Courier rating: {delivery.courier_profile.rating}/5</p> : null}
                      <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
                        <p className="font-semibold text-lokals-charcoal">Safe handling note</p>
                        <p className="mt-1 text-sm text-lokals-muted">Confirm the courier, vehicle, and parcel handoff details before releasing the package.</p>
                      </div>
                      <div className="mt-4">
                        <ContactActions
                          className="flex flex-wrap gap-2"
                          name={delivery.driver?.name ?? 'Courier'}
                          phone={delivery.driver?.phone}
                          conversationUserId={delivery.driver?.id ?? null}
                          conversationContext="delivery"
                          conversationSubject={delivery.reference_code ?? `Delivery ${delivery.id}`}
                          whatsappMessage={`Hi, I am checking on delivery ${delivery.reference_code ?? delivery.id}.`}
                        />
                      </div>
                      <div className="mt-3">
                        <Link to="/sos"><Button variant="danger"><AlertTriangle className="h-4 w-4" />Emergency shortcut</Button></Link>
                      </div>
                    </div>
                    <TransportSummaryCard
                      title="Parcel trust"
                      items={[
                        { label: 'Sender', value: delivery.user?.name ?? 'Resident' },
                        { label: 'Parcel size', value: delivery.parcel_size ?? 'Medium' },
                        { label: 'Current status', value: formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label), accent: true },
                        { label: 'Tracking', value: delivery.reference_code ?? 'Reference shown when available' },
                      ]}
                    />
                  </div>
                ) : null}

                {activeTab === 'proof' ? (
                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[28px] border border-lokals-purple/10 bg-white p-5 shadow-card">
                      <div className="flex items-center gap-2 text-lokals-charcoal">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        <p className="font-semibold">Proof of delivery</p>
                      </div>
                      <p className="mt-3 text-sm text-lokals-muted">{delivery.proof_of_delivery?.label ?? 'Proof of delivery will appear here once the courier confirms handoff.'}</p>
                    </div>
                    <TransportSummaryCard
                      title="Proof status"
                      items={[
                        { label: 'Delivery status', value: formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label), accent: true },
                        { label: 'Proof label', value: delivery.proof_of_delivery?.label ?? 'Pending handoff' },
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
