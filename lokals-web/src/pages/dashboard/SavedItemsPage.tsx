import { Link } from 'react-router-dom'
import { Card, EmptyState, PageHeader, QueryState, SectionCard } from '../../components/Ui'
import { useSavedItems } from '../../hooks/queries'

const groups = [
  { key: 'products', label: 'Products' },
  { key: 'events', label: 'Events' },
  { key: 'accommodations', label: 'Accommodation' },
  { key: 'providers', label: 'Providers' },
  { key: 'directory', label: 'Directory' },
  { key: 'news', label: 'News' },
  { key: 'listings', label: 'Listings' },
] as const

export function SavedItemsPage() {
  const savedItemsQuery = useSavedItems()
  const items = savedItemsQuery.data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Saved" title="Saved items" description="Products, events, accommodation, providers, local news, and followed organizations together in one place." />
      <QueryState isLoading={savedItemsQuery.isLoading} error={savedItemsQuery.error} empty={items.length === 0}>
        {items.length === 0 ? (
          <EmptyState title="Nothing saved yet." body="Save products, accommodation, events, news, or local providers and they will appear here." />
        ) : (
          <div className="space-y-5">
            {groups.map((group) => {
              const groupItems = savedItemsQuery.data?.[group.key] ?? []
              if (groupItems.length === 0) return null
              return (
                <SectionCard key={group.key} className="bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-lokals-charcoal">{group.label}</h2>
                    <span className="rounded-full bg-lokals-purple/10 px-3 py-1 text-xs font-semibold text-lokals-purple">{groupItems.length}</span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {groupItems.map((item) => (
                      <Card key={`${item.kind}-${item.id}`} interactive className="p-0">
                        <Link to={item.route} className="block p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                              <p className="mt-1 text-sm text-lokals-muted">{[item.subtitle, item.area, item.town].filter(Boolean).join(' - ')}</p>
                            </div>
                            <span className="rounded-full bg-lokals-purple/10 px-3 py-1 text-xs font-semibold text-lokals-purple">Open</span>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </SectionCard>
              )
            })}
          </div>
        )}
      </QueryState>
    </div>
  )
}
