import { Gavel, ShieldCheck, Warehouse } from 'lucide-react'
import { useState } from 'react'
import { Button, EmptyState, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../../components/Ui'
import { useAdminHireBookings, useAdminHireItemModeration, useAdminHireItems, useResolveHireDispute } from '../../hooks/queries'
import { getApiErrorMessage } from '../../lib/api'
import { getDisplayPrice } from '../../lib/display'

export function AdminHirePage({
  variant = 'admin',
}: {
  variant?: 'admin' | 'town'
}) {
  const itemsQuery = useAdminHireItems()
  const bookingsQuery = useAdminHireBookings()
  const moderateItem = useAdminHireItemModeration()
  const resolveDispute = useResolveHireDispute()
  const [resolutionNotes, setResolutionNotes] = useState<Record<number, string>>({})
  const items = itemsQuery.data?.data ?? []
  const bookings = bookingsQuery.data?.data ?? []
  const pendingItems = items.filter((item) => item.verification_status === 'pending')
  const disputedBookings = bookings.filter((booking) => booking.status === 'disputed')
  const activeBookings = bookings.filter((booking) => !['completed', 'cancelled', 'rejected'].includes(booking.status)).slice(0, 8)
  const title = variant === 'town' ? 'Town hire operations' : 'Hire moderation'
  const description = variant === 'town'
    ? 'Review local hire listings, keep risky bookings visible, and make dispute resolution practical for the town team.'
    : 'Approve listings, monitor active hire bookings, and keep dispute-ready operations visible platform-wide.'

  return (
    <div className="space-y-6 pb-24">
      <PageHeader eyebrow={variant === 'town' ? 'Town manager' : 'Super Admin'} title={title} description={description} />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Pending listings</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{pendingItems.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple"><Warehouse className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Active hire bookings</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{activeBookings.length}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700"><Gavel className="h-5 w-5" /></div>
            <div>
              <p className="text-sm text-lokals-muted">Disputes</p>
              <p className="text-2xl font-semibold text-lokals-charcoal">{disputedBookings.length}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <QueryState isLoading={itemsQuery.isLoading} error={itemsQuery.error}>
          <SectionCard className="bg-white">
            <h2 className="text-xl font-semibold text-lokals-charcoal">Pending hire listings</h2>
            <p className="mt-2 text-sm text-lokals-muted">Listings stay out of the public browse flow until they are approved here.</p>
            <div className="mt-5 space-y-4">
              {pendingItems.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-lokals-border bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.category} | {item.owner?.name ?? item.business?.name ?? 'Local owner'} | {item.area ?? item.town ?? 'Okahandja'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{getDisplayPrice(item.prices?.price_per_day ?? item.prices?.price_per_hour ?? 0, 'N$')} {item.prices?.price_per_day ? '/ day' : item.prices?.price_per_hour ? '/ hour' : ''}</p>
                    </div>
                    <StatusBadge value={item.verification_status ?? 'pending'} tone="warning" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      disabled={moderateItem.isPending}
                      onClick={() => moderateItem.mutate({ itemId: item.id, action: 'approve' }, { onError: (error) => window.alert(getApiErrorMessage(error, 'Unable to approve this hire listing right now.')) })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={moderateItem.isPending}
                      onClick={() => moderateItem.mutate({ itemId: item.id, action: 'reject' }, { onError: (error) => window.alert(getApiErrorMessage(error, 'Unable to reject this hire listing right now.')) })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              {!pendingItems.length ? <EmptyState title="No pending hire listings" body="New hire items waiting for verification will appear here." /> : null}
            </div>
          </SectionCard>
        </QueryState>

        <QueryState isLoading={bookingsQuery.isLoading} error={bookingsQuery.error}>
          <SectionCard className="bg-white">
            <h2 className="text-xl font-semibold text-lokals-charcoal">Active bookings and disputes</h2>
            <p className="mt-2 text-sm text-lokals-muted">Town and platform operators can keep high-risk bookings visible without interfering with normal owner workflows.</p>
            <div className="mt-5 space-y-4">
              {(disputedBookings.length ? disputedBookings : activeBookings).map((booking) => (
                <div key={booking.id} className="rounded-[24px] border border-lokals-border bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lokals-charcoal">{booking.reference_code ?? `Hire #${booking.id}`}</p>
                        <StatusBadge value={booking.status_label ?? booking.status} tone={booking.status === 'disputed' ? 'danger' : 'accent'} />
                      </div>
                      <p className="mt-1 text-sm text-lokals-muted">{booking.item?.title ?? 'Hire item'} | {booking.customer?.name ?? 'Customer'} | Total {getDisplayPrice(booking.totals?.total ?? 0, 'N$')}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{booking.next_action ?? 'Operational review ready.'}</p>
                    </div>
                  </div>
                  <label className="mt-4 block space-y-2 text-sm font-medium text-lokals-charcoal">
                    <span>Resolution note</span>
                    <TextArea
                      value={resolutionNotes[booking.id] ?? ''}
                      onChange={(event) => setResolutionNotes((current) => ({ ...current, [booking.id]: event.target.value }))}
                      rows={3}
                      placeholder="Optional outcome or dispute note"
                    />
                  </label>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['returned', 'completed', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={status === 'completed' ? 'primary' : 'secondary'}
                        disabled={resolveDispute.isPending}
                        onClick={() => resolveDispute.mutate({
                          bookingId: booking.id,
                          payload: {
                            status: status as 'returned' | 'completed' | 'cancelled',
                            owner_notes: resolutionNotes[booking.id] || undefined,
                          },
                        }, { onError: (error) => window.alert(getApiErrorMessage(error, 'Unable to resolve this hire booking right now.')) })}
                      >
                        Mark {status.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {!activeBookings.length && !disputedBookings.length ? <EmptyState title="No active hire bookings" body="Once hire bookings start moving or disputes appear, they will show up here." /> : null}
            </div>
          </SectionCard>
        </QueryState>
      </div>
    </div>
  )
}
