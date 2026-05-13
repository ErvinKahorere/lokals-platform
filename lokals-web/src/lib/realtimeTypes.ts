import type { DashboardMode } from './dashboardConfig'

export type DashboardRealtimeEventName =
  | 'NotificationCreated'
  | 'MessageReceived'
  | 'IssueStatusUpdated'
  | 'RideRequestUpdated'
  | 'DeliveryRequestUpdated'
  | 'RoleApplicationSubmitted'
  | 'CommunityProjectSubmitted'
  | 'FeedPostSubmitted'
  | 'RewardVerificationSubmitted'
  | 'EmergencyAlertPublished'
  | 'ModerationActionTaken'

export type DashboardRealtimeStatus = 'live' | 'polling' | 'offline'

export type DashboardRealtimeLastEvent = {
  name: DashboardRealtimeEventName
  alias: string
  fingerprint: string
  receivedAt: number
}

export type DashboardRealtimeState = {
  mode: DashboardMode
  status: DashboardRealtimeStatus
  updatedAt: number | null
  updatedKeys: string[]
  subscribedChannels: string[]
  lastEvent: DashboardRealtimeLastEvent | null
  pollingActive: boolean
  lastRefreshAt: number | null
}

export type DashboardRealtimeOptions = {
  userId?: number | string | null
  townId?: number | string | null
}
