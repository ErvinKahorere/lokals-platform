import { Bell, History, MessageSquare, PackageSearch, Power, Star, Wallet } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, StatusBadge } from '../../components/Ui'
import { useCourierDeliveryAction, useUpdateCourierAvailability } from '../../hooks/queries'
import { useCourierOperationalData } from '../../lib/dashboardDataProvider'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'
import type { CourierDashboardData } from '../../lib/dashboardTypes'
import type { RoleDashboardPayload } from '../../types'

export function CourierDashboardPage() {
  const dashboardQuery = useCourierOperationalData()
  const data = dashboardQuery.data as CourierDashboardData | undefined
  const dashboard = data?.dashboard as RoleDashboardPayload | null | undefined
  const availableDeliveries = useMemo(() => data?.availableDeliveries ?? [], [data?.availableDeliveries])
  const deliveryHistory = useMemo(() => data?.deliveryHistory ?? [], [data?.deliveryHistory])
  const activeDelivery = data?.activeDelivery
  const activityRows = useMemo(() => dashboard?.recent_activity ?? [], [dashboard?.recent_activity])
  const availability = data?.availability ?? 'unknown'
  const availabilityMutation = useUpdateCourierAvailability()
  const deliveryActionMutation = useCourierDeliveryAction()
  const stats = useMemo(
    () => ({
      ...(dashboard?.stats ?? {}),
      availability,
      unread_notifications: data?.unread.notifications ?? 0,
      unread_messages: data?.unread.messages ?? 0,
    }),
    [availability, dashboard?.stats, data?.unread.messages, data?.unread.notifications],
  )
  const handleAvailabilityToggle = useCallback(() => {
    availabilityMutation.mutate(availability !== 'online')
  }, [availability, availabilityMutation])
  const handleDeliveryAction = useCallback((deliveryId: number, action: 'accept' | 'decline' | 'pickup-confirmed' | 'in-transit' | 'delivered') => {
    deliveryActionMutation.mutate({ deliveryId, action })
  }, [deliveryActionMutation])

  return (
    <DashboardShell
      mode="courier"
      eyebrow="Courier mode"
      title="Courier dashboard"
      description="Manage parcel requests, active drop-offs, online availability, and delivery earnings."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={stats}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSection title="Quick actions" description="The next delivery action should always be one tap away.">
          <div className="grid gap-3 md:grid-cols-2">
            <QuickActionTile to="/delivery" title="Available deliveries" body="Review parcel requests still waiting for a courier." icon={PackageSearch} />
            <button
              type="button"
              onClick={handleAvailabilityToggle}
              className="rounded-[22px] border border-lokals-border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-lokals-purple/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                  <Power className="h-5 w-5" />
                </div>
                <StatusBadge value={availability === 'online' ? 'online' : 'offline'} tone={availability === 'online' ? 'success' : 'neutral'} />
              </div>
              <p className="mt-3 text-base font-semibold text-lokals-charcoal">{availability === 'online' ? 'Go offline' : 'Go online'}</p>
              <p className="mt-1 text-sm text-lokals-muted">Control whether you are visible for parcel matching.</p>
            </button>
            <QuickActionTile to="/delivery" title="Delivery history" body="See recent drop-offs and status changes." icon={History} />
            <QuickActionTile to="/dashboard/courier" title="Earnings" body="Track estimated and completed courier earnings." icon={Wallet} />
          </div>
        </DashboardSection>
        <DashboardSection title="Operational summary" description="A live view of courier readiness and active workload.">
          <StatusBreakdownCard
            items={[
              { label: 'Availability', value: availability },
              { label: 'Unread notifications', value: data?.unread.notifications ?? 0 },
              { label: 'Unread messages', value: data?.unread.messages ?? 0 },
              { label: 'Open deliveries', value: availableDeliveries.length },
            ]}
          />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available deliveries" description="Nearby parcel requests ready for courier acceptance.">
          <div className="space-y-3">
            {availableDeliveries.slice(0, 6).map((delivery) => (
              <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                <p className="mt-1 text-sm text-lokals-muted">{delivery.user?.name ?? 'Resident'} | {delivery.parcel_size ?? 'Parcel'} | N$ {delivery.estimated_price ?? '0'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={`/delivery/${delivery.id}`}><Button className="min-h-9 px-3 py-2 text-xs" variant="secondary">Details</Button></Link>
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionMutation.isPending} onClick={() => handleDeliveryAction(delivery.id, 'accept')}>
                    Accept
                  </Button>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={deliveryActionMutation.isPending} onClick={() => handleDeliveryAction(delivery.id, 'decline')}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
            {!availableDeliveries.length ? <p className="text-sm text-lokals-muted">No courier requests are waiting right now. Stay available to catch the next parcel.</p> : null}
          </div>
        </DashboardSection>
        <DashboardSection title="Delivery history" description="Completed and active courier work in one list.">
          <div className="space-y-3">
            {deliveryHistory.slice(0, 6).map((delivery) => (
              <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                <p className="mt-1 text-sm text-lokals-muted">{formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} | {delivery.user?.name ?? 'Resident'}</p>
              </div>
            ))}
            {!deliveryHistory.length ? <p className="text-sm text-lokals-muted">Completed and cancelled deliveries will appear here as you start handling parcels.</p> : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Active delivery" description="The parcel run currently assigned to you, if any.">
          {activeDelivery ? (
            <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <p className="font-semibold text-lokals-charcoal">{activeDelivery.pickup_location ?? activeDelivery.pickup_address} {'->'} {activeDelivery.dropoff_location ?? activeDelivery.dropoff_address}</p>
              <p className="mt-1 text-sm text-lokals-muted">{formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label)} | {activeDelivery.user?.name ?? 'Resident'}</p>
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-lokals-charcoal">
                  {transportStatusTone(activeDelivery.status) === 'success' ? 'Completed' : 'Active now'}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/delivery/${activeDelivery.id}`}><Button className="min-h-9 px-3 py-2 text-xs" variant="secondary">Details</Button></Link>
                {activeDelivery.status === 'accepted' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionMutation.isPending} onClick={() => handleDeliveryAction(activeDelivery.id, 'pickup-confirmed')}>Pickup confirmed</Button> : null}
                {activeDelivery.status === 'pickup_confirmed' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionMutation.isPending} onClick={() => handleDeliveryAction(activeDelivery.id, 'in-transit')}>In transit</Button> : null}
                {activeDelivery.status === 'in_transit' ? <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionMutation.isPending} onClick={() => handleDeliveryAction(activeDelivery.id, 'delivered')}>Delivered</Button> : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-lokals-muted">No active delivery yet. Once you accept a parcel request it will appear here.</p>
          )}
        </DashboardSection>
        <DashboardSection title="Earnings summary" description="Latest delivery totals from your dashboard feed.">
          <StatusBreakdownCard items={Object.entries(data?.earningsSummary ?? {}).slice(0, 4).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value }))} />
        </DashboardSection>
        <DashboardSection title="Ratings and comms" description="Trust and inbox signals in one compact panel.">
          <div className="space-y-3">
            {[
              { label: 'Average rating', value: data?.ratingsSummary.average ?? '0', icon: Star },
              { label: 'Total ratings', value: data?.ratingsSummary.total ?? '0', icon: Star },
              { label: 'Unread notifications', value: data?.unread.notifications ?? 0, icon: Bell },
              { label: 'Unread messages', value: data?.unread.messages ?? 0, icon: MessageSquare },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                </div>
                <span className="text-sm font-semibold text-lokals-charcoal">{item.value}</span>
              </div>
            ))}
          </div>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" description="Latest courier updates, assignments, and completions.">
        <RecentActivityList items={activityRows} />
      </DashboardSection>
    </DashboardShell>
  )
}
