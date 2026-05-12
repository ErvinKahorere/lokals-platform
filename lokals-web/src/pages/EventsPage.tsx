import { CalendarRange, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState, QueryState } from '../components/Ui'
import { NotificationBell } from '../components/experience/NotificationBell'
import { EventCard } from '../components/events/EventCard'
import { EventCategoryChips } from '../components/events/EventCategoryChips'
import { SearchBar } from '../components/ui/SearchBar'
import { useEvents, useFollows, useMe, useNearbyEvents, useNotifications, useUpcomingEvents } from '../hooks/queries'

export function EventsPage() {
  const meQuery = useMe()
  const user = useMemo(() => {
    const payload = meQuery.data?.user
    if (!payload) return null
    return 'data' in payload ? payload.data : payload
  }, [meQuery.data])
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'weekend' | 'month'>('all')
  const notificationsQuery = useNotifications()
  const followsQuery = useFollows(Boolean(user))

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const weekendEnd = new Date(now)
  weekendEnd.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7) + 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const formatDay = (value: Date) => value.toISOString().slice(0, 10)

  const params = {
    search: search || undefined,
    category: category === 'all' ? undefined : category,
    town: user?.default_town ?? undefined,
    area: user?.default_area ?? undefined,
    date_from: dateFilter === 'all' ? undefined : dateFilter === 'tomorrow' ? formatDay(tomorrow) : formatDay(now),
    date_to:
      dateFilter === 'today'
        ? formatDay(now)
        : dateFilter === 'tomorrow'
          ? formatDay(tomorrow)
          : dateFilter === 'weekend'
            ? formatDay(weekendEnd)
            : dateFilter === 'month'
              ? formatDay(monthEnd)
              : undefined,
  }

  const eventsQuery = useEvents(params)
  const nearbyQuery = useNearbyEvents({ town: user?.default_town ?? undefined, area: user?.default_area ?? undefined })
  const weekendQuery = useUpcomingEvents({ town: user?.default_town ?? undefined, date_to: formatDay(weekendEnd) })
  const savedEventsQuery = useEvents({ town: user?.default_town ?? undefined, area: user?.default_area ?? undefined })

  const events = eventsQuery.data?.data ?? []
  const nearbyEvents = nearbyQuery.data?.data?.slice(0, 3) ?? []
  const weekendEvents = weekendQuery.data?.data?.slice(0, 3) ?? []
  const featuredEvent = events.find((event) => event.is_featured) ?? nearbyEvents[0] ?? weekendEvents[0]
  const savedEvents = (savedEventsQuery.data?.data ?? []).filter((event) => event.is_saved).slice(0, 3)
  const unreadCount = notificationsQuery.data?.filter((item) => item.read_at == null).length ?? 0

  const followedKeys = new Set(
    (followsQuery.data?.data ?? []).map((item) => `${item.followable_type}-${item.followable_id}`),
  )
  const followedEvents = events.filter((event) => {
    const organizer = event.organizer
    if (!organizer?.type) return false
    const typeFragment = organizer.type === 'organization' ? 'Organization' : 'ServiceProvider'
    return followedKeys.has(`App\\Models\\${typeFragment}-${organizer.id}`)
  }).slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Events</p>
            <h1 className="mt-1 text-3xl font-semibold text-lokals-charcoal">What is happening near you?</h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-lokals-purple">
              <MapPin className="h-4 w-4" />
              {[user?.default_area, user?.default_town].filter(Boolean).join(', ') || 'Okahandja'}
            </div>
          </div>
          <NotificationBell count={unreadCount} />
        </div>

        <div className="mt-5">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            placeholder="Search events..."
            recentKey="events"
            suggestions={['Weekend market', 'Workshop', 'Live music', 'Public meeting']}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <EventCategoryChips value={category} onChange={setCategory} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ['all', 'All'],
            ['today', 'Today'],
            ['tomorrow', 'Tomorrow'],
            ['weekend', 'This weekend'],
            ['month', 'This month'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateFilter(value as typeof dateFilter)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                dateFilter === value
                  ? 'border-lokals-purple bg-lokals-purple text-white shadow-card'
                  : 'border-lokals-border bg-lokals-bg text-lokals-charcoal hover:border-lokals-purple/30 hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {featuredEvent ? (
        <section className="overflow-hidden rounded-[28px] border border-lokals-border bg-white shadow-card">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-72 bg-slate-100">
              {featuredEvent.image_url ? (
                <img src={featuredEvent.image_url} alt={featuredEvent.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Featured event</div>
              )}
            </div>
            <div className="space-y-4 p-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">
                <CalendarRange className="h-4 w-4" />
                Featured event
              </div>
              <h2 className="text-2xl font-semibold text-lokals-charcoal">{featuredEvent.title}</h2>
              <p className="text-sm leading-6 text-lokals-muted">{featuredEvent.description ?? 'A strong local event pick near you.'}</p>
              <div className="max-w-md">
                <EventCard event={featuredEvent} />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Events near you</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Upcoming local moments worth acting on</h2>
          </div>
          <Link to="/events/calendar" className="text-sm font-semibold text-lokals-purple">Calendar view</Link>
        </div>
        <QueryState isLoading={nearbyQuery.isLoading} error={nearbyQuery.error} empty={nearbyEvents.length === 0}>
          {nearbyEvents.length === 0 ? (
            <EmptyState title="No events found in your area yet." body="Try another date or category." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {nearbyEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">This weekend</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Good local picks to act on quickly</h2>
        </div>
        <QueryState isLoading={weekendQuery.isLoading} error={weekendQuery.error} empty={weekendEvents.length === 0}>
          {weekendEvents.length === 0 ? (
            <EmptyState title="No events found for this weekend." body="More weekend plans will appear as organizers publish them." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {weekendEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Saved events</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Events you plan to come back to</h2>
        </div>
        <QueryState isLoading={savedEventsQuery.isLoading} error={savedEventsQuery.error} empty={savedEvents.length === 0}>
          {savedEvents.length === 0 ? (
            <EmptyState title="No saved events yet." body="Save events to keep them close while planning your week." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {savedEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">From followed organizers</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Updates from organizers you already trust</h2>
        </div>
        <QueryState isLoading={eventsQuery.isLoading || followsQuery.isLoading} error={eventsQuery.error ?? followsQuery.error} empty={followedEvents.length === 0}>
          {followedEvents.length === 0 ? (
            <EmptyState title="No followed organizer events yet." body="Follow organizers from event details to see their events sooner." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {followedEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">All events</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Browse the local calendar</h2>
        </div>
        <QueryState isLoading={eventsQuery.isLoading} error={eventsQuery.error} empty={events.length === 0}>
          {events.length === 0 ? (
            <EmptyState title="No events found in your area yet." body="Try another category or date." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </QueryState>
      </section>
    </div>
  )
}
