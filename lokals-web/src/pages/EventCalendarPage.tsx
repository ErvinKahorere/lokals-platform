import { Link } from 'react-router-dom'
import { Button, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { EventDateBadge } from '../components/events/EventDateBadge'
import { useEventCalendar } from '../hooks/queries'

export function EventCalendarPage() {
  const calendarQuery = useEventCalendar()
  const groups = calendarQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Events" title="Calendar view" description="See upcoming local events grouped by date so it is easier to plan around your week." />
      <QueryState isLoading={calendarQuery.isLoading} error={calendarQuery.error} empty={groups.length === 0}>
        <div className="space-y-4">
          {groups.map((group) => (
            <SectionCard key={group.date} className="bg-white">
              <h2 className="text-lg font-semibold text-lokals-charcoal">{new Intl.DateTimeFormat('en-NA', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(group.date))}</h2>
              <div className="mt-4 space-y-4">
                {group.events.map((event) => (
                  <div key={event.id} className="flex flex-col gap-3 rounded-[20px] border border-lokals-border p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{event.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{event.location_label ?? event.location ?? [event.area, event.town].filter(Boolean).join(', ')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <EventDateBadge startsAt={event.starts_at} endsAt={event.ends_at} />
                      <Link to={`/events/${event.id}`}><Button>Open</Button></Link>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
    </div>
  )
}
