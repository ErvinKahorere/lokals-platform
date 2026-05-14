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
      {/* TEMPORARY ISOLATION: Minimal render to test if page is the source */}
      <div>Courier OK</div>
    </DashboardShell>
  )
}
