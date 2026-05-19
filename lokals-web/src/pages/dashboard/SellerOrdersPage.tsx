import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, QueryState, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { useSellerOrderAction, useSellerOrders } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'
import { getDisplayPrice } from '../../lib/display'
import type { OrderRecord } from '../../types'

const filters = ['all', 'pending', 'accepted', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled'] as const

export function SellerOrdersPage() {
  const [status, setStatus] = useState<(typeof filters)[number]>('all')
  const ordersQuery = useSellerOrders(status === 'all' ? undefined : { status })
  const actionMutation = useSellerOrderAction()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const orders = ordersQuery.data?.data ?? []

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
      title="Seller orders"
      description="Review incoming orders, move preparation forward, and hand off ready orders to couriers."
      isLoading={ordersQuery.isLoading}
      error={ordersQuery.error}
      stats={{
        pending: orders.filter((order) => order.status === 'pending').length,
        preparing: orders.filter((order) => order.status === 'preparing').length,
        ready_for_pickup: orders.filter((order) => order.status === 'ready_for_pickup').length,
      }}
      actions={<Link to="/store"><Button variant="secondary">Open store</Button></Link>}
    >
      <DashboardSection title="Order queue" description="One order per seller keeps local shop operations simple and practical.">
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
              <div key={order.id} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} />
                    </div>
                    <p className="mt-2 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} • {order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{order.delivery_location?.address ?? 'Delivery address pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-lokals-muted">Total</p>
                    <p className="text-lg font-semibold text-lokals-charcoal">{getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/orders/${order.id}`}><Button variant="secondary">Details</Button></Link>
                  {order.status === 'pending' ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'accept')}>Accept</Button> : null}
                  {order.status === 'pending' ? <Button variant="secondary" disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'reject')}>Reject</Button> : null}
                  {order.status === 'accepted' ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'preparing')}>Preparing</Button> : null}
                  {['accepted', 'preparing'].includes(order.status) ? <Button disabled={actionMutation.isPending} onClick={() => handleAction(order.id, 'ready')}>Ready for pickup</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </QueryState>
      </DashboardSection>
    </DashboardShell>
  )
}
