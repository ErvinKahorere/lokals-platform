import { useMemo, useState } from 'react'
import { Button, PageHeader, QueryState, SectionCard, StatusPill } from '../components/Ui'
import { NotificationList } from '../components/experience/NotificationList'
import { useMarkAllNotificationsRead, useNotifications } from '../hooks/queries'
import type { NotificationItem } from '../types'

const notificationFilters = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'rides', label: 'Rides' },
  { key: 'hire', label: 'Hire' },
  { key: 'marketplace', label: 'Market' },
  { key: 'reports', label: 'Reports' },
  { key: 'announcements', label: 'Announcements' },
] as const

type NotificationFilter = (typeof notificationFilters)[number]['key']

function notificationCategory(item: NotificationItem): NotificationFilter {
  const haystack = [item.type, item.target_type, item.title, item.body, item.target?.type]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes('order')) return 'orders'
  if (haystack.includes('ride') || haystack.includes('driver')) return 'rides'
  if (haystack.includes('hire') || haystack.includes('rental')) return 'hire'
  if (haystack.includes('market') || haystack.includes('product') || haystack.includes('store')) return 'marketplace'
  if (haystack.includes('report') || haystack.includes('issue')) return 'reports'
  if (haystack.includes('announcement') || haystack.includes('alert') || haystack.includes('news')) return 'announcements'
  return 'all'
}

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')
  const notificationsQuery = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data])
  const visibleNotifications = useMemo(
    () => activeFilter === 'all' ? notifications : notifications.filter((item) => notificationCategory(item) === activeFilter),
    [activeFilter, notifications],
  )
  const unreadCount = notifications.filter((item) => item.read_at == null).length

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Notifications"
        title="Notifications"
        description="Booking updates, reminders, followed alerts, and system activity for your account."
        actions={
          <Button variant="secondary" disabled={markAllRead.isPending || notifications.length === 0} onClick={() => markAllRead.mutate()}>
            {markAllRead.isPending ? 'Marking read...' : 'Mark all read'}
          </Button>
        }
      />

      <SectionCard className="bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Activity feed</p>
            <h2 className="mt-1 text-lg font-semibold text-lokals-charcoal">Grouped updates with a clearer unread signal</h2>
            <p className="mt-1 text-sm text-lokals-muted">Filter by city workflow so orders, rides, hire, reports, and announcements do not compete for attention.</p>
          </div>
          <StatusPill value={`${unreadCount} unread`} tone="accent" />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {notificationFilters.map((filter) => {
            const count = filter.key === 'all'
              ? notifications.length
              : notifications.filter((item) => notificationCategory(item) === filter.key).length

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${activeFilter === filter.key ? 'bg-lokals-purple text-white shadow-brand' : 'bg-lokals-surface text-lokals-muted hover:text-lokals-charcoal'}`}
              >
                {filter.label} {count > 0 ? count : ''}
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard className="bg-white">
        <QueryState isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} empty={notifications.length === 0}>
          <NotificationList items={visibleNotifications} />
        </QueryState>
      </SectionCard>
    </div>
  )
}
