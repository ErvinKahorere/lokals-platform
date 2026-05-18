import { BellRing, BookOpenCheck, CalendarRange, PlusCircle } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useServiceProviderDashboard } from '../../hooks/queries'
import { getDisplayPrice } from '../../lib/display'
import { getDashboardActivity, getDashboardArray } from '../../lib/dashboardTypes'
import type { Booking, RoleDashboardPayload, ServiceItem } from '../../types'

export function ServiceProviderDashboardPage() {
  const dashboardQuery = useServiceProviderDashboard()
  const dashboard = dashboardQuery.data as RoleDashboardPayload | undefined

  return (
    <DashboardShell
      mode="provider"
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
            <QuickActionTile to="/dashboard/provider/bookings" title="Manage Availability" body="Adjust slots and readiness." icon={CalendarRange} />
            <QuickActionTile to="/dashboard/provider/bookings" title="View Bookings" body="Track incoming service demand." icon={BookOpenCheck} />
            <QuickActionTile to="/dashboard/service-provider" title="Post Alert" body="Share service updates with followers." icon={BellRing} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Where provider ops need attention.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Recent bookings" description="Current bookings and enquiry-style demand.">
          <div className="space-y-3">
            {getDashboardArray(dashboard, 'recent_bookings').slice(0, 5).map((booking: Booking) => (
              <div key={booking.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Booking'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{booking.user?.name ?? 'Customer'} | {booking.status ?? 'pending'}</p>
              </div>
            ))}
            {!getDashboardArray(dashboard, 'recent_bookings').length ? <p className="text-sm text-lokals-muted">Incoming bookings will appear here once clients start booking your services.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Services offered" description="Your visible services and rates.">
          <div className="space-y-3">
            {(Array.isArray(dashboard?.services_offered) ? dashboard.services_offered : []).slice(0, 5).map((service: ServiceItem) => (
              <div key={service.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{service.name}</p>
                  <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(service.price, 'N$')}</span>
                </div>
                <p className="mt-1 text-sm text-lokals-muted">{service.duration_minutes} min - {service.price_type ?? 'fixed'}</p>
              </div>
            ))}
            {!((Array.isArray(dashboard?.services_offered) ? dashboard.services_offered : []).length) ? <p className="text-sm text-lokals-muted">Services and rates you publish will show up here.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Booking and provider updates.">
        <RecentActivityList items={getDashboardActivity(dashboard)} />
      </DashboardSection>
    </DashboardShell>
  )
}
