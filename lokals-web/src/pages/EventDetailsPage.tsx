import { CheckCircle2, Clock3, MapPin } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { AddToCalendarButton } from '../components/events/AddToCalendarButton'
import { EventCard } from '../components/events/EventCard'
import { EventDateBadge } from '../components/events/EventDateBadge'
import { EventReminderButton } from '../components/events/EventReminderButton'
import { SaveEventButton } from '../components/events/SaveEventButton'
import { TicketTypeCard } from '../components/events/TicketTypeCard'
import { ContactActions } from '../components/experience/ContactActions'
import { useCreateFollow, useDeleteFollow, useEvent, useFollows, useReserveEventTicket } from '../hooks/queries'
import { resolveMediaUrl } from '../lib/display'
import { navigateToLogin } from '../lib/authNavigation'
import { useAuthStore } from '../store/auth'

export function EventDetailsPage() {
  const { id } = useParams()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const eventQuery = useEvent(id)
  const followsQuery = useFollows(Boolean(token))
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const reserveTicket = useReserveEventTicket()
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | undefined>(undefined)
  const [holderName, setHolderName] = useState('')
  const [holderPhone, setHolderPhone] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [reservedTicketCode, setReservedTicketCode] = useState('')

  const event = eventQuery.data?.data
  const related = eventQuery.data?.related ?? []
  const followId = useMemo(() => {
    if (!event?.organizer) return undefined
    return (followsQuery.data?.data ?? []).find((follow) =>
      event.organizer?.type === 'organization'
        ? follow.followable_type.includes('Organization') && follow.followable_id === event.organizer?.id
        : follow.followable_type.includes('ServiceProvider') && follow.followable_id === event.organizer?.id,
    )?.id
  }, [event?.organizer, followsQuery.data?.data])

  return (
    <QueryState isLoading={eventQuery.isLoading} error={eventQuery.error} empty={!event}>
      {!event ? (
        <EmptyState title="Event not found" body="This event may have moved, ended, or no longer be visible." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Events" title={event.title} description={event.description ?? 'Local event details, tickets, reminders, and calendar actions.'} />
          <div className="overflow-hidden rounded-[28px] border border-lokals-border bg-white shadow-card">
            <div className="relative h-72 bg-slate-100">
              {event.image_url ? (
                <img src={resolveMediaUrl(event.image_url) ?? event.image_url} alt={event.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Event image</div>
              )}
              <div className="absolute left-5 top-5">
                <EventDateBadge startsAt={event.starts_at} endsAt={event.ends_at} />
              </div>
              <div className="absolute right-5 top-5">
                {token ? <SaveEventButton eventId={event.id} isSaved={event.is_saved} /> : null}
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={event.is_featured ? 'accent' : 'neutral'} value={event.category} />
                  <StatusBadge tone={event.is_free ? 'success' : 'warning'} value={event.is_free ? 'Free or RSVP' : 'Paid enquiry'} />
                </div>
                <p className="inline-flex items-center gap-2 text-sm text-lokals-muted">
                  <MapPin className="h-4 w-4" />
                  {event.location_label ?? event.location ?? [event.area, event.town].filter(Boolean).join(', ')}
                </p>
                <p className="inline-flex items-center gap-2 text-sm text-lokals-muted">
                  <Clock3 className="h-4 w-4" />
                  {[`${event.attendees_count ?? 0} attending`, `${event.saves_count ?? 0} saved`].join(' | ')}
                </p>
                <p className="text-sm leading-6 text-lokals-muted">{event.description ?? 'Local event details and attendance options will appear here.'}</p>
                <div className="flex flex-wrap gap-3">
                  {token ? <EventReminderButton eventId={event.id} startsAt={event.starts_at} /> : null}
                  <AddToCalendarButton icsUrl={event.calendar?.ics_url} />
                </div>
              </div>

              <SectionCard className="bg-slate-50">
                <h3 className="text-lg font-semibold text-lokals-charcoal">Organizer</h3>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 font-semibold text-lokals-purple">
                    {(event.organizer?.name ?? 'L').slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-lokals-charcoal">{event.organizer?.name ?? 'Local organizer'}</p>
                      {event.organizer?.is_verified ? <StatusBadge tone="success" value="Verified" /> : null}
                    </div>
                    <p className="mt-1 text-sm text-lokals-muted">Follow the organizer to surface future events and updates faster in your feed.</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ContactActions name={event.organizer?.name ?? 'Organizer'} phone={event.organizer?.phone} whatsapp={event.organizer?.whatsapp} className="grid gap-2 sm:grid-cols-2" />
                </div>
                {token && event.organizer?.type ? (
                  <div className="mt-3">
                    <Button
                      variant={followId ? 'primary' : 'secondary'}
                      className="w-full"
                      disabled={createFollow.isPending || deleteFollow.isPending}
                      onClick={() => {
                        if (!token) {
                          navigateToLogin(navigate)
                          return
                        }
                        if (followId) {
                          deleteFollow.mutate(followId)
                          return
                        }
                        if (event.organizer) {
                          createFollow.mutate({ type: event.organizer.type as 'organization' | 'service_provider', id: event.organizer.id })
                        }
                      }}
                    >
                      {followId ? 'Following organizer' : 'Follow organizer'}
                    </Button>
                  </div>
                ) : null}
              </SectionCard>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Tickets</h3>
              <p className="mt-2 text-sm text-lokals-muted">Free tickets confirm instantly. Paid tickets are reserved as an enquiry until payments go live.</p>
              <div className="mt-4 space-y-3">
                {(event.ticket_types ?? []).length === 0 ? (
                  <EmptyState title="No ticket options yet" body="This organizer has not published ticket types yet. Save the event or contact the organizer for updates." />
                ) : (
                  (event.ticket_types ?? []).map((ticketType) => (
                    <TicketTypeCard
                      key={ticketType.id}
                      ticketType={ticketType}
                      selected={selectedTicketTypeId === ticketType.id}
                      onSelect={() => setSelectedTicketTypeId(ticketType.id)}
                    />
                  ))
                )}
              </div>
              {successMessage ? (
                <div className="mt-5 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-lokals-charcoal">Ticket reserved</p>
                        <p className="mt-1 text-sm text-lokals-muted">{successMessage}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-lokals-charcoal md:grid-cols-2">
                        <p><span className="font-semibold">Code:</span> {reservedTicketCode}</p>
                        <p><span className="font-semibold">Event:</span> {event.title}</p>
                        <p><span className="font-semibold">When:</span> {event.starts_at ? new Intl.DateTimeFormat('en-NA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.starts_at)) : 'TBC'}</p>
                        <p><span className="font-semibold">Status:</span> {event.is_free ? 'Confirmed' : 'Reserved enquiry'}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link to="/my-tickets"><Button>View My Tickets</Button></Link>
                        {event.calendar?.ics_url ? <AddToCalendarButton icsUrl={event.calendar.ics_url} /> : null}
                        <Link to="/events"><Button variant="secondary">Back to Events</Button></Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : token ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <input value={holderName} onChange={(event) => setHolderName(event.target.value)} placeholder="Holder name" className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3 outline-none transition focus:border-lokals-green" />
                  <input value={holderPhone} onChange={(event) => setHolderPhone(event.target.value)} placeholder="Holder phone" className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3 outline-none transition focus:border-lokals-green" />
                  {errorMessage ? <p className="text-sm font-medium text-red-600 md:col-span-2">{errorMessage}</p> : null}
                  <div className="md:col-span-2">
                    <Button
                      className="w-full"
                      disabled={reserveTicket.isPending || (!event.is_free && !selectedTicketTypeId)}
                      onClick={async () => {
                        setErrorMessage('')
                        setSuccessMessage('')
                        try {
                          const payload = {
                            ticket_type_id: selectedTicketTypeId,
                            holder_name: holderName || undefined,
                            holder_phone: holderPhone || undefined,
                          }
                          const response = await reserveTicket.mutateAsync({ eventId: event.id, payload })
                          setReservedTicketCode(response.data.ticket_code)
                          setSuccessMessage(response.data.status === 'confirmed' ? 'Provider will confirm shortly and your free ticket is already active.' : 'Your paid ticket enquiry is reserved and the organizer can follow up from here.')
                        } catch (error: any) {
                          setErrorMessage(error?.response?.data?.errors?.ticket_type_id?.[0] ?? error?.response?.data?.errors?.event?.[0] ?? error?.response?.data?.message ?? 'Unable to reserve a ticket right now.')
                        }
                      }}
                    >
                      {reserveTicket.isPending ? 'Submitting...' : event.is_free ? 'Confirm free ticket' : 'Reserve ticket enquiry'}
                    </Button>
                  </div>
                  <Link to="/my-tickets" className="md:col-span-2">
                    <Button variant="secondary" className="w-full">View My Tickets</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  <Button className="w-full" onClick={() => navigateToLogin(navigate)}>Login to reserve or save</Button>
                </div>
              )}
            </SectionCard>

            <SectionCard className="bg-white">
              <h3 className="text-lg font-semibold text-lokals-charcoal">Related events</h3>
              <div className="mt-4 space-y-4">
                {related.length === 0 ? (
                  <EmptyState title="No related events yet" body="More events in this area or category will show here." />
                ) : (
                  related.map((item) => <EventCard key={item.id} event={item} />)
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </QueryState>
  )
}
