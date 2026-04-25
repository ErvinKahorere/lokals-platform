import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, PageHeader, QueryState, SectionCard, Select, TextArea } from '../components/Ui'
import { useCreateBooking, useProvider } from '../hooks/queries'
import type { Provider } from '../types'

const suggestedTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

export function BookingPage() {
  const { id } = useParams()
  const providerQuery = useProvider(id)
  const provider = providerQuery.data as Provider | undefined
  const createBooking = useCreateBooking()
  const [serviceId, setServiceId] = useState('')
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('10:00')
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const selectedService = provider?.services?.find((service) => String(service.id) === serviceId)
  const dateOptions = Array.from({ length: 5 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })

  useEffect(() => {
    if (provider?.services?.[0]) {
      setServiceId(String(provider.services[0].id))
    }
  }, [provider])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await createBooking.mutateAsync({ service_id: Number(serviceId), booking_date: bookingDate, start_time: startTime, notes })
    setSuccess(true)
  }

  return (
    <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={!provider}>
      {!provider ? null : (
        <div className="space-y-5">
          <PageHeader eyebrow="Booking" title={`Book ${provider.name}`} description="Pick a service, choose a date and time, and send a lightweight appointment request." />
          {success ? (
            <section className="mx-auto max-w-2xl rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center shadow-card">
              <h2 className="text-2xl font-semibold text-lokals-charcoal">Booking requested</h2>
              <p className="mt-2 text-sm text-lokals-muted">Provider will confirm shortly.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => navigate('/dashboard/bookings')}>View My Bookings</Button>
                <Button variant="secondary" onClick={() => navigate('/')}>Back Home</Button>
              </div>
            </section>
          ) : (
            <SectionCard className="mx-auto max-w-2xl">
              <form className="space-y-4" onSubmit={submit}>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-lokals-muted">Selected provider</p>
                  <h3 className="mt-2 text-lg font-semibold text-lokals-charcoal">{provider.name}</h3>
                  <p className="mt-1 text-sm text-lokals-muted">{provider.category} • {provider.location}</p>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Service</span>
                  <Select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
                    {provider.services?.filter((service) => service.is_active).map((service) => (
                      <option key={service.id} value={service.id}>{service.name} - N$ {service.price}</option>
                    ))}
                  </Select>
                </label>
                <div className="rounded-2xl bg-lokals-green-soft p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-lokals-muted">Service summary</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{selectedService?.name ?? 'Select a service'}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{selectedService ? `${selectedService.duration_minutes} min • N$ ${selectedService.price}` : 'Price always stays visible before confirm'}</p>
                </div>
                <div>
                  <span className="mb-2 block text-sm font-medium">Available dates</span>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dateOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => setBookingDate(option)}
                        className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${bookingDate === option ? 'border-lokals-green bg-lokals-green-soft text-lokals-green' : 'border-lokals-border bg-white text-lokals-charcoal'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Custom date</span>
                  <Input type="date" value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} min={new Date().toISOString().slice(0, 10)} />
                </label>
                <div>
                  <span className="mb-2 block text-sm font-medium">Time slots</span>
                  <div className="grid grid-cols-3 gap-2">
                    {suggestedTimes.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setStartTime(slot)}
                        className={`min-h-11 rounded-lokals-lg border px-3 text-sm font-semibold ${startTime === slot ? 'border-lokals-green bg-lokals-green-soft text-lokals-green' : 'border-lokals-border bg-white text-lokals-charcoal'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <button type="button" onClick={() => setShowNotes((value) => !value)} className="text-sm font-medium text-lokals-charcoal">
                    {showNotes ? 'Hide optional notes' : 'Add optional notes'}
                  </button>
                  {showNotes ? <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-2" /> : null}
                </label>
                <Button className="w-full" disabled={createBooking.isPending || !serviceId}>
                  {createBooking.isPending ? 'Sending booking...' : 'Confirm booking'}
                </Button>
              </form>
            </SectionCard>
          )}
        </div>
      )}
    </QueryState>
  )
}
