import { Link } from 'react-router-dom'
import type { Provider } from '../../types'
import { getCompletedLabel, getDisplayDistance, getDisplayPrice, getDisplayRating, getProviderPhone, getResponseTimeLabel } from '../../lib/display'
import { Button } from '../ui/Button'
import { ContactActions } from './ContactActions'
import { TrustRow } from './TrustRow'

export function NearbyServiceCard({ provider }: { provider: Provider }) {
  return (
    <div className="rounded-[24px] border border-lokals-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">{provider.category}</p>
          <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">{provider.name}</h3>
        </div>
        <span className="rounded-full bg-lokals-green-soft px-3 py-1 text-xs font-semibold text-lokals-green">From {getDisplayPrice(provider.services?.[0]?.price)}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{provider.description ?? 'Trusted provider with quick local availability.'}</p>
      <div className="mt-4">
        <TrustRow
          verified={provider.is_verified}
          ratingLabel={getDisplayRating(provider)}
          distanceLabel={getDisplayDistance(provider.distance_km, provider.location)}
          completedLabel={getCompletedLabel(provider)}
          responseLabel={getResponseTimeLabel(provider)}
        />
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <Link to={`/services/${provider.id}`}><Button className="w-full">Book</Button></Link>
        <ContactActions name={provider.name} phone={getProviderPhone(provider)} className="grid gap-2 sm:grid-cols-3" />
      </div>
    </div>
  )
}

