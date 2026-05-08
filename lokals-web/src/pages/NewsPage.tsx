import { useMemo, useState } from 'react'
import { BellRing } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, QueryState } from '../components/Ui'
import { NewsCategoryChips } from '../components/news/NewsCategoryChips'
import { NewsCard } from '../components/news/NewsCard'
import { SearchBar } from '../components/ui/SearchBar'
import { useMe, useNewsFeed, useNewsLocal, useNewsTrending, useNotifications } from '../hooks/queries'

export function NewsPage() {
  const meQuery = useMe()
  const notificationsQuery = useNotifications()
  const user = useMemo(() => {
    const payload = meQuery.data?.user
    if (!payload) return null
    return 'data' in payload ? payload.data : payload
  }, [meQuery.data])
  const unreadCount = (notificationsQuery.data ?? []).filter((item) => !item.read_at).length
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('all')

  const localParams = {
    search: search || undefined,
    category: category === 'all' ? undefined : category,
    town: user?.default_town ?? undefined,
    area: user?.default_area ?? undefined,
  }

  const localNewsQuery = useNewsLocal(localParams)
  const trendingNewsQuery = useNewsTrending({ category: category === 'all' ? undefined : category })
  const feedNewsQuery = useNewsFeed(Boolean(user))

  const localItems = localNewsQuery.data?.data ?? []
  const featuredItem = trendingNewsQuery.data?.data?.[0]
  const trendingItems = trendingNewsQuery.data?.data?.slice(1, 4) ?? []
  const followedItems = (feedNewsQuery.data?.data ?? []).filter((item) => item.feed_reason === 'from followed places').slice(0, 3)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Local News"
        title="Local News"
        description="Aggregated updates from trusted publishers, official sources, and local organizations. LOKALS shows the summary and sends you to the original source for the full story."
        actions={
          <Link to="/notifications" className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-lokals-border bg-white shadow-card">
            <BellRing className="h-5 w-5 text-lokals-charcoal" />
            {unreadCount > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lokals-danger px-1 text-[10px] font-bold text-white">{unreadCount}</span> : null}
          </Link>
        }
      />

      <div className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr,220px]">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onValueSelect={setSearch}
            placeholder="Search local news..."
            recentKey="news"
            suggestions={['Windhoek updates', 'Clinic notices', 'Transport news', 'Public notice']}
          />
          <div className="inline-flex items-center rounded-full bg-lokals-surface px-4 py-3 text-sm font-medium text-lokals-muted">
            {[user?.default_area, user?.default_town].filter(Boolean).join(', ') || 'All Namibia'}
          </div>
        </div>
        <div className="mt-4">
          <NewsCategoryChips value={category} onChange={setCategory} />
        </div>
      </div>

      {featuredItem ? (
        <section className="overflow-hidden rounded-[28px] border border-lokals-border bg-white shadow-card">
          <div className="grid gap-0 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="min-h-[280px] bg-[linear-gradient(135deg,#ede9fe,#eff6ff)]">
              {featuredItem.image_url ? <img src={featuredItem.image_url} alt={featuredItem.title} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Featured story</p>
              <h2 className="text-3xl font-semibold text-lokals-charcoal">{featuredItem.title}</h2>
              <p className="text-sm leading-6 text-lokals-muted">{featuredItem.summary}</p>
              <div className="text-sm text-lokals-muted">
                <p>{featuredItem.source_name}</p>
                <p>{[featuredItem.area, featuredItem.town].filter(Boolean).join(', ') || 'Namibia'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/news/${featuredItem.id}`} className="rounded-full bg-lokals-charcoal px-5 py-3 text-sm font-semibold text-white">View details</Link>
                <Link
                  to={`/article?${new URLSearchParams({ url: featuredItem.external_url, source: featuredItem.source_name, title: featuredItem.title }).toString()}`}
                  className="rounded-full border border-lokals-border px-5 py-3 text-sm font-semibold text-lokals-charcoal"
                >
                  Read full story
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Latest near you</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Local stories first</h2>
        </div>
        <QueryState isLoading={localNewsQuery.isLoading} error={localNewsQuery.error} empty={localItems.length === 0}>
          <div className="grid gap-4 xl:grid-cols-3">
            {localItems.slice(0, 6).map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Trending</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Popular updates across the country</h2>
        </div>
        <QueryState isLoading={trendingNewsQuery.isLoading} error={trendingNewsQuery.error} empty={trendingItems.length === 0}>
          <div className="grid gap-4 xl:grid-cols-3">
            {trendingItems.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </QueryState>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">From followed sources</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Updates from places you trust</h2>
        </div>
        <QueryState isLoading={feedNewsQuery.isLoading} error={feedNewsQuery.error} empty={followedItems.length === 0}>
          <div className="grid gap-4 xl:grid-cols-3">
            {followedItems.map((item) => <NewsCard key={item.id} item={item} />)}
          </div>
        </QueryState>
      </section>
    </div>
  )
}
