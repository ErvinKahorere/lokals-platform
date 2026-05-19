import { useMemo, useState } from 'react'
import { LifeBuoy, MapPinned, PhoneCall, RotateCcw, Truck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useCancelOrder, useOrder, useRateOrder } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { addProductToOrderCart } from '../lib/orderCart'
import { getDisplayPrice } from '../lib/display'
import type { OrderRecord, Product } from '../types'

const detailTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'route', label: 'Route' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'contact', label: 'Contact' },
] as const

export function OrderDetailsPage() {
  const { id } = useParams()
  const orderQuery = useOrder(id)
  const cancelOrder = useCancelOrder()
  const rateOrder = useRateOrder()
  const [activeTab, setActiveTab] = useState<(typeof detailTabs)[number]['key']>('overview')
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const order = orderQuery.data
  const currentTracking = useMemo(() => order?.tracking_steps?.find((step) => step.is_current) ?? order?.tracking_steps?.find((step) => step.is_complete === false) ?? null, [order])
  const progressSteps = useMemo(() => {
    if (!order) return []
    if (order.tracking_steps?.length) return order.tracking_steps
    return (order.timeline ?? []).map((item) => ({
      ...item,
      is_complete: Boolean(item.timestamp),
      is_current: !item.timestamp,
    }))
  }, [order])

  const handleReorder = (currentOrder: OrderRecord) => {
    currentOrder.reorder_payload?.items?.forEach((item) => {
      const original = currentOrder.items.find((source) => source.product_id === item.product_id)
      if (!item.product_id || !original) return
      const product: Product = {
        id: item.product_id,
        title: item.name ?? original.name,
        price: original.unit_price,
        sale_price: null,
        image_url: null,
        business: currentOrder.business ?? currentOrder.seller ?? undefined,
        user: undefined,
        town: currentOrder.delivery_location?.address ?? undefined,
        area: undefined,
      }
      addProductToOrderCart(product, item.quantity ?? 1)
    })
    setFeedback('Order items were added back into your cart.')
  }

  return (
    <QueryState isLoading={orderQuery.isLoading} error={orderQuery.error} empty={!order}>
      {!order ? (
        <EmptyState title="Order not found" body="This order may have been removed or is no longer available." />
      ) : (
        <div className="space-y-6 pb-24">
          <PageHeader
            eyebrow="Orders"
            title={order.reference_code ?? `Order #${order.id}`}
            description={`${order.seller?.name ?? order.business?.name ?? 'Local seller'} | ${order.status_label ?? order.status}`}
            actions={<Link to="/orders"><Button variant="secondary">Back to orders</Button></Link>}
          />

          {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
          {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

          <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-white shadow-card">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),linear-gradient(135deg,#0f172a,#111827,#16a34a)] px-6 py-6 text-white">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10" />
              <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} className="bg-white/15 text-white ring-0" />
                    <StatusBadge value={order.payment_status ?? 'pending'} tone="neutral" className="bg-white/15 text-white ring-0" />
                    {order.estimated_arrival_minutes ? <StatusBadge value={`${order.estimated_arrival_minutes} min ETA`} tone="success" className="bg-emerald-500/20 text-white ring-0" /> : null}
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold">Track your order delivery</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{currentTracking?.label ?? order.next_action_label ?? 'Your order is moving through the local seller and courier flow.'}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Receipt summary</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Items', `${order.items.length} in basket`],
                      ['Delivery', getDisplayPrice(order.totals?.delivery_fee ?? 0, 'N$')],
                      ['Total', getDisplayPrice(order.totals?.total ?? 0, 'N$')],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{label}</span>
                        <span className="font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <SectionCard className="bg-white">
                <div className="flex flex-wrap gap-2">
                  {detailTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-lokals-purple text-white' : 'bg-slate-100 text-lokals-charcoal'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </SectionCard>

              {activeTab === 'overview' ? (
                <SectionCard className="bg-white">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] bg-slate-50 p-5">
                      <p className="text-sm text-lokals-muted">Current status</p>
                      <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{order.status_label ?? order.status}</p>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">{order.next_action_label ?? 'Waiting for the next order update.'}</p>
                    </div>
                    <div className="rounded-[24px] bg-slate-50 p-5">
                      <p className="text-sm text-lokals-muted">Estimated arrival</p>
                      <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{order.estimated_arrival_minutes ? `${order.estimated_arrival_minutes} min` : 'Updating soon'}</p>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">LOKALS reuses the transport status flow so seller prep and courier delivery stay understandable.</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-slate-50 px-4 py-4">
                        <div>
                          <p className="font-semibold text-lokals-charcoal">{item.name}</p>
                          <p className="mt-1 text-sm text-lokals-muted">Qty {item.quantity} | {getDisplayPrice(item.unit_price, 'N$')} each</p>
                        </div>
                        <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.total_price, 'N$')}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}

              {activeTab === 'route' ? (
                <SectionCard className="bg-white">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Pickup</p>
                      <p className="mt-3 font-semibold text-lokals-charcoal">{order.pickup_location?.address ?? order.seller?.location ?? 'Seller location pending'}</p>
                    </div>
                    <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Drop-off</p>
                      <p className="mt-3 font-semibold text-lokals-charcoal">{order.delivery_location?.address ?? 'Delivery address pending'}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[28px] border border-dashed border-lokals-border bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
                    <div className="flex items-center gap-3">
                      <MapPinned className="h-5 w-5 text-lokals-green" />
                      <div>
                        <p className="font-semibold text-lokals-charcoal">Live route architecture ready</p>
                        <p className="text-sm text-lokals-muted">This order flow now exposes clear pickup and delivery checkpoints and is ready for future live courier tracking.</p>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              {activeTab === 'timeline' ? (
                <SectionCard className="bg-white">
                  <div className="space-y-4">
                    {progressSteps.map((item) => (
                      <div key={item.key} className="flex gap-4 rounded-[22px] border border-lokals-border bg-slate-50 px-4 py-4">
                        <div className={`mt-1 h-3 w-3 rounded-full ${item.is_complete ? 'bg-lokals-green' : item.is_current ? 'bg-lokals-purple' : 'bg-slate-300'}`} />
                        <div>
                          <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                          <p className="mt-1 text-sm text-lokals-muted">{item.timestamp ? new Date(item.timestamp).toLocaleString() : item.is_current ? 'In progress now' : 'Waiting for update'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ) : null}

              {activeTab === 'contact' ? (
                <SectionCard className="bg-white">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                      <p className="text-sm text-lokals-muted">Seller</p>
                      <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{order.seller?.name ?? order.business?.name ?? 'Local seller'}</p>
                      <p className="mt-2 text-sm text-lokals-muted">{order.pickup_location?.address ?? order.seller?.location ?? 'Seller location pending'}</p>
                    </div>
                    <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                      <p className="text-sm text-lokals-muted">Courier</p>
                      <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{order.courier?.name ?? 'Courier assigned soon'}</p>
                      <p className="mt-2 text-sm text-lokals-muted">Support shortcuts stay available even before live calling is wired in.</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="secondary"><PhoneCall className="h-4 w-4" /> Seller support</Button>
                    <Button variant="secondary"><LifeBuoy className="h-4 w-4" /> LOKALS support</Button>
                    {order.courier ? <Button variant="secondary"><Truck className="h-4 w-4" /> Courier contact</Button> : null}
                  </div>
                </SectionCard>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-2">
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

                <SectionCard className="bg-white">
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Need another order?</h2>
                  <p className="mt-3 text-sm leading-6 text-lokals-muted">Reorder drops the same item set back into your cart so you can adjust address, delivery method, or payment in the guided checkout.</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button onClick={() => handleReorder(order)}><RotateCcw className="h-4 w-4" /> Reorder</Button>
                    <Link to="/orders/checkout"><Button variant="secondary">Open cart</Button></Link>
                  </div>
                </SectionCard>
              </div>
            </div>

            <div className="space-y-5">
              <SectionCard className="sticky top-[92px] bg-white">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Actions</h2>
                <div className="mt-4 space-y-3">
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
                  <Link to="/orders"><Button variant="secondary" className="w-full">Order history</Button></Link>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ['Subtotal', getDisplayPrice(order.totals?.subtotal ?? 0, 'N$')],
                    ['Delivery fee', getDisplayPrice(order.totals?.delivery_fee ?? 0, 'N$')],
                    ['Service fee', getDisplayPrice(order.totals?.service_fee ?? 0, 'N$')],
                    ['Total', getDisplayPrice(order.totals?.total ?? 0, 'N$')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                      <p className="font-medium text-lokals-charcoal">{label}</p>
                      <span className="font-semibold text-lokals-charcoal">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                  <p className="text-sm text-lokals-muted">Support shortcuts</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(order.support_shortcuts ?? []).map((shortcut) => (
                      <span key={shortcut.key} className="rounded-full bg-white px-3 py-2 text-sm font-medium text-lokals-charcoal shadow-sm">{shortcut.label}</span>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}
