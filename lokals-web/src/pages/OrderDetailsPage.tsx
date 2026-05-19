import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useCancelOrder, useOrder, useRateOrder } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getDisplayPrice } from '../lib/display'

export function OrderDetailsPage() {
  const { id } = useParams()
  const orderQuery = useOrder(id)
  const cancelOrder = useCancelOrder()
  const rateOrder = useRateOrder()
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const order = orderQuery.data

  return (
    <QueryState isLoading={orderQuery.isLoading} error={orderQuery.error} empty={!order}>
      {!order ? (
        <EmptyState title="Order not found" body="This order may have been removed or is no longer available." />
      ) : (
        <div className="space-y-6">
          <PageHeader
            eyebrow="Orders"
            title={order.reference_code ?? `Order #${order.id}`}
            description={`${order.seller?.name ?? order.business?.name ?? 'Local seller'} • ${order.status_label ?? order.status}`}
            actions={<Link to="/orders"><Button variant="secondary">Back to orders</Button></Link>}
          />

          {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
          {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="bg-white">
              <div className="flex items-center gap-2">
                <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} />
                <StatusBadge value={order.payment_status ?? 'pending'} tone="neutral" />
              </div>
              <div className="mt-5 space-y-4">
                {order.timeline?.map((item) => (
                  <div key={item.key} className="flex items-start gap-3 rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                    <div className="mt-1 h-3 w-3 rounded-full bg-lokals-green" />
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Waiting for update'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard className="bg-white">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Totals</h2>
              <div className="mt-4 space-y-3">
                {[
                  ['Subtotal', getDisplayPrice(order.totals?.subtotal ?? 0, 'N$')],
                  ['Delivery fee', getDisplayPrice(order.totals?.delivery_fee ?? 0, 'N$')],
                  ['Service fee', getDisplayPrice(order.totals?.service_fee ?? 0, 'N$')],
                  ['Total', getDisplayPrice(order.totals?.total ?? 0, 'N$')],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-[18px] border border-lokals-border bg-lokals-bg px-4 py-3">
                    <p className="font-medium text-lokals-charcoal">{label}</p>
                    <span className="font-semibold text-lokals-charcoal">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['pending', 'accepted', 'preparing', 'ready_for_pickup'].includes(order.status) ? (
                  <Button
                    variant="secondary"
                    disabled={cancelOrder.isPending}
                    onClick={() => {
                      setFeedback(null)
                      setErrorMessage(null)
                      cancelOrder.mutate(
                        { orderId: order.id },
                        {
                          onSuccess: () => setFeedback('Order cancelled.'),
                          onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to cancel the order right now.')),
                        },
                      )
                    }}
                  >
                    {cancelOrder.isPending ? 'Cancelling...' : 'Cancel order'}
                  </Button>
                ) : null}
              </div>
            </SectionCard>
          </div>

          <SectionCard className="bg-white">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{item.name}</p>
                    <p className="mt-1 text-sm text-lokals-muted">Qty {item.quantity} • {getDisplayPrice(item.unit_price, 'N$')} each</p>
                  </div>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.total_price, 'N$')}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard className="bg-white">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Route</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Pickup</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{order.pickup_location?.address ?? order.seller?.location ?? 'Seller location pending'}</p>
                </div>
                <div className="rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Delivery</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{order.delivery_location?.address ?? 'Address pending'}</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="bg-white">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Rate order</h2>
              {order.status !== 'delivered' ? (
                <p className="mt-4 text-sm text-lokals-muted">Rating becomes available after delivery is completed.</p>
              ) : order.customer_rating ? (
                <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <p className="font-semibold text-emerald-800">You rated this order {order.customer_rating}/5</p>
                  <p className="mt-2 text-sm text-emerald-800">{order.customer_rating_comment ?? 'No comment left.'}</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min={1} max={5} />
                  <TextArea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="What went well, or what should improve?" />
                  <Button
                    disabled={rateOrder.isPending}
                    onClick={() => {
                      setFeedback(null)
                      setErrorMessage(null)
                      rateOrder.mutate(
                        { orderId: order.id, rating: Number(rating), comment: comment.trim() || undefined },
                        {
                          onSuccess: () => setFeedback('Order rating saved.'),
                          onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to save your rating right now.')),
                        },
                      )
                    }}
                  >
                    {rateOrder.isPending ? 'Saving...' : 'Save rating'}
                  </Button>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </QueryState>
  )
}
