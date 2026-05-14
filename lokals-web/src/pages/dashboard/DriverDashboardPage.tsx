import { Bell, CarFront, History, MessageSquare, Power, Star, Wallet } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { DashboardSection } from '../../components/dashboard/DashboardSection'
import { QuickActionTile } from '../../components/dashboard/QuickActionTile'
import { RecentActivityList } from '../../components/dashboard/RecentActivityList'
import { StatusBreakdownCard } from '../../components/dashboard/StatusBreakdownCard'
import { Button, StatusBadge } from '../../components/Ui'
import { useDriverRideAction, useUpdateDriverAvailability } from '../../hooks/queries'
import { useDriverOperationalData } from '../../lib/dashboardDataProvider'
import { formatTransportStatus, transportStatusTone } from '../../lib/transportStatus'
import type { DriverDashboardData } from '../../lib/dashboardTypes'
import type { RoleDashboardPayload } from '../../types'

export function DriverDashboardPage() {
  const dashboardQuery = useDriverOperationalData()
  const data = dashboardQuery.data as DriverDashboardData | undefined
  const dashboard = data?.dashboard as RoleDashboardPayload | null | undefined
  const availableRequests = useMemo(() => data?.availableRequests ?? [], [data?.availableRequests])
  const tripHistory = useMemo(() => data?.tripHistory ?? [], [data?.tripHistory])
  const activityRows = useMemo(() => dashboard?.recent_activity ?? [], [dashboard?.recent_activity])
  const activeTrip = data?.activeTrip
  const availability = data?.availability ?? 'unknown'
  const availabilityMutation = useUpdateDriverAvailability()
  const rideActionMutation = useDriverRideAction()
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
  const handleRideAction = useCallback((rideId: number, action: 'accept' | 'decline' | 'arrived' | 'start' | 'complete') => {
    rideActionMutation.mutate({ rideId, action })
  }, [rideActionMutation])

  return (
    <DashboardShell
      mode="driver"
      eyebrow="Driver mode"
      title="Driver dashboard"
      description="Go online, pick up nearby ride requests, track active trips, and keep earnings in view."
      isLoading={dashboardQuery.isLoading}
      error={dashboardQuery.error}
      stats={stats}
    >
      {/* TEMPORARY ISOLATION: Minimal render to test if page is the source */}
      <div>Driver OK</div>
    </DashboardShell>
  )
}
