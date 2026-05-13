import { History, PackageSearch, Power, Wallet } from 'lucide-react'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useCourierDashboard } from '../../hooks/queries'
import type { RoleDashboardPayload } from '../../types'

export function CourierDashboardPage() {
  const dashboardQuery = useCourierDashboard()
  const dashboard = dashboardQuery.data as RoleDashboardPayload | undefined

  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier mode"
      title="Courier dashboard"
      description="Manage parcel requests, active drop-offs, online availability, and delivery earnings."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={dashboard?.stats ?? {}}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="The next delivery action should always be one tap away.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/delivery" title="Available deliveries" body="Review parcel requests still waiting for a courier." icon={PackageSearch} />
            <QuickActionTile to="/dashboard/courier" title="Go online" body="Become available for new courier requests." icon={Power} />
            <QuickActionTile to="/delivery" title="Delivery history" body="See recent drop-offs and status changes." icon={History} />
            <QuickActionTile to="/dashboard/courier" title="Earnings" body="Track estimated and completed courier earnings." icon={Wallet} />
          </div>
        </DashboardSection>
        <DashboardSection title="Pending tasks" description="Approval and delivery workload at a glance.">
          <StatusBreakdownCard items={(dashboard?.pending_tasks ?? []).map((item: any) => ({ label: item.label, value: item.count }))} />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available deliveries" description="Nearby parcel requests ready for courier acceptance.">
          <div className="space-y-3">
            {(((dashboard as any)?.available_deliveries as any[]) ?? []).slice(0, 6).map((delivery) => (
              <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                <p className="mt-1 text-sm text-lokals-muted">{delivery.user?.name ?? 'Resident'} | {delivery.parcel_size ?? 'Parcel'} | N$ {delivery.estimated_price ?? '0'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Delivery history" description="Completed and active courier work in one list.">
          <div className="space-y-3">
            {(((dashboard as any)?.delivery_history as any[]) ?? []).slice(0, 6).map((delivery) => (
              <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                <p className="mt-1 text-sm text-lokals-muted">{delivery.status ?? 'requested'} | {delivery.user?.name ?? 'Resident'}</p>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Latest courier updates, assignments, and completions.">
        <RecentActivityList items={((dashboard as any)?.recent_activity ?? [])} />
      </DashboardSection>
    </DashboardShell>
  )
}
