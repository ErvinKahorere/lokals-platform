import { useProviderBookings, useUpdateBookingStatus } from '../../hooks/queries'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'

const statusFlow = ['pending', 'confirmed', 'completed', 'cancelled']

export function AdminBookingsPage() {
  const bookingsQuery = useProviderBookings()
  const updateStatus = useUpdateBookingStatus()
  const bookings = bookingsQuery.data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Admin" title="Manage bookings" description="Provider-side and operator-side view of appointment throughput." />
      <QueryState isLoading={bookingsQuery.isLoading} error={bookingsQuery.error} empty={bookings.length === 0}>
        {bookings.length === 0 ? (
          <EmptyState title="No bookings found" body="Incoming provider bookings will show here." />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: any) => (
              <SectionCard key={booking.id} className="bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{booking.service?.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{booking.user?.name} with {booking.service_provider?.name}</p>
                    <p className="mt-1 text-sm">{booking.booking_date} at {booking.start_time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge value={booking.status} tone={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'danger' : 'warn'} />
                    <select
                      className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm"
                      defaultValue={booking.status}
                      onChange={(event) => updateStatus.mutate({ bookingId: booking.id, status: event.target.value })}
                    >
                      {statusFlow.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
