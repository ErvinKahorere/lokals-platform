import { BellRing, Package2, ShoppingBasket, Store, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, StatusBadge } from '../../components/Ui'
import { useBusinessDashboard } from '../../hooks/queries'
import { getDashboardArray } from '../../lib/dashboardTypes'
import { getDisplayPrice } from '../../lib/display'
import { getDashboardActivity } from '../../lib/dashboardTypes'
import type { AlertItem, Booking, BusinessDashboard, HireBookingRecord, HireItemRecord, OrderRecord, Product, RoleDashboardPayload, ServiceItem } from '../../types'

export function BusinessDashboardPage({
  variant = 'business',
}: {
  variant?: 'seller' | 'business'
}) {
  const dashboardQuery = useBusinessDashboard()
  const dashboard = dashboardQuery.data as (RoleDashboardPayload & BusinessDashboard) | undefined
  const title = variant === 'seller' ? 'Seller dashboard' : 'Business dashboard'
  const eyebrow = variant === 'seller' ? 'Seller' : 'Seller / Business'
  const description =
    variant === 'seller'
      ? 'Products, local enquiries, promotions, and shop activity in one focused workspace.'
      : 'Products, services, followers, promotions, and recent business activity in one place.'
  const recentOrders = getDashboardArray(dashboard, 'recent_orders') as OrderRecord[]
  const recentHireItems = getDashboardArray(dashboard, 'recent_hire_items') as HireItemRecord[]
  const recentHireBookings = getDashboardArray(dashboard, 'recent_hire_bookings') as HireBookingRecord[]
  const orderStats = [
    { label: 'Pending orders', value: dashboard?.stats?.pending_orders ?? 0 },
    { label: "Today's orders", value: dashboard?.stats?.today_orders ?? 0 },
    { label: 'Order revenue', value: getDisplayPrice(dashboard?.stats?.order_revenue ?? 0, 'N$') },
  ]
  const hireStats = [
    { label: 'Hire items', value: dashboard?.stats?.hire_items ?? 0 },
    { label: 'Pending hire bookings', value: dashboard?.stats?.pending_hire_bookings ?? 0 },
    { label: 'Hire revenue', value: getDisplayPrice(dashboard?.stats?.hire_revenue ?? 0, 'N$') },
  ]

  return (
    <DashboardShell
      mode="business"
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={<Link to="/store"><Button variant="secondary">View store</Button></Link>}
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Keep your store and public business presence active.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/store" title="Add Product" body="Publish a new product or update a listing." icon={Package2} />
            <QuickActionTile to="/services" title="Add Service" body="Attach services and rates to your business." icon={Store} />
            <QuickActionTile to="/dashboard/business/hire-items" title="List Hire Item" body="Offer generators, tools, and event gear for rental." icon={Warehouse} />
            <QuickActionTile to={variant === 'seller' ? '/dashboard/seller' : '/dashboard/business'} title="Post Promotion" body="Share a sale or update with followers." icon={BellRing} />
            <QuickActionTile to="/dashboard/business/hire-bookings" title="Review Hire Bookings" body="Accept, reject, and complete rental requests." icon={ShoppingBasket} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="What to refresh next.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Recent bookings / enquiries" description="Customer demand coming in through your products and services.">
          <div className="space-y-3">
            {getDashboardArray(dashboard, 'recent_bookings').slice(0, 5).map((booking: Booking) => (
              <div key={booking.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Booking enquiry'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{booking.user?.name ?? 'Customer'} | {booking.status ?? 'pending'}</p>
              </div>
            ))}
            {!getDashboardArray(dashboard, 'recent_bookings').length ? <p className="text-sm text-lokals-muted">New bookings and enquiries will appear here once customers start engaging.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Sale alerts and promotions" description="Recent public-facing updates from your businesses.">
          <div className="space-y-3">
            {(getDashboardArray(dashboard, 'sale_alerts').length > 0 ? getDashboardArray(dashboard, 'sale_alerts') : (dashboard?.alerts ?? [])).slice(0, 5).map((alert: AlertItem) => (
              <div key={alert.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{alert.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{alert.body}</p>
              </div>
            ))}
            {!(getDashboardArray(dashboard, 'sale_alerts').length > 0 ? getDashboardArray(dashboard, 'sale_alerts') : (dashboard?.alerts ?? [])).length ? <p className="text-sm text-lokals-muted">Promotions and sale alerts will appear here after your first published update.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent product activity" description="Your latest products and their current pricing.">
          <div className="space-y-3">
            {(getDashboardArray(dashboard, 'recent_products').length > 0 ? getDashboardArray(dashboard, 'recent_products') : (dashboard?.products ?? [])).slice(0, 5).map((product: Product) => (
              <div key={product.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{product.category ?? 'Local product'} - {product.town ?? 'Okahandja'}</p>
              </div>
            ))}
            {!(getDashboardArray(dashboard, 'recent_products').length > 0 ? getDashboardArray(dashboard, 'recent_products') : (dashboard?.products ?? [])).length ? <p className="text-sm text-lokals-muted">Products you publish in the store will show up here.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardSection title="Order performance" description="Keep new order volume, revenue, and acceptance pressure visible.">
          <StatusBreakdownCard items={orderStats} />
        </DashboardSection>
        <DashboardSection title="Hire performance" description="Track local rental supply and how many bookings still need a decision.">
          <StatusBreakdownCard items={hireStats} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardSection title="Recent orders" description="The newest shop and food orders waiting on action or courier handoff.">
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25 hover:bg-emerald-50/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{order.reference_code ?? `Order #${order.id}`}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{order.customer?.name ?? 'Customer'} | {order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{order.status_label ?? order.status}</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">{getDisplayPrice(order.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
              </Link>
            ))}
            {!recentOrders.length ? <p className="text-sm text-lokals-muted">New orders will appear here once customers start ordering products from your store.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent hire bookings" description="The rental queue stays separate so parcel delivery and store orders never blur together.">
          <div className="space-y-3">
            {recentHireBookings.slice(0, 5).map((booking) => (
              <Link key={booking.id} to={`/hire/bookings/${booking.id}`} className="block rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25 hover:bg-emerald-50/20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{booking.reference_code ?? `Hire #${booking.id}`}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{booking.item?.title ?? 'Hire item'} | {booking.customer?.name ?? 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">{booking.status_label ?? booking.status}</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">{getDisplayPrice(booking.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
              </Link>
            ))}
            {!recentHireBookings.length ? <p className="text-sm text-lokals-muted">Rental requests will appear here once customers start booking your hire items.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Services and rates" description="Services attached to your business footprint.">
          <div className="grid gap-3 md:grid-cols-2">
            {getDashboardArray(dashboard, 'recent_services').slice(0, 4).map((service: ServiceItem) => (
              <div key={service.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(service.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{service.price_type ?? 'fixed'} | {service.duration_minutes ?? 0} min</p>
              </div>
            ))}
            {!getDashboardArray(dashboard, 'recent_services').length ? <p className="text-sm text-lokals-muted">Services and rates will appear here after you add them.</p> : null}
          </div>
      </DashboardSection>

      <DashboardSection title="Recent hire items" description="The latest rental inventory visible to admins and customers after approval.">
        <div className="grid gap-3 md:grid-cols-2">
          {recentHireItems.slice(0, 4).map((item) => (
            <Link key={item.id} to={`/hire/${item.id}`} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4 transition hover:border-lokals-green/25 hover:bg-emerald-50/20">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                <StatusBadge value={item.verification_status ?? 'pending'} tone={item.verification_status === 'approved' ? 'success' : 'warning'} />
              </div>
              <p className="mt-1 text-sm text-lokals-muted">{item.category} | {item.area ?? item.town ?? 'Okahandja'}</p>
            </Link>
          ))}
          {!recentHireItems.length ? <p className="text-sm text-lokals-muted">Hire items you publish will show up here for quick inventory visibility.</p> : null}
        </div>
      </DashboardSection>

      <DashboardSection title="Recent activity" description="Products, promotions, and business changes.">
        <RecentActivityList items={getDashboardActivity(dashboard)} />
      </DashboardSection>
    </DashboardShell>
  )
}
