import { Clock3, ShieldCheck, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { useHireBookings } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import type { HireBookingRecord } from '../types'

export function MyHireBookingsPage() {
  const bookingsQuery = useHireBookings()
  const bookings = bookingsQuery.data?.data ?? []
  const activeBookings = bookings.filter((booking) => !['completed', 'cancelled', 'rejected'].includes(booking.status))
  const completedBookings = bookings.filter((booking) => booking.status === 'completed')

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="Hire"
        title="My hire bookings"
        description="Track approved rentals, owner handover progress, and what needs to be returned next."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/hire"><Button variant="secondary">Browse hire items</Button></Link>
            <Link to="/hire/my-items"><Button>List an item</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple"><Clock3 className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Active bookings</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{activeBookings.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Completed</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{completedBookings.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Warehouse className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Deposit held</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{getDisplayPrice(activeBookings.reduce((sum, booking) => sum + Number(booking.totals?.deposit_amount ?? 0), 0), 'N$')}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <QueryState isLoading={bookingsQuery.isLoading} error={bookingsQuery.error}>
        {bookings.length === 0 ? (
          <EmptyState
            title="No hire bookings yet"
            body="Once you request rentals, they will appear here with owner approval, handover, and return status."
            action={<Link to="/hire"><Button>Browse hire items</Button></Link>}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: HireBookingRecord) => (
              <SectionCard key={booking.id} className="bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-lokals-charcoal">{booking.reference_code ?? `Hire #${booking.id}`}</p>
                      <StatusBadge value={booking.status_label ?? booking.status} tone={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' || booking.status === 'rejected' ? 'danger' : 'accent'} />
                    </div>
                    <p className="mt-2 text-sm text-lokals-muted">{booking.item?.title ?? 'Hire item'} | {booking.item?.business?.name ?? booking.owner?.name ?? 'Local owner'}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{booking.start_at ? new Date(booking.start_at).toLocaleString() : 'Start pending'} to {booking.end_at ? new Date(booking.end_at).toLocaleString() : 'End pending'}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{booking.next_action ?? 'Waiting for the next hire update.'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-lokals-muted">Total</p>
                    <p className="text-xl font-semibold text-lokals-charcoal">{getDisplayPrice(booking.totals?.total ?? 0, 'N$')}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/hire/bookings/${booking.id}`}><Button>Open booking</Button></Link>
                  <Link to={`/hire/${booking.item?.id ?? ''}`}><Button variant="secondary">View item</Button></Link>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
