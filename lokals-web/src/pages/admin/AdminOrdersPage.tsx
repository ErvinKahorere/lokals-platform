import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'
import { useAdminOrders } from '../../hooks/queries'
import { getDisplayPrice } from '../../lib/display'
import type { OrderRecord } from '../../types'

export function AdminOrdersPage() {
  const [status, setStatus] = useState('all')
  const ordersQuery = useAdminOrders(status === 'all' ? undefined : { status })
  const orders = ordersQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Orders overview"
        description="Live order delivery operations across customers, sellers, and couriers."
        actions={<Link to="/dashboard/admin"><Button variant="secondary">Back to admin</Button></Link>}
      />

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'preparing', 'ready_for_pickup', 'courier_assigned', 'picked_up', 'delivered', 'cancelled'].map((item) => (
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
            <SectionCard key={order.id} className="bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                    <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} />
                  </div>
                  <p className="mt-2 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} • {order.seller?.name ?? order.business?.name ?? 'Seller'}</p>
                  <p className="mt-1 text-sm text-lokals-muted">Courier: {order.courier?.name ?? 'Unassigned'} • {order.delivery_location?.town ?? 'Town not set'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-lokals-muted">Total</p>
                  <p className="text-lg font-semibold text-lokals-charcoal">{getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to={`/orders/${order.id}`}><Button variant="secondary">Open details</Button></Link>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
