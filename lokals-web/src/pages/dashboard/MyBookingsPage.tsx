import { useMyBookings } from '../../hooks/queries'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'
import type { Booking } from '../../types'
import { ContactActions } from '../../components/experience/ContactActions'
import { QuickCallButton } from '../../components/experience/QuickCallButton'
import { getProviderPhone, getStatusColor } from '../../lib/display'

export function MyBookingsPage() {
  const bookingsQuery = useMyBookings()
  const bookings = bookingsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Dashboard" title="My bookings" description="Track service bookings and status updates in one place." />
      <QueryState isLoading={bookingsQuery.isLoading} error={bookingsQuery.error} empty={bookings.length === 0}>
        {bookings.length === 0 ? (
          <EmptyState title="No bookings yet" body="Your appointments will appear here once you confirm a slot." />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: Booking) => (
              <SectionCard key={booking.id} className="bg-white">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{booking.service?.name}</h3>
                  <StatusBadge value={booking.status} tone={getStatusColor(booking.status)} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{booking.service_provider?.name}</p>
                <p className="mt-2 text-sm">{booking.booking_date} at {booking.start_time}</p>
                {booking.notes ? <p className="mt-3 text-sm text-[var(--muted)]">{booking.notes}</p> : null}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary">View</Button>
                  <QuickCallButton phone={getProviderPhone(booking.service_provider)} />
                  {booking.status === 'pending' ? <Button variant="ghost">Cancel</Button> : <ContactActions name={booking.service_provider?.name ?? 'provider'} phone={getProviderPhone(booking.service_provider)} />}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
