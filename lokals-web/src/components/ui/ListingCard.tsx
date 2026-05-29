import { Flag, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from './Card'
import { Badge } from './Badge'
import type { Listing } from '../../types'
import { getDisplayPrice, resolveMediaUrl } from '../../lib/display'
import { ContactActions } from '../experience/ContactActions'
import { SaveButton } from '../experience/SaveButton'
import { ImageWithFallback } from './ImageWithFallback'

export function ListingCard({ listing }: { listing: Listing }) {
  const image = resolveMediaUrl(listing.image_url ?? listing.user?.avatar ?? null)
  const sellerName = listing.organization?.name ?? listing.user?.business_name ?? listing.user?.name ?? 'Local seller'
  const locationLabel = listing.location ?? 'Nearby'
  const distanceLabel = listing.distance_km ? `${Number(listing.distance_km).toFixed(1)} km away` : null
  const sellerPhone = listing.organization?.phone ?? listing.user?.phone ?? undefined
  const sellerWhatsapp = listing.organization?.whatsapp ?? listing.user?.whatsapp ?? listing.user?.phone ?? undefined

  return (
    <Card interactive variant="marketplace" className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#e2e8f0,#cbd5e1,#f8fafc)]">
        <ImageWithFallback src={image} alt={listing.title} className="h-full w-full" />
        <div className="absolute right-4 top-4">
          <SaveButton label={listing.title} itemId={listing.id} itemType="listing" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">{listing.type}</Badge>
          <span className="text-lg font-extrabold text-lokals-charcoal">{listing.price ? getDisplayPrice(listing.price) : 'Offer'}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-lokals-charcoal">{listing.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-lokals-muted">{listing.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {listing.organization?.is_verified ? <Badge tone="success">Verified seller</Badge> : null}
          <Badge tone={listing.status === 'published' ? 'success' : 'neutral'}>{listing.status}</Badge>
          {distanceLabel ? <span className="text-xs text-lokals-muted">{distanceLabel}</span> : null}
        </div>
        <p className="mt-2 text-sm font-medium text-lokals-charcoal">{sellerName}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-lokals-muted">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{locationLabel}</span>
          <span>Meet safely before payment</span>
        </div>
        <div className="mt-4">
          <ContactActions name={sellerName} phone={sellerPhone} whatsapp={sellerWhatsapp} className="grid gap-2 sm:grid-cols-3" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={`/marketplace/${listing.id}`} className="flex-1 min-w-[140px]">
            <button type="button" className="w-full rounded-full bg-lokals-charcoal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              View details
            </button>
          </Link>
          <Link to={`/marketplace/${listing.id}`} className="inline-flex items-center gap-2 rounded-full border border-lokals-border px-4 py-2.5 text-sm font-semibold text-lokals-charcoal transition hover:border-lokals-danger/30 hover:text-lokals-danger">
            <Flag className="h-4 w-4" />
            Report listing
          </Link>
        </div>
      </div>
    </Card>
  )
}
