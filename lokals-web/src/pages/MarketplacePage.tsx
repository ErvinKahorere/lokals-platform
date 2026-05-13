import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Camera, CheckCircle2, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, EmptyState, Input, ListingCard, PageHeader, QueryState, SearchBar, SectionCard, Select, TextArea } from '../components/Ui'
import { isDemoMode } from '../config/appMode'
import { useAiAssist, useCreateListing, useListings } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'

export function MarketplacePage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [message, setMessage] = useState('')
  const [sortBy, setSortBy] = useState('distance')
  const [draft, setDraft] = useState({
    type: 'product',
    title: '',
    description: '',
    price: '',
    location: '',
    imageFile: null as File | null,
    imagePreview: '',
  })
  const [postStep, setPostStep] = useState<1 | 2 | 3 | 4>(1)
  const token = useAuthStore((state) => state.token)
  const listingsQuery = useListings(search ? { search } : undefined)
  const createListing = useCreateListing()
  const aiAssist = useAiAssist('marketplace')
  const listings = useMemo(() => {
    const items = [...(listingsQuery.data?.data ?? [])]
    return items.sort((a, b) => {
      if (sortBy === 'price') {
        return Number(a.price ?? 999999) - Number(b.price ?? 999999)
      }
      return Number(a.distance_km ?? 999999) - Number(b.distance_km ?? 999999)
    })
  }, [listingsQuery.data, sortBy])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDemoMode) {
      setMessage('Demo Mode: listing publish simulated. Your product was not submitted to live data.')
      setDraft({ type: 'product', title: '', description: '', price: '', location: '', imageFile: null, imagePreview: '' })
      setPostStep(1)
      return
    }
    const payload = new FormData()
    payload.append('type', draft.type)
    payload.append('title', draft.title)
    payload.append('description', draft.description)
    payload.append('price', draft.price)
    payload.append('currency', 'NAD')
    payload.append('location', draft.location)
    payload.append('status', 'published')
    payload.append('metadata[assisted]', 'true')
    if (draft.imageFile) {
      payload.append('image', draft.imageFile)
    }
    await createListing.mutateAsync(payload as unknown as Record<string, unknown>)
    setMessage('Listing published to the marketplace feed.')
    setDraft({ type: 'product', title: '', description: '', price: '', location: '', imageFile: null, imagePreview: '' })
    setPostStep(1)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-lokals-border bg-white p-5 shadow-card">
        <PageHeader
          eyebrow="Market"
          title="Local goods, services, and promoted supply"
          description="Compact cards keep discovery fast, while sellers can publish new supply without filling a long back-office form."
          actions={<SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onValueSelect={setSearch} recentKey="market" suggestions={['Affordable phones', 'Popular listings', 'Laptops nearby', 'Furniture for sale']} shortcuts={[{ label: 'Popular near you', value: 'popular near you' }, { label: 'Affordable', value: 'affordable' }, { label: 'Available now', value: 'available now' }]} placeholder="Find a barber, job, product..." className="w-full md:w-72" />}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Image-first cards</h3>
          <p className="mt-2 text-sm text-lokals-muted">Price, location, save, and contact actions stay visible before opening details.</p>
        </SectionCard>
        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Nearby first</h3>
          <p className="mt-2 text-sm text-lokals-muted">Marketplace discovery stays local and low-friction for daily-use shopping.</p>
        </SectionCard>
        <SectionCard className="bg-white">
          <h3 className="text-lg font-semibold text-lokals-charcoal">Conversion ready</h3>
          <p className="mt-2 text-sm text-lokals-muted">Save items, contact sellers, and return later without losing momentum.</p>
        </SectionCard>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="success">Popular near you</Badge>
        <Badge tone="accent">Affordable</Badge>
        <Badge tone="info">Available now</Badge>
        <div className="ml-auto w-full sm:w-56">
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="distance">Sort by distance</option>
            <option value="price">Sort by price</option>
          </Select>
        </div>
      </div>

      {token ? (
        <SectionCard className="bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">Post in a few taps</h3>
              <p className="mt-2 text-sm text-lokals-muted">Pick a type, add a photo, and confirm the details instead of filling a long form.</p>
            </div>
            <Badge tone="success">Step {postStep} of 4</Badge>
          </div>
          <form className="mt-4 grid gap-4" onSubmit={submit}>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { key: 'product', label: 'Sell item' },
                { key: 'service', label: 'Offer service' },
                { key: 'delivery', label: 'Offer delivery' },
              ].map((option, index) => (
                <button key={option.key} type="button" onClick={() => { setDraft((current) => ({ ...current, type: option.key })); setPostStep(Math.max(2, postStep) as 2 | 3 | 4) }} className={`rounded-[20px] border p-4 text-left transition ${draft.type === option.key ? 'border-lokals-green bg-emerald-50 shadow-card' : 'border-lokals-border bg-slate-50'}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Step {index + 1}</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{option.label}</p>
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
              {draft.imagePreview ? <img src={draft.imagePreview} alt="Listing preview" className="mb-4 h-44 w-full rounded-[20px] object-cover" /> : <Camera className="mb-3 h-8 w-8 text-lokals-green" />}
              <span className="font-semibold text-lokals-charcoal">{draft.imagePreview ? 'Change photo' : 'Take or upload a photo'}</span>
              <span className="mt-2 text-sm text-lokals-muted">A preview appears instantly before you publish.</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                setDraft((current) => ({ ...current, imageFile: file, imagePreview: file ? URL.createObjectURL(file) : '' }))
                if (file) {
                  setPostStep(3)
                }
              }} />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={aiAssist.isPending}
                onClick={async () => {
                  const payload = new FormData()
                  payload.append('title', draft.title)
                  payload.append('description', draft.description)
                  payload.append('location', draft.location)
                  if (draft.imageFile) {
                    payload.append('media', draft.imageFile)
                  }
                  const response = await aiAssist.mutateAsync(payload)
                  const suggestion = response.data.suggestions?.[0]?.content ?? {}
                  setDraft((current) => ({
                    ...current,
                    title: current.title || String(suggestion.title ?? ''),
                    description: current.description || String(suggestion.description ?? ''),
                    location: current.location || String(suggestion.location_hint ?? ''),
                    price: current.price || String(suggestion.price_estimate ?? ''),
                  }))
                  setPostStep(4)
                }}
              >
                {aiAssist.isPending ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
              <p className="self-center text-sm text-lokals-muted">Suggestions stay editable and never auto-publish.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Suggested title" required />
              <Input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Town or suburb" required />
              <Input value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} placeholder="Price in NAD" />
              <Input value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))} placeholder="Category" required />
            </div>
            <TextArea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" required rows={4} />

            <div className="rounded-[24px] border border-lokals-border bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-lokals-green" />
                <p className="font-semibold text-lokals-charcoal">Confirm before publish</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-lokals-muted md:grid-cols-2">
                <p><span className="font-semibold text-lokals-charcoal">Title:</span> {draft.title || 'Waiting for title'}</p>
                <p><span className="font-semibold text-lokals-charcoal">Category:</span> {draft.type}</p>
                <p><span className="font-semibold text-lokals-charcoal">Price:</span> {getDisplayPrice(draft.price || null)}</p>
                <p><span className="font-semibold text-lokals-charcoal">Location:</span> {draft.location || 'Add location'}</p>
              </div>
            </div>
            {message ? <p className="text-sm text-[var(--accent)] md:col-span-2">{message}</p> : null}
            <Button className="md:col-span-2" disabled={createListing.isPending}>
              {createListing.isPending ? 'Publishing...' : <><CheckCircle2 className="h-4 w-4" />{isDemoMode ? 'Simulate Publish' : 'Confirm Publish'}</>}
            </Button>
          </form>
        </SectionCard>
      ) : null}

      <QueryState isLoading={listingsQuery.isLoading} error={listingsQuery.error} empty={listings.length === 0}>
        {listings.length === 0 ? (
          <EmptyState title="No items found nearby" body="Try changing category or location." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </QueryState>
    </div>
  )
}
