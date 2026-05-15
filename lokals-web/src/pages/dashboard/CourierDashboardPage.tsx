import { Bell, History, MessageSquare, PackageSearch, Power, Star, Wallet, AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { useCourierOperationalData } from '../../lib/dashboardDataProvider'
import { getDashboardActivity, type CourierDashboardData } from '../../lib/dashboardTypes'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'
import { useCourierDeliveryAction, useUpdateCourierAvailability } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'

export function CourierDashboardPage() {
  const dashboardQuery = useCourierOperationalData()
  const data = dashboardQuery.data as CourierDashboardData | undefined

  const stats = useMemo(() => data?.dashboard?.stats ?? {}, [data?.dashboard?.stats])
  const availability = data?.availability ?? 'unknown'
  const availabilityTone = availability === 'online' ? 'success' : availability === 'offline' ? 'warning' : 'neutral'
  const availabilityLabel = availability === 'online' ? 'online' : availability === 'offline' ? 'offline' : 'unknown'

  const updateAvailabilityMutation = useUpdateCourierAvailability()
  const deliveryActionMutation = useCourierDeliveryAction()

  // Per-delivery pending state and error tracking
  const [deliveryActionState, setDeliveryActionState] = useState<Record<number, { action: string; pending: boolean; error?: string }>>({})

  const activeDelivery = data?.activeDelivery
  const availableDeliveries = data?.availableDeliveries ?? []
  const deliveryHistory = data?.deliveryHistory ?? []
  const earningsSummary = data?.earningsSummary ?? {}
  const ratingsSummary = data?.ratingsSummary ?? { average: '0', total: '0' }
  const unreadNotifications = data?.unread.notifications ?? 0
  const unreadMessages = data?.unread.messages ?? 0
  const recentActivity = getDashboardActivity(data?.dashboard ?? undefined)
  const handleAvailabilityToggle = () => {
    updateAvailabilityMutation.mutate(availability !== 'online')
  }

  const handleDeliveryAction = (deliveryId: number, action: 'accept' | 'decline' | 'pickup-confirmed' | 'in-transit' | 'delivered') => {
    setDeliveryActionState((prev) => ({
      ...prev,
      [deliveryId]: { action, pending: true, error: undefined },
    }))

    deliveryActionMutation.mutate({ deliveryId, action }, {
      onSuccess: () => {
        setDeliveryActionState((prev) => ({
          ...prev,
          [deliveryId]: { action, pending: false, error: undefined },
        }))
      },
      onError: (error) => {
        const errorMessage = getApiErrorMessage(error, 'Unable to update delivery status. Please try again.')
        setDeliveryActionState((prev) => ({
          ...prev,
          [deliveryId]: { action, pending: false, error: errorMessage },
        }))
      },
    })
  }

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
                <StatusBadge value={availabilityLabel} tone={availabilityTone} />
              </div>
              <p className="mt-3 text-base font-semibold text-lokals-charcoal">
                {availability === 'online' ? 'Go offline' : 'Go online'}
              </p>
              <p className="mt-1 text-sm text-lokals-muted">Control whether you are visible for parcel matching.</p>
            </button>
            <QuickActionTile to="/delivery" title="Delivery history" body="Review recently completed deliveries." icon={History} />
            <QuickActionTile to="/dashboard/courier" title="Earnings" body="Track estimated and completed courier earnings." icon={Wallet} />
          </div>
        </DashboardSection>

        <DashboardSection title="Operational summary" description="A live view of courier readiness and active workload.">
          <StatusBreakdownCard
            items={[
              { label: 'Availability', value: availabilityLabel },
              { label: 'Unread notifications', value: unreadNotifications },
              { label: 'Unread messages', value: unreadMessages },
              { label: 'Open deliveries', value: availableDeliveries.length },
            ]}
          />
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Available deliveries" description="Nearby parcel requests ready for courier acceptance.">
          <div className="space-y-3">
            {availableDeliveries.slice(0, 6).map((delivery) => {
              const deliveryState = deliveryActionState[delivery.id]
              const isPending = deliveryState?.pending ?? false
              const error = deliveryState?.error

              return (
                <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                    <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                  </div>
                  <p className="mt-1 text-sm text-lokals-muted">
                    {delivery.user?.name ?? 'Sender'} | {delivery.parcel_size ?? 'Parcel'} | N$ {delivery.estimated_price ?? '0'}
                  </p>
                  {error ? (
                    <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/delivery/${delivery.id}`}>
                      <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={isPending}>
                        Details
                      </Button>
                    </Link>
                    <Button className="min-h-9 px-3 py-2 text-xs" disabled={isPending} onClick={() => handleDeliveryAction(delivery.id, 'accept')}>
                      {isPending && deliveryState?.action === 'accept' ? 'Updating…' : 'Accept'}
                    </Button>
                    <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary" disabled={isPending} onClick={() => handleDeliveryAction(delivery.id, 'decline')}>
                      {isPending && deliveryState?.action === 'decline' ? 'Updating…' : 'Decline'}
                    </Button>
                  </div>
                </div>
              )
            })}
            {!availableDeliveries.length ? (
              <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center">
                <p className="font-semibold text-lokals-charcoal">No deliveries available</p>
                <p className="mt-2 text-sm text-lokals-muted">Stay available and the next parcel request will appear here.</p>
              </div>
            ) : null}
          </div>
        </DashboardSection>

        <DashboardSection title="Delivery history" description="Completed and active courier work in one list.">
          <div className="space-y-3">
            {deliveryHistory.slice(0, 6).map((delivery) => (
              <div key={delivery.id} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} {'->'} {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                  <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                </div>
                <p className="mt-1 text-sm text-lokals-muted">
                  {delivery.user?.name ?? 'Sender'}
                </p>
              </div>
            ))}
            {!deliveryHistory.length ? (
              <p className="text-sm text-lokals-muted">Completed and cancelled deliveries will appear here as you start working parcels.</p>
            ) : null}
          </div>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <DashboardSection title="Active delivery" description="The parcel currently assigned to you, if any.">
          {activeDelivery ? (
            <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-lokals-charcoal">{activeDelivery.pickup_location ?? activeDelivery.pickup_address} {'->'} {activeDelivery.dropoff_location ?? activeDelivery.dropoff_address}</p>
                <StatusBadge value={formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label)} tone={transportStatusTone(activeDelivery.status)} />
              </div>
              <p className="mt-1 text-sm text-lokals-muted">
                {activeDelivery.user?.name ?? 'Sender'}
              </p>
              <div className="mt-2">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-lokals-charcoal">
                  {transportStatusTone(activeDelivery.status)}
                </span>
              </div>
              {deliveryActionState[activeDelivery.id]?.error ? (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{deliveryActionState[activeDelivery.id]?.error}</p>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/delivery/${activeDelivery.id}`}>
                  <Button className="min-h-9 px-3 py-2 text-xs" variant="secondary">
                    Details
                  </Button>
                </Link>
                {activeDelivery.status === 'accepted' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'pickup-confirmed')}>
                    {deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'pickup-confirmed' ? 'Updating…' : 'Pickup confirmed'}
                  </Button>
                ) : null}
                {activeDelivery.status === 'pickup_confirmed' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'in-transit')}>
                    {deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'in-transit' ? 'Updating…' : 'In transit'}
                  </Button>
                ) : null}
                {activeDelivery.status === 'in_transit' ? (
                  <Button className="min-h-9 px-3 py-2 text-xs" disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'delivered')}>
                    {deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'delivered' ? 'Updating…' : 'Delivered'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center">
              <p className="font-semibold text-lokals-charcoal">No active delivery yet</p>
              <p className="mt-2 text-sm text-lokals-muted">Accept a delivery request to start tracking your active parcel.</p>
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Earnings summary" description="Latest delivery totals from your dashboard feed.">
          {Object.keys(earningsSummary).length ? (
            <StatusBreakdownCard
              items={Object.entries(earningsSummary).slice(0, 4).map(([label, value]) => ({
                label: label.replaceAll('_', ' '),
                value,
              }))}
            />
          ) : (
            <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
              No earnings yet. Complete your first delivery to see dashboard totals.
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Ratings and comms" description="Trust and inbox signals in one compact panel.">
          <div className="space-y-3">
            {[
              { label: 'Average rating', value: ratingsSummary.average ?? '0', icon: Star },
              { label: 'Total ratings', value: ratingsSummary.total ?? '0', icon: Star },
              { label: 'Unread notifications', value: unreadNotifications, icon: Bell },
              { label: 'Unread messages', value: unreadMessages, icon: MessageSquare },
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
        {recentActivity.length ? (
          <RecentActivityList items={recentActivity} />
        ) : (
          <div className="rounded-[20px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
            No recent activity yet. Your courier dashboard will update as deliveries are assigned and completed.
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}
