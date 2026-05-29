import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BellRing,
  CarFront,
  FileWarning,
  MapPin,
  Package,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Store,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LocalUpdateCard } from '../components/home/LocalUpdateCard'
import { HomeSection } from '../components/home/HomeSection'
import { NearbyServiceCard } from '../components/experience/NearbyServiceCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SearchBar } from '../components/ui/SearchBar'
import { StatusPill } from '../components/Ui'
import {
  useAlertsFeed,
  useFollowingFeed,
  useMe,
  useNewsFeed,
  useNewsLocal,
  usePreferences,
  useProducts,
  useProviders,
  useSearchResults,
} from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { normalizePilotArea, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../lib/pilot'
import { formatRoleLabel } from '../lib/roles'
import { useAuthStore } from '../store/auth'
import type { AlertFeedItem, UnifiedSearchResult } from '../types'

type FollowedUpdate = {
  id: number | string
  title?: string
  name?: string
  body?: string
  category?: string
  location?: string
  timestamp?: string
  created_at?: string
  status?: string
}

type CommandAction = {
  to: string
  label: string
  detail: string
  icon: LucideIcon
  toneClass: string
  iconClass: string
}

const priorityActions: CommandAction[] = [
  {
    to: '/report-issue',
    label: 'Report Issue',
    detail: 'Roads, water, waste, and public concerns',
    icon: FileWarning,
    toneClass: 'border-orange-200/70 bg-orange-50/80',
    iconClass: 'bg-orange-100 text-orange-700',
  },
  {
    to: '/ride',
    label: 'Request Taxi',
    detail: 'Book a ride around town in a few taps',
    icon: CarFront,
    toneClass: 'border-sky-200/70 bg-sky-50/80',
    iconClass: 'bg-sky-100 text-sky-700',
  },
  {
    to: '/delivery',
    label: 'Send Parcel',
    detail: 'Arrange quick local delivery',
    icon: Package,
    toneClass: 'border-emerald-200/70 bg-emerald-50/80',
    iconClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    to: '/sos',
    label: 'SOS',
    detail: 'Reach emergency help fast',
    icon: ShieldAlert,
    toneClass: 'border-rose-200/70 bg-rose-50/80',
    iconClass: 'bg-rose-100 text-rose-700',
  },
  {
    to: '/services',
    label: 'Browse Services',
    detail: 'Trusted local providers near you',
    icon: Sparkles,
    toneClass: 'border-lokals-green/20 bg-lokals-green-soft/60',
    iconClass: 'bg-lokals-green-soft text-lokals-green',
  },
]

const suggestedOrganizations = [
  {
    title: 'Town notices',
    body: 'Follow municipal announcements, service notices, and verified public updates.',
    to: '/following-organizations',
    badge: 'Official',
  },
  {
    title: 'Community groups',
    body: 'See updates from local organizers, projects, and public-interest initiatives.',
    to: '/following-organizations',
    badge: 'Community',
  },
  {
    title: 'Trusted businesses',
    body: 'Keep nearby service providers and verified local brands in your regular feed.',
    to: '/directory',
    badge: 'Business',
  },
]

function resolveGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function toneForAlert(severity?: string | null) {
  const value = severity?.toLowerCase()
  if (value === 'critical' || value === 'high' || value === 'urgent') return 'danger'
  if (value === 'medium') return 'warning'
  return 'info'
}

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
  const providersQuery = useProviders({ town, area: area ?? undefined })
  const productsQuery = useProducts({ sort: 'popular', town, area: area ?? undefined })

  const locationLabel = [area, town].filter(Boolean).join(', ')
  const firstName = currentUser?.name?.split(' ')[0] ?? 'there'
  const localNews = useMemo(
    () => (currentUser ? newsFeedQuery.data?.data : newsLocalQuery.data?.data)?.slice(0, 3) ?? [],
    [currentUser, newsFeedQuery.data?.data, newsLocalQuery.data?.data],
  )
  const providers = useMemo(() => providersQuery.data?.data?.slice(0, 4) ?? [], [providersQuery.data?.data])
  const products = useMemo(() => productsQuery.data?.data?.slice(0, 3) ?? [], [productsQuery.data?.data])
  const alerts = useMemo(() => alertsFeedQuery.data?.data ?? [], [alertsFeedQuery.data?.data])
  const sortedAlerts = useMemo(() => {
    const severityWeight: Record<string, number> = { critical: 4, high: 3, urgent: 3, medium: 2, normal: 1 }
    return [...alerts].sort((a: AlertFeedItem, b: AlertFeedItem) => {
      const leftWeight = (a.source_type === 'municipal_alert' ? 10 : 0) + (severityWeight[(a.severity ?? 'normal').toLowerCase()] ?? 0)
      const rightWeight = (b.source_type === 'municipal_alert' ? 10 : 0) + (severityWeight[(b.severity ?? 'normal').toLowerCase()] ?? 0)
      if (leftWeight !== rightWeight) {
        return rightWeight - leftWeight
      }
      return new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    })
  }, [alerts])

  const followedItems = useMemo(
    () => ((followingFeedQuery.data?.data ?? []) as FollowedUpdate[]).slice(0, 3),
    [followingFeedQuery.data?.data],
  )

  const localUpdates = useMemo(() => {
    const urgentAlerts = sortedAlerts.slice(0, 2).map((item) => ({
      key: `alert-${item.id}`,
      title: item.title,
      source: item.location ?? 'Local alert',
      type: 'alert' as const,
      time: item.timestamp ?? 'Recent',
      status: item.severity ?? 'urgent',
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

    const followedUpdates = followedItems.map((item) => ({
      key: `followed-${item.id}`,
      title: item.title ?? item.name ?? item.body ?? 'Update from a followed organization',
      source: item.category ?? item.location ?? 'Followed update',
      type: 'followed' as const,
      time: item.timestamp ?? item.created_at ?? 'Recent',
      status: item.status ?? 'following',
      to: '/activity',
      weight: 1,
    }))

    return [...urgentAlerts, ...newsUpdates, ...followedUpdates]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  }, [followedItems, localNews, sortedAlerts])

  const searchTarget = (href: string) => {
    const query = search.trim()
    if (!query) return href
    return `${href}?q=${encodeURIComponent(query)}`
  }

  const searchPreviewSections = [
    { label: 'Services', items: searchResultsQuery.data?.services ?? [], key: 'name', href: '/services' },
    { label: 'Directory', items: searchResultsQuery.data?.directory ?? [], key: 'name', href: '/directory' },
    { label: 'Store', items: searchResultsQuery.data?.products ?? [], key: 'title', href: '/store' },
    { label: 'Events', items: searchResultsQuery.data?.events ?? [], key: 'title', href: '/events' },
    { label: 'News', items: searchResultsQuery.data?.news ?? [], key: 'title', href: '/news' },
    { label: 'Jobs', items: searchResultsQuery.data?.jobs ?? [], key: 'title', href: '/jobs' },
  ]

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_26%),radial-gradient(circle_at_top_left,rgba(22,163,74,0.16),transparent_28%),linear-gradient(180deg,#ffffff,#f8fbff)] p-5 shadow-soft md:p-7">
        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-lokals-muted">{resolveGreeting()}, {firstName}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-lokals-charcoal md:text-4xl">
                    Your City Command Center
                  </h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-lokals-muted md:text-[15px]">
                  Calm local tools, verified city updates, nearby services, and marketplace activity for {locationLabel}.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-lokals-green-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-green">
                    {PILOT_LOCATION_MESSAGE}
                  </span>
                  <span className="rounded-full bg-lokals-purple-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-purple">
                    {currentUser ? formatRoleLabel(activeRole) : 'Guest'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-lokals-charcoal">
                    <MapPin className="h-3.5 w-3.5 text-lokals-green" />
                    {locationLabel}
                  </span>
                </div>
              </div>
              {currentUser ? (
                <Link to="/following-organizations">
                  <Button variant="secondary">Manage follows</Button>
                </Link>
              ) : (
                <Link to="/login" state={{ from: '/' }}>
                  <Button>Sign in</Button>
                </Link>
              )}
            </div>

            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              placeholder="Search services, jobs, products, and city updates..."
              recentKey="home"
              suggestions={['Public services in Okahandja', 'Taxi to Nau-Aib', 'Parcel delivery today', 'Town updates', 'Nearby electricians']}
              shortcuts={[
                { label: 'Services', value: 'services near me' },
                { label: 'Taxi', value: 'request taxi' },
                { label: 'Delivery', value: 'parcel delivery' },
                { label: 'Store', value: 'shop local products' },
                { label: 'Alerts', value: 'town updates' },
              ]}
            />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {priorityActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`group rounded-[24px] border p-4 shadow-card transition duration-200 hover:-translate-y-0.5 ${action.toneClass}`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconClass}`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-semibold text-lokals-charcoal">{action.label}</p>
                  <p className="mt-1 text-sm leading-5 text-lokals-muted">{action.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <Card variant="dashboard" className="relative overflow-hidden p-5 md:p-6">
            <div className="absolute inset-x-6 top-0 h-20 rounded-b-[28px] bg-[linear-gradient(180deg,rgba(22,163,74,0.10),transparent)]" />
            <div className="relative space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Today in town</p>
                <h2 className="mt-2 text-2xl font-semibold text-lokals-charcoal">Useful at a glance</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <PulseStat
                  icon={BellRing}
                  label="Active alerts"
                  value={String(sortedAlerts.length)}
                  detail={sortedAlerts[0]?.title ?? 'No urgent alert right now'}
                  tone="text-rose-700"
                  background="bg-rose-50"
                />
                <PulseStat
                  icon={Sparkles}
                  label="Nearby services"
                  value={String(providers.length)}
                  detail={providers[0]?.name ?? 'Providers will appear here'}
                  tone="text-lokals-green"
                  background="bg-lokals-green-soft"
                />
                <PulseStat
                  icon={Store}
                  label="Market picks"
                  value={String(products.length)}
                  detail={products[0]?.title ?? 'Fresh offers will show here'}
                  tone="text-amber-700"
                  background="bg-amber-50"
                />
              </div>
              <div className="rounded-[24px] border border-lokals-green/10 bg-lokals-green-soft/40 p-4">
                <p className="text-sm font-semibold text-lokals-charcoal">Command tip</p>
                <p className="mt-1 text-sm leading-6 text-lokals-muted">
                  Use alerts for urgent city updates, services for trusted help nearby, and follows to keep official voices in your regular feed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {search.trim() ? (
        <Card variant="dashboard" className="p-5 md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Search preview</p>
              <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Fast results for "{search.trim()}"</h2>
            </div>
            <p className="text-sm text-lokals-muted">Open the full section when you are ready to act.</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {searchPreviewSections.map((section) => (
              <div key={section.label} className="rounded-[22px] border border-lokals-border bg-white/90 p-4 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-lokals-charcoal">{section.label}</p>
                  <Link to={searchTarget(section.href)} className="text-xs font-semibold text-lokals-green">Open</Link>
                </div>
                <div className="mt-3 space-y-2 text-sm text-lokals-muted">
                  {section.items.length === 0
                    ? <p>No matches yet.</p>
                    : section.items.slice(0, 3).map((item: UnifiedSearchResult) => <p key={`${section.label}-${item.id}`}>{String(item[section.key as keyof UnifiedSearchResult] ?? '')}</p>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HomeSection
          eyebrow="City alerts"
          title="Smart city alerts and announcements"
          action={<Link to="/alerts" className="text-sm font-semibold text-lokals-green">View all</Link>}
          isLoading={alertsFeedQuery.isLoading || (currentUser ? newsFeedQuery.isLoading : newsLocalQuery.isLoading)}
          error={alertsFeedQuery.error ?? (currentUser ? newsFeedQuery.error : newsLocalQuery.error)}
          empty={sortedAlerts.length === 0 && localNews.length === 0}
          emptyTitle="No active alerts right now"
          emptyBody="Official notices and local announcements will show here as soon as they are published."
          emptyAction={<Link to="/news"><Button variant="secondary">Open local news</Button></Link>}
          onRetry={() => {
            void alertsFeedQuery.refetch()
            void (currentUser ? newsFeedQuery.refetch() : newsLocalQuery.refetch())
          }}
        >
          <div className="space-y-3">
            {sortedAlerts.slice(0, 3).map((alert) => (
              <Link
                key={alert.id}
                to="/alerts"
                className="block rounded-[24px] border border-lokals-border bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill value={alert.severity ?? 'notice'} tone={toneForAlert(alert.severity)} />
                      <span className="text-xs font-medium text-lokals-muted">{alert.location ?? locationLabel}</span>
                    </div>
                    <p className="mt-3 font-semibold text-lokals-charcoal">{alert.title}</p>
                    <p className="mt-2 text-sm leading-6 text-lokals-muted">
                      {alert.body ?? 'Open this alert for the latest city guidance and status details.'}
                    </p>
                  </div>
                  <BellRing className="mt-1 h-5 w-5 shrink-0 text-lokals-green" />
                </div>
              </Link>
            ))}
            {!sortedAlerts.length && localNews.length ? (
              localNews.slice(0, 2).map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="block rounded-[24px] border border-lokals-border bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <StatusPill value={item.category ?? 'announcement'} tone="info" />
                      <p className="mt-3 font-semibold text-lokals-charcoal">{item.title}</p>
                      <p className="mt-2 text-sm text-lokals-muted">{item.source_name ?? 'Local source'}</p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-lokals-green" />
                  </div>
                </Link>
              ))
            ) : null}
          </div>
        </HomeSection>

        <HomeSection
          eyebrow="Follow"
          title={followedItems.length ? 'Followed organizations' : 'Suggested organizations'}
          action={<Link to="/following-organizations" className="text-sm font-semibold text-lokals-green">Manage</Link>}
          isLoading={followingFeedQuery.isLoading}
          error={followingFeedQuery.error}
          empty={false}
          onRetry={() => void followingFeedQuery.refetch()}
        >
          <div className="space-y-3">
            {(followedItems.length ? followedItems : suggestedOrganizations).map((item) => {
              const isSuggested = !('id' in item)
              return (
                <Link
                  key={isSuggested ? item.title : item.id}
                  to={isSuggested ? item.to : '/following-organizations'}
                  className="block rounded-[24px] border border-lokals-border bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
                      <UsersRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-lokals-charcoal">
                          {isSuggested ? item.title : (item.title ?? item.name ?? 'Followed organization')}
                        </p>
                        <StatusPill value={isSuggested ? item.badge : (item.status ?? 'Following')} tone={isSuggested ? 'accent' : 'success'} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">
                        {isSuggested ? item.body : (item.body ?? 'Latest update from your local network.')}
                      </p>
                      <p className="mt-2 text-xs font-medium text-lokals-muted">
                        {isSuggested ? 'Suggested for your feed' : (item.category ?? item.location ?? 'Followed update')}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </HomeSection>
      </div>

      <HomeSection
        eyebrow="Nearby services"
        title="Trusted providers around you"
        action={<Link to="/services" className="text-sm font-semibold text-lokals-green">Browse all</Link>}
        isLoading={providersQuery.isLoading}
        error={providersQuery.error}
        empty={providers.length === 0}
        emptyTitle="No nearby services yet"
        emptyBody="Trusted providers will appear here as soon as they are available in your area."
        emptyAction={<Link to="/services"><Button variant="secondary">Browse services</Button></Link>}
        onRetry={() => void providersQuery.refetch()}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {providers.map((provider) => (
            <NearbyServiceCard key={provider.id} provider={provider} />
          ))}
        </div>
      </HomeSection>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <HomeSection
          eyebrow="Market picks"
          title="Marketplace highlights"
          action={<Link to="/store" className="text-sm font-semibold text-lokals-green">Open store</Link>}
          isLoading={productsQuery.isLoading}
          error={productsQuery.error}
          empty={products.length === 0}
          emptyTitle="No local offers yet"
          emptyBody="Fresh products and popular offers will appear here when sellers publish them."
          emptyAction={<Link to="/store"><Button variant="secondary">Browse marketplace</Button></Link>}
          onRetry={() => void productsQuery.refetch()}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/store/${product.id}`}
                className="rounded-[24px] border border-lokals-border bg-white/90 p-4 shadow-card transition hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-2 font-semibold text-lokals-charcoal">{product.title}</p>
                      <StatusPill value="Popular" tone="accent" />
                    </div>
                    <p className="mt-2 text-sm text-lokals-muted">{product.business?.name ?? product.user?.name ?? 'Local seller'}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-lg font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
                      <p className="text-xs font-medium text-lokals-muted">{product.area ?? product.town ?? locationLabel}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </HomeSection>

        <HomeSection
          eyebrow="Recent activity"
          title="Status updates that matter"
          action={<Link to="/activity" className="text-sm font-semibold text-lokals-green">Open activity</Link>}
          isLoading={alertsFeedQuery.isLoading || (currentUser ? newsFeedQuery.isLoading : newsLocalQuery.isLoading) || followingFeedQuery.isLoading}
          error={alertsFeedQuery.error ?? (currentUser ? newsFeedQuery.error : newsLocalQuery.error) ?? followingFeedQuery.error}
          empty={localUpdates.length === 0}
          emptyTitle="No recent movement yet"
          emptyBody="Your city feed will collect alerts, followed updates, and trusted local notices here."
          emptyAction={<Link to="/alerts"><Button variant="secondary">Check alerts</Button></Link>}
          onRetry={() => {
            void alertsFeedQuery.refetch()
            void followingFeedQuery.refetch()
            void (currentUser ? newsFeedQuery.refetch() : newsLocalQuery.refetch())
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {localUpdates.map((item) => (
              <LocalUpdateCard key={item.key} title={item.title} source={item.source} type={item.type} time={item.time} status={item.status} to={item.to} />
            ))}
          </div>
        </HomeSection>
      </div>
    </div>
  )
}

function PulseStat({
  icon: Icon,
  label,
  value,
  detail,
  tone,
  background,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  tone: string
  background: string
}) {
  return (
    <div className="rounded-[24px] border border-lokals-border bg-white/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-lokals-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${background} ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-lokals-muted">{detail}</p>
    </div>
  )
}
