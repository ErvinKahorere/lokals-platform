import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { DashboardMode } from './dashboardConfig'
import type {
  DashboardRealtimeEventName,
  DashboardRealtimeLastEvent,
  DashboardRealtimeOptions,
  DashboardRealtimeState,
  DashboardRealtimeStatus,
} from './realtimeTypes'

declare global {
  interface Window {
    Echo?: {
      private?: (name: string) => {
        listen: (event: string, callback: (payload: unknown) => void) => unknown
        stopListening?: (event: string) => unknown
      }
      channel?: (name: string) => {
        listen: (event: string, callback: (payload: unknown) => void) => unknown
        stopListening?: (event: string) => unknown
      }
    }
  }
}

const POLL_INTERVAL_MS = 45000
const UPDATE_FLASH_MS = 5000

const EVENT_ALIASES: Record<DashboardRealtimeEventName, string[]> = {
  NotificationCreated: ['.notification.created'],
  MessageReceived: ['.message.received', '.support.message.received', '.marketplace.message.received'],
  IssueStatusUpdated: ['.issue.status.updated'],
  RideRequestUpdated: ['.ride.request.updated'],
  DeliveryRequestUpdated: ['.delivery.request.updated'],
  RoleApplicationSubmitted: ['.role.application.submitted'],
  CommunityProjectSubmitted: ['.community.project.submitted'],
  FeedPostSubmitted: ['.feed.post.submitted'],
  RewardVerificationSubmitted: ['.reward.verification.submitted', '.reward.approved'],
  EmergencyAlertPublished: ['.emergency.alert.published', '.new.town.announcement'],
  ModerationActionTaken: ['.moderation.action.taken'],
}

const MODE_QUERY_KEYS: Record<DashboardMode, string[][]> = {
  resident: [['dashboard-adapter', 'resident-dashboard']],
  driver: [['dashboard-adapter', 'driver-dashboard']],
  courier: [['dashboard-adapter', 'courier-dashboard']],
  provider: [['dashboard-service-provider']],
  business: [['business-dashboard']],
  organisation: [['dashboard-organization']],
  town_manager: [['dashboard-adapter', 'town-manager-dashboard']],
  admin: [['dashboard-admin'], ['admin-overview']],
}

const EVENT_QUERY_KEYS: Record<DashboardRealtimeEventName, string[][]> = {
  NotificationCreated: [['notifications']],
  MessageReceived: [['conversations']],
  IssueStatusUpdated: [['activity-feed'], ['my-reports'], ['admin-reports']],
  RideRequestUpdated: [['rides']],
  DeliveryRequestUpdated: [['deliveries']],
  RoleApplicationSubmitted: [['admin-role-applications'], ['my-role-applications']],
  CommunityProjectSubmitted: [['admin-community-projects-pending'], ['community-projects']],
  FeedPostSubmitted: [['admin-feed-pending']],
  RewardVerificationSubmitted: [['admin-community-impact-pending'], ['community-impact-dashboard']],
  EmergencyAlertPublished: [['alerts-feed']],
  ModerationActionTaken: [['admin-feed-pending'], ['admin-reports']],
}

const EVENT_UPDATED_KEYS: Record<DashboardRealtimeEventName, string[]> = {
  NotificationCreated: ['unread_notifications'],
  MessageReceived: ['unread_messages'],
  IssueStatusUpdated: ['open_reports'],
  RideRequestUpdated: ['active_requests', 'availability'],
  DeliveryRequestUpdated: ['active_requests', 'availability'],
  RoleApplicationSubmitted: ['pending_approvals', 'role_applications'],
  CommunityProjectSubmitted: ['pending_approvals'],
  FeedPostSubmitted: ['feed_pending', 'pending_approvals'],
  RewardVerificationSubmitted: ['available_points', 'pending_approvals'],
  EmergencyAlertPublished: ['active_alerts'],
  ModerationActionTaken: ['pending_approvals'],
}

const DEFAULT_REALTIME_STATE: DashboardRealtimeState = {
  mode: 'resident',
  status: 'offline',
  updatedAt: null,
  updatedKeys: [],
  subscribedChannels: [],
  lastEvent: null,
  pollingActive: false,
  lastRefreshAt: null,
}

const DashboardRealtimeContext = createContext<DashboardRealtimeState>(DEFAULT_REALTIME_STATE)

function buildEventFingerprint(event: DashboardRealtimeEventName, payload: unknown) {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const identifier = record.id ?? record.notification_id ?? record.message_id ?? record.report_id ?? record.ride_id ?? record.delivery_id
    if (identifier != null) {
      return `${event}:${String(identifier)}`
    }
  }

  return `${event}:${Date.now()}`
}

function getQueryKeysForMode(mode: DashboardMode, event: DashboardRealtimeEventName) {
  return [...MODE_QUERY_KEYS[mode], ...EVENT_QUERY_KEYS[event]]
}

async function pollOperationalQueries(mode: DashboardMode, userId?: number | string | null) {
  const requests: Array<Promise<unknown>> = [api.get('/notifications').catch(() => null)]

  if (userId) {
    requests.push(api.get('/conversations').catch(() => null))
  }

  if (mode === 'resident') {
    requests.push(api.get('/dashboard/citizen').catch(() => null))
  }

  if (mode === 'driver') {
    requests.push(api.get('/dashboard/driver').catch(() => null))
  }

  if (mode === 'courier') {
    requests.push(api.get('/dashboard/courier').catch(() => null))
  }

  if (mode === 'town_manager') {
    requests.push(api.get('/dashboard/town-manager').catch(() => null))
  }

  await Promise.all(requests)
}

export function useDashboardRealtime(mode: DashboardMode, { userId, townId }: DashboardRealtimeOptions): DashboardRealtimeState {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<DashboardRealtimeStatus>('offline')
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [updatedKeys, setUpdatedKeys] = useState<string[]>([])
  const [lastEvent, setLastEvent] = useState<DashboardRealtimeLastEvent | null>(null)
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null)
  const seenEvents = useRef<Set<string>>(new Set())
  const clearUpdatedTimer = useRef<number | null>(null)
  const activeChannels = useMemo(
    () => [
      ...(userId ? [`users.${userId}`] : []),
      ...(mode === 'town_manager' && townId ? [`towns.${townId}.managers`] : []),
      ...(mode === 'admin' ? ['platform.admins'] : []),
    ],
    [mode, townId, userId],
  )
  const hasLiveChannel = activeChannels.length > 0 && Boolean(window.Echo?.private)

  useEffect(() => {
    seenEvents.current.clear()
    const resetKeysTimer = window.setTimeout(() => {
      setUpdatedKeys([])
    }, 0)
    const resetRealtimeStateTimer = window.setTimeout(() => {
      setLastEvent(null)
      setLastRefreshAt(null)
    }, 0)

    if (clearUpdatedTimer.current) {
      window.clearTimeout(clearUpdatedTimer.current)
      clearUpdatedTimer.current = null
    }

    if (!userId) {
      const offlineTimer = window.setTimeout(() => {
        setStatus('offline')
      }, 0)
      return () => {
        window.clearTimeout(offlineTimer)
      }
    }

    let cancelled = false
    const privateChannel = window.Echo?.private?.(`users.${userId}`)
    const managerChannel = mode === 'town_manager' && townId ? window.Echo?.private?.(`towns.${townId}.managers`) : undefined
    const adminChannel = mode === 'admin' ? window.Echo?.private?.('platform.admins') : undefined

    const statusTimer = window.setTimeout(() => {
      setStatus(hasLiveChannel ? 'live' : 'polling')
    }, 0)

    const markUpdated = (keys: string[]) => {
      setUpdatedAt(Date.now())
      setUpdatedKeys((current) => Array.from(new Set([...current, ...keys])))

      if (clearUpdatedTimer.current) {
        window.clearTimeout(clearUpdatedTimer.current)
      }

      clearUpdatedTimer.current = window.setTimeout(() => {
        setUpdatedKeys([])
      }, UPDATE_FLASH_MS)
    }

    const handleEvent = async (event: DashboardRealtimeEventName, alias: string, payload: unknown) => {
      const fingerprint = buildEventFingerprint(event, payload)
      if (seenEvents.current.has(fingerprint)) {
        return
      }

      seenEvents.current.add(fingerprint)
      setLastEvent({
        name: event,
        alias,
        fingerprint,
        receivedAt: Date.now(),
      })
      if (import.meta.env.DEV) {
        console.debug('[dashboard-realtime]', {
          mode,
          event,
          alias,
          channels: activeChannels,
          payload,
        })
      }
      const keys = getQueryKeysForMode(mode, event)
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
      markUpdated(EVENT_UPDATED_KEYS[event])
    }

    const listeners = Object.entries(EVENT_ALIASES).flatMap(([eventName, aliases]) =>
      aliases.map((alias) => ({ eventName: eventName as DashboardRealtimeEventName, alias })),
    )

    listeners.forEach(({ eventName, alias }) => {
      privateChannel?.listen?.(alias, (payload: unknown) => void handleEvent(eventName, alias, payload))
      managerChannel?.listen?.(alias, (payload: unknown) => void handleEvent(eventName, alias, payload))
      adminChannel?.listen?.(alias, (payload: unknown) => void handleEvent(eventName, alias, payload))
    })

    const poll = async () => {
      try {
        await pollOperationalQueries(mode, userId)
        await Promise.all(MODE_QUERY_KEYS[mode].map((queryKey) => queryClient.invalidateQueries({ queryKey })))
        await queryClient.invalidateQueries({ queryKey: ['notifications'] })
        await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        setLastRefreshAt(Date.now())

        if (!cancelled && !hasLiveChannel) {
          setStatus('polling')
        }
      } catch {
        if (!cancelled) {
          setStatus(hasLiveChannel ? 'live' : 'offline')
        }
      }
    }

    const interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(interval)

      listeners.forEach(({ alias }) => {
        privateChannel?.stopListening?.(alias)
        managerChannel?.stopListening?.(alias)
        adminChannel?.stopListening?.(alias)
      })

      if (clearUpdatedTimer.current) {
        window.clearTimeout(clearUpdatedTimer.current)
        clearUpdatedTimer.current = null
      }
      window.clearTimeout(resetKeysTimer)
      window.clearTimeout(resetRealtimeStateTimer)
      window.clearTimeout(statusTimer)
    }
  }, [activeChannels, hasLiveChannel, mode, queryClient, townId, userId])

  return useMemo(
    () => ({
      mode,
      status,
      updatedAt,
      updatedKeys,
      subscribedChannels: activeChannels,
      lastEvent,
      pollingActive: !hasLiveChannel || status === 'polling',
      lastRefreshAt,
    }),
    [activeChannels, hasLiveChannel, lastEvent, lastRefreshAt, mode, status, updatedAt, updatedKeys],
  )
}

export function DashboardRealtimeProvider({
  value,
  children,
}: PropsWithChildren<{ value: DashboardRealtimeState }>) {
  return createElement(DashboardRealtimeContext.Provider, { value }, children)
}

export function useDashboardRealtimeState() {
  return useContext(DashboardRealtimeContext)
}
