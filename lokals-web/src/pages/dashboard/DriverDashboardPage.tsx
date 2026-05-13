import { CarFront, History, Power, Wallet } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useDriverDashboard } from '../../hooks/queries'
import type { RoleDashboardPayload } from '../../types'

export function DriverDashboardPage() {
  const dashboardQuery = useDriverDashboard()
  const dashboard = dashboardQuery.data as RoleDashboardPayload | undefined

  return (
    <DashboardShell
      mode="driver"
      eyebrow="Driver mode"
      title="Driver dashboard"
      description="Go online, pick up nearby ride requests, track active trips, and keep earnings in view."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="Practical controls for your next trip.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/ride" title="Available rides" body="Review nearby resident requests." icon={CarFront} />
            <QuickActionTile to="/dashboard/driver" title="Go online" body="Control whether you are visible for matching." icon={Power} />
            <QuickActionTile to="/ride" title="Trip history" body="Review recently completed trips." icon={History} />
            <QuickActionTile to="/dashboard/driver" title="Earnings" body="See your latest ride totals and payouts." icon={Wallet} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="What still needs attention before your next trip.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available ride requests" description="Fresh resident requests that still need a driver.">
          <div className="space-y-3">
            {(((dashboard as any)?.available_requests as any[]) ?? []).slice(0, 6).map((ride) => (
              <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                <p className="mt-1 text-sm text-lokals-muted">{ride.user?.name ?? 'Resident'} | {ride.ride_type ?? 'Standard'} | N$ {ride.fare_estimate ?? '0'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Trip history" description="Recent trips and their current outcome.">
          <div className="space-y-3">
            {(((dashboard as any)?.trip_history as any[]) ?? []).slice(0, 6).map((ride) => (
              <div key={ride.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{ride.pickup_location} {'->'} {ride.dropoff_location}</p>
                <p className="mt-1 text-sm text-lokals-muted">{ride.status ?? 'requested'} | {ride.user?.name ?? 'Resident'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Latest movement across your driver workspace.">
        <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
      </DashboardSection>
    </DashboardShell>
  )
}
