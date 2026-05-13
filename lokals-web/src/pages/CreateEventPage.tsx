import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, PageHeader, SectionCard } from '../components/Ui'
import { EventCategoryChips } from '../components/events/EventCategoryChips'
import { useCreateEvent, useMyBusinesses } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'

export function CreateEventPage() {
  const navigate = useNavigate()
  const businessesQuery = useMyBusinesses()
  const createEvent = useCreateEvent()
  const businesses = businessesQuery.data?.data ?? []
  const [category, setCategory] = useState('community')
  const [form, setForm] = useState({
    organizer_id: '',
    title: '',
    description: '',
    venue_name: '',
    location: '',
    town: 'Windhoek',
    area: '',
    starts_at: '',
    ends_at: '',
    image_url: '',
    capacity: '',
    status: 'draft',
    is_free: true,
  })
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Events" title="Create event" description="Publish a local event in a few clear steps: basics, date and place, tickets, then publish when ready." />
      <SectionCard className="bg-white">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Organizer
            <select value={form.organizer_id} onChange={(event) => setForm((current) => ({ ...current, organizer_id: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3">
              <option value="">Choose business or organization</option>
              {businesses.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Title
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <div className="md:col-span-2">
            <EventCategoryChips value={category} onChange={setCategory} />
          </div>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal md:col-span-2">
            Description
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Venue
            <input value={form.venue_name} onChange={(event) => setForm((current) => ({ ...current, venue_name: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Location
            <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Town
            <input value={form.town} onChange={(event) => setForm((current) => ({ ...current, town: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Area
            <input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Starts
            <input type="datetime-local" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Ends
            <input type="datetime-local" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Capacity
            <input value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-lokals-charcoal">
            Banner image URL
            <input value={form.image_url} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} className="min-h-11 rounded-[18px] border border-lokals-border px-4 py-3" />
          </label>
          <div className="flex flex-wrap gap-4 md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal">
              <input type="checkbox" checked={form.is_free} onChange={(event) => setForm((current) => ({ ...current, is_free: event.target.checked }))} />
              Free event
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal">
              <input type="radio" name="status" checked={form.status === 'draft'} onChange={() => setForm((current) => ({ ...current, status: 'draft' }))} />
              Save as draft
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal">
              <input type="radio" name="status" checked={form.status === 'published'} onChange={() => setForm((current) => ({ ...current, status: 'published' }))} />
              Publish now
            </label>
          </div>
        </div>
        {errorMessage ? <p className="mt-4 text-sm font-medium text-red-600">{errorMessage}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            disabled={createEvent.isPending}
            onClick={async () => {
              setErrorMessage('')
              try {
                const response = await createEvent.mutateAsync({
                  organizer_type: form.organizer_id ? 'organization' : undefined,
                  organizer_id: form.organizer_id ? Number(form.organizer_id) : undefined,
                  title: form.title,
                  description: form.description || undefined,
                  category,
                  venue_name: form.venue_name || undefined,
                  location: form.location || undefined,
                  town: form.town || undefined,
                  area: form.area || undefined,
                  starts_at: form.starts_at,
                  ends_at: form.ends_at || undefined,
                  image_url: form.image_url || undefined,
                  status: form.status,
                  is_free: form.is_free,
                  ticketing_enabled: !form.is_free,
                  capacity: form.capacity ? Number(form.capacity) : undefined,
                })
                navigate(`/events/${response.data.id}/manage`)
              } catch (error) {
                setErrorMessage(getApiErrorMessage(error, 'Unable to create event right now.'))
              }
            }}
          >
            {createEvent.isPending ? 'Saving...' : 'Create event'}
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
