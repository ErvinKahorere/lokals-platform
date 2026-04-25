import { BellRing, BookOpenCheck, Package2, ScanSearch, Store, UsersRound, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, PageHeader, QueryState, SectionCard, StatCard, StatusBadge } from '../../components/Ui'
import { useBusinessDashboard } from '../../hooks/queries'
import { getDisplayPrice } from '../../lib/display'

export function BusinessDashboardPage() {
  const dashboardQuery = useBusinessDashboard()
  const dashboard = dashboardQuery.data

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Business"
        title="Manage your business"
        description="Followers, products, bookings, alerts, and services stay in one calm workspace."
        actions={<Link to="/settings"><Button variant="secondary">Business settings</Button></Link>}
      />

      <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} empty={!dashboard}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {Object.entries(dashboard?.stats ?? {}).map(([key, value]) => (
            <StatCard key={key} label={key.replaceAll('_', ' ')} value={String(value)} hint="Business snapshot" />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-lokals-charcoal">Business setup</h2>
                <p className="mt-1 text-sm text-lokals-muted">A simple path for completing your profile and publishing faster.</p>
              </div>
              <StatusBadge value={`${dashboard?.businesses?.length ?? 0} profiles`} tone="accent" />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { title: '1. Business name', body: 'Set a clear name customers recognize immediately.', icon: Store },
                { title: '2. Category', body: 'Choose the right category so nearby people find you.', icon: ScanSearch },
                { title: '3. Contact and location', body: 'Keep phone, WhatsApp, and area ready to act on.', icon: WalletCards },
                { title: '4. Services and products', body: 'Publish rates, products, and alerts when ready.', icon: Package2 },
              ].map(({ title, body, icon: Icon }) => (
                <div key={title} className="rounded-[20px] bg-[var(--bg)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {[
                { title: 'Add product', body: 'Keep your shelf fresh so customers always have something to browse.', icon: Package2 },
                { title: 'Add service', body: 'Publish rates and availability with fewer steps.', icon: Store },
                { title: 'Post alert', body: 'Turn updates and offers into follower-facing alerts quickly.', icon: BellRing },
                { title: 'Review bookings', body: 'See incoming demand and move appointments forward faster.', icon: BookOpenCheck },
              ].map(({ title, body, icon: Icon }) => (
                <div key={title} className="rounded-[20px] bg-[var(--bg)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-amber-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Products</h3>
                <p className="text-sm text-lokals-muted">What people can browse or ask about right now.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.products ?? []).slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                    <p className="text-lokals-muted">{product.category ?? 'Local product'}</p>
                  </div>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <WalletCards className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Services and rates</h3>
                <p className="text-sm text-lokals-muted">Keep pricing visible so decisions happen faster.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.services ?? []).slice(0, 4).map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                    <p className="text-lokals-muted">{service.duration_minutes} min</p>
                  </div>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(service.price, 'N$')}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-amber-700">
                <UsersRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lokals-charcoal">Alerts and followers</h3>
                <p className="text-sm text-lokals-muted">Stay close to the people who already care about your business.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {(dashboard?.alerts ?? []).slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-[18px] bg-[var(--bg)] p-3">
                  <p className="font-semibold text-lokals-charcoal">{alert.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{alert.body}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </QueryState>
    </div>
  )
}
