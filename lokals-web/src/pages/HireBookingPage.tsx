import { LifeBuoy, MapPin, PhoneCall, Warehouse } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useCancelHireBooking, useHireBooking, useRateHireBooking } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getDisplayPrice } from '../lib/display'

const bookingTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'handover', label: 'Handover' },
  { key: 'contact', label: 'Contact' },
] as const

export function HireBookingPage() {
  const { id } = useParams()
  const bookingQuery = useHireBooking(id)
  const cancelBooking = useCancelHireBooking()
  const rateBooking = useRateHireBooking()
  const [activeTab, setActiveTab] = useState<(typeof bookingTabs)[number]['key']>('overview')
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const booking = bookingQuery.data
  const progressSteps = useMemo(() => booking?.timeline ?? [], [booking])

  return (
    <QueryState isLoading={bookingQuery.isLoading} error={bookingQuery.error} empty={!booking}>
      {!booking ? (
        <EmptyState title="Booking not found" body="This hire booking may have been removed or you may no longer have access to it." />
      ) : (
        <div className="space-y-6 pb-24">
          <PageHeader
            eyebrow="Hire"
            title={booking.reference_code ?? `Hire #${booking.id}`}
            description={`${booking.item?.title ?? 'Hire item'} | ${booking.status_label ?? booking.status}`}
            actions={<Link to="/hire/bookings"><Button variant="secondary">Back to bookings</Button></Link>}
          />

          {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
          {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

          <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-white shadow-card">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.16),_transparent_30%),linear-gradient(135deg,#0f172a,#111827,#16a34a)] px-6 py-6 text-white">
              <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={booking.status_label ?? booking.status} tone={booking.status === 'completed' ? 'success' : booking.status === 'cancelled' || booking.status === 'rejected' ? 'danger' : 'accent'} className="bg-white/15 text-white ring-0" />
                    <StatusBadge value={booking.payment_status ?? 'pending'} tone="neutral" className="bg-white/15 text-white ring-0" />
                    <StatusBadge value={booking.pickup_method ?? 'pickup'} tone="success" className="bg-white/15 text-white ring-0" />
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold">Hire tracking</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{booking.next_action ?? 'Keep the owner and customer aligned around handover, use, and return.'}</p>
                </div>
                <div className="rounded-[28px] bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-white/70">Totals</p>
                  <div className="mt-4 space-y-3">
                    {[
                      ['Rental fee', getDisplayPrice(booking.totals?.rental_fee ?? 0, 'N$')],
                      ['Deposit', getDisplayPrice(booking.totals?.deposit_amount ?? 0, 'N$')],
                      ['Delivery fee', getDisplayPrice(booking.totals?.delivery_fee ?? 0, 'N$')],
                      ['Total', getDisplayPrice(booking.totals?.total ?? 0, 'N$')],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{label}</span>
                        <span className="font-semibold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <SectionCard className="bg-white">
                  <div className="flex flex-wrap gap-2">
                    {bookingTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-lokals-green text-white' : 'bg-slate-100 text-lokals-charcoal'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                {activeTab === 'overview' ? (
                  <SectionCard className="bg-white">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Rental window</p>
                        <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{booking.start_at ? new Date(booking.start_at).toLocaleString() : 'Pending'} to {booking.end_at ? new Date(booking.end_at).toLocaleString() : 'Pending'}</p>
                      </div>
                      <div className="rounded-[24px] bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Current action</p>
                        <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{booking.next_action ?? 'Waiting for the next update'}</p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                      <p className="text-sm text-lokals-muted">Selected item</p>
                      <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{booking.item?.title ?? 'Hire item'}</p>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">{booking.item?.description ?? 'The owner can continue managing this booking without affecting store orders or parcel delivery flows.'}</p>
                    </div>
                  </SectionCard>
                ) : null}

                {activeTab === 'timeline' ? (
                  <SectionCard className="bg-white">
                    <div className="space-y-4">
                      {progressSteps.map((item) => (
                        <div key={item.key} className="flex gap-4 rounded-[22px] border border-lokals-border bg-slate-50 px-4 py-4">
                          <div className={`mt-1 h-3 w-3 rounded-full ${item.timestamp ? 'bg-lokals-green' : 'bg-slate-300'}`} />
                          <div>
                            <p className="font-semibold text-lokals-charcoal">{item.label}</p>
                            <p className="mt-1 text-sm text-lokals-muted">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Waiting for this step'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                ) : null}

                {activeTab === 'handover' ? (
                  <SectionCard className="bg-white">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Pickup method</p>
                        <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{booking.pickup_method ?? 'pickup'}</p>
                        <p className="mt-2 text-sm text-lokals-muted">{booking.delivery_info?.address ?? booking.item?.address ?? booking.item?.area ?? 'Owner address shared after approval.'}</p>
                      </div>
                      <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Owner notes</p>
                        <p className="mt-2 text-sm leading-6 text-lokals-charcoal">{booking.owner_notes ?? booking.notes ?? 'No extra handover notes yet.'}</p>
                      </div>
                    </div>
                  </SectionCard>
                ) : null}

                {activeTab === 'contact' ? (
                  <SectionCard className="bg-white">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Owner</p>
                        <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{booking.owner?.name ?? booking.item?.business?.name ?? 'Local owner'}</p>
                        <p className="mt-2 text-sm text-lokals-muted">{booking.owner?.phone ?? 'Phone available after approval.'}</p>
                      </div>
                      <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-5">
                        <p className="text-sm text-lokals-muted">Support</p>
                        <p className="mt-2 text-sm leading-6 text-lokals-charcoal">Use LOKALS support if anything about the hire item, deposit, or return process needs intervention.</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="secondary"><PhoneCall className="h-4 w-4" /> Contact owner</Button>
                      <Button variant="secondary"><MapPin className="h-4 w-4" /> Handover location</Button>
                      <Button variant="secondary"><LifeBuoy className="h-4 w-4" /> LOKALS support</Button>
                    </div>
                  </SectionCard>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-2">
                  <SectionCard className="bg-white">
                    <h2 className="text-lg font-semibold text-lokals-charcoal">Rate this hire</h2>
                    {!['completed', 'returned'].includes(booking.status) ? (
                      <p className="mt-4 text-sm text-lokals-muted">Rating becomes available after return or completion.</p>
                    ) : booking.customer_rating ? (
                      <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4">
                        <p className="font-semibold text-emerald-800">You rated this hire {booking.customer_rating}/5</p>
                        <p className="mt-2 text-sm text-emerald-800">{booking.customer_rating_comment ?? 'No comment left.'}</p>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <Input value={rating} onChange={(event) => setRating(event.target.value)} type="number" min={1} max={5} />
                        <TextArea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="How did the rental experience go?" />
                        <Button
                          disabled={rateBooking.isPending}
                          onClick={() => {
                            setFeedback(null)
                            setErrorMessage(null)
                            rateBooking.mutate(
                              { bookingId: booking.id, rating: Number(rating), comment: comment.trim() || undefined },
                              {
                                onSuccess: () => setFeedback('Hire rating saved.'),
                                onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to save your rating right now.')),
                              },
                            )
                          }}
                        >
                          {rateBooking.isPending ? 'Saving...' : 'Save rating'}
                        </Button>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard className="bg-white">
                    <h2 className="text-lg font-semibold text-lokals-charcoal">Item summary</h2>
                    <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-lokals-border bg-slate-50 px-4 py-4">
                      <Warehouse className="mt-1 h-5 w-5 text-lokals-green" />
                      <div>
                        <p className="font-semibold text-lokals-charcoal">{booking.item?.title ?? 'Hire item'}</p>
                        <p className="mt-1 text-sm text-lokals-muted">{booking.item?.category ?? 'Equipment'} | {booking.item?.business?.name ?? booking.owner?.name ?? 'Local owner'}</p>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </div>

              <div className="space-y-5">
                <SectionCard className="sticky top-[92px] bg-white">
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Actions</h2>
                  <div className="mt-4 space-y-3">
                    {['pending', 'accepted', 'confirmed'].includes(booking.status) ? (
                      <Button
                        variant="secondary"
                        disabled={cancelBooking.isPending}
                        onClick={() => {
                          setFeedback(null)
                          setErrorMessage(null)
                          cancelBooking.mutate(
                            { bookingId: booking.id },
                            {
                              onSuccess: () => setFeedback('Hire booking cancelled.'),
                              onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to cancel this booking right now.')),
                            },
                          )
                        }}
                      >
                        {cancelBooking.isPending ? 'Cancelling...' : 'Cancel booking'}
                      </Button>
                    ) : null}
                    <Link to="/hire/bookings"><Button variant="secondary" className="w-full">Booking history</Button></Link>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ['Rental fee', getDisplayPrice(booking.totals?.rental_fee ?? 0, 'N$')],
                      ['Deposit', getDisplayPrice(booking.totals?.deposit_amount ?? 0, 'N$')],
                      ['Delivery fee', getDisplayPrice(booking.totals?.delivery_fee ?? 0, 'N$')],
                      ['Total', getDisplayPrice(booking.totals?.total ?? 0, 'N$')],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                        <p className="font-medium text-lokals-charcoal">{label}</p>
                        <span className="font-semibold text-lokals-charcoal">{value}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>
            </div>
          </section>
        </div>
      )}
    </QueryState>
  )
}
