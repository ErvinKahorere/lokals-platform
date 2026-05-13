import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, Input, QueryState, SectionCard, Select, TextArea } from '../components/Ui'
import { useCreateBooking, useProvider } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getServicePriceLabel } from '../lib/display'
import { useAuthStore } from '../store/auth'
import type { Provider } from '../types'

const suggestedTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

export function BookingPage() {
  const { id } = useParams()
  const providerQuery = useProvider(id)
  const provider = providerQuery.data as Provider | undefined
  const createBooking = useCreateBooking()
  const user = useAuthStore((state) => state.user)
  const [serviceId, setServiceId] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const services = provider?.services?.filter((service) => service.is_active && service.is_bookable) ?? []
  const effectiveServiceId = serviceId || (services[0] ? String(services[0].id) : '')
  const selectedService = services.find((service) => String(service.id) === effectiveServiceId)
  const timeOptions = buildTimeOptions(provider, bookingDate, selectedService?.duration_minutes ?? 60)
  const effectiveStartTime = startTime && timeOptions.includes(startTime) ? startTime : (timeOptions[0] ?? '')
  const dateOptions = Array.from({ length: 5 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })
  const formatDateChip = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString('en-NA', { weekday: 'short', day: 'numeric', month: 'short' })
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await createBooking.mutateAsync({ service_id: Number(effectiveServiceId), booking_date: bookingDate, start_time: effectiveStartTime, notes })
      setSuccess(true)
    } catch (caught) {
      setError(getApiErrorMessage(caught, 'Unable to create booking right now.'))
    }
  }

  return (
    <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={!provider}>
      {!provider ? (
        <SectionCard className="mx-auto max-w-2xl">
          <EmptyState title="Provider not found" body="This provider may have been removed or is no longer taking bookings." />
        </SectionCard>
      ) : (
        <div className="space-y-5">
          {success ? (
            <section className="mx-auto max-w-2xl rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center shadow-card">
              <h2 className="text-2xl font-semibold text-lokals-charcoal">Booking requested</h2>
              <p className="mt-2 text-sm text-lokals-muted">Provider will confirm shortly.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate('/dashboard/bookings')}>View My Bookings</Button>
                <Button variant="secondary" onClick={() => navigate('/home')}>Back Home</Button>
              </div>
            </section>
          ) : (
            <SectionCard className="mx-auto max-w-3xl">
              <form className="space-y-5" onSubmit={submit}>
                <div className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
                  <div className="flex items-start gap-4">
                    <Avatar name={provider.name} className="h-14 w-14 border border-violet-100 bg-violet-50 text-lokals-purple" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Selected provider</p>
                      <h2 className="mt-2 text-xl font-semibold text-lokals-charcoal">{provider.name}</h2>
                      <p className="mt-1 text-sm text-lokals-muted">{[provider.subcategory ?? provider.category, provider.area ?? provider.town ?? provider.location].filter(Boolean).join(' | ')}</p>
                    </div>
                  </div>
                </div>

                {services.length === 0 ? (
                  <div className="rounded-[24px] border border-lokals-border bg-white p-5 text-sm text-lokals-muted shadow-card">
                    This provider is not taking instant bookings right now. Please call or WhatsApp to confirm availability.
                  </div>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Selected service</span>
                      <Select value={effectiveServiceId} onChange={(event) => setServiceId(event.target.value)}>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>{service.name} - {getServicePriceLabel(service)}</option>
                        ))}
                      </Select>
                    </label>

                    <div className="rounded-[24px] bg-violet-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Service summary</p>
                      <p className="mt-2 font-semibold text-lokals-charcoal">{selectedService?.name ?? 'Select a service'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">
                        {selectedService ? `${selectedService.duration_minutes} min | ${getServicePriceLabel(selectedService)}` : 'Price stays visible before confirm.'}
                      </p>
                    </div>

                    <div>
                      <span className="mb-2 block text-sm font-medium">Date selection</span>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {dateOptions.map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setBookingDate(option)}
                            className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${bookingDate === option ? 'border-lokals-purple bg-violet-50 text-lokals-purple' : 'border-lokals-border bg-white text-lokals-charcoal'}`}
                          >
                            {formatDateChip(option)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">Custom date</span>
                      <Input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} min={new Date().toISOString().slice(0, 10)} />
                    </label>

                    <div>
                      <span className="mb-2 block text-sm font-medium">Time selection</span>
                      {timeOptions.length === 0 ? (
                        <div className="rounded-[24px] border border-lokals-border bg-white p-4 text-sm text-lokals-muted shadow-card">
                          No time slots are available for this day. Choose another date or contact the provider directly.
                        </div>
                      ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {timeOptions.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setStartTime(slot)}
                            className={`min-h-11 rounded-lokals-lg border px-3 text-sm font-semibold ${effectiveStartTime === slot ? 'border-lokals-purple bg-violet-50 text-lokals-purple' : 'border-lokals-border bg-white text-lokals-charcoal'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      )}
                    </div>

                    <div className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Contact info</p>
                      <p className="mt-2 font-semibold text-lokals-charcoal">{user?.name ?? 'Guest'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{user?.phone ?? 'Sign in to save your phone number'}</p>
                    </div>

                    <label className="block">
                      <button type="button" onClick={() => setShowNotes((value) => !value)} className="text-sm font-medium text-lokals-charcoal">
                        {showNotes ? 'Hide optional notes' : 'Add optional notes'}
                      </button>
                      {showNotes ? <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2" /> : null}
                    </label>
                  </>
                )}

                {error ? <p className="text-sm font-medium text-lokals-danger">{error}</p> : null}
                <Button className="w-full" disabled={createBooking.isPending || !effectiveServiceId || !effectiveStartTime}>
                  {createBooking.isPending ? 'Sending booking...' : 'Confirm Booking'}
                </Button>
              </form>
            </SectionCard>
          )}
        </div>
      )}
    </QueryState>
  )
}

function buildTimeOptions(provider: Provider | undefined, bookingDate: string, durationMinutes: number) {
  const hasAvailability = Boolean(provider?.availability_slots?.length)
  const availability = hasAvailability
    ? provider!.availability_slots!
    : [{ id: 0, day_of_week: 1, start_time: '08:00', end_time: '17:00', is_available: true }]
  const options = new Set<string>()
  const targetDate = new Date(`${bookingDate}T00:00:00`)
  const now = new Date()
  const dayOfWeek = targetDate.getDay()
  const slotStep = durationMinutes <= 30 ? 30 : durationMinutes

  availability
    .filter((slot) => slot.day_of_week === dayOfWeek)
    .forEach((slot) => {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number)
      const [endHour, endMinute] = slot.end_time.split(':').map(Number)
      let cursor = new Date(targetDate)
      cursor.setHours(startHour, startMinute, 0, 0)
      const end = new Date(targetDate)
      end.setHours(endHour, endMinute, 0, 0)

      while (cursor.getTime() + durationMinutes * 60000 <= end.getTime()) {
        if (cursor > now) {
          options.add(cursor.toLocaleTimeString('en-NA', { hour: '2-digit', minute: '2-digit', hour12: false }))
        }
        cursor = new Date(cursor.getTime() + slotStep * 60000)
      }
    })

  if (options.size) {
    return Array.from(options).sort()
  }

  return hasAvailability ? [] : suggestedTimes
}
