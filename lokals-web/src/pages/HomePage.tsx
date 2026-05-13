import { ArrowRight, BriefcaseBusiness, MapPin, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EventCard } from '../components/events/EventCard'
import { HomeHeroCard } from '../components/home/HomeHeroCard'
import { HomeQuickActions } from '../components/home/HomeQuickActions'
import { HomeSection } from '../components/home/HomeSection'
import { LocalUpdateCard } from '../components/home/LocalUpdateCard'
import { RoleHomeCard } from '../components/home/RoleHomeCard'
import { NewsFeedSection } from '../components/news/NewsFeedSection'
import { NearbyServiceCard } from '../components/experience/NearbyServiceCard'
import { NotificationBell } from '../components/experience/NotificationBell'
import { Button } from '../components/ui/Button'
import { SearchBar } from '../components/ui/SearchBar'
import { StatusPill } from '../components/Ui'
import { useAlertsFeed, useEvents, useFollowingFeed, useJobs, useMe, useNewsFeed, useNewsLocal, useNotifications, usePreferences, useProducts, useProviders, useSearchResults } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { normalizePilotArea, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'

export function HomePage() {
  const user = useAuthStore((state) => state.user)
  const meQuery = useMe()
  const preferencesQuery = usePreferences()
  const [search, setSearch] = useState('')
  const currentUser = meQuery.data?.user ? ('data' in meQuery.data.user ? meQuery.data.user.data : meQuery.data.user) : user
  const town = PILOT_TOWN
  const area = normalizePilotArea(currentUser?.default_area ?? preferencesQuery.data?.default_area)
  const activeRole = currentUser?.current_role ?? currentUser?.roles?.[0] ?? 'guest'
  const alertsFeedQuery = useAlertsFeed()
  const followingFeedQuery = useFollowingFeed()
  const newsLocalQuery = useNewsLocal({ town, area: area ?? undefined })
  const newsFeedQuery = useNewsFeed(Boolean(currentUser))
  const searchResultsQuery = useSearchResults(search)
  const notificationsQuery = useNotifications()
  const providersQuery = useProviders({ town, area: area ?? undefined })
  const productsQuery = useProducts({ sort: 'popular', town, area: area ?? undefined })
  const eventsQuery = useEvents({ town, area: area ?? undefined })
  const jobsQuery = useJobs({ town, area: area ?? undefined })

  const providers = providersQuery.data?.data ?? []
  const products = productsQuery.data?.data?.slice(0, 3) ?? []
  const events = eventsQuery.data?.data?.slice(0, 3) ?? []
  const jobs = jobsQuery.data?.data?.slice(0, 3) ?? []
  const unreadCount = notificationsQuery.data?.filter((item) => item.read_at == null).length ?? 0
  const localNews = (currentUser ? newsFeedQuery.data?.data : newsLocalQuery.data?.data)?.slice(0, 3) ?? []
  const alerts = alertsFeedQuery.data?.data ?? []
  const sortedAlerts = useMemo(() => {
    const severityWeight: Record<string, number> = { critical: 4, high: 3, urgent: 3, medium: 2, normal: 1 }
    return [...alerts].sort((a: any, b: any) => {
      const leftWeight = (a.source_type === 'municipal_alert' ? 10 : 0) + (severityWeight[(a.severity ?? 'normal').toLowerCase()] ?? 0)
      const rightWeight = (b.source_type === 'municipal_alert' ? 10 : 0) + (severityWeight[(b.severity ?? 'normal').toLowerCase()] ?? 0)
      if (leftWeight !== rightWeight) {
        return rightWeight - leftWeight
      }
      return new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    })
  }, [alerts])

  const roleCardKind = useMemo(() => {
    if (!currentUser) return 'guest' as const
    if (['seller', 'service_provider', 'business_owner'].includes(activeRole)) return 'business' as const
    if (activeRole === 'worker') return 'worker' as const
    if (activeRole === 'organization_admin') return 'organization' as const
    if (['town_manager', 'municipality_admin', 'super_admin', 'operator'].includes(activeRole)) return 'manager' as const
    return 'citizen' as const
  }, [activeRole, currentUser])

  const localUpdates = useMemo(() => {
    const urgentAlerts = sortedAlerts.slice(0, 2).map((item: any) => ({
      key: `alert-${item.id}`,
      title: item.title,
      source: item.location ?? 'Local alert',
      type: 'alert' as const,
      time: item.timestamp ?? item.published_at ?? 'Recent',
      status: item.severity ?? item.priority ?? 'urgent',
      to: '/alerts',
      weight: 3,
    }))

    const newsUpdates = localNews.slice(0, 2).map((item) => ({
      key: `news-${item.id}`,
      title: item.title,
      source: item.source_name,
      type: 'news' as const,
      time: item.published_at ?? 'Recent',
      status: item.category,
      to: `/news/${item.id}`,
      weight: 2,
    }))

    const followedUpdates = (followingFeedQuery.data?.data ?? []).slice(0, 2).map((item: any) => ({
      key: `followed-${item.id}`,
      title: item.title ?? item.name ?? item.body ?? 'Update from a followed organization',
      source: item.category ?? item.location ?? 'Followed update',
      type: 'followed' as const,
      time: item.timestamp ?? item.created_at ?? 'Recent',
      status: item.status ?? 'following',
      to: '/activity',
      weight: 1,
    }))

    const eventUpdates = events.slice(0, urgentAlerts.length + newsUpdates.length + followedUpdates.length >= 4 ? 0 : 1).map((item) => ({
      key: `event-${item.id}`,
      title: item.title,
      source: item.venue_name ?? item.location_label ?? item.location ?? 'Local event',
      type: 'event' as const,
      time: item.starts_at ?? 'Upcoming',
      status: item.category,
      to: `/events/${item.id}`,
      weight: 2,
    }))

    const baseUpdateCount = urgentAlerts.length + newsUpdates.length + followedUpdates.length + eventUpdates.length
    const overflowNewsUpdates = (baseUpdateCount >= 5 ? [] : localNews.slice(2, 2 + Math.max(0, 5 - baseUpdateCount))).map((item) => ({
      key: `news-more-${item.id}`,
      title: item.title,
      source: item.source_name,
      type: 'news' as const,
      time: item.published_at ?? 'Recent',
      status: item.category,
      to: `/news/${item.id}`,
      weight: 1,
    }))

    return [...urgentAlerts, ...newsUpdates, ...followedUpdates, ...eventUpdates, ...overflowNewsUpdates]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  }, [events, followingFeedQuery.data?.data, localNews, sortedAlerts])

  const searchTarget = (href: string) => {
    const query = search.trim()
    if (!query) return href
    return `${href}?q=${encodeURIComponent(query)}`
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-6 py-6 shadow-soft">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-lokals-muted">{currentUser ? `Good morning, ${currentUser.name}` : 'Explore what is happening nearby'}</p>
                  <h1 className="mt-2 text-3xl font-semibold text-lokals-charcoal">What do you need in Okahandja today?</h1>
                </div>
                <NotificationBell count={unreadCount} to="/notifications" />
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-lokals-muted">
                Search trusted services, daily essentials, events, jobs, and local updates around {[area, town].filter(Boolean).join(', ')}.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-lokals-green">{PILOT_LOCATION_MESSAGE}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-lokals-purple-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-purple">
                  {currentUser ? activeRole.replaceAll('_', ' ') : 'Guest'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-lokals-charcoal">
                  <MapPin className="h-3.5 w-3.5 text-lokals-green" />
                  {[area, town].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
            {currentUser ? null : (
              <Link to="/login" state={{ from: '/' }}>
                <Button>Sign in for local updates</Button>
              </Link>
            )}
          </div>

          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            placeholder="Search services, jobs, products..."
            recentKey="home"
            suggestions={['Public services in Okahandja', 'Local businesses in Nau-Aib', 'Events this weekend', 'Okahandja council news', 'Jobs nearby']}
            shortcuts={[
              { label: 'Services', value: 'services near me' },
              { label: 'Directory', value: 'businesses nearby' },
              { label: 'Store', value: 'shop local products' },
              { label: 'Events', value: 'events this weekend' },
              { label: 'News', value: 'local news' },
              { label: 'Jobs', value: 'jobs near me' },
            ]}
          />

          {search.trim() ? (
            <div className="rounded-[24px] border border-lokals-purple/10 bg-[linear-gradient(180deg,#f9faff,#ffffff)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-green">Search preview</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: 'Services', items: searchResultsQuery.data?.services ?? [], key: 'name', href: '/services' },
                  { label: 'Directory', items: searchResultsQuery.data?.directory ?? [], key: 'name', href: '/directory' },
                  { label: 'Store', items: searchResultsQuery.data?.products ?? [], key: 'title', href: '/store' },
                  { label: 'Events', items: searchResultsQuery.data?.events ?? [], key: 'title', href: '/events' },
                  { label: 'News', items: searchResultsQuery.data?.news ?? [], key: 'title', href: '/news' },
                  { label: 'Jobs', items: searchResultsQuery.data?.jobs ?? [], key: 'title', href: '/jobs' },
                ].map((section) => (
                  <div key={section.label} className="rounded-[20px] bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-lokals-charcoal">{section.label}</p>
                      <Link to={searchTarget(section.href)} className="text-xs font-semibold text-lokals-green">Open</Link>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-lokals-muted">
                      {section.items.length === 0 ? <p>No matches yet.</p> : section.items.slice(0, 3).map((item: any) => <p key={`${section.label}-${item.id}`}>{item[section.key]}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <HomeHeroCard />

      <HomeQuickActions activeRole={activeRole} isGuest={!currentUser} />

      <RoleHomeCard kind={roleCardKind} activeRole={activeRole} />

      <HomeSection
        eyebrow="Local updates"
        title="What is happening near you"
        action={<Link to="/alerts" className="text-sm font-semibold text-lokals-green">View All</Link>}
        isLoading={alertsFeedQuery.isLoading || (currentUser ? newsFeedQuery.isLoading : newsLocalQuery.isLoading) || followingFeedQuery.isLoading}
        error={alertsFeedQuery.error ?? (currentUser ? newsFeedQuery.error : newsLocalQuery.error) ?? followingFeedQuery.error}
        empty={localUpdates.length === 0}
        emptyTitle="No alerts right now. You're all caught up."
        emptyBody="Local alerts, followed updates, and local news will appear here."
        onRetry={() => {
          void alertsFeedQuery.refetch()
          void followingFeedQuery.refetch()
          void (currentUser ? newsFeedQuery.refetch() : newsLocalQuery.refetch())
        }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {localUpdates.map((item) => (
            <LocalUpdateCard key={item.key} title={item.title} source={item.source} type={item.type} time={item.time} status={item.status} to={item.to} />
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Nearby services"
        title="Trusted providers around you"
        action={<Link to="/services" className="text-sm font-semibold text-lokals-green">View All</Link>}
        isLoading={providersQuery.isLoading}
        error={providersQuery.error}
        empty={providers.length === 0}
        emptyTitle="No nearby services yet."
        emptyBody="We will show trusted local providers here as they become available."
        onRetry={() => void providersQuery.refetch()}
      >
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4 px-1">
            {providers.map((provider) => (
              <div key={provider.id} className="w-[320px] shrink-0">
                <NearbyServiceCard provider={provider} />
              </div>
            ))}
          </div>
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Events near you"
        title="Upcoming events nearby"
        action={<Link to="/events" className="text-sm font-semibold text-lokals-green">View All</Link>}
        isLoading={eventsQuery.isLoading}
        error={eventsQuery.error}
        empty={events.length === 0}
        emptyTitle="No events nearby yet."
        emptyBody="Local events will show up here once organizers publish them."
        onRetry={() => void eventsQuery.refetch()}
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow="Store deals"
        title="Local products and offers"
        action={<Link to="/store" className="text-sm font-semibold text-lokals-green">View All</Link>}
        isLoading={productsQuery.isLoading}
        error={productsQuery.error}
        empty={products.length === 0}
        emptyTitle="No store deals in your area today."
        emptyBody="Local products and sale alerts will appear here."
        onRetry={() => void productsQuery.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} to={`/store/${product.id}`} className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-lokals-charcoal">{product.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{product.business?.name ?? product.user?.name ?? 'Local seller'}</p>
                  <p className="mt-3 text-lg font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-lokals-muted">{product.area ?? product.town ?? PILOT_TOWN}</p>
                    <StatusPill value="Local deal" tone="success" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        eyebrow={activeRole === 'worker' ? 'Work first' : 'Work opportunities'}
        title="Jobs near you"
        action={<Link to="/jobs" className="text-sm font-semibold text-lokals-green">View All</Link>}
        isLoading={jobsQuery.isLoading}
        error={jobsQuery.error}
        empty={jobs.length === 0}
        emptyTitle="No nearby work opportunities right now."
        emptyBody="We will show fresh local jobs here as they are posted."
        onRetry={() => void jobsQuery.refetch()}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card transition hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-lokals-charcoal">{job.title}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{job.location ?? [area, town].filter(Boolean).join(', ')}</p>
                  <p className="mt-2 text-sm font-semibold text-lokals-charcoal">{job.compensation ? getDisplayPrice(job.compensation) : 'Pay not listed'}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-lokals-muted">
                    <span>{job.status ?? 'Open'}</span>
                    <span>{job.applications_count ?? 0} applications</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </HomeSection>

      <NewsFeedSection
        title="Local news"
        eyebrow="Stay informed"
        items={localNews}
        isLoading={currentUser ? newsFeedQuery.isLoading : newsLocalQuery.isLoading}
        error={currentUser ? newsFeedQuery.error : newsLocalQuery.error}
      />

      <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">More nearby</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Explore more in your area</h2>
          </div>
          <Link to="/more"><Button variant="secondary">Open more <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </div>
  )
}
