import { BedDouble, MapPin, ShowerHead } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { SaveButton } from '../components/experience/SaveButton'
import { useAccommodation, useAccommodations } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'

export function AccommodationDetailsPage() {
  const { id } = useParams()
  const accommodationQuery = useAccommodation(id)
  const relatedQuery = useAccommodations()
  const item = accommodationQuery.data
  const related = (relatedQuery.data?.data ?? []).filter((entry) => entry.id !== item?.id).slice(0, 3)

  return (
    <QueryState isLoading={accommodationQuery.isLoading || relatedQuery.isLoading} error={accommodationQuery.error ?? relatedQuery.error} empty={!item}>
      {!item ? (
        <EmptyState title="Accommodation not found" body="This listing may no longer be available." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Accommodation" title={item.title} description={item.description ?? 'Local stay or property listing.'} />
          <SectionCard className="overflow-hidden bg-white p-0">
            <div className="relative aspect-[16/8] bg-[linear-gradient(135deg,#e2e8f0,#cbd5e1,#f8fafc)]">
              {item.image_url ? <img src={resolveMediaUrl(item.image_url) ?? item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" /> : null}
              <div className="absolute right-4 top-4">
                <SaveButton label={item.title} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <StatusBadge value={item.type.replaceAll('_', ' ')} tone="accent" />
                  <p className="mt-3 text-2xl font-bold text-lokals-charcoal">{getDisplayPrice(item.price)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">per {item.price_period ?? 'month'}</p>
                </div>
                <StatusBadge value={item.status ?? 'published'} tone="success" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-lokals-muted">
                {item.bedrooms != null ? <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{item.bedrooms} bed</span> : null}
                {item.bathrooms != null ? <span className="inline-flex items-center gap-1"><ShowerHead className="h-4 w-4" />{item.bathrooms} bath</span> : null}
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{item.area ?? item.town ?? item.location ?? 'Windhoek'}</span>
              </div>
              <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Host or owner</p>
                <p className="mt-2 font-semibold text-lokals-charcoal">{item.business?.name ?? item.user?.name ?? 'Local owner'}</p>
                <p className="mt-1 text-sm text-lokals-muted">{item.area ?? item.town ?? 'Windhoek'}</p>
              </div>
              <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Amenities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(((item.metadata?.amenities as string[] | undefined) ?? ['Parking', 'Secure access', 'Local transport nearby'])).map((amenity) => (
                    <span key={amenity} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-lokals-charcoal">{amenity}</span>
                  ))}
                </div>
              </div>
              <div className="mt-5">
                <ContactActions name={item.title} phone={item.business?.phone ?? item.user?.phone ?? undefined} className="grid gap-2 sm:grid-cols-3" />
              </div>
            </div>
          </SectionCard>
          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Related places</h2>
              <Link to="/accommodation" className="text-sm font-semibold text-lokals-green">Back to stays</Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {related.map((entry) => (
                <Link key={entry.id} to={`/accommodation/${entry.id}`} className="rounded-[20px] border border-lokals-border p-4 transition hover:-translate-y-0.5">
                  <p className="font-semibold text-lokals-charcoal">{entry.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{entry.area ?? entry.town ?? 'Windhoek'}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
