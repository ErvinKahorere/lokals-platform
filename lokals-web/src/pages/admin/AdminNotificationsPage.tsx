import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { PageHeader, QueryState, SectionCard, StatCard } from '../../components/Ui'

type SystemHealthPayload = {
  notifications?: Record<string, number | string>
}

function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}

export function AdminNotificationsPage() {
  const query = useQuery({
    queryKey: ['admin-notifications-page'],
    queryFn: async () => (await api.get('/admin/system-health')).data as SystemHealthPayload,
  })

  const notifications = Object.entries(query.data?.notifications ?? {})

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Notification operations"
        description="Platform communication volume, unread backlog, and operational message pressure."
        actions={<Link to="/notifications" className="rounded-full border border-lokals-border bg-white px-4 py-2 text-sm font-semibold text-lokals-charcoal">My notifications</Link>}
      />
      <QueryState isLoading={query.isLoading} error={query.error} empty={notifications.length === 0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notifications.map(([key, value]) => (
            <StatCard key={key} label={formatLabel(key)} value={String(value)} hint="Communication health" />
          ))}
        </div>
        <SectionCard className="bg-white p-5">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Why this matters</h3>
          <p className="mt-2 text-sm leading-6 text-lokals-muted">
            This view gives super admins a quick read on whether operational notifications are flowing normally or whether unread backlog is starting to grow across the platform.
          </p>
        </SectionCard>
      </QueryState>
    </div>
  )
}
