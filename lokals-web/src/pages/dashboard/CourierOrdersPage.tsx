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

  const handleAction = (orderId: number, action: 'accept' | 'picked-up' | 'delivered') => {
    orderAction.mutate({ orderId, action })
  }

  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier"
      title="Order deliveries"
      description="Separate shop and food order deliveries from parcel runs, while reusing the same courier workflow."
      isLoading={availableOrdersQuery.isLoading || dashboardQuery.isLoading}
      error={availableOrdersQuery.error ?? dashboardQuery.error}
      stats={{
        available_orders: availableOrders.length,
        active_order_delivery: myCourierOrders.length,
      }}
      actions={<Link to="/dashboard/courier"><Button variant="secondary">Back to courier overview</Button></Link>}
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardSection title="Available order pickups" description="Ready-for-pickup seller orders that can be accepted right now.">
          <QueryState isLoading={availableOrdersQuery.isLoading} error={availableOrdersQuery.error} empty={availableOrders.length === 0}>
            <div className="space-y-4">
              {availableOrders.map((order: OrderRecord) => (
                <div key={order.id} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.seller?.name ?? order.business?.name ?? 'Local seller'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.pickup_location?.address ?? 'Pickup point pending'} → {order.delivery_location?.address ?? 'Delivery point pending'}</p>
                    </div>
                    <StatusBadge value={order.status_label ?? order.status} tone="accent" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'accept')}>Accept pickup</Button>
                    <Link to={`/orders/${order.id}`}><Button variant="secondary">Details</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </DashboardSection>

        <DashboardSection title="My active order deliveries" description="Orders already assigned to you and their next step.">
          <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} empty={myCourierOrders.length === 0}>
            <div className="space-y-4">
              {myCourierOrders.map((order: OrderRecord) => (
                <div key={order.id} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} • {getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                    </div>
                    <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'picked_up' ? 'success' : 'accent'} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status === 'courier_assigned' ? <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'picked-up')}>Picked up</Button> : null}
                    {order.status === 'picked_up' ? <Button disabled={orderAction.isPending} onClick={() => handleAction(order.id, 'delivered')}>Delivered</Button> : null}
                    <Link to={`/orders/${order.id}`}><Button variant="secondary">Details</Button></Link>
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
