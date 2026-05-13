import { BellRing, Package2, ShoppingBasket, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button } from '../../components/Ui'
import { useBusinessDashboard } from '../../hooks/queries'
import { getDisplayPrice } from '../../lib/display'
import type { BusinessDashboard, RoleDashboardPayload } from '../../types'

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
            <QuickActionTile to={variant === 'seller' ? '/dashboard/seller' : '/dashboard/business'} title="Post Promotion" body="Share a sale or update with followers." icon={BellRing} />
            <QuickActionTile to="/store" title="View Store" body="Check how customers see your products." icon={ShoppingBasket} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="What to refresh next.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Recent bookings / enquiries" description="Customer demand coming in through your products and services.">
          <div className="space-y-3">
            {(((dashboard as any)?.recent_bookings as any[]) ?? []).slice(0, 5).map((booking) => (
              <div key={booking.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Booking enquiry'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{booking.user?.name ?? 'Customer'} | {booking.status ?? 'pending'}</p>
              </div>
            ))}
            {!((dashboard as any)?.recent_bookings as any[])?.length ? <p className="text-sm text-lokals-muted">New bookings and enquiries will appear here once customers start engaging.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Sale alerts and promotions" description="Recent public-facing updates from your businesses.">
          <div className="space-y-3">
            {((((dashboard as any)?.sale_alerts as any[]) ?? (dashboard?.alerts as any[]) ?? [])).slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{alert.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{alert.body}</p>
              </div>
            ))}
            {!((((dashboard as any)?.sale_alerts as any[]) ?? (dashboard?.alerts as any[]) ?? [])).length ? <p className="text-sm text-lokals-muted">Promotions and sale alerts will appear here after your first published update.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent product activity" description="Your latest products and their current pricing.">
          <div className="space-y-3">
            {((((dashboard as any)?.recent_products as any[]) ?? (dashboard?.products as any[]) ?? [])).slice(0, 5).map((product) => (
              <div key={product.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{product.category ?? 'Local product'} - {product.town ?? 'Okahandja'}</p>
              </div>
            ))}
            {!((((dashboard as any)?.recent_products as any[]) ?? (dashboard?.products as any[]) ?? [])).length ? <p className="text-sm text-lokals-muted">Products you publish in the store will show up here.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Services and rates" description="Services attached to your business footprint.">
          <div className="grid gap-3 md:grid-cols-2">
            {(((dashboard as any)?.recent_services as any[]) ?? []).slice(0, 4).map((service) => (
              <div key={service.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(service.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{service.price_type ?? 'fixed'} | {service.duration_minutes ?? 0} min</p>
              </div>
            ))}
            {!((dashboard as any)?.recent_services as any[])?.length ? <p className="text-sm text-lokals-muted">Services and rates will appear here after you add them.</p> : null}
          </div>
      </DashboardSection>

      <DashboardSection title="Recent activity" description="Products, promotions, and business changes.">
        <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
      </DashboardSection>
    </DashboardShell>
  )
}
