import { api } from './api'
import { getDashboardWorkspaceData } from './dashboardWorkspaceData'
import type {
  CourierDashboardData,
  DashboardAdapterPayload,
  DashboardWorkspaceResource,
  DriverDashboardData,
  FollowingUpdateSummary,
  PendingApprovalSummary,
  ResidentDashboardData,
  TownManagerDashboardData,
} from './dashboardTypes'
import type {
  AlertItem,
  CommunityImpactDashboardPayload,
  CommunityImpactTransaction,
  FeedPost,
  RoleApplication,
  SavedItemsPayload,
  ConversationThread,
  DashboardActivityItem,
  NotificationItem,
  Product,
  Provider,
  Report,
  RoleDashboardPayload,
  RideItem,
  DeliveryItem,
  CommunityProject,
  Booking,
} from '../types'

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : [])

export async function fetchRoleDashboard(endpoint: string): Promise<RoleDashboardPayload> {
  return (await api.get(endpoint)).data as RoleDashboardPayload
}

export async function fetchResidentActivity(): Promise<DashboardActivityItem[]> {
  const payload = (await api.get('/activity')).data as { data?: DashboardActivityItem[] }
  return payload.data ?? []
}

export async function fetchSavedItems(): Promise<SavedItemsPayload | null> {
  return (await api.get('/saved-items')).data as SavedItemsPayload
}

export async function fetchFollowingUpdates(): Promise<FollowingUpdateSummary[]> {
  const payload = (await api.get('/following-feed')).data as { data?: Array<Record<string, unknown>> }
  return asArray<Record<string, unknown>>(payload.data).slice(0, 6).map((item, index) => ({
    id: String(item.id ?? `follow-${index}`),
    title: String(item.title ?? item.name ?? 'Followed update'),
    body: String(item.body ?? item.description ?? 'A followed organization or provider shared a new update.'),
    source: String(item.category ?? item.location ?? 'Followed source'),
    timestamp: typeof item.created_at === 'string' ? item.created_at : typeof item.timestamp === 'string' ? item.timestamp : null,
  }))
}

export async function fetchBookings(): Promise<Booking[]> {
  const payload = (await api.get('/bookings')).data as { data?: Booking[] }
  return payload.data ?? []
}

export async function fetchIssues(): Promise<Report[]> {
  const payload = (await api.get('/my-reports')).data as { data?: Report[] }
  return payload.data ?? []
}

export async function fetchRides(): Promise<RideItem[]> {
  const payload = (await api.get('/rides')).data as { data?: RideItem[] }
  return payload.data ?? []
}

export async function fetchDeliveries(): Promise<DeliveryItem[]> {
  const payload = (await api.get('/deliveries')).data as { data?: DeliveryItem[] }
  return payload.data ?? []
}

export async function fetchMarketplace(): Promise<Product[]> {
  const payload = (await api.get('/store/products')).data as { data?: Product[] }
  return payload.data ?? []
}

export async function fetchServices(): Promise<Provider[]> {
  const payload = (await api.get('/service-providers')).data as { data?: Provider[] }
  return payload.data ?? []
}

export async function fetchCommunityProjects(): Promise<CommunityProject[]> {
  const payload = (await api.get('/community-projects')).data as { data?: CommunityProject[] }
  return payload.data ?? []
}

export async function fetchRewards(): Promise<CommunityImpactDashboardPayload | null> {
  return (await api.get('/community-impact/me')).data as CommunityImpactDashboardPayload
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  return (await api.get('/notifications')).data as NotificationItem[]
}

export async function fetchMessages(): Promise<ConversationThread[]> {
  const payload = (await api.get('/conversations')).data as { data?: ConversationThread[] }
  return payload.data ?? []
}

export async function fetchAdminOverview(): Promise<Record<string, unknown> | null> {
  return (await api.get('/admin/overview')).data as Record<string, unknown>
}

export async function fetchTownManagerApprovals(): Promise<PendingApprovalSummary[]> {
  const [roleApplications, communityProjects, feedPosts, rewardTransactions] = await Promise.all([
    api.get('/admin/role-applications', { params: { status: 'pending_review' } }).then((response) => response.data).catch(() => ({ data: [] as RoleApplication[] })),
    api.get('/admin/community-projects/pending').then((response) => response.data).catch(() => ({ data: [] as CommunityProject[] })),
    api.get('/admin/feed/pending').then((response) => response.data).catch(() => ({ data: [] as FeedPost[] })),
    api.get('/admin/community-impact/pending').then((response) => response.data).catch(() => ({ data: [] as CommunityImpactTransaction[] })),
  ])

  const roleRows = asArray<RoleApplication>(roleApplications.data).slice(0, 6).map((application) => ({
    id: `role-${application.id}`,
    type: 'Role application',
    title: `${application.requested_role} application for ${application.full_name}`,
    status: application.status,
    source: 'roles' as const,
  }))
  const projectRows = asArray<CommunityProject>(communityProjects.data).slice(0, 6).map((project) => ({
    id: `project-${project.id}`,
    type: 'Community project',
    title: project.title,
    status: project.verification_status ?? project.status,
    source: 'projects' as const,
  }))
  const feedRows = asArray<FeedPost>(feedPosts.data).slice(0, 6).map((post) => ({
    id: `feed-${post.id}`,
    type: 'Feed moderation',
    title: post.title,
    status: post.status,
    source: 'feed' as const,
  }))
  const rewardRows = asArray<CommunityImpactTransaction>(rewardTransactions.data).slice(0, 6).map((transaction) => ({
    id: `reward-${transaction.id}`,
    type: 'Reward verification',
    title: transaction.reason,
    status: transaction.verification_status,
    source: 'rewards' as const,
  }))

  return [...roleRows, ...projectRows, ...feedRows, ...rewardRows]
}

export async function fetchDashboardWorkspaceResource(path: string): Promise<DashboardWorkspaceResource> {
  if (path === '/dashboard/driver/requests') {
    const dashboard = await fetchRoleDashboard('/dashboard/driver')
    const requests = Array.isArray(dashboard.available_requests) ? (dashboard.available_requests as RideItem[]) : []
    return {
      rows: requests.slice(0, 8).map((ride) => ({
        status: String(ride.status ?? 'searching').replaceAll('_', ' '),
        summary: `${ride.pickup_location} -> ${ride.dropoff_location}`,
        owner: `${ride.user?.name ?? 'Resident'} | ${ride.ride_type ?? 'Standard'} | N$ ${ride.fare_estimate ?? '0'}`,
        next_step: 'Accept or decline this request from the driver dashboard.',
      })),
      filters: [{ label: 'Searching', value: 'searching' }, { label: 'Requested', value: 'requested' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/driver/active-trip') {
    const dashboard = await fetchRoleDashboard('/dashboard/driver')
    const activeTrip = isRecordLike(dashboard.active_trip) ? (dashboard.active_trip as unknown as RideItem) : null
    return {
      rows: activeTrip ? [{
        status: String(activeTrip.status ?? 'accepted').replaceAll('_', ' '),
        summary: `${activeTrip.pickup_location} -> ${activeTrip.dropoff_location}`,
        owner: `${activeTrip.user?.name ?? 'Resident'} | ${activeTrip.user?.phone ?? 'No contact yet'}`,
        next_step: 'Use the active trip card on the overview to move this ride forward.',
      }] : [],
      filters: [],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/driver/history') {
    const dashboard = await fetchRoleDashboard('/dashboard/driver')
    const history = Array.isArray(dashboard.trip_history) ? (dashboard.trip_history as RideItem[]) : []
    return {
      rows: history.slice(0, 10).map((ride) => ({
        status: String(ride.status ?? 'completed').replaceAll('_', ' '),
        summary: `${ride.pickup_location} -> ${ride.dropoff_location}`,
        owner: `${ride.user?.name ?? 'Resident'} | N$ ${ride.fare_estimate ?? '0'}`,
        next_step: ride.rating ? `Resident rating: ${ride.rating}/5` : 'Await resident rating or review.',
      })),
      filters: [{ label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/courier/requests') {
    const dashboard = await fetchRoleDashboard('/dashboard/courier')
    const deliveries = Array.isArray(dashboard.available_deliveries) ? (dashboard.available_deliveries as DeliveryItem[]) : []
    return {
      rows: deliveries.slice(0, 8).map((delivery) => ({
        status: String(delivery.status ?? 'requested').replaceAll('_', ' '),
        summary: `${delivery.pickup_location ?? delivery.pickup_address} -> ${delivery.dropoff_location ?? delivery.dropoff_address}`,
        owner: `${delivery.user?.name ?? 'Resident'} | ${delivery.parcel_size ?? 'Parcel'} | N$ ${delivery.estimated_price ?? '0'}`,
        next_step: 'Accept or decline this delivery from the courier overview.',
      })),
      filters: [{ label: 'Requested', value: 'requested' }, { label: 'Searching', value: 'searching' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/courier/active-delivery') {
    const dashboard = await fetchRoleDashboard('/dashboard/courier')
    const activeDelivery = isRecordLike(dashboard.active_delivery) ? (dashboard.active_delivery as unknown as DeliveryItem) : null
    return {
      rows: activeDelivery ? [{
        status: String(activeDelivery.status ?? 'accepted').replaceAll('_', ' '),
        summary: `${activeDelivery.pickup_location ?? activeDelivery.pickup_address} -> ${activeDelivery.dropoff_location ?? activeDelivery.dropoff_address}`,
        owner: `${activeDelivery.user?.name ?? 'Resident'} | ${activeDelivery.user?.phone ?? 'No contact yet'}`,
        next_step: 'Confirm pickup, mark transit, then mark delivered from the overview.',
      }] : [],
      filters: [],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/courier/history') {
    const dashboard = await fetchRoleDashboard('/dashboard/courier')
    const history = Array.isArray(dashboard.delivery_history) ? (dashboard.delivery_history as DeliveryItem[]) : []
    return {
      rows: history.slice(0, 10).map((delivery) => ({
        status: String(delivery.status ?? 'delivered').replaceAll('_', ' '),
        summary: `${delivery.pickup_location ?? delivery.pickup_address} -> ${delivery.dropoff_location ?? delivery.dropoff_address}`,
        owner: `${delivery.user?.name ?? 'Resident'} | N$ ${delivery.estimated_price ?? delivery.price ?? '0'}`,
        next_step: delivery.rating ? `Resident rating: ${delivery.rating}/5` : 'Await resident rating or follow-up.',
      })),
      filters: [{ label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/pending-approvals') {
    const approvals = await fetchTownManagerApprovals()
    return {
      rows: approvals.slice(0, 12).map((item) => ({
        status: item.status.replaceAll('_', ' '),
        summary: item.title,
        owner: item.type,
        next_step: 'Open the matching approval queue and complete the review.',
      })),
      filters: [{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/emergencies') {
    const dashboard = await fetchRoleDashboard('/dashboard/town-manager')
    const alerts = Array.isArray(dashboard.active_alerts) ? (dashboard.active_alerts as AlertItem[]) : []
    return {
      rows: alerts.slice(0, 8).map((alert) => ({
        status: String(alert.priority ?? 'active'),
        summary: alert.title,
        owner: alert.location ?? 'Okahandja',
        next_step: 'Review the alert body and publish the next operational update if needed.',
      })),
      filters: [{ label: 'Critical', value: 'critical' }, { label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/business-verification') {
    const payload = (await api.get('/admin/role-applications', { params: { role: 'business_owner' } }).catch(() => ({ data: { data: [] as RoleApplication[] } }))).data as { data?: RoleApplication[] }
    return {
      rows: asArray<RoleApplication>(payload.data).slice(0, 10).map((application) => ({
        status: application.status.replaceAll('_', ' '),
        summary: application.business_name || application.full_name,
        owner: application.phone,
        next_step: 'Open role approvals to approve, reject, or request changes.',
      })),
      filters: [{ label: 'Pending review', value: 'pending' }, { label: 'Approved', value: 'approved' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/service-providers') {
    const payload = (await api.get('/admin/role-applications', { params: { role: 'service_provider' } }).catch(() => ({ data: { data: [] as RoleApplication[] } }))).data as { data?: RoleApplication[] }
    return {
      rows: asArray<RoleApplication>(payload.data).slice(0, 10).map((application) => ({
        status: application.status.replaceAll('_', ' '),
        summary: application.full_name,
        owner: application.service_category || application.phone,
        next_step: 'Use the role approval queue to verify documents and trust status.',
      })),
      filters: [{ label: 'Pending review', value: 'pending' }, { label: 'Approved', value: 'approved' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/residents') {
    const dashboard = await fetchRoleDashboard('/dashboard/town-manager')
    const reports = Array.isArray(dashboard.recent_reports) ? (dashboard.recent_reports as Report[]) : []
    return {
      rows: reports.slice(0, 10).map((report) => ({
        status: String(report.status ?? 'open').replaceAll('_', ' '),
        summary: report.title,
        owner: report.location ?? ([report.area, report.town].filter(Boolean).join(', ') || 'Okahandja'),
        next_step: 'Open issue management when this report needs assignment or action.',
      })),
      filters: [{ label: 'Open', value: 'open' }, { label: 'In progress', value: 'in progress' }, { label: 'Resolved', value: 'resolved' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/town-manager/analytics') {
    const dashboard = await fetchRoleDashboard('/dashboard/town-manager')
    return {
      rows: Object.entries(dashboard.stats ?? {}).map(([key, value]) => ({
        status: 'Live',
        summary: key.replaceAll('_', ' '),
        owner: String(value),
        next_step: 'Use the dashboard overview to compare this metric against current queues.',
      })),
      filters: [{ label: 'Live', value: 'live' }],
      actions: [],
      source: 'api',
    }
  }

  if (path === '/dashboard/provider/bookings') {
    const payload = (await api.get('/provider/bookings').catch(() => ({ data: { data: [] as Booking[] } }))).data as { data?: Booking[] }
    return {
      rows: asArray<Booking>(payload.data).slice(0, 12).map((booking) => ({
        status: String(booking.status ?? 'pending').replaceAll('_', ' '),
        summary: booking.service?.name ?? 'Service booking',
        owner: `${booking.user?.name ?? 'Customer'} | ${booking.booking_date ?? 'Schedule pending'}`,
        next_step: 'Confirm timing, adjust availability, or follow up with the customer.',
      })),
      filters: [{ label: 'Pending', value: 'pending' }, { label: 'Confirmed', value: 'confirmed' }, { label: 'Completed', value: 'completed' }],
      actions: [{ label: 'Open earnings', to: '/dashboard/provider/earnings', accentClass: 'bg-emerald-50 text-emerald-700', iconName: 'Wallet' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/towns') {
    const payload = (await api.get('/admin/towns').catch(() => ({ data: { data: [] as Array<Record<string, unknown>> } }))).data as {
      data?: Array<Record<string, unknown>>
    }

    return {
      rows: asArray<Record<string, unknown>>(payload.data).map((town) => ({
        status: 'Live',
        summary: String(town.town ?? 'Town'),
        owner: `${String(town.users ?? 0)} users | ${String(town.businesses ?? 0)} businesses | ${String(town.providers ?? 0)} providers`,
        next_step: `${String(town.open_reports ?? 0)} open reports and ${String(town.active_alerts ?? 0)} active alerts currently tracked.`,
      })),
      filters: [{ label: 'Live', value: 'live' }],
      actions: [{ label: 'Open overview', to: '/dashboard/admin', accentClass: 'bg-lokals-purple-soft text-lokals-purple', iconName: 'LayoutDashboard' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/system-health') {
    const payload = (await api.get('/admin/system-health').catch(() => ({ data: { system_health: [] as Array<Record<string, unknown>> } }))).data as {
      system_health?: Array<Record<string, unknown>>
    }

    return {
      rows: asArray<Record<string, unknown>>(payload.system_health).map((item) => ({
        status: String(item.status ?? 'unknown').replaceAll('_', ' '),
        summary: String(item.label ?? 'System health'),
        owner: String(item.detail ?? 'Operational health signal'),
        next_step: `Current value: ${String(item.value ?? 'n/a')}`,
      })),
      filters: [{ label: 'Healthy', value: 'healthy' }, { label: 'Warning', value: 'warning' }, { label: 'Degraded', value: 'degraded' }],
      actions: [{ label: 'Audit logs', to: '/dashboard/admin/audit-logs', accentClass: 'bg-sky-50 text-sky-700', iconName: 'ScrollText' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/feature-flags') {
    const payload = (await api.get('/admin/feature-flags').catch(() => ({ data: { data: [] as Array<Record<string, unknown>> } }))).data as {
      data?: Array<Record<string, unknown>>
    }

    return {
      rows: asArray<Record<string, unknown>>(payload.data).map((flag) => ({
        status: flag.enabled ? 'enabled' : 'disabled',
        summary: String(flag.label ?? flag.key ?? 'Feature flag'),
        owner: `${String(flag.scope ?? 'platform')} | ${String(flag.status ?? 'live')}`,
        next_step: String(flag.description ?? 'Operational feature flag status.'),
      })),
      filters: [{ label: 'Enabled', value: 'enabled' }, { label: 'Disabled', value: 'disabled' }],
      actions: [{ label: 'System health', to: '/dashboard/admin/system-health', accentClass: 'bg-amber-50 text-amber-700', iconName: 'Wrench' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/audit-logs' || path === '/dashboard/admin/ai-logs') {
    const payload = (await api.get('/admin/audit-logs').catch(() => ({ data: { data: [] as Array<Record<string, unknown>> } }))).data as {
      data?: Array<Record<string, unknown>>
    }

    return {
      rows: asArray<Record<string, unknown>>(payload.data).map((item) => ({
        status: String(item.type ?? 'activity').replaceAll('_', ' '),
        summary: String(item.title ?? 'Admin activity'),
        owner: String(item.body ?? 'Operational change'),
        next_step: String(item.timestamp ?? 'Recent'),
      })),
      filters: [{ label: 'Role', value: 'role' }, { label: 'Alert', value: 'alert' }, { label: 'Project', value: 'project' }],
      actions: [{ label: 'System health', to: '/dashboard/admin/system-health', accentClass: 'bg-emerald-50 text-emerald-700', iconName: 'Activity' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/roles') {
    const payload = (await api.get('/admin/role-applications', { params: { status: 'pending_review' } }).catch(() => ({ data: { data: [] as RoleApplication[] } }))).data as {
      data?: RoleApplication[]
    }

    return {
      rows: asArray<RoleApplication>(payload.data).slice(0, 12).map((application) => ({
        status: application.status.replaceAll('_', ' '),
        summary: `${application.full_name} requested ${application.requested_role.replaceAll('_', ' ')}`,
        owner: application.business_name || application.phone || 'Role approvals',
        next_step: 'Open the full approval queue to approve, reject, or request changes.',
      })),
      filters: [{ label: 'Pending review', value: 'pending' }, { label: 'Approved', value: 'approved' }, { label: 'Rejected', value: 'rejected' }],
      actions: [{ label: 'Open approvals', to: '/dashboard/admin/role-applications', accentClass: 'bg-lokals-purple-soft text-lokals-purple', iconName: 'ClipboardCheck' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/feed-engine') {
    const payload = (await api.get('/admin/feed/pending').catch(() => ({ data: { data: [] as FeedPost[] } }))).data as { data?: FeedPost[] }

    return {
      rows: asArray<FeedPost>(payload.data).slice(0, 12).map((post) => ({
        status: String(post.status ?? 'pending').replaceAll('_', ' '),
        summary: post.title,
        owner: [post.town, post.area].filter(Boolean).join(', ') || 'Community feed',
        next_step: 'Moderate this post before it reaches the public feed.',
      })),
      filters: [{ label: 'Pending', value: 'pending' }, { label: 'Approved', value: 'approved' }],
      actions: [{ label: 'Moderate feed', to: '/dashboard/town-manager/feed/pending', accentClass: 'bg-emerald-50 text-emerald-700', iconName: 'ShieldCheck' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/notifications') {
    const payload = (await api.get('/admin/system-health').catch(() => ({ data: { notifications: {} as Record<string, unknown> } }))).data as {
      notifications?: Record<string, unknown>
    }
    const notifications = payload.notifications ?? {}

    return {
      rows: Object.entries(notifications).map(([key, value]) => ({
        status: 'live',
        summary: key.replaceAll('_', ' '),
        owner: String(value),
        next_step: 'Use these counts to judge communication pressure and unread backlog.',
      })),
      filters: [{ label: 'Live', value: 'live' }],
      actions: [{ label: 'Open system health', to: '/dashboard/admin/system-health', accentClass: 'bg-sky-50 text-sky-700', iconName: 'Bell' }],
      source: 'api',
    }
  }

  if (path === '/dashboard/admin/rewards') {
    const payload = (await api.get('/admin/community-impact/pending').catch(() => ({ data: { data: [] as CommunityImpactTransaction[] } }))).data as {
      data?: CommunityImpactTransaction[]
    }

    return {
      rows: asArray<CommunityImpactTransaction>(payload.data).slice(0, 12).map((transaction) => ({
        status: String(transaction.verification_status ?? 'pending').replaceAll('_', ' '),
        summary: transaction.reason || 'Community impact verification',
        owner: `${String(transaction.points ?? 0)} points`,
        next_step: 'Review reward evidence and decide whether to verify the contribution.',
      })),
      filters: [{ label: 'Pending', value: 'pending' }, { label: 'Verified', value: 'verified' }],
      actions: [{ label: 'Town reward queue', to: '/dashboard/town-manager/community-impact/pending', accentClass: 'bg-amber-50 text-amber-700', iconName: 'Gift' }],
      source: 'api',
    }
  }

  const fallback = getDashboardWorkspaceData(path)
  return {
    rows: fallback.rows ?? [],
    filters: fallback.filters ?? [],
    actions: (fallback.actions ?? []).map((action) => ({
      label: action.label,
      to: action.to,
      accentClass: action.accentClass,
      iconName: action.icon?.displayName ?? action.icon?.name ?? 'Sparkles',
    })),
    source: 'mock',
  }
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function fetchDashboardAdapterPayload(): Promise<DashboardAdapterPayload> {
  const [
    residentActivity,
    issues,
    rides,
    deliveries,
    marketplace,
    services,
    communityProjects,
    rewards,
    notifications,
    messages,
    townManagerApprovals,
    adminOverview,
  ] = await Promise.all([
    fetchResidentActivity().catch(() => []),
    fetchIssues().catch(() => []),
    fetchRides().catch(() => []),
    fetchDeliveries().catch(() => []),
    fetchMarketplace().catch(() => []),
    fetchServices().catch(() => []),
    fetchCommunityProjects().catch(() => []),
    fetchRewards().catch(() => null),
    fetchNotifications().catch(() => []),
    fetchMessages().catch(() => []),
    fetchTownManagerApprovals().catch(() => []),
    fetchAdminOverview().catch(() => null),
  ])

  return {
    residentActivity,
    issues,
    rides,
    deliveries,
    marketplace,
    services,
    communityProjects,
    rewards,
    notifications: asArray<NotificationItem>(notifications),
    messages,
    townManagerApprovals,
    adminOverview,
  }
}

export async function fetchResidentDashboardData(): Promise<ResidentDashboardData> {
  const [dashboard, activity, issues, savedItems, rewards, notifications, messages, followedUpdates, bookings, rides, deliveries] = await Promise.all([
    fetchRoleDashboard('/dashboard/citizen').catch(() => null),
    fetchResidentActivity().catch(() => []),
    fetchIssues().catch(() => []),
    fetchSavedItems().catch(() => null),
    fetchRewards().catch(() => null),
    fetchNotifications().catch(() => []),
    fetchMessages().catch(() => []),
    fetchFollowingUpdates().catch(() => []),
    fetchBookings().catch(() => []),
    fetchRides().catch(() => []),
    fetchDeliveries().catch(() => []),
  ])

  const unreadNotifications = notifications.filter((item) => item.read_at == null).length
  const unreadMessages = messages.filter((thread) => (thread.last_message?.read_receipts?.length ?? 0) === 0).length
  const activeRides = rides.filter((ride) => !['completed', 'cancelled'].includes(String(ride.status ?? '').toLowerCase()))
  const activeDeliveries = deliveries.filter((delivery) => !['delivered', 'cancelled'].includes(String(delivery.status ?? '').toLowerCase()))
  const activeBookings = bookings.filter((booking) => !['completed', 'cancelled'].includes(String(booking.status ?? '').toLowerCase()))

  const normalizedSaved = [
    ...(savedItems?.products ?? []),
    ...(savedItems?.accommodations ?? []),
    ...(savedItems?.events ?? []),
    ...(savedItems?.providers ?? []),
    ...(savedItems?.directory ?? []),
    ...(savedItems?.news ?? []),
    ...(savedItems?.listings ?? []),
  ].slice(0, 6)

  return {
    dashboard,
    activity,
    issues,
    savedItems: normalizedSaved,
    rewards,
    unread: { notifications: unreadNotifications, messages: unreadMessages },
    activeRequests: {
      bookings: activeBookings.slice(0, 3),
      rides: activeRides.slice(0, 3),
      deliveries: activeDeliveries.slice(0, 3),
    },
    followedUpdates,
  }
}

export async function fetchTownManagerDashboardData(): Promise<TownManagerDashboardData> {
  const [dashboard, approvals, roleApplications, communityProjectsPending, feedPendingPayload, rewardsPendingPayload] = await Promise.all([
    fetchRoleDashboard('/dashboard/town-manager').catch(() => null),
    fetchTownManagerApprovals().catch(() => []),
    api.get('/admin/role-applications', { params: { status: 'pending_review' } }).then((response) => response.data).catch(() => ({ data: [] as RoleApplication[] })),
    api.get('/admin/community-projects/pending').then((response) => response.data).catch(() => ({ data: [] as CommunityProject[] })),
    api.get('/admin/feed/pending').then((response) => response.data).catch(() => ({ data: [] as FeedPost[] })),
    api.get('/admin/community-impact/pending').then((response) => response.data).catch(() => ({ data: [] as CommunityImpactTransaction[] })),
  ])

  const reports = (dashboard?.recent_reports as Report[] | undefined) ?? []
  const alerts = (dashboard?.active_alerts as AlertItem[] | undefined) ?? []

  return {
    dashboard,
    approvals,
    reports,
    alerts,
    roleApplicationsPending: asArray<RoleApplication>(roleApplications.data).length,
    communityProjectsPending: asArray<CommunityProject>(communityProjectsPending.data),
    feedPending: asArray<FeedPost>(feedPendingPayload.data),
    rewardsPending: asArray<CommunityImpactTransaction>(rewardsPendingPayload.data),
    analyticsSummary: dashboard?.stats ?? {},
  }
}

function resolveAvailabilityLabel(stats: Record<string, number | string> | undefined) {
  const raw = String(stats?.availability ?? stats?.status ?? stats?.online_status ?? '').toLowerCase()
  if (raw.includes('online') || raw.includes('available')) return 'online' as const
  if (raw.includes('offline') || raw.includes('unavailable')) return 'offline' as const
  return 'unknown' as const
}

export async function fetchDriverDashboardData(): Promise<DriverDashboardData> {
  const [dashboard, notifications, messages] = await Promise.all([
    fetchRoleDashboard('/dashboard/driver').catch(() => null),
    fetchNotifications().catch(() => []),
    fetchMessages().catch(() => []),
  ])

  const availableRequests = Array.isArray(dashboard?.available_requests) ? (dashboard.available_requests as RideItem[]) : []
  const tripHistory = Array.isArray(dashboard?.trip_history) ? (dashboard.trip_history as RideItem[]) : []
  const activeTrip = tripHistory.find((ride) => !['completed', 'cancelled'].includes(String(ride.status ?? '').toLowerCase())) ?? null

  return {
    dashboard,
    unread: {
      notifications: notifications.filter((item) => item.read_at == null).length,
      messages: messages.filter((thread) => (thread.last_message?.read_receipts?.length ?? 0) === 0).length,
    },
    availableRequests,
    activeTrip,
    tripHistory,
    earningsSummary: {
      today: dashboard?.stats?.todays_earnings ?? dashboard?.stats?.earnings_today ?? 0,
      total: dashboard?.stats?.total_earnings ?? dashboard?.stats?.earnings_total ?? 0,
    },
    ratingsSummary: {
      average: dashboard?.stats?.average_rating ?? dashboard?.stats?.rating ?? 'N/A',
      total: dashboard?.stats?.ratings_count ?? dashboard?.stats?.completed_trips ?? 0,
    },
    availability: resolveAvailabilityLabel(dashboard?.stats),
  }
}

export async function fetchCourierDashboardData(): Promise<CourierDashboardData> {
  const [dashboard, notifications, messages] = await Promise.all([
    fetchRoleDashboard('/dashboard/courier').catch(() => null),
    fetchNotifications().catch(() => []),
    fetchMessages().catch(() => []),
  ])

  const availableDeliveries = Array.isArray(dashboard?.available_deliveries) ? (dashboard.available_deliveries as DeliveryItem[]) : []
  const deliveryHistory = Array.isArray(dashboard?.delivery_history) ? (dashboard.delivery_history as DeliveryItem[]) : []
  const activeDelivery = deliveryHistory.find((delivery) => !['delivered', 'cancelled'].includes(String(delivery.status ?? '').toLowerCase())) ?? null

  return {
    dashboard,
    unread: {
      notifications: notifications.filter((item) => item.read_at == null).length,
      messages: messages.filter((thread) => (thread.last_message?.read_receipts?.length ?? 0) === 0).length,
    },
    availableDeliveries,
    activeDelivery,
    deliveryHistory,
    earningsSummary: {
      today: dashboard?.stats?.todays_earnings ?? dashboard?.stats?.earnings_today ?? 0,
      total: dashboard?.stats?.total_earnings ?? dashboard?.stats?.earnings_total ?? 0,
    },
    ratingsSummary: {
      average: dashboard?.stats?.average_rating ?? dashboard?.stats?.rating ?? 'N/A',
      total: dashboard?.stats?.ratings_count ?? dashboard?.stats?.completed_deliveries ?? 0,
    },
    availability: resolveAvailabilityLabel(dashboard?.stats),
  }
}
