import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { SaveButton } from '../components/experience/SaveButton'
import { TrustRow } from '../components/experience/TrustRow'
import { useListings } from '../hooks/queries'
import { getDisplayDistance, getDisplayPrice, resolveMediaUrl } from '../lib/display'

export function ListingDetailsPage() {
  const { id } = useParams()
  const listingsQuery = useListings()
  const listing = useMemo(() => listingsQuery.data?.data.find((item) => String(item.id) === id), [id, listingsQuery.data])
  const related = useMemo(() => listingsQuery.data?.data.filter((item) => item.id !== listing?.id).slice(0, 3) ?? [], [listing?.id, listingsQuery.data])
  const image = resolveMediaUrl(listing?.image_url ?? listing?.user?.avatar ?? null)

  return (
    <QueryState isLoading={listingsQuery.isLoading} error={listingsQuery.error} empty={!listing}>
      {!listing ? (
        <EmptyState title="Listing not found" body="This item may have sold or moved out of the nearby feed." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Marketplace" title={listing.title} description={listing.description} />
          <SectionCard className="overflow-hidden bg-white p-0">
            <div className="relative aspect-[16/8] bg-[linear-gradient(135deg,#dbeafe,#f8fafc,#e2e8f0)]">
              {image ? <img src={image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" /> : null}
              <div className="absolute right-4 top-4">
                <SaveButton label={listing.title} itemId={listing.id} itemType="listing" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-lokals-gold-soft px-3 py-2 text-xs font-semibold text-lokals-charcoal">{listing.type}</span>
                <span className="text-xl font-bold text-lokals-charcoal">{listing.price ? getDisplayPrice(listing.price) : 'Open offer'}</span>
              </div>
              <div className="mt-4">
                <TrustRow
                  ratingLabel="Seller info ready"
                  distanceLabel={getDisplayDistance(listing.distance_km, listing.location)}
                  completedLabel={listing.status}
                  responseLabel="Replies soon"
                />
              </div>
              <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Seller info</p>
                <p className="mt-2 font-semibold text-lokals-charcoal">{listing.user?.business_name ?? listing.user?.name ?? listing.organization?.name ?? 'Local seller'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{listing.user?.profession ?? listing.location ?? 'Windhoek'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{listing.location ?? 'Windhoek'}</p>
              </div>
              <div className="mt-5">
                <ContactActions name={listing.title} className="grid gap-2 sm:grid-cols-3" />
              </div>
            </div>
          </SectionCard>
          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Related listings</h2>
              <Link to="/marketplace" className="text-sm font-semibold text-lokals-green">Back to market</Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} to={`/marketplace/${item.id}`} className="rounded-[20px] border border-lokals-border p-4 transition hover:-translate-y-0.5">
                  <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{item.location ?? 'Nearby'}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
