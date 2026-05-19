import { Link } from 'react-router-dom'
import { Button, QueryState, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { useCourierAvailableOrders, useCourierOrderAction } from '../../hooks/queries'
import { useCourierOperationalData } from '../../lib/dashboardDataProvider'
import { getDisplayPrice } from '../../lib/display'
import type { OrderRecord } from '../../types'

export function CourierOrdersPage() {
  const dashboardQuery = useCourierOperationalData()
  const availableOrdersQuery = useCourierAvailableOrders()
  const orderAction = useCourierOrderAction()
  const availableOrders = availableOrdersQuery.data?.data ?? []
  const myCourierOrders = dashboardQuery.data?.orderDeliveryHistory.filter((order) => ['courier_assigned', 'picked_up'].includes(order.status)) ?? []
  const completed = dashboardQuery.data?.orderDeliveryHistory.filter((order) => order.status === 'delivered') ?? []
  const activePayout = myCourierOrders.reduce((sum, order) => sum + Number(order.totals?.delivery_fee ?? 0), 0)

  const handleAction = (orderId: number, action: 'accept' | 'picked-up' | 'delivered') => {
    orderAction.mutate({ orderId, action })
  }

  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier"
      title="Order delivery flow"
      description="Pick up ready seller orders, complete last-mile delivery, and keep food and shop runs distinct from parcel jobs."
      isLoading={availableOrdersQuery.isLoading || dashboardQuery.isLoading}
      error={availableOrdersQuery.error ?? dashboardQuery.error}
      stats={{
        available_orders: availableOrders.length,
        active_order_delivery: myCourierOrders.length,
      }}
      actions={<Link to="/dashboard/courier"><Button variant="secondary">Back to courier overview</Button></Link>}
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {[
          ['Available deliveries', String(availableOrders.length)],
          ['Active order run', String(myCourierOrders.length)],
          ['Completed', String(completed.length)],
          ['Estimated payout', getDisplayPrice(activePayout, 'N$')],
        ].map(([label, value], index) => (
          <div key={label} className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-sm">
            <p className="text-sm text-lokals-muted">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${index === 3 ? 'text-lokals-green' : 'text-lokals-charcoal'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <DashboardSection title="Available deliveries" description="Ready-for-pickup store and food orders that can be accepted right now.">
          <QueryState isLoading={availableOrdersQuery.isLoading} error={availableOrdersQuery.error} empty={availableOrders.length === 0}>
            <div className="space-y-4">
              {availableOrders.map((order: OrderRecord) => (
                <div key={order.id} className="rounded-[26px] border border-lokals-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.seller?.name ?? order.business?.name ?? 'Local seller'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.pickup_location?.address ?? 'Pickup point pending'} | {order.delivery_location?.address ?? 'Drop-off pending'}</p>
                    </div>
                    <StatusBadge value={order.status_label ?? order.status} tone="accent" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Payout', getDisplayPrice(order.totals?.delivery_fee ?? 0, 'N$')],
                      ['Distance', order.delivery_location?.address ? 'Local route' : 'Pending'],
                      ['ETA', order.estimated_arrival_minutes ? `${order.estimated_arrival_minutes} min` : 'Updating'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[18px] bg-slate-50 px-3 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-lokals-muted">{label}</p>
                        <p className="mt-2 font-semibold text-lokals-charcoal">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'accept')}>Accept delivery</Button>
                    <Link to={`/orders/${order.id}`}><Button variant="secondary">Details</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </DashboardSection>

        <DashboardSection title="Active order runs" description="One compact flow from pickup to delivered, reusing the transport patterns that already work well.">
          <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} empty={myCourierOrders.length === 0}>
            <div className="space-y-4">
              {myCourierOrders.map((order: OrderRecord) => (
                <div key={order.id} className="rounded-[26px] border border-lokals-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} | {getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                    </div>
                    <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'picked_up' ? 'success' : 'accent'} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(order.tracking_steps ?? []).slice(0, 5).map((step) => (
                      <span key={step.key} className={`rounded-full px-3 py-1 text-xs font-semibold ${step.is_current ? 'bg-violet-100 text-lokals-purple' : step.is_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-lokals-muted'}`}>
                        {step.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status === 'courier_assigned' ? <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'picked-up')}>Pickup confirmed</Button> : null}
                    {order.status === 'picked_up' ? <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'delivered')}>Delivered</Button> : null}
                    <Link to={`/orders/${order.id}`}><Button variant="secondary">Track order</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
