import { BellRing } from 'lucide-react'
import { Button, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { ActivityTimeline } from '../components/experience/ActivityTimeline'
import { NotificationList } from '../components/experience/NotificationList'
import { useAlertsFeed, useMarkAllNotificationsRead, useNotifications } from '../hooks/queries'

export function AlertsPage() {
  const alertsQuery = useAlertsFeed()
  const notificationsQuery = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const alerts = alertsQuery.data?.data ?? []
  const notifications = notificationsQuery.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Alerts"
        title="City alerts and your notifications"
        description="See nearby alerts, followed-entity updates, and recent account activity in one feed."
        actions={<Button variant="secondary" disabled={markAllRead.isPending || notifications.length === 0} onClick={() => markAllRead.mutate()}>{markAllRead.isPending ? 'Marking read...' : 'Mark all read'}</Button>}
      />

      <SectionCard className="bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-lokals-charcoal">Notifications</h2>
            <p className="text-sm text-lokals-muted">Account updates, follow activity, and system messages.</p>
          </div>
        </div>
        <QueryState isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} empty={notifications.length === 0}>
          <div className="mt-4">
            <NotificationList items={notifications} />
          </div>
        </QueryState>
      </SectionCard>

      <SectionCard className="bg-white">
        <h2 className="text-lg font-semibold text-lokals-charcoal">Alerts near you</h2>
        <QueryState isLoading={alertsQuery.isLoading} error={alertsQuery.error} empty={alerts.length === 0}>
          <div className="mt-4">
            <ActivityTimeline
              items={alerts.map((item) => ({
                id: String(item.id),
                kind: item.source_type === 'organization' ? 'listing' : 'report',
                title: item.title,
                message: item.body,
                timestamp: item.timestamp ?? 'Recent',
                status: item.severity ?? 'alert',
              }))}
            />
          </div>
        </QueryState>
      </SectionCard>
    </div>
  )
}
