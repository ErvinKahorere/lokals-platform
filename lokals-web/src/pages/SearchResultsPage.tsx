import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, QueryState, SearchBar, SectionCard } from '../components/Ui'
import { useSearchResults } from '../hooks/queries'
import { PILOT_TOWN } from '../lib/pilot'

const sections = [
  { key: 'services', label: 'Services', href: '/services', titleKey: 'name' },
  { key: 'providers', label: 'Providers', href: '/services', titleKey: 'name' },
  { key: 'directory', label: 'Directory', href: '/directory', titleKey: 'name' },
  { key: 'products', label: 'Products', href: '/store', titleKey: 'title' },
  { key: 'jobs', label: 'Jobs', href: '/jobs', titleKey: 'title' },
  { key: 'events', label: 'Events', href: '/events', titleKey: 'title' },
  { key: 'news', label: 'News', href: '/news', titleKey: 'title' },
  { key: 'accommodations', label: 'Accommodation', href: '/accommodation', titleKey: 'title' },
] as const

function getDetailHref(sectionKey: string, item: any, query: string) {
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
      <PageHeader eyebrow="Search" title="Search across LOKALS Okahandja" description="Services, products, jobs, events, news, and local listings in one grouped view." />
      <SearchBar
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onValueSelect={(value) => {
          setSearch(value)
          setParams(value.trim() ? { q: value.trim() } : {})
        }}
        recentKey="global-results"
        placeholder="Search services, jobs, products..."
        suggestions={['Barber in Nau-Aib', `Jobs in ${PILOT_TOWN}`, 'Phone accessories', 'Events this weekend']}
        shortcuts={[
          { label: 'Services', value: 'services near me' },
          { label: 'Jobs', value: 'jobs near me' },
          { label: 'Products', value: 'shop local products' },
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
                    ) : items.slice(0, 4).map((item: any) => (
                      <Link
                        key={`${section.key}-${item.id}`}
                        to={getDetailHref(section.key, item, query)}
                        className="block rounded-[18px] border border-lokals-border px-4 py-3 transition hover:bg-slate-50"
                      >
                        <p className="font-semibold text-lokals-charcoal">{item[section.titleKey] ?? item.title ?? item.name}</p>
                        <p className="mt-1 text-sm text-lokals-muted">
                          {[item.category, item.area, item.town, item.location, item.source_name].filter(Boolean).join(' | ') || 'Open details'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </SectionCard>
              )
            })}
          </div>
        ) : (
          <SectionCard className="bg-white">
            <p className="text-sm text-lokals-muted">Start typing to search services, providers, directory entries, products, jobs, events, news, and accommodation.</p>
          </SectionCard>
        )}
      </QueryState>
    </div>
  )
}
