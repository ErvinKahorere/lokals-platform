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
  const activeServices = provider.services?.filter((service) => service.is_active) ?? []
  const primaryService = activeServices[0]
  const fromPrice = activeServices.reduce<number | null>((lowest, service) => {
    const nextPrice = Number(service.price ?? 0)
    if (!nextPrice) {
      return lowest
    }
    if (lowest == null || nextPrice < lowest) {
      return nextPrice
    }
    return lowest
  }, null)
  const phone = getProviderPhone(provider)
  const reviewLabel = provider.review_count ? `${provider.review_count} reviews` : 'Trusted local provider'
  const availabilityLabel = provider.open_now ? 'Open now' : provider.availability_status ?? getResponseTimeLabel(provider)

  return (
    <Card interactive variant="service">
      <div className="flex items-start gap-4">
        <Avatar name={provider.name} className="h-14 w-14 border border-violet-100 bg-violet-50 text-lokals-purple" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-lokals-purple">{provider.subcategory ?? provider.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">{provider.name}</h3>
            </div>
            <div className="rounded-2xl bg-lokals-gold-soft px-3 py-2 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-lokals-green">Starting</p>
              <p className="mt-1 text-sm font-bold text-lokals-charcoal">{fromPrice ? getDisplayPrice(fromPrice) : 'Book now'}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-lokals-muted">
            <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-current text-lokals-gold" />{getDisplayRating(provider)}</span>
            <span>{reviewLabel}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-lokals-green" />{provider.area ?? provider.town ?? getDisplayDistance(provider.distance_km, provider.location)}</span>
            <span className="rounded-full bg-lokals-green-soft px-2.5 py-1 text-lokals-green">{availabilityLabel}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{provider.description ?? 'Trusted local provider ready to book.'}</p>
          {primaryService ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-lokals-charcoal">{primaryService.name}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-lokals-charcoal">
                {primaryService.duration_minutes ? `${primaryService.duration_minutes} mins` : 'Timing confirmed on contact'}
              </span>
            </div>
          ) : null}
          <div className="mt-4">
            <TrustRow
              verified={provider.is_verified}
              ratingLabel={`${getDisplayRating(provider)} | ${reviewLabel}`}
              distanceLabel={getDisplayDistance(provider.distance_km, provider.location)}
              completedLabel={getCompletedLabel(provider)}
              responseLabel={getResponseTimeLabel(provider)}
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
