import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BellRing, Clock3, MapPin, MessageSquare, Phone } from 'lucide-react'
import { useCreateConversation, useCreateFollow, useDeleteFollow, useFollows, useProvider } from '../hooks/queries'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { QuickCallButton } from '../components/experience/QuickCallButton'
import { TrustRow } from '../components/experience/TrustRow'
import type { AvailabilitySlot, Provider, ServiceItem } from '../types'
import {
  getCompletedLabel,
  getDisplayDistance,
  getDisplayRating,
  getProviderPhone,
  getResponseTimeLabel,
  getServicePriceLabel,
  resolveMediaUrl,
} from '../lib/display'
import { navigateToLogin } from '../lib/authNavigation'
import { useAuthStore } from '../store/auth'

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ServiceProviderDetailsPage() {
  const { id } = useParams()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const providerQuery = useProvider(id)
  const followsQuery = useFollows(Boolean(token))
  const createConversation = useCreateConversation()
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const provider = providerQuery.data as Provider | undefined
  const [messageNotice, setMessageNotice] = useState('')

  const followId = useMemo(
    () => (followsQuery.data?.data ?? []).find((follow) => follow.followable_type.includes('ServiceProvider') && follow.followable_id === provider?.id)?.id,
    [followsQuery.data, provider?.id],
  )
  const services = provider?.services?.filter((service) => service.is_active) ?? []
  const bookableServices = services.filter((service) => service.is_bookable)
  const availability = provider?.availability_slots?.length
    ? provider.availability_slots
    : [{ id: 0, day_of_week: 1, start_time: '08:00', end_time: '17:00', is_available: true } as AvailabilitySlot]
  const alerts = provider?.alerts?.length
    ? provider.alerts
    : [{ id: 'placeholder', title: 'No provider alerts yet', body: 'New updates from this provider will appear here once posted.' }]
  const skills = services.map((service) => service.name).slice(0, 6)

  const toggleFollow = async () => {
    if (!provider) return
    if (!token) {
      navigateToLogin(navigate)
      return
    }
    if (followId) {
      await deleteFollow.mutateAsync(followId)
      setMessageNotice('Unfollowed')
      return
    }

    await createFollow.mutateAsync({ type: 'service_provider', id: provider.id })
    setMessageNotice('Following')
  }

  const openConversation = async () => {
    if (!provider?.user_id) {
      setMessageNotice('Call or WhatsApp this provider for now.')
      return
    }
    if (!token) {
      navigateToLogin(navigate)
      return
    }

    try {
      const response = await createConversation.mutateAsync({
        participant_ids: [provider.user_id],
        context: 'service',
        subject: provider.name,
      })
      navigate(`/conversations/${response.data.id}`)
    } catch {
      setMessageNotice('We could not open this conversation right now.')
    }
  }

  return (
    <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={!provider}>
      {!provider ? (
        <EmptyState title="Provider not found" body="This provider may have been removed or is no longer available." />
      ) : (
        <div className="space-y-5">
          <section className="rounded-[28px] border border-lokals-border bg-white p-6 shadow-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar name={provider.name} src={resolveMediaUrl(provider.avatar_url)} className="h-20 w-20 border border-violet-100 bg-violet-50 text-lokals-purple" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {provider.is_verified ? <StatusBadge value="Verified" tone="success" /> : null}
                    <StatusBadge value={provider.open_now ? 'Open now' : provider.availability_status ?? 'Available'} tone={provider.open_now ? 'success' : 'info'} />
                    <StatusBadge value={getResponseTimeLabel(provider)} tone="warning" />
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold text-lokals-charcoal">{provider.name}</h1>
                  <p className="mt-2 text-sm font-semibold text-lokals-purple">{provider.subcategory ?? provider.category}</p>
                  <p className="mt-3 text-sm text-lokals-muted">
                    {[provider.area, provider.town, provider.location].filter(Boolean).join(', ')}
                    {provider.distance_km ? ` | ${getDisplayDistance(provider.distance_km, provider.location)}` : ''}
                  </p>
                  <div className="mt-4">
                    <TrustRow
                      verified={provider.is_verified}
                      ratingLabel={`${getDisplayRating(provider)} | ${provider.review_count ?? 0} reviews`}
                      distanceLabel={getDisplayDistance(provider.distance_km, provider.location)}
                      completedLabel={getCompletedLabel(provider)}
                      responseLabel={getResponseTimeLabel(provider)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:flex-col">
                <Button variant="secondary" disabled={createConversation.isPending} onClick={() => void openConversation()}>
                  <MessageSquare className="h-4 w-4" />
                  {createConversation.isPending ? 'Opening...' : 'Message'}
                </Button>
                <QuickCallButton phone={getProviderPhone(provider)} />
                <Button
                  variant={followId ? 'primary' : 'secondary'}
                  disabled={createFollow.isPending || deleteFollow.isPending}
                  onClick={() => void toggleFollow()}
                >
                  {!token ? 'Login to follow' : followId ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
            {provider.about ?? provider.description ? (
              <p className="mt-5 max-w-3xl text-sm leading-6 text-lokals-muted">{provider.about ?? provider.description}</p>
            ) : null}
            {messageNotice ? (
              <div className="mt-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm font-medium text-lokals-purple">{messageNotice}</div>
            ) : null}
          </section>

          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
            <SectionCard>
              <h2 className="text-xl font-semibold">Provider info</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <InfoCard title="Location" body={[provider.area, provider.town, provider.location].filter(Boolean).join(', ')} icon={<MapPin className="h-4 w-4 text-lokals-purple" />} />
                <InfoCard title="Opening hours" body={`${weekdayNames[availability[0].day_of_week] ?? 'Today'} ${availability[0].start_time} - ${availability[0].end_time}`} icon={<Clock3 className="h-4 w-4 text-lokals-purple" />} />
                <InfoCard title="Response time" body={getResponseTimeLabel(provider)} icon={<BellRing className="h-4 w-4 text-lokals-purple" />} />
                <InfoCard title="Experience" body={provider.is_verified ? 'Verified local provider' : 'Growing local profile'} icon={<Phone className="h-4 w-4 text-lokals-purple" />} />
              </div>

              {skills.length ? (
                <>
                  <h2 className="mt-6 text-xl font-semibold">Skills & services</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-lokals-border bg-slate-50 px-3 py-2 text-sm font-medium text-lokals-charcoal">{skill}</span>
                    ))}
                  </div>
                </>
              ) : null}

              <h2 className="mt-6 text-xl font-semibold">Services & rates</h2>
              <div className="mt-4 space-y-3">
                {services.length === 0 ? (
                  <article className="rounded-2xl bg-white p-4 text-sm text-lokals-muted shadow-card">
                    Services are being updated. Call or WhatsApp this provider for the latest rates and availability.
                  </article>
                ) : services.map((service: ServiceItem) => (
                  <article key={service.id} className="rounded-2xl border border-lokals-border bg-white p-4 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lokals-charcoal">{service.name}</h3>
                        <p className="mt-2 text-sm text-lokals-muted">{service.description || 'Local service with clear pricing and direct contact.'}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">
                          {service.duration_minutes ? `${service.duration_minutes} minutes` : 'Timing confirmed on contact'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lokals-charcoal">{getServicePriceLabel(service)}</p>
                        <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${service.is_bookable ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {service.is_bookable ? 'Bookable now' : 'Call for booking'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-xl font-semibold">Availability and contact</h2>
              <div className="mt-4 space-y-3">
                {availability.map((slot: AvailabilitySlot) => (
                  <div key={slot.id} className="rounded-2xl border border-lokals-border bg-white p-4 text-sm shadow-card">
                    <p className="font-semibold text-lokals-charcoal">{weekdayNames[slot.day_of_week] ?? `Day ${slot.day_of_week}`}</p>
                    <p className="mt-1 text-lokals-muted">{slot.start_time} - {slot.end_time}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-lokals-surface p-4 text-sm">
                <p className="font-semibold text-lokals-charcoal">Contact details</p>
                <p className="mt-2 inline-flex items-center gap-2 text-lokals-muted"><MapPin className="h-3.5 w-3.5" />{[provider.area, provider.town, provider.location].filter(Boolean).join(', ')}</p>
                {provider.phone ? <p className="mt-2 inline-flex items-center gap-2 text-lokals-muted"><Phone className="h-3.5 w-3.5" />{provider.phone}</p> : null}
              </div>

              <div className="mt-4">
                <ContactActions name={provider.name} phone={getProviderPhone(provider)} whatsapp={provider.whatsapp} className="grid gap-2" />
              </div>

              <div className="mt-4 rounded-2xl bg-lokals-surface p-4 text-sm text-lokals-muted">
                {followId ? 'You will receive updates and alerts from this provider.' : 'Follow to receive updates and alerts from this provider.'}
              </div>

              <div className="mt-4 space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-lokals-border bg-white p-4 shadow-card">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lokals-gold"><BellRing className="h-3.5 w-3.5" />Update</p>
                    <p className="mt-2 font-semibold text-lokals-charcoal">{alert.title}</p>
                    <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="sticky bottom-6 z-10">
            <div className="mx-auto max-w-3xl rounded-[24px] border border-lokals-border bg-white/95 p-4 shadow-soft-lg backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-lokals-muted">Booking ready</p>
                  <p className="text-base font-semibold text-lokals-charcoal">Choose a service, confirm a time, or call right away.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <QuickCallButton phone={getProviderPhone(provider)} className="sm:w-auto" />
                  <Link to={`/services/${provider.id}/book`} className="w-full sm:w-auto"><Button className="w-full sm:w-auto" disabled={bookableServices.length === 0}>Book Appointment</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </QueryState>
  )
}

function InfoCard({ title, body, icon }: { title: string; body: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-lokals-border bg-white p-4 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50">{icon}</div>
      <p className="mt-4 font-semibold text-lokals-charcoal">{title}</p>
      <p className="mt-2 text-sm text-lokals-muted">{body}</p>
    </div>
  )
}
