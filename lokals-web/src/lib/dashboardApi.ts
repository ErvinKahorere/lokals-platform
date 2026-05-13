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

export async function fetchAdminOverview(): Promise<Record<string, number | string> | null> {
  return (await api.get('/admin/overview')).data as Record<string, number | string>
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
