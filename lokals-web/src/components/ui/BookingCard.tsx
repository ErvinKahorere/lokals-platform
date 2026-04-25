import { CalendarDays, Clock3 } from 'lucide-react'
import type { Booking } from '../../types'
import { Badge } from './Badge'
import { Card } from './Card'
import { getStatusLabel } from '../../lib/display'

export function BookingCard({ booking, action }: { booking: Booking; action?: React.ReactNode }) {
  const tone = booking.status === 'confirmed' || booking.status === 'completed'
    ? 'success'
    : booking.status === 'cancelled'
      ? 'danger'
      : 'warning'

  return (
    <Card variant="dashboard">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-lokals-charcoal">{booking.service?.name ?? 'Service booking'}</h3>
          <p className="mt-1 text-sm text-lokals-muted">{booking.service_provider?.name ?? booking.user?.name}</p>
        </div>
        <Badge tone={tone}>{getStatusLabel(booking.status)}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-lokals-muted">
        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{booking.booking_date}</span>
        <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{booking.start_time} - {booking.end_time}</span>
      </div>
      {booking.notes ? <p className="mt-4 text-sm text-lokals-muted">{booking.notes}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  )
}
