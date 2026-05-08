import { BellRing, BookOpenCheck, CalendarRange, PlusCircle } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useServiceProviderDashboard } from '../../hooks/queries'
import { getDisplayPrice } from '../../lib/display'

export function ServiceProviderDashboardPage() {
  const dashboardQuery = useServiceProviderDashboard()
  const dashboard = dashboardQuery.data

  return (
    <DashboardShell
      eyebrow="Service Provider"
      title="Service provider dashboard"
      description="Bookings, services, availability, and follower demand in one clear workspace."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Keep services and availability easy to manage.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/services" title="Add Service" body="Publish another service or rate." icon={PlusCircle} />
            <QuickActionTile to="/provider-bookings" title="Manage Availability" body="Adjust slots and readiness." icon={CalendarRange} />
            <QuickActionTile to="/provider-bookings" title="View Bookings" body="Track incoming service demand." icon={BookOpenCheck} />
            <QuickActionTile to="/dashboard/service-provider" title="Post Alert" body="Share service updates with followers." icon={BellRing} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Where provider ops need attention.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Services offered" description="Your visible services and rates.">
          <div className="space-y-3">
            {((dashboard?.services_offered as any[]) ?? []).slice(0, 5).map((service) => (
              <div key={service.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(service.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{service.duration_minutes} min - {service.price_type ?? 'fixed'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent activity" description="Booking and provider updates.">
          <RecentActivityList items={(dashboard?.recent_activity as any[]) ?? []} />
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}
