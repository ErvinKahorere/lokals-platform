import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, QueryState, SearchBar, SectionCard, StatusPill } from '../components/Ui'
import { useSearchResults } from '../hooks/queries'
import { PILOT_TOWN } from '../lib/pilot'
import type { UnifiedSearchResult } from '../types'

type SearchResultWithProvider = UnifiedSearchResult & {
  service_provider_id?: number | string | null
}

const sections = [
  { key: 'services', label: 'Services', href: '/services', titleKey: 'name' },
  { key: 'providers', label: 'Providers', href: '/services', titleKey: 'name' },
  { key: 'directory', label: 'Directory', href: '/directory', titleKey: 'name' },
  { key: 'products', label: 'Products', href: '/store', titleKey: 'title' },
  { key: 'hire_items', label: 'Hire / Rentals', href: '/hire', titleKey: 'title' },
  { key: 'listings', label: 'Marketplace', href: '/marketplace', titleKey: 'title' },
  { key: 'jobs', label: 'Jobs', href: '/jobs', titleKey: 'title' },
  { key: 'events', label: 'Events', href: '/events', titleKey: 'title' },
  { key: 'news', label: 'News', href: '/news', titleKey: 'title' },
  { key: 'accommodations', label: 'Accommodation', href: '/accommodation', titleKey: 'title' },
] as const

function getDetailHref(sectionKey: string, item: SearchResultWithProvider, query: string) {
  const id = item?.id
  if (!id) {
    return `/search?q=${encodeURIComponent(query)}`
  }

  switch (sectionKey) {
    case 'providers':
      return `/services/${id}`
    case 'directory':
      return `/directory/${id}`
    case 'products':
      return `/store/${id}`
    case 'hire_items':
      return `/hire/${id}`
    case 'listings':
      return '/marketplace'
    case 'jobs':
      return `/jobs/${id}`
    case 'events':
      return `/events/${id}`
    case 'news':
      return `/news/${id}`
    case 'accommodations':
      return `/accommodation/${id}`
    case 'services':
    default:
      return item?.service_provider_id
        ? `/services/${item.service_provider_id}`
        : `/services?q=${encodeURIComponent(query)}`
  }
}

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const query = params.get('q') ?? ''
  const searchQuery = useSearchResults(query)
  const totalMatches = useMemo(
    () => sections.reduce((sum, section) => sum + ((searchQuery.data?.[section.key] ?? []).length), 0),
    [searchQuery.data],
  )

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Search" title="Search across LOKALS Okahandja" description="Businesses, products, hire items, services, jobs, events, and trusted local updates in one grouped view." />
      <SearchBar
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onValueSelect={(value) => {
          setSearch(value)
          setParams(value.trim() ? { q: value.trim() } : {})
        }}
        recentKey="global-results"
        placeholder="Search services, shops, rentals, jobs..."
        suggestions={['Barber in Nau-Aib', `Jobs in ${PILOT_TOWN}`, 'Phone accessories', 'Chairs for hire', 'Events this weekend']}
        shortcuts={[
          { label: 'Services', value: 'services near me' },
          { label: 'Products', value: 'shop local products' },
          { label: 'Hire', value: 'rentals and equipment' },
          { label: 'Jobs', value: 'jobs near me' },
          { label: 'Events', value: 'events this weekend' },
        ]}
      />
      <QueryState
        isLoading={searchQuery.isLoading}
        error={searchQuery.error}
        empty={Boolean(query) && totalMatches === 0}
      >
        {query ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {sections.map((section) => {
              const items = searchQuery.data?.[section.key] ?? []
              return (
                <SectionCard key={section.key} className="bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-lokals-charcoal">{section.label}</h2>
                      <p className="text-sm text-lokals-muted">{items.length} match{items.length === 1 ? '' : 'es'}</p>
                    </div>
                    <Link to={`${section.href}?q=${encodeURIComponent(query)}`} className="text-sm font-semibold text-lokals-purple">
                      View all
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {items.length === 0 ? (
                      <p className="text-sm text-lokals-muted">No matches in this section.</p>
                    ) : items.slice(0, 4).map((item: UnifiedSearchResult) => (
                      <Link
                        key={`${section.key}-${item.id}`}
                        to={getDetailHref(section.key, item, query)}
                        className="block rounded-[18px] border border-lokals-border px-4 py-3 transition hover:bg-slate-50"
                      >
                        <p className="font-semibold text-lokals-charcoal">{item[section.titleKey] ?? item.title ?? item.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {[item.category, item.area, item.town, item.location, item.source_name].filter(Boolean).slice(0, 3).map((value) => (
                            <span key={`${section.key}-${item.id}-${value}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-lokals-muted">
                              {value}
                            </span>
                          ))}
                          {item.verification_status === 'approved' ? <StatusPill value="Verified" tone="success" /> : null}
                          {item.price_per_day ? <StatusPill value={`N$ ${item.price_per_day}/day`} tone="neutral" /> : null}
                          {item.price_per_hour ? <StatusPill value={`N$ ${item.price_per_hour}/hr`} tone="neutral" /> : null}
                          {!item.category && !item.area && !item.town && !item.location && !item.source_name ? <span className="text-sm text-lokals-muted">Open details</span> : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                </SectionCard>
              )
            })}
          </div>
        ) : (
          <SectionCard className="bg-white">
            <div className="space-y-3">
              <p className="text-sm text-lokals-muted">Start typing to search services, providers, directory entries, products, rentals, jobs, events, news, and accommodation.</p>
              <div className="flex flex-wrap gap-2">
                {['Popular in Okahandja', 'Fast delivery nearby', 'Nearby rentals', 'Recent searches'].map((label) => (
                  <span key={label} className="rounded-full bg-lokals-surface px-3 py-1.5 text-xs font-semibold text-lokals-muted">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>
        )}
      </QueryState>
    </div>
  )
}
