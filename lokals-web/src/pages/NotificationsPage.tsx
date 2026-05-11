import { Button, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { NotificationList } from '../components/experience/NotificationList'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/queries'

export function NotificationsPage() {
  const notificationsQuery = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const markRead = useMarkNotificationRead()
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
        <QueryState isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} empty={notifications.length === 0}>
          <NotificationList
            items={notifications}
            onMarkRead={(id) => markRead.mutate(id)}
            onOpen={(notification) => {
              if (!notification.read_at) {
                markRead.mutate(notification.id)
              }
            }}
          />
        </QueryState>
      </SectionCard>
    </div>
  )
}
