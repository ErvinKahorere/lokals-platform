import { useMemo, useState } from 'react'
import { BellRing, Clock3, PackageCheck, Store, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, QueryState, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { useSellerOrderAction, useSellerOrders } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'
import { getDisplayPrice } from '../../lib/display'
import type { OrderRecord } from '../../types'

const filters = ['all', 'pending', 'accepted', 'preparing', 'ready_for_pickup', 'courier_assigned', 'delivered', 'cancelled'] as const

export function SellerOrdersPage() {
  const [status, setStatus] = useState<(typeof filters)[number]>('all')
  const ordersQuery = useSellerOrders(status === 'all' ? undefined : { status })
  const actionMutation = useSellerOrderAction()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const orders = useMemo(() => ordersQuery.data?.data ?? [], [ordersQuery.data?.data])

  const summary = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'pending')
    const preparing = orders.filter((order) => order.status === 'preparing')
    const ready = orders.filter((order) => order.status === 'ready_for_pickup')
    const completed = orders.filter((order) => order.status === 'delivered')
    const todayRevenue = completed.reduce((sum, order) => sum + Number(order.totals?.total ?? 0), 0)
    const prepCandidates = orders.filter((order) => order.timeline?.some((item) => item.key === 'preparing' && item.timestamp))
    const averagePrepTime = prepCandidates.length ? Math.round(prepCandidates.reduce((sum, order) => sum + Number(order.estimated_arrival_minutes ?? 24), 0) / prepCandidates.length) : 24

    return { pending, preparing, ready, completed, todayRevenue, averagePrepTime }
  }, [orders])

  const handleAction = (orderId: number, action: 'accept' | 'reject' | 'preparing' | 'ready') => {
    setFeedback(null)
    setErrorMessage(null)
    actionMutation.mutate(
      { orderId, action },
      {
        onSuccess: () => setFeedback(`Order ${action.replace('-', ' ')} updated.`),
        onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to update the order right now.')),
      },
    )
  }

  return (
    <DashboardShell
      mode="business"
      eyebrow="Seller"
      title="Seller order console"
      description="A compact local kitchen and shop workflow for new orders, prep timing, ready handoff, and completed revenue."
      isLoading={ordersQuery.isLoading}
      error={ordersQuery.error}
      stats={{
        new_orders: summary.pending.length,
        active_queue: summary.preparing.length,
        ready_queue: summary.ready.length,
      }}
      actions={<Link to="/store"><Button variant="secondary">Open store</Button></Link>}
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {[
          { label: 'New orders', value: summary.pending.length, tone: 'bg-violet-100 text-lokals-purple', icon: BellRing },
          { label: 'Preparing', value: summary.preparing.length, tone: 'bg-amber-100 text-amber-700', icon: Store },
          { label: 'Revenue today', value: getDisplayPrice(summary.todayRevenue, 'N$'), tone: 'bg-emerald-100 text-lokals-green', icon: PackageCheck },
          { label: 'Average prep', value: `${summary.averagePrepTime} min`, tone: 'bg-sky-100 text-sky-700', icon: TimerReset },
        ].map((card) => (
          <div key={card.label} className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}><card.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-sm text-lokals-muted">{card.label}</p>
                <p className="text-2xl font-semibold text-lokals-charcoal">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardSection title="Incoming and active queue" description="Use one practical console for new, preparing, and ready seller actions.">
          {feedback ? <div className="mb-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{feedback}</div> : null}
          {errorMessage ? <div className="mb-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errorMessage}</div> : null}
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStatus(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === item ? 'bg-lokals-purple text-white' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}
              >
                {item === 'all' ? 'All' : item.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
          <QueryState isLoading={ordersQuery.isLoading} error={ordersQuery.error} empty={orders.length === 0}>
            <div className="space-y-4">
              {orders.map((order: OrderRecord) => (
                <div key={order.id} className="rounded-[26px] border border-lokals-border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                        <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} />
                      </div>
                      <p className="mt-2 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} | {order.items.length} item{order.items.length === 1 ? '' : 's'} | {order.delivery_location?.address ?? 'Delivery address pending'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {order.tracking_steps?.slice(0, 4).map((step) => (
                          <span key={step.key} className={`rounded-full px-3 py-1 text-xs font-semibold ${step.is_current ? 'bg-violet-100 text-lokals-purple' : step.is_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-lokals-muted'}`}>
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-lokals-muted">Total</p>
                      <p className="text-lg font-semibold text-lokals-charcoal">{getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-lokals-muted"><Clock3 className="h-3.5 w-3.5" /> {order.estimated_arrival_minutes ? `${order.estimated_arrival_minutes} min flow` : 'Prep timer updating'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/orders/${order.id}`}><Button variant="secondary">Details</Button></Link>
                    {order.status === 'pending' ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'accept')}>Accept</Button> : null}
                    {order.status === 'pending' ? <Button variant="secondary" disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'reject')}>Reject</Button> : null}
                    {order.status === 'accepted' ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'preparing')}>Start preparing</Button> : null}
                    {['accepted', 'preparing'].includes(order.status) ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'ready')}>Mark ready</Button> : null}
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </DashboardSection>

        <DashboardSection title="Operational view" description="A seller-first queue split that feels realistic instead of admin-heavy.">
          <div className="space-y-4">
            {[
              { title: 'New', body: `${summary.pending.length} incoming orders waiting for an accept or reject decision.` },
              { title: 'Preparing', body: `${summary.preparing.length} orders in the kitchen or packing workflow right now.` },
              { title: 'Ready', body: `${summary.ready.length} orders are ready for courier pickup.` },
              { title: 'Completed', body: `${summary.completed.length} orders have already been delivered today.` },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-lokals-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
