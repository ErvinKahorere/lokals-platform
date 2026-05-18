import type {
  AlertItem,
  Booking,
  CommunityImpactDashboardPayload,
  CommunityImpactTransaction,
  CommunityProject,
  ConversationThread,
  DashboardActivityItem,
  DeliveryItem,
  EventItem,
  EventTicket,
  FeedPost,
  Job,
  NotificationItem,
  Product,
  Provider,
  Report,
  RoleDashboardPayload,
  RideItem,
  SavedItemEntry,
  ServiceItem,
} from '../types'

export type DashboardArrayMap = {
  upcoming_bookings: Booking
  recent_bookings: Booking
  my_reports: Report
  my_tickets: EventTicket
  recent_alerts: AlertItem
  available_requests: RideItem
  trip_history: RideItem
  available_deliveries: DeliveryItem
  delivery_history: DeliveryItem
  jobs_near_me: Job
  applications: { id: number | string; status?: string | null; job?: Pick<Job, 'title' | 'location'> | null }
  sale_alerts: AlertItem
  recent_products: Product
  recent_services: ServiceItem
  public_updates: AlertItem
  events: EventItem
  moderation_flags: { id: number | string; reason: string; status: string; notes?: string | null }
  recent_reports: Report
  recent_activity: DashboardActivityItem
}

export type DashboardObjectMap = {
  worker_profile: { headline?: string | null }
  profile_status: { complete?: number; needs_attention?: number }
  news_source_status: { connected?: number; pending?: number }
  system_overview: Record<string, string | number>
}

export type DashboardWorkspaceResource = {
  rows: Array<{
    status: string
    summary: string
    owner: string
    next_step: string
  }>
  filters: Array<{ label: string; value: string }>
  actions: Array<{
    label: string
    to: string
    accentClass?: string
    iconName?: string
  }>
  source: 'api' | 'mock'
}

export type DashboardAdapterPayload = {
  residentActivity: DashboardActivityItem[]
  issues: Report[]
  rides: RideItem[]
  deliveries: DeliveryItem[]
  marketplace: Product[]
  services: Provider[]
  communityProjects: CommunityProject[]
  rewards: CommunityImpactDashboardPayload | null
  notifications: NotificationItem[]
  messages: ConversationThread[]
  townManagerApprovals: Array<{ id: string; type: string; title: string; status: string }>
  adminOverview: Record<string, unknown> | null
}

export type DashboardUnreadSummary = {
  notifications: number
  messages: number
}

export type FollowingUpdateSummary = {
  id: number | string
  title: string
  body: string
  source: string
  timestamp?: string | null
}

export type PendingApprovalSummary = {
  id: string
  type: string
  title: string
  status: string
  source: 'roles' | 'projects' | 'feed' | 'rewards' | 'mock'
}

export type ResidentDashboardData = {
  dashboard: RoleDashboardPayload | null
  activity: DashboardActivityItem[]
  issues: Report[]
  savedItems: SavedItemEntry[]
  rewards: CommunityImpactDashboardPayload | null
  unread: DashboardUnreadSummary
  activeRequests: {
    bookings: Booking[]
    rides: RideItem[]
    deliveries: DeliveryItem[]
  }
  followedUpdates: FollowingUpdateSummary[]
}

export type TownManagerDashboardData = {
  dashboard: RoleDashboardPayload | null
  approvals: PendingApprovalSummary[]
  reports: Report[]
  alerts: AlertItem[]
  roleApplicationsPending: number
  communityProjectsPending: CommunityProject[]
  feedPending: FeedPost[]
  rewardsPending: CommunityImpactTransaction[]
  analyticsSummary: Record<string, number | string>
}

export type DriverDashboardData = {
  dashboard: RoleDashboardPayload | null
  unread: DashboardUnreadSummary
  availableRequests: RideItem[]
  activeTrip: RideItem | null
  tripHistory: RideItem[]
  earningsSummary: Record<string, number | string>
  ratingsSummary: {
    average: number | string
    total: number | string
  }
  availability: 'online' | 'offline' | 'unknown'
}

export type CourierDashboardData = {
  dashboard: RoleDashboardPayload | null
  unread: DashboardUnreadSummary
  availableDeliveries: DeliveryItem[]
  activeDelivery: DeliveryItem | null
  deliveryHistory: DeliveryItem[]
  earningsSummary: Record<string, number | string>
  ratingsSummary: {
    average: number | string
    total: number | string
  }
  availability: 'online' | 'offline' | 'unknown'
}

export function getDashboardArray<K extends keyof DashboardArrayMap>(
  dashboard: RoleDashboardPayload | undefined,
  key: K,
): DashboardArrayMap[K][] {
  const value = dashboard?.[key]
  return Array.isArray(value) ? (value as DashboardArrayMap[K][]) : []
}

export function getDashboardObject<K extends keyof DashboardObjectMap>(
  dashboard: RoleDashboardPayload | undefined,
  key: K,
): Partial<DashboardObjectMap[K]> {
  const value = dashboard?.[key]
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Partial<DashboardObjectMap[K]>) : {}
}

export function getDashboardActivity(
  dashboard: RoleDashboardPayload | undefined,
): DashboardActivityItem[] {
  return getDashboardArray(dashboard, 'recent_activity')
}
