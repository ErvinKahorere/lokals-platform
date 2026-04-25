import { Clock3, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useProvider } from '../hooks/queries'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import type { AvailabilitySlot, Provider, ServiceItem } from '../types'
import { ContactActions } from '../components/experience/ContactActions'
import { QuickCallButton } from '../components/experience/QuickCallButton'
import { TrustRow } from '../components/experience/TrustRow'
import { getCompletedLabel, getDisplayDistance, getDisplayPrice, getDisplayRating, getProviderPhone, getResponseTimeLabel } from '../lib/display'

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ServiceProviderDetailsPage() {
  const { id } = useParams()
  const providerQuery = useProvider(id)
  const provider = providerQuery.data as Provider | undefined

  return (
    <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={!provider}>
      {!provider ? (
        <EmptyState title="Provider not found" body="This provider may have been removed or is no longer available." />
      ) : (
        <div className="space-y-5">
          <PageHeader
            eyebrow={provider.category}
            title={provider.name}
            description={provider.description ?? ''}
            actions={<div className="flex flex-wrap gap-2"><QuickCallButton phone={getProviderPhone(provider)} /><Link to={`/services/${provider.id}/book`}><Button>Book appointment</Button></Link></div>}
          />
          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <SectionCard>
              <div className="mb-5 flex items-start gap-4 rounded-[24px] bg-slate-50 p-4">
                <Avatar name={provider.name} className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold">{provider.name}</h3>
                  </div>
                  <div className="mt-3">
                    <TrustRow
                      verified={provider.is_verified}
                      ratingLabel={getDisplayRating(provider)}
                      distanceLabel={getDisplayDistance(provider.distance_km, provider.location)}
                      completedLabel={getCompletedLabel(provider)}
                      responseLabel={getResponseTimeLabel(provider)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Offerings</h3>
                <StatusBadge value={provider.status} tone={provider.status === 'active' ? 'success' : 'warn'} />
              </div>
              <div className="mt-4 space-y-3">
                {provider.services?.filter((service) => service.is_active).map((service: ServiceItem) => (
                  <article key={service.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold">{service.name}</h4>
                      <div className="text-right">
                        <span className="font-semibold">{getDisplayPrice(service.price)}</span>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Available today</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{service.description}</p>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--brand)]"><Clock3 className="h-3.5 w-3.5" />{service.duration_minutes} minutes</p>
                  </article>
                ))}
              </div>
            </SectionCard>
            <SectionCard>
              <h3 className="text-xl font-semibold">Weekly availability</h3>
              <div className="mt-4 space-y-3">
                {provider.availability_slots?.map((slot: AvailabilitySlot) => (
                  <div key={slot.id} className="rounded-2xl bg-white p-4 text-sm">
                    <p className="font-semibold">{weekdayNames[slot.day_of_week] ?? `Day ${slot.day_of_week}`}</p>
                    <p className="mt-1 text-[var(--muted)]">{slot.start_time} - {slot.end_time}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-[var(--bg)] p-4 text-sm">
                <p className="font-semibold">Location</p>
                <p className="mt-1 text-[var(--muted)]">{provider.location}</p>
                {provider.phone ? <p className="mt-2 inline-flex items-center gap-2 text-[var(--muted)]"><Phone className="h-3.5 w-3.5" />{provider.phone}</p> : null}
              </div>
              <div className="mt-4">
                <ContactActions name={provider.name} phone={getProviderPhone(provider)} className="grid gap-2" />
              </div>
            </SectionCard>
          </div>
          <div className="mt-2 md:sticky md:bottom-6 md:z-10">
            <div className="mx-auto max-w-3xl rounded-[24px] border border-lokals-border bg-white/95 p-4 shadow-soft-lg backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-lokals-muted">Booking ready</p>
                  <p className="text-base font-semibold text-lokals-charcoal">Choose a service, confirm a time, or call right away.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <QuickCallButton phone={getProviderPhone(provider)} className="sm:w-auto" />
                  <Link to={`/services/${provider.id}/book`} className="w-full sm:w-auto"><Button className="w-full sm:w-auto">Book Appointment</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}
