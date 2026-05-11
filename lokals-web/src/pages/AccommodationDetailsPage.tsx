import { Bath, BedDouble, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { SaveButton } from '../components/experience/SaveButton'
import { useAccommodation, useAccommodations } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'
import { PILOT_TOWN } from '../lib/pilot'

const typeLabels: Record<string, string> = {
  rental: 'Rental',
  property_sale: 'Property sale',
  bnb: 'B&B',
  short_stay: 'Short stay',
  guesthouse: 'Guesthouse',
  guest_room: 'Room',
}

export function AccommodationDetailsPage() {
  const { id } = useParams()
  const accommodationQuery = useAccommodation(id)
  const relatedQuery = useAccommodations()
  const item = accommodationQuery.data
  const related = (relatedQuery.data?.data ?? []).filter((entry) => entry.id !== item?.id && (entry.type === item?.type || entry.area === item?.area)).slice(0, 4)
  const image = resolveMediaUrl(item?.image_url) ?? item?.image_url
  const ownerName = item?.owner?.name ?? item?.business?.name ?? item?.user?.name ?? 'Local owner'
  const ownerPhone = item?.owner?.phone ?? item?.business?.phone ?? item?.user?.phone
  const ownerWhatsapp = item?.owner?.whatsapp ?? item?.business?.whatsapp ?? item?.user?.whatsapp ?? item?.user?.phone
  const ownerLocation = item?.owner?.location ?? ([item?.area, item?.town].filter(Boolean).join(', ') || item?.location || PILOT_TOWN)
  const amenities = ((item?.metadata?.amenities as string[] | undefined) ?? ['Secure access', 'Local transport nearby'])
  const rules = ((item?.metadata?.rules as string[] | undefined) ?? [])
  const availability = (item?.metadata?.availability as string | undefined) ?? 'Contact owner to confirm availability.'
  const accommodationWhatsappMessage = `Hi, I saw your accommodation listing on LOKALS and would like to enquire.`

  return (
    <QueryState isLoading={accommodationQuery.isLoading || relatedQuery.isLoading} error={accommodationQuery.error ?? relatedQuery.error} empty={!item}>
      {!item ? (
        <EmptyState title="Accommodation not found" body="This listing may no longer be available." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Accommodation" title={item.title} description={item.description ?? 'Local stay or property listing.'} />

          <SectionCard className="overflow-hidden bg-white p-0">
            <div className="relative aspect-[16/8] bg-[linear-gradient(135deg,#e2e8f0,#f8fafc,#ede9fe)]">
              {image ? <img src={image} alt={item.title} className="h-full w-full object-cover" loading="lazy" /> : null}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <StatusBadge value={typeLabels[item.type] ?? item.type.replaceAll('_', ' ')} tone="accent" />
                {item.price_period ? <StatusBadge value={`Per ${item.price_period}`} tone="info" /> : null}
              </div>
              <div className="absolute right-4 top-4">
                <SaveButton label={item.title} itemId={item.id} itemType="accommodation" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.is_verified_owner ? <StatusBadge value="Verified owner" tone="success" /> : null}
                    <StatusBadge value={item.status ?? 'published'} tone="success" />
                  </div>
                  <p className="mt-4 text-3xl font-bold text-lokals-charcoal">{getDisplayPrice(item.price)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">per {item.price_period ?? 'month'}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-lokals-muted">
                    {item.bedrooms != null ? <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{item.bedrooms} bed</span> : null}
                    {item.bathrooms != null ? <span className="inline-flex items-center gap-1"><Bath className="h-4 w-4" />{item.bathrooms} bath</span> : null}
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{[item.area, item.town].filter(Boolean).join(', ') || item.location || PILOT_TOWN}</span>
                  </div>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Availability</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal">
                    <Clock3 className="h-4 w-4 text-lokals-purple" />
                    {availability}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Description</p>
                  <p className="mt-3 text-sm leading-6 text-lokals-muted">
                    {item.description ?? 'This owner has not added more details yet. Call or WhatsApp to confirm stay details, pricing, and viewing options.'}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Location / map</p>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-lokals-muted">
                    <MapPin className="h-4 w-4 text-lokals-purple" />
                    {ownerLocation}
                  </p>
                  <p className="mt-3 text-sm text-lokals-muted">Map preview will expand here as location coverage improves.</p>
                </div>
              </div>

              <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Amenities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span key={amenity} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-lokals-charcoal">{amenity}</span>
                  ))}
                </div>
              </div>

              {rules.length ? (
                <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Rules</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rules.map((rule) => (
                      <span key={rule} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-lokals-charcoal">{rule}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[22px] border border-lokals-border p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={ownerName} src={resolveMediaUrl(item.owner?.avatar ?? item.business?.logo_url ?? item.user?.avatar ?? null)} className="h-16 w-16 border border-lokals-border" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-lokals-charcoal">{ownerName}</p>
                        {item.owner?.is_verified ? <StatusBadge value="Verified" tone="success" /> : null}
                      </div>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm text-lokals-muted">
                        <ShieldCheck className="h-4 w-4 text-lokals-purple" />
                        {ownerLocation}
                      </p>
                      <p className="mt-2 text-sm text-lokals-muted">Call or WhatsApp for viewings, short-stay questions, and availability.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.business?.id ? (
                      <Link to={`/directory/${item.business.id}`}>
                        <Button variant="secondary">View profile / business</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div>
                  <ContactActions
                    name={ownerName}
                    phone={ownerPhone}
                    whatsapp={ownerWhatsapp}
                    whatsappMessage={accommodationWhatsappMessage}
                    className="grid gap-2 sm:grid-cols-3"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-lokals-charcoal">Related listings</h2>
                <p className="text-sm text-lokals-muted">Similar places nearby and more listings in the same category.</p>
              </div>
              <Link to="/accommodation" className="text-sm font-semibold text-lokals-purple">Back to accommodation</Link>
            </div>
            {related.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No related listings yet." body="More similar places will appear here soon." />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {related.map((entry) => (
                    <Link key={entry.id} to={`/accommodation/${entry.id}`} className="rounded-[20px] border border-lokals-border p-4 transition hover:-translate-y-0.5">
                      <p className="font-semibold text-lokals-charcoal">{entry.title}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{[entry.area, entry.town].filter(Boolean).join(', ') || PILOT_TOWN}</p>
                      <p className="mt-3 text-sm font-semibold text-lokals-purple">{getDisplayPrice(entry.price)}</p>
                    </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
