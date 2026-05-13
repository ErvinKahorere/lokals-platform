import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { getNotificationTarget } from '../lib/notificationRouting'
import { useAuthStore } from '../store/auth'
import type { NotificationItem } from '../types'

declare global {
  interface Window {
    Echo?: {
      private: (name: string) => { listen: (event: string, callback: (payload: unknown) => void) => unknown; stopListening?: (event: string) => unknown }
    }
  }
}

function isPreferenceEnabled(notification: NotificationItem, preferences?: Record<string, boolean>) {
  if (!preferences) return true

  const type = notification.type ?? 'system'
  const map: Record<string, string[]> = {
    municipal_alert: ['city_alerts'],
    booking_update: ['booking_updates'],
    booking_status: ['booking_updates'],
    job_update: ['job_updates'],
    job_application: ['job_updates'],
    news_update: ['alerts_from_followed_entities'],
  }

  const keys = map[type]
  if (!keys) return true
  return keys.every((key) => preferences[key] !== false)
}

function toNotificationItem(item: any): NotificationItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title ?? item.data?.title ?? 'Notification',
    body: item.body ?? item.data?.body ?? item.data?.message ?? 'You have an update.',
    target_type: item.target_type ?? item.target?.type ?? item.data?.target_type,
    target_id: item.target_id ?? item.target?.id ?? item.data?.target_id,
    target: {
      id: item.target?.id ?? item.data?.target?.id,
      type: item.target?.type ?? item.data?.target?.type,
      href: item.target?.href ?? item.data?.target?.href,
      external_url: item.target?.external_url ?? item.data?.target?.external_url,
      source_name: item.target?.source_name ?? item.data?.target?.source_name,
      title: item.target?.title ?? item.data?.target?.title,
    },
    read_at: item.read_at,
    created_at: item.created_at,
    data: item.data,
  }
}

export function useRealtimeNotifications() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const seen = useRef<Set<string>>(new Set())
  const [queue, setQueue] = useState<NotificationItem[]>([])
  const preferences = user?.preferences?.notification_preferences

  useEffect(() => {
    if (!token) {
      seen.current.clear()
      setQueue([])
      return
    }

    let cancelled = false
    const channel = window.Echo?.private?.(`users.${user?.id ?? ''}`)

    const poll = async () => {
      try {
        const response = await api.get('/notifications/unread', { params: { unread: 1, per_page: 10 } })
        const items = (response.data?.data ?? []).map(toNotificationItem)
        queryClient.setQueryData(['notifications'], items)

        if (cancelled) return

        const nextItems = items
          .filter((item: NotificationItem) => !seen.current.has(item.id))
          .filter((item: NotificationItem) => isPreferenceEnabled(item, preferences))

        if (nextItems.length > 0) {
          nextItems.forEach((item: NotificationItem) => seen.current.add(item.id))
          setQueue((current) => [...current, ...nextItems].slice(-4))
        }
      } catch {
        // Polling should fail quietly and try again on the next interval.
      }
    }

    void poll()
    const interval = window.setInterval(() => void poll(), 45000)
    channel?.listen?.('.support.message.received', () => void poll())
    channel?.listen?.('.issue.status.updated', () => void poll())
    channel?.listen?.('.reward.approved', () => void poll())
    channel?.listen?.('.marketplace.message.received', () => void poll())

    return () => {
      cancelled = true
      window.clearInterval(interval)
      channel?.stopListening?.('.support.message.received')
      channel?.stopListening?.('.issue.status.updated')
      channel?.stopListening?.('.reward.approved')
      channel?.stopListening?.('.marketplace.message.received')
    }
  }, [preferences, queryClient, token, user?.id])

  const active = queue[0] ?? null

  useEffect(() => {
    if (!active) return
    const timeout = window.setTimeout(() => {
      setQueue((current) => current.slice(1))
    }, 6500)
    return () => window.clearTimeout(timeout)
  }, [active])

  const openNotification = useMemo(() => {
    return (notification: NotificationItem) => {
      const href = getNotificationTarget(notification)
      setQueue((current) => current.filter((item) => item.id !== notification.id))
      navigate(href)
    }
  }, [navigate])

  const dismissNotification = (id: string) => {
    setQueue((current) => current.filter((item) => item.id !== id))
  }

  return {
    activeNotification: active,
    openNotification,
    dismissNotification,
  }
}
