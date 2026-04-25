import { Link } from 'react-router-dom'
import { MapPin, Phone, Star } from 'lucide-react'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Card } from './Card'
import type { Provider } from '../../types'
import { getCompletedLabel, getDisplayDistance, getDisplayPrice, getDisplayRating, getProviderPhone, getResponseTimeLabel } from '../../lib/display'
import { QuickCallButton } from '../experience/QuickCallButton'
import { TrustRow } from '../experience/TrustRow'

export function ProviderCard({ provider }: { provider: Provider }) {
  const fromPrice = provider.services?.[0]?.price
  const phone = getProviderPhone(provider)

  return (
    <Card interactive variant="service">
      <div className="flex items-start gap-4">
        <Avatar name={provider.name} className="h-14 w-14 border border-emerald-100" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-lokals-purple">{provider.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">{provider.name}</h3>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lokals-green">Starting</p>
              <p className="mt-1 text-sm font-bold text-lokals-charcoal">{fromPrice ? getDisplayPrice(fromPrice) : 'Book now'}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-lokals-muted">
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-current text-lokals-gold" />{getDisplayRating(provider)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-lokals-purple" />{getDisplayDistance(provider.distance_km, provider.location)}</span>
            <span className="rounded-full bg-lokals-green-soft px-2.5 py-1 text-lokals-green">{provider.availability_slots?.length ? 'Available today' : 'Open now'}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{provider.description ?? 'Trusted local provider ready to book.'}</p>
          <div className="mt-4">
            <TrustRow
              verified={provider.is_verified}
              ratingLabel="Trusted local provider"
              distanceLabel={provider.location ?? 'Nearby'}
              completedLabel={getCompletedLabel(provider)}
              responseLabel={provider.availability_slots?.length ? 'Available today' : getResponseTimeLabel(provider)}
            />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to={`/services/${provider.id}/book`}><Button className="w-full">Book</Button></Link>
            {phone ? <QuickCallButton phone={phone} /> : <Button variant="secondary" className="w-full" disabled><Phone className="h-4 w-4" />Call</Button>}
          </div>
        </div>
      </div>
    </Card>
  )
}
