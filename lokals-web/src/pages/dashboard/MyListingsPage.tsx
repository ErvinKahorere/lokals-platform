import { useMyListings } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

export function MyListingsPage() {
  const listingsQuery = useMyListings()
  const listings = listingsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="My listings" description="Seller-facing view for marketplace and service-linked items." />
      <QueryState isLoading={listingsQuery.isLoading} error={listingsQuery.error} empty={listings.length === 0}>
        {listings.length === 0 ? (
          <EmptyState title="No listings yet" body="Create your first listing from the marketplace page." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing: any) => (
              <SectionCard key={listing.id} className="bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{listing.title}</h3>
                  <StatusBadge value={listing.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{listing.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{listing.type}</p>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
