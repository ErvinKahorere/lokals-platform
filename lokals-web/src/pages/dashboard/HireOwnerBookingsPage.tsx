import { CheckCheck, Clock3, PackageCheck, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../../components/Ui'
import { useHireBookingAction, useOwnerHireBookings } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'
import { getDisplayPrice } from '../../lib/display'
import type { HireBookingRecord } from '../../types'

function nextOwnerActions(booking: HireBookingRecord): Array<{ label: string; action: 'accept' | 'reject' | 'confirm' | 'handed-over' | 'returned' | 'complete'; tone?: 'primary' | 'secondary' }> {
  if (booking.status === 'pending') {
    return [
      { label: 'Accept', action: 'accept' },
      { label: 'Reject', action: 'reject', tone: 'secondary' },
    ]
  }

  if (booking.status === 'accepted') {
    return [{ label: 'Confirm handover plan', action: 'confirm' }]
  }

  if (booking.status === 'confirmed') {
    return [{ label: 'Mark handed over', action: 'handed-over' }]
  }

  if (['handed_over', 'in_use', 'return_due'].includes(booking.status)) {
    return [{ label: 'Mark returned', action: 'returned' }]
  }

  if (booking.status === 'returned') {
    return [{ label: 'Complete booking', action: 'complete' }]
  }

  return []
}

export function HireOwnerBookingsPage() {
  const bookingsQuery = useOwnerHireBookings()
  const bookingAction = useHireBookingAction()
  const bookings = bookingsQuery.data?.data ?? []
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending')
  const activeBookings = bookings.filter((booking) => ['accepted', 'confirmed', 'handed_over', 'in_use', 'return_due', 'returned'].includes(booking.status))
  const completedBookings = bookings.filter((booking) => booking.status === 'completed')

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="Hire owner"
        title="Owner bookings"
        description="Review incoming rental requests, keep handover realistic, and close returns cleanly."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/hire/my-items"><Button variant="secondary">My hire items</Button></Link>
            <Link to="/dashboard/business"><Button>Business dashboard</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Clock3 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Pending requests</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{pendingBookings.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple"><PackageCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Active rentals</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{activeBookings.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><CheckCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Completed</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{completedBookings.length}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <QueryState isLoading={bookingsQuery.isLoading} error={bookingsQuery.error}>
        {bookings.length === 0 ? (
          <EmptyState title="No owner bookings yet" body="Once customers request your hire items, the queue will show up here with next-step actions." />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <SectionCard key={booking.id} className="bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-lokals-charcoal">{booking.reference_code ?? `Hire #${booking.id}`}</p>
                      <StatusBadge value={booking.status_label ?? booking.status} tone={booking.status === 'completed' ? 'success' : booking.status === 'rejected' || booking.status === 'cancelled' ? 'danger' : 'accent'} />
                    </div>
                    <p className="mt-2 text-sm text-lokals-muted">{booking.item?.title ?? 'Hire item'} | {booking.customer?.name ?? 'Customer'} | Qty {booking.quantity ?? 1}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{booking.start_at ? new Date(booking.start_at).toLocaleString() : 'Pending'} to {booking.end_at ? new Date(booking.end_at).toLocaleString() : 'Pending'}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{booking.next_action ?? 'Waiting for action.'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-lokals-muted">Booking total</p>
                    <p className="text-xl font-semibold text-lokals-charcoal">{getDisplayPrice(booking.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/hire/bookings/${booking.id}`}><Button variant="secondary">Open booking</Button></Link>
                  {nextOwnerActions(booking).map((entry) => (
                    <Button
                      key={entry.label}
                      variant={entry.tone === 'secondary' ? 'secondary' : 'primary'}
                      disabled={bookingAction.isPending}
                      onClick={() => {
                        bookingAction.mutate(
                          { bookingId: booking.id, action: entry.action },
                          {
                            onError: (error) => window.alert(getApiErrorMessage(error, 'Unable to update this hire booking right now.')),
                          },
                        )
                      }}
                    >
                      {entry.label}
                    </Button>
                  ))}
                  {booking.status === 'pending' ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700"><XCircle className="h-4 w-4" /> Review needed</span> : null}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
