import { Link } from 'react-router-dom'
import { Bookmark, MapPin, Ticket } from 'lucide-react'
import { Button, StatusBadge } from '../Ui'
import { resolveMediaUrl } from '../../lib/display'
import type { EventItem } from '../../types'
import { EventDateBadge } from './EventDateBadge'
import { SaveEventButton } from './SaveEventButton'
import { ImageWithFallback } from '../ui/ImageWithFallback'

export function EventCard({ event }: { event: EventItem }) {
  const locationLabel = event.venue_name ?? event.location_label ?? event.location ?? ([event.area, event.town].filter(Boolean).join(', ') || 'Okahandja')
  const priceLabel = event.ticket_price_from == null || Number(event.ticket_price_from) === 0
    ? 'Free or RSVP'
    : event.ticket_price_to != null && event.ticket_price_to !== event.ticket_price_from
      ? `N$${event.ticket_price_from} - N$${event.ticket_price_to}`
      : `From N$${event.ticket_price_from}`

  return (
    <article className="overflow-hidden rounded-[24px] border border-lokals-border bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-soft-lg">
      <div className="h-44 bg-slate-100">
        <ImageWithFallback src={resolveMediaUrl(event.image_url) ?? event.image_url} alt={event.title} className="h-full w-full" fallback={<div className="text-sm text-lokals-muted">Event image</div>} />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={event.is_featured ? 'accent' : 'neutral'} value={event.category} />
              <StatusBadge tone={event.is_free ? 'success' : 'warning'} value={event.is_free ? 'Free' : 'Paid'} />
            </div>
            <h3 className="mt-3 text-xl font-semibold text-lokals-charcoal">{event.title}</h3>
          </div>
          <EventDateBadge startsAt={event.starts_at} endsAt={event.ends_at} />
        </div>
        <p className="line-clamp-2 text-sm text-lokals-muted">{event.description ?? 'Local event details and community activity.'}</p>
        <p className="inline-flex items-center gap-2 text-sm text-lokals-muted"><MapPin className="h-4 w-4" />{locationLabel}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-lokals-charcoal">{priceLabel}</p>
            <p className="text-xs text-lokals-muted">{event.attendees_count ?? 0} attending</p>
          </div>
          <div className="flex items-center gap-2">
            <SaveEventButton eventId={event.id} isSaved={event.is_saved} compact />
            <Link to={`/events/${event.id}`}>
              <Button><Ticket className="h-4 w-4" />Tickets</Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-[18px] bg-slate-50 px-4 py-3 text-xs text-lokals-muted">
          <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4 text-lokals-purple" />{event.saves_count ?? 0} saved</span>
          <Link to={`/events/${event.id}`} className="font-semibold text-lokals-purple">View details</Link>
        </div>
      </div>
    </article>
  )
}
