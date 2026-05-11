import { Link } from 'react-router-dom'
import { BellRing, BriefcaseBusiness, CalendarClock, CarFront, ClipboardList, Bookmark, Newspaper, ShieldAlert, Ticket, Truck, TriangleAlert } from 'lucide-react'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { useActivityFeed } from '../hooks/queries'
import { normalizeNotificationHref } from '../lib/notificationRoutes'

const sectionLabel = (timestamp?: string | null) => {
  if (!timestamp) return 'Earlier'
  const date = new Date(timestamp)
  const now = new Date()
  return date.toDateString() === now.toDateString() ? 'Today' : 'Earlier'
}

export function ActivityPage() {
  const activityQuery = useActivityFeed()
  const items = activityQuery.data?.data ?? []

  const iconForType = (type: string) => {
    switch (type) {
      case 'booking':
        return CalendarClock
      case 'ticket':
        return Ticket
      case 'delivery':
        return Truck
      case 'ride':
        return CarFront
      case 'job_application':
        return BriefcaseBusiness
      case 'report':
        return ClipboardList
      case 'alert':
        return ShieldAlert
      case 'saved_item':
        return Bookmark
      case 'notification':
        return BellRing
      case 'sos':
        return TriangleAlert
      default:
        return Newspaper
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Activity" title="Everything happening around your account" description="Bookings, tickets, rides, deliveries, reports, alerts, and saved updates in one timeline." />
      <QueryState isLoading={activityQuery.isLoading} error={activityQuery.error} empty={items.length === 0}>
        {items.length === 0 ? (
          <EmptyState title="No activity yet." body="Bookings, saved items, rides, tickets, and reports will show here as you use LOKALS." />
        ) : (
          <div className="space-y-5">
            {['Today', 'Earlier'].map((section) => {
              const sectionItems = items.filter((item) => sectionLabel(item.timestamp) === section)
              if (sectionItems.length === 0) return null
              return (
                <div key={section} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{section}</p>
                  {sectionItems.map((item, index) => (
                    <Link key={`${item.type}-${item.title}-${index}`} to={normalizeNotificationHref(item.route)} className="block rounded-[22px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
                            {(() => {
                              const Icon = iconForType(item.type)
                              return <Icon className="h-5 w-5" />
                            })()}
                          </div>
                          <div className="min-w-0">
                          <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                          <p className="mt-1 text-sm text-lokals-muted">{item.body}</p>
                          <p className="mt-2 text-xs text-lokals-muted">{item.timestamp ?? 'Recent'}</p>
                          </div>
                        </div>
                        <StatusBadge value={item.status ?? item.type} tone={item.type === 'sos' ? 'danger' : item.type === 'alert' ? 'accent' : 'neutral'} />
                      </div>
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </QueryState>
      {activityQuery.data?.summary ? (
        <SectionCard className="bg-white">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(activityQuery.data.summary).map(([label, value]) => (
              <div key={label} className="rounded-[18px] bg-lokals-surface px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">{label.replaceAll('_', ' ')}</p>
                <p className="mt-1 text-xl font-bold text-lokals-charcoal">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
