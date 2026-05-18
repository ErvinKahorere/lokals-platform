import { AlertCircle, Package, ShieldCheck, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { ContactActions } from '../components/experience/ContactActions'
import { LocationPreviewMap } from '../components/maps/LocationPreviewMap'
import { Button, EmptyState, Input, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { useCancelDelivery, useCourierDeliveryAction, useDelivery, useRateDelivery } from '../hooks/queries'
import { formatTransportStatus, formatTransportTimestamp, normalizeTransportTimeline, transportStatusTone } from '../lib/transportStatus'
import { getApiErrorMessage } from '../lib/api'
import type { LocationPoint } from '../lib/location'
import { useAuthStore } from '../store/auth'

const deliverySteps = ['requested', 'accepted', 'pickup_confirmed', 'in_transit', 'delivered', 'cancelled']

export function DeliveryDetailsPage() {
  const { id } = useParams()
  const user = useAuthStore((state) => state.user)
  const deliveryQuery = useDelivery(id)
  const delivery = deliveryQuery.data
  const cancelDelivery = useCancelDelivery()
  const rateDelivery = useRateDelivery()
  const deliveryActionMutation = useCourierDeliveryAction()
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
  const pickupPoint: LocationPoint | null = delivery?.pickup_latitude != null && delivery?.pickup_longitude != null
    ? { lat: delivery.pickup_latitude, lng: delivery.pickup_longitude }
    : null
  const dropoffPoint: LocationPoint | null = delivery?.dropoff_latitude != null && delivery?.dropoff_longitude != null
    ? { lat: delivery.dropoff_latitude, lng: delivery.dropoff_longitude }
    : null

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
      <SectionCard className="bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Delivery request</p>
            <h1 className="mt-1 text-3xl font-semibold text-lokals-charcoal">Track your parcel request</h1>
          </div>
          <Link to="/delivery"><Button variant="secondary">Back to delivery</Button></Link>
        </div>
      </SectionCard>

      {isDeliveryAccessError ? (
        <SectionCard className="bg-white">
          <EmptyState
            title={isDeliveryUnauthorized ? 'Please login to view this delivery.' : 'You don’t have access to this delivery.'}
            body={isDeliveryUnauthorized ? 'Sign in to continue and access your delivery details.' : 'This delivery is private or reserved for another account.'}
            action={
              isDeliveryUnauthorized ? (
                <div className="grid gap-3 sm:grid-cols-[auto_auto]">
                  <Link to="/login"><Button>Login</Button></Link>
                  <Link to="/delivery"><Button variant="secondary">Back to delivery</Button></Link>
                </div>
              ) : (
                <Link to="/delivery"><Button>Back to delivery</Button></Link>
              )
            }
          />
        </SectionCard>
      ) : (
        <QueryState isLoading={deliveryQuery.isLoading} error={deliveryQuery.error} empty={!delivery}>
        {!delivery ? (
          <EmptyState title="Delivery not found" body="We could not find this delivery request." action={<Link to="/delivery"><Button>Back</Button></Link>} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionCard className="bg-white">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lokals-gold-soft text-lokals-charcoal">
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-lokals-charcoal">Parcel details</h2>
                    <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                  </div>
                  <p className="mt-3 text-sm text-lokals-muted">{delivery.parcel_description ?? delivery.item_description ?? 'Parcel request'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {delivery.reference_code ? <StatusBadge value={delivery.reference_code} tone="neutral" /> : null}
                    {delivery.urgency ? <StatusBadge value={delivery.urgency} tone="accent" /> : null}
                  </div>
                </div>
              </div>

              {delivery.photo_url ? <img src={delivery.photo_url} alt="Parcel" className="mt-4 h-56 w-full rounded-[24px] object-cover" /> : null}

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Pickup</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{delivery.pickup_address ?? delivery.pickup_location}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Drop-off</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{delivery.dropoff_address ?? delivery.dropoff_location}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Parcel size</p>
                  <p className="mt-2 font-semibold capitalize text-lokals-charcoal">{delivery.parcel_size ?? 'Medium'}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Estimate</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{delivery.estimated_price || delivery.price ? `N$ ${delivery.estimated_price ?? delivery.price}` : 'Open estimate'}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Weight</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{delivery.weight_kg ? `${delivery.weight_kg} kg` : 'Not specified'}</p>
                </article>
                <article className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Estimated distance</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{delivery.estimated_distance_km ? `${delivery.estimated_distance_km} km` : 'Address-based estimate'}</p>
                </article>
              </div>

              <div className="mt-5">
                <LocationPreviewMap
                  primary={pickupPoint}
                  secondary={dropoffPoint}
                  primaryLabel={delivery.pickup_address ?? delivery.pickup_location ?? 'Pickup'}
                  secondaryLabel={delivery.dropoff_address ?? delivery.dropoff_location ?? 'Drop-off'}
                />
              </div>

              {delivery.notes ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Notes</p>
                  <p className="mt-2 text-sm text-lokals-charcoal">{delivery.notes}</p>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{delivery.driver?.name ?? 'Courier operator pending'}</p>
                    <p className="text-sm text-lokals-muted">{delivery.driver?.phone ?? 'A courier contact will appear here once the request is accepted.'}</p>
                    {delivery.courier_profile?.vehicle_type ? <p className="mt-1 text-sm text-lokals-muted">Vehicle: {delivery.courier_profile.vehicle_type}</p> : null}
                    {delivery.courier_profile?.vehicle_registration ? <p className="mt-1 text-sm text-lokals-muted">Plate: {delivery.courier_profile.vehicle_registration}</p> : null}
                    {delivery.courier_profile?.rating != null ? <p className="mt-1 text-sm text-lokals-muted">Courier rating: {delivery.courier_profile.rating}/5</p> : null}
                  </div>
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
              </div>

              {(canAcceptDelivery || isAssignedCourier) ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{canAcceptDelivery ? 'Courier response' : 'Courier workflow'}</p>
                      <p className="mt-2 text-sm text-lokals-muted">
                        {canAcceptDelivery
                          ? 'Accept or decline this delivery request if you can collect and deliver the parcel.'
                          : 'Update the parcel status as pickup and delivery progress.'}
                      </p>
                    </div>
                  </div>
                  {deliveryActionState[delivery.id]?.error ? (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{deliveryActionState[delivery.id]?.error}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canAcceptDelivery ? (
                      <>
                        <Button
                          className="min-h-9 px-3 py-2 text-xs"
                          disabled={deliveryActionState[delivery.id]?.pending}
                          onClick={() => handleDeliveryAction('accept')}
                        >
                          {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'accept' ? 'Accepting…' : 'Accept delivery'}
                        </Button>
                        <Button
                          className="min-h-9 px-3 py-2 text-xs"
                          variant="secondary"
                          disabled={deliveryActionState[delivery.id]?.pending}
                          onClick={() => handleDeliveryAction('decline')}
                        >
                          {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'decline' ? 'Declining…' : 'Decline'}
                        </Button>
                      </>
                    ) : null}
                    {isAssignedCourier && delivery.status === 'accepted' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={deliveryActionState[delivery.id]?.pending}
                        onClick={() => handleDeliveryAction('pickup-confirmed')}
                      >
                        {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'pickup-confirmed' ? 'Updating…' : 'Confirm pickup'}
                      </Button>
                    ) : null}
                    {isAssignedCourier && delivery.status === 'pickup_confirmed' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={deliveryActionState[delivery.id]?.pending}
                        onClick={() => handleDeliveryAction('in-transit')}
                      >
                        {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'in-transit' ? 'Updating…' : 'Mark in transit'}
                      </Button>
                    ) : null}
                    {isAssignedCourier && delivery.status === 'in_transit' ? (
                      <Button
                        className="min-h-9 px-3 py-2 text-xs"
                        disabled={deliveryActionState[delivery.id]?.pending}
                        onClick={() => handleDeliveryAction('delivered')}
                      >
                        {deliveryActionState[delivery.id]?.pending && deliveryActionState[delivery.id]?.action === 'delivered' ? 'Updating…' : 'Mark delivered'}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-lokals-charcoal">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <p className="font-semibold">Proof of delivery</p>
                </div>
                <p className="mt-2 text-sm text-lokals-muted">{delivery.proof_of_delivery?.label ?? 'Proof of delivery will appear here once confirmed.'}</p>
              </div>

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
                  <p className="font-semibold text-lokals-charcoal">Cancel this delivery</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <Input value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Optional reason" />
                    <Button variant="danger" disabled={cancelDelivery.isPending} onClick={() => {
                      if (!delivery?.id) return
                      cancelDelivery.mutate({ deliveryId: delivery.id, reason: cancelReason || undefined })
                    }}>
                      {cancelDelivery.isPending ? 'Cancelling...' : 'Cancel delivery'}
                    </Button>
                  </div>
                </div>
              ) : null}

              {canRate ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="font-semibold text-lokals-charcoal">Rate this courier</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                    <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min="1" max="5" />
                    <TextArea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} rows={3} placeholder="Share a short note about the delivery." />
                  </div>
                  <div className="mt-3">
                    <Button disabled={rateDelivery.isPending} onClick={() => {
                      if (!delivery?.id) return
                      rateDelivery.mutate({ deliveryId: delivery.id, rating: Number(rating), comment: ratingComment || undefined })
                    }}>
                      {rateDelivery.isPending ? 'Saving rating...' : <><Star className="mr-2 h-4 w-4" />Submit rating</>}
                    </Button>
                  </div>
                </div>
              ) : null}
            </SectionCard>

            <StatusStepper steps={deliverySteps} current={delivery.status === 'assigned' ? 'accepted' : delivery.status} updatedAt={delivery.updated_at} />
          </div>
        )}
      </QueryState>
      )}
    </div>
  )
}
