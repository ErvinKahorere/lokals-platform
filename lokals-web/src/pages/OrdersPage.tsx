import { Clock3, PackageCheck, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { useOrders } from '../hooks/queries'
import { useOrderCart } from '../lib/orderCart'
import { getDisplayPrice } from '../lib/display'
import type { OrderRecord } from '../types'

export function OrdersPage() {
  const ordersQuery = useOrders()
  const cart = useOrderCart()
  const orders = ordersQuery.data?.data ?? []
  const activeOrders = orders.filter((order) => !['delivered', 'cancelled', 'rejected'].includes(order.status))
  const deliveredOrders = orders.filter((order) => order.status === 'delivered')

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orders"
        title="Order Delivery"
        description="Track shop and food orders separately from parcel delivery."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/store"><Button variant="secondary">Browse store</Button></Link>
            <Link to="/orders/checkout"><Button>Checkout {cart.totalItems ? `(${cart.totalItems})` : ''}</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple"><Clock3 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Active orders</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{activeOrders.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><PackageCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Delivered</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{deliveredOrders.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><ShoppingBag className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Cart subtotal</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{getDisplayPrice(cart.subtotal, 'N$')}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <QueryState isLoading={ordersQuery.isLoading} error={ordersQuery.error}>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="Browse local products and place your first order delivery."
            action={<Link to="/store"><Button>Open store</Button></Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order: OrderRecord) => (
              <SectionCard key={order.id} className="bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                      <StatusBadge value={order.status_label ?? order.status} tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' || order.status === 'rejected' ? 'danger' : 'accent'} />
                    </div>
                    <p className="mt-2 text-sm text-lokals-muted">{order.seller?.name ?? order.business?.name ?? 'Local seller'} • {order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{order.delivery_location?.address ?? 'Delivery address pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-lokals-muted">Total</p>
                    <p className="text-xl font-semibold text-lokals-charcoal">{getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/orders/${order.id}`}><Button>Track order</Button></Link>
                  {order.status === 'delivered' && !order.customer_rating ? <Link to={`/orders/${order.id}`}><Button variant="secondary">Rate order</Button></Link> : null}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
