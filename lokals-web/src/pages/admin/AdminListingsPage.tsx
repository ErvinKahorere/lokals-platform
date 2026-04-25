import { useListings, useSuspendContent } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

export function AdminListingsPage() {
  const listingsQuery = useListings()
  const suspendContent = useSuspendContent()
  const listings = listingsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Manage listings" description="Monitor marketplace supply and suspend harmful or expired entries." />
      <QueryState isLoading={listingsQuery.isLoading} error={listingsQuery.error} empty={listings.length === 0}>
        {listings.length === 0 ? (
          <EmptyState title="No listings found" body="Marketplace items will appear here once created." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing: any) => (
              <SectionCard key={listing.id} className="bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <StatusBadge value={listing.status} tone={listing.status === 'published' ? 'success' : 'danger'} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{listing.type}</p>
                <p className="mt-3 text-sm">{listing.description}</p>
                <button
                  className="mt-4 rounded-2xl border border-[var(--line)] px-4 py-2 text-sm font-semibold"
                  onClick={() => suspendContent.mutate({ target_type: 'listing', target_id: listing.id, status: listing.status === 'suspended' ? 'published' : 'suspended' })}
                >
                  {listing.status === 'suspended' ? 'Restore' : 'Suspend'}
                </button>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
