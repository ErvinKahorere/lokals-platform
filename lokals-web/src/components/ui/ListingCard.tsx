import { MapPin } from 'lucide-react'
import { Card } from './Card'
import { Badge } from './Badge'
import type { Listing } from '../../types'
import { getDisplayPrice, resolveMediaUrl } from '../../lib/display'
import { ContactActions } from '../experience/ContactActions'
import { SaveButton } from '../experience/SaveButton'

export function ListingCard({ listing }: { listing: Listing }) {
  const image = resolveMediaUrl(listing.image_url ?? listing.user?.avatar ?? null)

  return (
    <Card interactive variant="marketplace" className="overflow-hidden p-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#e2e8f0,#cbd5e1,#f8fafc)]">
        {image ? <img src={image} alt={listing.title} className="h-full w-full object-cover" loading="lazy" /> : null}
        <div className="absolute right-4 top-4">
          <SaveButton label={listing.title} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="accent">{listing.type}</Badge>
          <span className="text-lg font-extrabold text-lokals-charcoal">{listing.price ? getDisplayPrice(listing.price) : 'Offer'}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-lokals-charcoal">{listing.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-lokals-muted">{listing.description}</p>
        <p className="mt-2 text-sm font-medium text-lokals-charcoal">{listing.user?.business_name ?? listing.user?.name ?? listing.organization?.name ?? 'Local seller'}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-lokals-muted dark:border-slate-800">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{listing.location ?? 'Nearby'}</span>
          <Badge tone={listing.status === 'published' ? 'success' : 'neutral'}>{listing.status}</Badge>
        </div>
        <div className="mt-4">
          <ContactActions name={listing.title} className="grid gap-2 sm:grid-cols-3" />
        </div>
      </div>
    </Card>
  )
}
