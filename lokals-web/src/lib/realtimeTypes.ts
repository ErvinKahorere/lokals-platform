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

export type DashboardRealtimeState = {
  mode: DashboardMode
  status: DashboardRealtimeStatus
  updatedAt: number | null
  updatedKeys: string[]
}

export type DashboardRealtimeOptions = {
  userId?: number | string | null
  townId?: number | string | null
}
