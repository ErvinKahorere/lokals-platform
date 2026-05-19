import { CalendarRange, Clock3, MapPin, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useBookHireItem, useHireItem } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'

function toDateTimeLocalValue(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(offsetDays === 1 ? 9 : 17, 0, 0, 0)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function HireItemDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const [startAt, setStartAt] = useState(toDateTimeLocalValue(1))
  const [endAt, setEndAt] = useState(toDateTimeLocalValue(2))
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const itemQuery = useHireItem(id, { start_at: startAt, end_at: endAt })
  const bookItem = useBookHireItem()

  const item = itemQuery.data
  const durationLabel = useMemo(() => {
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return 'Choose a valid rental window'
    }

    const hours = Math.ceil((end.getTime() - start.getTime()) / 3600000)
    const days = Math.ceil(hours / 24)
    return hours < 24 ? `${hours} hour${hours === 1 ? '' : 's'}` : `${days} day${days === 1 ? '' : 's'}`
  }, [endAt, startAt])

  const estimate = useMemo(() => {
    if (!item) return { rental: 0, delivery: 0, deposit: 0, total: 0 }
    const start = new Date(startAt)
    const end = new Date(endAt)
    const minutes = Math.max(60, end.getTime() - start.getTime()) / 60000
    const hours = Math.max(1, Math.ceil(minutes / 60))
    const days = Math.max(1, Math.ceil(minutes / 1440))
    const rental = item.prices?.price_per_day
      ? Number(item.prices.price_per_day) * days
      : Number(item.prices?.price_per_hour ?? 0) * hours
    const delivery = pickupMethod === 'delivery' ? 35 : 0
    const deposit = Number(item.deposit ?? 0)
    return {
      rental,
      delivery,
      deposit,
      total: rental + delivery + deposit,
    }
  }, [endAt, item, pickupMethod, startAt])

  const requestBooking = () => {
    if (!item) return
    if (!token) {
      navigate('/login')
      return
    }

    setFeedback(null)
    setErrorMessage(null)
    bookItem.mutate(
      {
        itemId: item.id,
        payload: {
          start_at: new Date(startAt).toISOString(),
          end_at: new Date(endAt).toISOString(),
          pickup_method: pickupMethod,
          delivery_address: pickupMethod === 'delivery' ? deliveryAddress : undefined,
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: (response) => {
          const bookingId = Number(response.data?.id ?? response.id)
          setFeedback('Hire request sent to the owner.')
          navigate(`/hire/bookings/${bookingId}`)
        },
        onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to request this hire item right now.')),
      },
    )
  }

  return (
    <QueryState isLoading={itemQuery.isLoading} error={itemQuery.error} empty={!item}>
      {!item ? (
        <EmptyState title="Hire item not found" body="This item may be paused, removed, or not approved for public bookings yet." />
      ) : (
        <div className="space-y-6 pb-24">
          <PageHeader
            eyebrow="Hire"
            title={item.title}
            description={`${item.business?.name ?? item.owner?.name ?? 'Local owner'} | ${item.category}`}
            actions={<Link to="/hire"><Button variant="secondary">Back to hire</Button></Link>}
          />

          {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
          {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

          <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-white shadow-card">
            <div className="grid gap-5 border-b border-lokals-border bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.12),_transparent_30%),linear-gradient(135deg,#ffffff,#f8fafc,#f5f3ff)] px-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={item.verification_status ?? 'pending'} tone={item.verification_status === 'approved' ? 'success' : 'warning'} />
                  <StatusBadge value={item.availability_summary?.available === false ? 'Unavailable' : 'Available'} tone={item.availability_summary?.available === false ? 'warning' : 'success'} />
                  {item.delivery_available ? <StatusBadge value="Delivery available" tone="accent" /> : null}
                </div>
                <h1 className="mt-4 text-3xl font-semibold text-lokals-charcoal">{item.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-lokals-muted">{item.description ?? 'This hire item is ready for a practical local rental flow with owner approval and clear pickup or delivery arrangements.'}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-lokals-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm"><MapPin className="h-4 w-4" /> {item.area ?? item.town ?? 'Okahandja'}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm"><Clock3 className="h-4 w-4" /> {item.bookings_count ?? 0} bookings</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-sm"><ShieldCheck className="h-4 w-4" /> Condition: {item.condition ?? 'good'}</span>
                </div>
              </div>
              <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="text-sm text-lokals-muted">Rental summary</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-lokals-muted">Price</span>
                    <span className="font-semibold text-lokals-charcoal">{item.prices?.price_per_day ? `${getDisplayPrice(item.prices.price_per_day, 'N$')} / day` : item.prices?.price_per_hour ? `${getDisplayPrice(item.prices.price_per_hour, 'N$')} / hour` : 'On request'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-lokals-muted">Deposit</span>
                    <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.deposit ?? 0, 'N$')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-lokals-muted">Replacement value</span>
                    <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.replacement_value ?? 0, 'N$')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 px-6 py-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <SectionCard className="bg-slate-50">
                  <h2 className="text-lg font-semibold text-lokals-charcoal">What is included</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(item.included_items?.length ? item.included_items : ['Main item', 'Basic accessories']).map((entry) => (
                      <span key={entry} className="rounded-full bg-white px-3 py-2 text-sm font-medium text-lokals-charcoal shadow-sm">{entry}</span>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard className="bg-slate-50">
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Rules and handover notes</h2>
                  <div className="mt-4 space-y-3">
                    {(item.rules?.length ? item.rules : ['Bring valid identification when collecting.', 'Return the item in the same condition you received it.']).map((rule) => (
                      <div key={rule} className="rounded-[20px] bg-white px-4 py-4 text-sm leading-6 text-lokals-muted shadow-sm">{rule}</div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard className="bg-slate-50">
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Availability summary</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] bg-white p-4 shadow-sm">
                      <p className="text-sm text-lokals-muted">Requested window</p>
                      <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{item.availability_summary?.requested_window_available === false ? 'Already booked' : 'Looks available'}</p>
                    </div>
                    <div className="rounded-[22px] bg-white p-4 shadow-sm">
                      <p className="text-sm text-lokals-muted">Next available date</p>
                      <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{item.availability_summary?.next_available_at ? new Date(item.availability_summary.next_available_at).toLocaleString() : 'Available now'}</p>
                    </div>
                  </div>
                </SectionCard>
              </div>

              <SectionCard className="sticky top-[92px] bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><CalendarRange className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-lokals-charcoal">Request this item</h2>
                    <p className="text-sm text-lokals-muted">Choose your dates, then send the booking request to the owner.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4">
                  <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                    <span>Start date and time</span>
                    <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                    <span>End date and time</span>
                    <Input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { key: 'pickup', label: 'Pickup', body: 'Collect from the owner or business.' },
                      { key: 'delivery', label: 'Delivery', body: 'Ask for delivery where available.' },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setPickupMethod(option.key as 'pickup' | 'delivery')}
                        className={`rounded-[24px] border p-4 text-left transition ${
                          pickupMethod === option.key ? 'border-lokals-green bg-emerald-50 shadow-sm' : 'border-lokals-border bg-slate-50'
                        }`}
                      >
                        <p className="font-semibold text-lokals-charcoal">{option.label}</p>
                        <p className="mt-2 text-sm leading-6 text-lokals-muted">{option.body}</p>
                      </button>
                    ))}
                  </div>
                  {pickupMethod === 'delivery' ? (
                    <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                      <span>Delivery address</span>
                      <Input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="House number, street, area, and town" />
                    </label>
                  ) : null}
                  <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                    <span>Notes</span>
                    <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Optional notes for setup, quantity, or handover details" />
                  </label>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ['Duration', durationLabel],
                    ['Rental fee', getDisplayPrice(estimate.rental, 'N$')],
                    ['Delivery fee', getDisplayPrice(estimate.delivery, 'N$')],
                    ['Deposit', getDisplayPrice(estimate.deposit, 'N$')],
                    ['Estimated total', getDisplayPrice(estimate.total, 'N$')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                      <span className="font-medium text-lokals-charcoal">{label}</span>
                      <span className="text-right font-semibold text-lokals-charcoal">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button disabled={bookItem.isPending} onClick={requestBooking}>
                    {bookItem.isPending ? 'Sending request...' : 'Request booking'}
                  </Button>
                  <Link to="/hire/bookings"><Button variant="secondary">View my bookings</Button></Link>
                </div>
                <p className="mt-3 text-sm text-lokals-muted">The owner accepts or rejects first. Parcel delivery and shop orders stay separate from this hire flow.</p>
              </SectionCard>
            </div>
          </section>
        </div>
      )}
    </QueryState>
  )
}
