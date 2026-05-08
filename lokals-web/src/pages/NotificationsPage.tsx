import { Button, PageHeader, QueryState, SectionCard } from '../components/Ui'
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
        <QueryState isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} empty={notifications.length === 0}>
          <NotificationList items={notifications} />
        </QueryState>
      </SectionCard>
    </div>
  )
}
