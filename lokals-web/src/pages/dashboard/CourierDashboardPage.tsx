import { AlertCircle, Bell, MessageSquare, PackageSearch, Power, Star, Truck, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, StatusBadge } from '../../components/Ui'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { TransportPanel, TransportTabs } from '../../components/transport/TransportSurface'
import { useCourierDeliveryAction, useUpdateCourierAvailability } from '../../hooks/queries'
import { useCourierOperationalData } from '../../lib/dashboardDataProvider'
import { type CourierDashboardData, getDashboardActivity } from '../../lib/dashboardTypes'
import { getApiErrorMessage } from '../../lib/api'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'

const dashboardTabs = [
  { label: 'Available', value: 'available' },
  { label: 'Active', value: 'active' },
  { label: 'Earnings', value: 'earnings' },
  { label: 'History', value: 'history' },
]

export function CourierDashboardPage() {
  const dashboardQuery = useCourierOperationalData()
  const data = dashboardQuery.data as CourierDashboardData | undefined
  const [activeTab, setActiveTab] = useState('available')
  const availability = data?.availability ?? 'unknown'
  const availabilityTone = availability === 'online' ? 'success' : availability === 'offline' ? 'warning' : 'neutral'
  const availabilityLabel = availability === 'online' ? 'online' : availability === 'offline' ? 'offline' : 'unknown'

  const updateAvailabilityMutation = useUpdateCourierAvailability()
  const deliveryActionMutation = useCourierDeliveryAction()
  const [deliveryActionState, setDeliveryActionState] = useState<Record<number, { action: string; pending: boolean; error?: string }>>({})

  const activeDelivery = data?.activeDelivery
  const availableDeliveries = data?.availableDeliveries ?? []
  const deliveryHistory = data?.deliveryHistory ?? []
  const earningsSummary = data?.earningsSummary ?? {}
  const ratingsSummary = data?.ratingsSummary ?? { average: '0', total: '0' }
  const unreadNotifications = data?.unread.notifications ?? 0
  const unreadMessages = data?.unread.messages ?? 0
  const recentActivity = getDashboardActivity(data?.dashboard ?? undefined)
  const availableOrderDeliveries = data?.availableOrderDeliveries ?? []
  const activeOrderDelivery = data?.activeOrderDelivery

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
      title="Courier workspace"
      description="A cleaner operational workspace built around available deliveries, the active drop-off, and the next required action."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={{
        availability: availabilityLabel,
        available_deliveries: availableDeliveries.length,
        active_delivery: activeDelivery ? 1 : 0,
        available_order_deliveries: availableOrderDeliveries.length,
        active_order_delivery: activeOrderDelivery ? 1 : 0,
        unread_notifications: unreadNotifications,
      }}
      actions={
        <Button variant={availability === 'online' ? 'secondary' : 'primary'} onClick={handleAvailabilityToggle} disabled={updateAvailabilityMutation.isPending}>
          <Power className="mr-2 h-4 w-4" />
          {updateAvailabilityMutation.isPending ? 'Updating...' : availability === 'online' ? 'Go offline' : 'Go online'}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[28px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#f9faff)] p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Operational focus</p>
              <h3 className="mt-1 text-xl font-semibold text-lokals-charcoal">{activeDelivery ? 'Active delivery in progress' : 'Waiting for the next parcel request'}</h3>
              <p className="mt-2 text-sm text-lokals-muted">
                {activeDelivery ? `${activeDelivery.pickup_location ?? activeDelivery.pickup_address} to ${activeDelivery.dropoff_location ?? activeDelivery.dropoff_address}` : 'Stay online and the next nearby delivery request will appear here.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={availabilityLabel} tone={availabilityTone} />
              <StatusBadge value={`${availableDeliveries.length} open deliveries`} tone="accent" />
              <StatusBadge value={`${availableOrderDeliveries.length} order pickups`} tone="success" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Order Delivery</p>
              <p className="mt-1 font-semibold text-lokals-charcoal">
                {activeOrderDelivery
                  ? `${activeOrderDelivery.reference_code ?? `Order #${activeOrderDelivery.id}`} is currently assigned to you.`
                  : availableOrderDeliveries.length
                    ? `${availableOrderDeliveries.length} ready seller order pickup${availableOrderDeliveries.length === 1 ? '' : 's'} available now.`
                    : 'No seller order pickups are waiting right now.'}
              </p>
            </div>
            <Link to="/dashboard/courier/orders"><Button variant="secondary">Open order deliveries</Button></Link>
          </div>
        </div>

        <TransportTabs items={dashboardTabs} value={activeTab} onChange={setActiveTab} />

        {activeTab === 'available' ? (
          <TransportPanel title="Available deliveries" description="Accept or decline from a compact request list with clearer status and stronger action hierarchy.">
            <div className="space-y-3">
              {availability !== 'online' && availableDeliveries.length > 0 ? (
                <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  You are offline and will not receive new delivery alerts until you go online.
                </div>
              ) : null}
              {availableDeliveries.map((delivery, index) => {
                const deliveryState = deliveryActionState[delivery.id]
                const isPending = deliveryState?.pending ?? false
                const isPriority = index === 0

                return (
                  <div key={delivery.id} className={`rounded-[24px] border px-4 py-4 ${isPriority ? 'border-lokals-purple/20 bg-violet-50' : 'border-lokals-border bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {isPriority ? <StatusBadge value="Priority" tone="accent" /> : null}
                          <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} to {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                        </div>
                        <p className="mt-2 text-sm text-lokals-muted">{delivery.user?.name ?? 'Sender'} | {delivery.parcel_size ?? 'Parcel'} | N$ {delivery.estimated_price ?? '0'}</p>
                      </div>
                      <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                    </div>
                    {deliveryState?.error ? (
                      <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <p>{deliveryState.error}</p>
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button disabled={isPending} onClick={() => handleDeliveryAction(delivery.id, 'accept')}>
                        {isPending && deliveryState?.action === 'accept' ? 'Accepting...' : 'Accept'}
                      </Button>
                      <Button variant="secondary" disabled={isPending} onClick={() => handleDeliveryAction(delivery.id, 'decline')}>
                        {isPending && deliveryState?.action === 'decline' ? 'Declining...' : 'Decline'}
                      </Button>
                      <Link to={`/delivery/${delivery.id}`}><Button variant="secondary">Details</Button></Link>
                      {delivery.user?.phone ? (
                        <Button variant="secondary" onClick={() => { window.location.href = `tel:${delivery.user?.phone}` }}>
                          Call sender
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
              {!availableDeliveries.length ? (
                <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                  No delivery requests right now. Stay online and the next parcel request will appear here.
                </div>
              ) : null}
            </div>
          </TransportPanel>
        ) : null}

        {activeTab === 'active' ? (
          <TransportPanel title="Active delivery" description="Keep the current delivery and its next required action in one focused workspace.">
            {activeDelivery ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[24px] border border-lokals-border bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{activeDelivery.pickup_location ?? activeDelivery.pickup_address} to {activeDelivery.dropoff_location ?? activeDelivery.dropoff_address}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{activeDelivery.user?.name ?? 'Sender'} | {activeDelivery.user?.phone ?? 'No phone yet'}</p>
                    </div>
                    <StatusBadge value={formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label)} tone={transportStatusTone(activeDelivery.status)} />
                  </div>
                  {deliveryActionState[activeDelivery.id]?.error ? (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <p>{deliveryActionState[activeDelivery.id]?.error}</p>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/delivery/${activeDelivery.id}`}><Button variant="secondary">Open details</Button></Link>
                    {activeDelivery.user?.phone ? <Button variant="secondary" onClick={() => { window.location.href = `tel:${activeDelivery.user?.phone}` }}>Call sender</Button> : null}
                    {activeDelivery.status === 'accepted' ? <Button disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'pickup-confirmed')}>{deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'pickup-confirmed' ? 'Updating...' : 'Confirm pickup'}</Button> : null}
                    {activeDelivery.status === 'pickup_confirmed' ? <Button disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'in-transit')}>{deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'in-transit' ? 'Updating...' : 'Mark in transit'}</Button> : null}
                    {activeDelivery.status === 'in_transit' ? <Button disabled={deliveryActionState[activeDelivery.id]?.pending} onClick={() => handleDeliveryAction(activeDelivery.id, 'delivered')}>{deliveryActionState[activeDelivery.id]?.pending && deliveryActionState[activeDelivery.id]?.action === 'delivered' ? 'Updating...' : 'Mark delivered'}</Button> : null}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Status', value: formatTransportStatus(activeDelivery.tracking_status ?? activeDelivery.status, activeDelivery.status_label), icon: Truck },
                    { label: 'Parcel size', value: activeDelivery.parcel_size ?? 'Parcel', icon: PackageSearch },
                    { label: 'Estimate', value: activeDelivery.estimated_price || activeDelivery.price ? `N$ ${activeDelivery.estimated_price ?? activeDelivery.price}` : 'Open fare', icon: Wallet },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-lokals-border bg-white px-4 py-4">
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
              </div>
            ) : (
              <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                No active delivery yet. Once you accept a parcel request it will appear here.
              </div>
            )}
          </TransportPanel>
        ) : null}

        {activeTab === 'earnings' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <TransportPanel title="Earnings visibility" description="Keep delivery totals and trust signals in a compact operational view.">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(earningsSummary).slice(0, 6).map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{label.replaceAll('_', ' ')}</p>
                    <p className="mt-2 text-xl font-semibold text-lokals-charcoal">{String(value)}</p>
                  </div>
                ))}
                {!Object.keys(earningsSummary).length ? (
                  <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-sm text-lokals-muted">
                    No earnings yet. Complete your first delivery to see totals here.
                  </div>
                ) : null}
              </div>
            </TransportPanel>

            <div className="space-y-3">
              {[
                { label: 'Average rating', value: String(ratingsSummary.average ?? '0'), icon: Star },
                { label: 'Total ratings', value: String(ratingsSummary.total ?? '0'), icon: Star },
                { label: 'Unread notifications', value: String(unreadNotifications), icon: Bell },
                { label: 'Unread messages', value: String(unreadMessages), icon: MessageSquare },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-lokals-border bg-white px-4 py-4">
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
          </div>
        ) : null}

        {activeTab === 'history' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <TransportPanel title="Delivery history" description="A lighter history view focused on route, outcome, and quick detail access.">
              <div className="space-y-3">
                {deliveryHistory.slice(0, 8).map((delivery) => (
                  <div key={delivery.id} className="rounded-[24px] border border-lokals-border bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-lokals-charcoal">{delivery.pickup_location ?? delivery.pickup_address} to {delivery.dropoff_location ?? delivery.dropoff_address}</p>
                        <p className="mt-1 text-sm text-lokals-muted">{delivery.user?.name ?? 'Sender'} | {delivery.estimated_price || delivery.price ? `N$ ${delivery.estimated_price ?? delivery.price}` : 'Open fare'}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge value={formatTransportStatus(delivery.tracking_status ?? delivery.status, delivery.status_label)} tone={transportStatusTone(delivery.status)} />
                        <div className="mt-2">
                          <Link to={`/delivery/${delivery.id}`}><Button variant="secondary">Details</Button></Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!deliveryHistory.length ? (
                  <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                    Completed and cancelled deliveries will appear here as you start working parcels.
                  </div>
                ) : null}
              </div>
            </TransportPanel>

            <TransportPanel title="Recent activity" description="Latest courier updates, assignments, and completions.">
              {recentActivity.length ? (
                <RecentActivityList items={recentActivity} />
              ) : (
                <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center text-sm text-lokals-muted">
                  No recent activity yet. Your courier dashboard will update as deliveries are assigned and completed.
                </div>
              )}
            </TransportPanel>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}
