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
const EVENT_DEDUPE_WINDOW_MS = 6000

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
  IssueStatusUpdated: [['activity-feed'], ['my-reports'], ['admin-reports'], ['report']],
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

function pushUniqueKeys(current: string[], incoming: string[]) {
  const next = Array.from(new Set([...current, ...incoming]))
  return next.length === current.length && next.every((value, index) => value === current[index]) ? current : next
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
  const normalizedUserId = userId == null || userId === '' ? null : String(userId)
  const normalizedTownId = townId == null || townId === '' ? null : String(townId)
  const [statusState, setStatusState] = useState<{ key: string; value: DashboardRealtimeStatus }>({
    key: 'offline',
    value: 'offline',
  })
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [updatedKeys, setUpdatedKeys] = useState<string[]>([])
  const [lastEvent, setLastEvent] = useState<DashboardRealtimeLastEvent | null>(null)
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null)
  const mountedRef = useRef(false)
  const seenEvents = useRef<Set<string>>(new Set())
  const seenEventTimestamps = useRef<Map<string, number>>(new Map())
  const clearUpdatedTimer = useRef<number | null>(null)
  const lastPollAt = useRef<number>(0)
  const activeChannels = useMemo(
    () => [
      ...(normalizedUserId ? [`users.${normalizedUserId}`] : []),
      ...(mode === 'town_manager' && normalizedTownId ? [`towns.${normalizedTownId}.managers`] : []),
      ...(mode === 'admin' ? ['platform.admins'] : []),
    ],
    [mode, normalizedTownId, normalizedUserId],
  )
  const activeChannelKey = useMemo(() => activeChannels.join('|'), [activeChannels])
  const hasRealtimeTransport = typeof window !== 'undefined' && typeof window.Echo?.private === 'function'
  const hasLiveChannel = activeChannels.length > 0 && hasRealtimeTransport
  const statusKey = useMemo(
    () => `${mode}:${normalizedUserId ?? 'guest'}:${normalizedTownId ?? 'no-town'}:${hasLiveChannel ? 'live' : 'polling'}`,
    [hasLiveChannel, mode, normalizedTownId, normalizedUserId],
  )
  const resolvedStatus = statusState.key === statusKey
    ? statusState.value
    : !normalizedUserId
      ? 'offline'
      : hasLiveChannel
        ? 'live'
        : 'polling'

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!normalizedUserId) {
      return
    }

    let cancelled = false
    const channelNames = activeChannelKey ? activeChannelKey.split('|').filter(Boolean) : []
    const subscribedChannels = channelNames
      .map((channelName) => window.Echo?.private?.(channelName))
      .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel))

    const updateStatus = (nextStatus: DashboardRealtimeStatus) => {
      if (!mountedRef.current || cancelled) {
        return
      }

      setStatusState((current) => (
        current.key === statusKey && current.value === nextStatus
          ? current
          : { key: statusKey, value: nextStatus }
      ))
    }

    const markUpdated = (keys: string[]) => {
      if (!mountedRef.current || cancelled) {
        return
      }

      const now = Date.now()
      setUpdatedAt((current) => (current === now ? current : now))
      setUpdatedKeys((current) => pushUniqueKeys(current, keys))

      if (clearUpdatedTimer.current) {
        window.clearTimeout(clearUpdatedTimer.current)
      }

      clearUpdatedTimer.current = window.setTimeout(() => {
        if (!mountedRef.current || cancelled) {
          return
        }
        setUpdatedKeys((current) => (current.length > 0 ? [] : current))
      }, UPDATE_FLASH_MS)
    }

    const handleEvent = async (event: DashboardRealtimeEventName, alias: string, payload: unknown) => {
      if (!mountedRef.current || cancelled) {
        return
      }

      const fingerprint = buildEventFingerprint(event, payload)
      const receivedAt = Date.now()
      const lastSeenAt = seenEventTimestamps.current.get(fingerprint)
      if (lastSeenAt != null && receivedAt - lastSeenAt < EVENT_DEDUPE_WINDOW_MS) {
        return
      }

      seenEvents.current.add(fingerprint)
      seenEventTimestamps.current.set(fingerprint, receivedAt)
      setLastEvent({
        name: event,
        alias,
        fingerprint,
        receivedAt,
      })
      if (import.meta.env.DEV) {
        console.debug('[dashboard-realtime]', {
          mode,
          event,
          alias,
          channels: channelNames,
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
      subscribedChannels.forEach((channel) => {
        channel.listen?.(alias, (payload: unknown) => void handleEvent(eventName, alias, payload))
      })
    })

    const poll = async () => {
      if (!mountedRef.current || cancelled) {
        return
      }

      const now = Date.now()
      if (now - lastPollAt.current < 1000) {
        return
      }
      lastPollAt.current = now

      try {
        await pollOperationalQueries(mode, normalizedUserId)
        await Promise.all(MODE_QUERY_KEYS[mode].map((queryKey) => queryClient.invalidateQueries({ queryKey })))
        await queryClient.invalidateQueries({ queryKey: ['notifications'] })
        await queryClient.invalidateQueries({ queryKey: ['conversations'] })
        if (!mountedRef.current || cancelled) {
          return
        }
        setLastRefreshAt(now)

        if (!cancelled && !hasLiveChannel) {
          updateStatus('polling')
        }
      } catch {
        if (!cancelled) {
          updateStatus(hasLiveChannel ? 'live' : 'offline')
        }
      }
    }

    let interval: number | null = null
    if (!hasLiveChannel) {
      interval = window.setInterval(() => void poll(), POLL_INTERVAL_MS)
      void poll()
    }

    return () => {
      cancelled = true
      if (interval != null) {
        window.clearInterval(interval)
        interval = null
      }

      listeners.forEach(({ alias }) => {
        subscribedChannels.forEach((channel) => {
          channel.stopListening?.(alias)
        })
      })

      if (clearUpdatedTimer.current) {
        window.clearTimeout(clearUpdatedTimer.current)
        clearUpdatedTimer.current = null
      }
    }
  }, [activeChannelKey, hasLiveChannel, mode, normalizedUserId, queryClient, statusKey])

  return useMemo(
    () => ({
      mode,
      status: resolvedStatus,
      updatedAt,
      updatedKeys,
      subscribedChannels: activeChannels,
      lastEvent,
      pollingActive: !hasLiveChannel || resolvedStatus === 'polling',
      lastRefreshAt,
    }),
    [activeChannels, hasLiveChannel, lastEvent, lastRefreshAt, mode, resolvedStatus, updatedAt, updatedKeys],
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
