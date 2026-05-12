import { Button, PageHeader, QueryState, SectionCard, StatusPill } from '../components/Ui'
import { NotificationList } from '../components/experience/NotificationList'
import { useMarkAllNotificationsRead, useNotifications } from '../hooks/queries'

export function NotificationsPage() {
  const notificationsQuery = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const notifications = notificationsQuery.data ?? []

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
          </div>
          <StatusPill value={`${notifications.filter((item) => item.read_at == null).length} unread`} tone="accent" />
        </div>
      </SectionCard>

      <SectionCard className="bg-white">
        <QueryState isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} empty={notifications.length === 0}>
          <NotificationList items={notifications} />
        </QueryState>
      </SectionCard>
    </div>
  )
}
