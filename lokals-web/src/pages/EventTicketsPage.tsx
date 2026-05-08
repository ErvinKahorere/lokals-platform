import { useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { useCheckInEventTicket, useEvent, useEventTickets } from '../hooks/queries'

export function EventTicketsPage() {
  const { id } = useParams()
  const eventQuery = useEvent(id)
  const ticketsQuery = useEventTickets(id)
  const checkInTicket = useCheckInEventTicket()
  const event = eventQuery.data?.data
  const tickets = ticketsQuery.data?.data ?? []

  return (
    <QueryState isLoading={eventQuery.isLoading || ticketsQuery.isLoading} error={eventQuery.error ?? ticketsQuery.error} empty={!event}>
      {!event ? <EmptyState title="Event unavailable" body="The attendee view could not be loaded." /> : (
        <div className="space-y-6">
          <PageHeader eyebrow="Events" title={`${event.title} attendees`} description="Track reservations, confirmations, and check-ins for this event." />
          <QueryState isLoading={ticketsQuery.isLoading} error={ticketsQuery.error} empty={tickets.length === 0}>
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <SectionCard key={ticket.id} className="bg-white">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={ticket.status === 'confirmed' ? 'success' : ticket.status === 'reserved' ? 'warning' : 'neutral'} value={ticket.status} />
                        <StatusBadge tone="accent" value={ticket.ticket_type?.name ?? 'General'} />
                      </div>
                      <p className="mt-3 font-semibold text-lokals-charcoal">{ticket.holder_name ?? 'Attendee'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{ticket.holder_phone ?? 'No phone supplied'}</p>
                      <p className="mt-1 text-sm text-lokals-charcoal">Code: {ticket.ticket_code}</p>
                    </div>
                    <div>
                      <Button disabled={checkInTicket.isPending || ticket.status === 'used'} onClick={() => checkInTicket.mutate(ticket.id)}>
                        {ticket.status === 'used' ? 'Checked in' : 'Check in'}
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              ))}
            </div>
          </QueryState>
        </div>
      )}
    </QueryState>
  )
}
