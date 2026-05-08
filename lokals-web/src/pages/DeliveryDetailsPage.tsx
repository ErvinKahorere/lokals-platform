import { Package, PhoneCall } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { StatusStepper } from '../components/transport/StatusStepper'
import { useDelivery } from '../hooks/queries'

const deliverySteps = ['requested', 'accepted', 'picked_up', 'delivered', 'cancelled']

export function DeliveryDetailsPage() {
  const { id } = useParams()
  const deliveryQuery = useDelivery(id)
  const delivery = deliveryQuery.data

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
                    <StatusBadge value={(delivery.status ?? 'requested').replaceAll('_', ' ')} tone={delivery.status === 'cancelled' ? 'danger' : delivery.status === 'delivered' ? 'success' : 'accent'} />
                  </div>
                  <p className="mt-3 text-sm text-lokals-muted">{delivery.parcel_description ?? delivery.item_description ?? 'Parcel request'}</p>
                </div>
              </div>

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
              </div>

              {delivery.notes ? (
                <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Notes</p>
                  <p className="mt-2 text-sm text-lokals-charcoal">{delivery.notes}</p>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-lokals-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{delivery.driver?.name ?? 'Driver not assigned yet'}</p>
                    <p className="text-sm text-lokals-muted">{delivery.driver?.phone ?? 'A driver contact will appear here after acceptance.'}</p>
                  </div>
                  {delivery.driver?.phone ? (
                    <a href={`tel:${delivery.driver.phone}`}>
                      <Button variant="secondary"><PhoneCall className="mr-2 h-4 w-4" />Call</Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </SectionCard>

            <StatusStepper steps={deliverySteps} current={delivery.status} updatedAt={delivery.updated_at} />
          </div>
        )}
      </QueryState>
    </div>
  )
}
