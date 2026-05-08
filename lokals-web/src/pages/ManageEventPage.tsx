import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard } from '../components/Ui'
import { TicketTypeCard } from '../components/events/TicketTypeCard'
import { useAddEventTicketType, useEvent, useUpdateEvent } from '../hooks/queries'

export function ManageEventPage() {
  const { id } = useParams()
  const eventQuery = useEvent(id)
  const updateEvent = useUpdateEvent()
  const addTicketType = useAddEventTicketType()
  const event = eventQuery.data?.data
  const [status, setStatus] = useState('published')
  const [ticketName, setTicketName] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [ticketQty, setTicketQty] = useState('')

  return (
    <QueryState isLoading={eventQuery.isLoading} error={eventQuery.error} empty={!event}>
      {!event ? <EmptyState title="Event unavailable" body="This event could not be loaded for editing." /> : (
        <div className="space-y-6">
          <PageHeader eyebrow="Events" title={`Manage ${event.title}`} description="Update status, add ticket options, and monitor attendees without leaving the current layout." actions={<Link to={`/events/${event.id}/tickets`}><Button variant="secondary">View attendees</Button></Link>} />
          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Publishing</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {['draft', 'published', 'cancelled', 'completed'].map((value) => (
                <Button key={value} variant={status === value ? 'primary' : 'secondary'} onClick={() => setStatus(value)}>
                  {value}
                </Button>
              ))}
              <Button disabled={updateEvent.isPending} onClick={() => updateEvent.mutate({ eventId: event.id, payload: { status } })}>
                {updateEvent.isPending ? 'Updating...' : 'Save status'}
              </Button>
            </div>
          </SectionCard>
          <SectionCard className="bg-white">
            <h3 className="text-lg font-semibold text-lokals-charcoal">Ticket types</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <input value={ticketName} onChange={(event) => setTicketName(event.target.value)} placeholder="Ticket name" className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
              <input value={ticketPrice} onChange={(event) => setTicketPrice(event.target.value)} placeholder="Price" className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
              <input value={ticketQty} onChange={(event) => setTicketQty(event.target.value)} placeholder="Quantity" className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
            </div>
            <div className="mt-4">
              <Button
                disabled={addTicketType.isPending || !ticketName.trim()}
                onClick={async () => {
                  await addTicketType.mutateAsync({
                    eventId: event.id,
                    payload: {
                      name: ticketName,
                      price: ticketPrice ? Number(ticketPrice) : 0,
                      quantity_available: ticketQty ? Number(ticketQty) : undefined,
                      is_active: true,
                    },
                  })
                  setTicketName('')
                  setTicketPrice('')
                  setTicketQty('')
                }}
              >
                {addTicketType.isPending ? 'Adding...' : 'Add ticket type'}
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {(event.ticket_types ?? []).map((ticketType) => <TicketTypeCard key={ticketType.id} ticketType={ticketType} />)}
            </div>
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
