import { BedDouble, Bath, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Accommodation } from '../../types'
import { getDisplayPrice, resolveMediaUrl } from '../../lib/display'
import { SaveButton } from '../experience/SaveButton'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card } from './Card'

const typeLabels: Record<string, string> = {
  rental: 'Rental',
  property_sale: 'Property sale',
  bnb: 'B&B',
  short_stay: 'Short stay',
  guesthouse: 'Guesthouse',
  guest_room: 'Room',
}

export function AccommodationCard({
  accommodation,
  compact = false,
}: {
  accommodation: Accommodation
  compact?: boolean
}) {
  const image = resolveMediaUrl(accommodation.image_url) ?? accommodation.image_url
  const locationLabel = [accommodation.area, accommodation.town].filter(Boolean).join(', ') || accommodation.location || 'Windhoek'
  const ownerPhone = accommodation.owner?.phone ?? accommodation.business?.phone ?? accommodation.user?.phone

  return (
    <Card className="overflow-hidden bg-white p-0">
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        {image ? (
          <img src={image} alt={accommodation.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Accommodation photo</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="accent">{typeLabels[accommodation.type] ?? accommodation.type.replaceAll('_', ' ')}</Badge>
          {accommodation.price_period ? <Badge tone="info">Per {accommodation.price_period}</Badge> : null}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton label={accommodation.title} itemId={accommodation.id} itemType="accommodation" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-1 text-base font-semibold text-lokals-charcoal">{accommodation.title}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-lokals-muted">
              <MapPin className="h-4 w-4" />
              {locationLabel}
            </p>
          </div>
          {accommodation.is_verified_owner ? <Badge tone="success">Verified</Badge> : null}
        </div>
        <p className="mt-3 text-xl font-bold text-lokals-charcoal">{getDisplayPrice(accommodation.price)}</p>
        <p className="mt-1 text-sm text-lokals-muted">per {accommodation.price_period ?? 'month'}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-lokals-muted">
          {accommodation.bedrooms != null ? <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{accommodation.bedrooms} bed</span> : null}
          {accommodation.bathrooms != null ? <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{accommodation.bathrooms} bath</span> : null}
        </div>
        {!compact ? (
          <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">
            {accommodation.description ?? 'Local stay or property listing with direct owner contact.'}
          </p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Link to={`/accommodation/${accommodation.id}`} className="flex-1">
            <Button className="w-full">View</Button>
          </Link>
          {ownerPhone ? (
            <a href={`tel:${ownerPhone}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                <Phone className="h-4 w-4" />
                Contact
              </Button>
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
