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

export function BusinessDashboardPage() {
  const dashboardQuery = useBusinessDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      eyebrow="Seller / Business"
      title="Business dashboard"
      description="Products, services, followers, promotions, and recent business activity in one place."
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
            <QuickActionTile to="/dashboard/business" title="Post Promotion" body="Share a sale or update with followers." icon={BellRing} />
            <QuickActionTile to="/store" title="View Store" body="Check how customers see your products." icon={ShoppingBasket} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="What to refresh next.">
          <StatusBreakdownCard items={Object.entries(dashboard?.stats ?? {}).slice(0, 5).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Sale alerts and promotions" description="Recent public-facing updates from your businesses.">
          <div className="space-y-3">
            {((dashboard?.alerts as any[]) ?? []).slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{alert.title}</p>
                <p className="mt-1 text-sm text-lokals-muted">{alert.body}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent product activity" description="Your latest products and their current pricing.">
          <div className="space-y-3">
            {((dashboard?.products as any[]) ?? []).slice(0, 5).map((product) => (
              <div key={product.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{product.category ?? 'Local product'} - {product.town ?? 'Windhoek'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Products, promotions, and business changes.">
        <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
      </DashboardSection>
    </DashboardShell>
  )
}
