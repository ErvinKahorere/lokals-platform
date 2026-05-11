import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddToCalendarButton } from '../../components/events/AddToCalendarButton'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'
import { useCancelEventTicket, useMyTickets } from '../../hooks/queries'

export function MyTicketsPage() {
  const ticketsQuery = useMyTickets()
  const cancelTicket = useCancelEventTicket()
  const tickets = ticketsQuery.data?.data ?? []
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  const filtered = useMemo(() => {
    const now = new Date()
    return tickets.filter((ticket) => {
      if (tab === 'cancelled') return ticket.status === 'cancelled'
      const startsAt = ticket.event?.starts_at ? new Date(ticket.event.starts_at) : null
      const isPast = startsAt ? startsAt.getTime() < now.getTime() : false
      if (tab === 'past') return ticket.status !== 'cancelled' && isPast
      return ticket.status !== 'cancelled' && !isPast
    })
  }, [tab, tickets])

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Events" title="My tickets" description="Keep event confirmations, reserved ticket requests, and entry codes in one place." />
      <div className="flex flex-wrap gap-2">
        {[
          ['upcoming', 'Upcoming'],
          ['past', 'Past'],
          ['cancelled', 'Cancelled'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as typeof tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === value ? 'bg-lokals-purple text-white shadow-card' : 'border border-lokals-border bg-white text-lokals-charcoal'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <QueryState isLoading={ticketsQuery.isLoading} error={ticketsQuery.error} empty={filtered.length === 0}>
        <div className="grid gap-4">
          {filtered.map((ticket) => (
            <SectionCard key={ticket.id} className="bg-white">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={ticket.status === 'confirmed' ? 'success' : ticket.status === 'reserved' ? 'warning' : 'neutral'} value={ticket.status} />
                    <StatusBadge tone="accent" value={ticket.ticket_type?.name ?? 'General'} />
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-lokals-charcoal">{ticket.event?.title ?? 'Event ticket'}</h2>
                  <p className="mt-1 text-sm text-lokals-muted">{ticket.event?.location_label ?? ticket.event?.location ?? 'Location TBC'}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{ticket.event?.starts_at ? new Intl.DateTimeFormat('en-NA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ticket.event.starts_at)) : 'Date TBC'}</p>
                  <p className="mt-2 text-sm text-lokals-charcoal">Code: <span className="font-semibold">{ticket.ticket_code}</span></p>
                  <p className="mt-2 text-sm text-lokals-muted">{ticket.price_paid ? `Paid: N$${ticket.price_paid}` : 'QR placeholder ready for a later check-in pass.'}</p>
                  {ticket.holder_name ? <p className="mt-2 text-sm text-lokals-muted">Holder: {ticket.holder_name}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {ticket.event?.calendar?.ics_url ? <AddToCalendarButton icsUrl={ticket.event.calendar.ics_url} /> : null}
                  <Link to={`/events/${ticket.event_id}`}>
                    <Button variant="secondary">View event</Button>
                  </Link>
                  {['reserved', 'confirmed'].includes(ticket.status) ? (
                    <Button variant="secondary" disabled={cancelTicket.isPending} onClick={() => cancelTicket.mutate(ticket.id)}>Cancel ticket</Button>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </QueryState>
      {filtered.length === 0 ? <EmptyState title="No tickets yet" body="Explore events near you." /> : null}
    </div>
  )
}
