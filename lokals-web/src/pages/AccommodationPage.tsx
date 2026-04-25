import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BedDouble, MapPin, ShowerHead, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SearchBar, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { isDemoMode } from '../config/appMode'
import { useAccommodations, useCreateAccommodation } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'

export function AccommodationPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('rental')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [form, setForm] = useState({ title: '', description: '', town: 'Windhoek', area: 'Klein Windhoek', price: '', bedrooms: '1', bathrooms: '1' })
  const [image, setImage] = useState<File | null>(null)
  const accommodationsQuery = useAccommodations({ search, ...(type ? { type } : {}), sort: sortBy })
  const createAccommodation = useCreateAccommodation()
  const items = useMemo(() => accommodationsQuery.data?.data ?? [], [accommodationsQuery.data])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (isDemoMode) {
      setForm({ title: '', description: '', town: 'Windhoek', area: 'Klein Windhoek', price: '', bedrooms: '1', bathrooms: '1' })
      setImage(null)
      return
    }
    const payload = new FormData()
    payload.append('type', type)
    payload.append('price_period', type === 'bnb' || type === 'short_stay' ? 'night' : type === 'property_sale' ? 'once' : 'month')
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    await createAccommodation.mutateAsync(payload)
    setForm({ title: '', description: '', town: 'Windhoek', area: 'Klein Windhoek', price: '', bedrooms: '1', bathrooms: '1' })
    setImage(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Accommodation" title="Rentals, property sales, and short stays nearby" description="Filter by area, compare price periods, and contact owners quickly." actions={<SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onValueSelect={setSearch} recentKey="accommodation" suggestions={['Rentals in Windhoek', 'B&B near CBD', 'House for sale', 'Affordable rooms']} shortcuts={[{ label: 'Rentals', value: 'rental' }, { label: 'B&B', value: 'bnb' }, { label: 'Property sales', value: 'property_sale' }]} placeholder="Search accommodation..." className="w-full md:w-80" />} />
      <div className="flex flex-wrap gap-2">
        {[
          ['rental', 'Rentals'],
          ['property_sale', 'Property sales'],
          ['bnb', 'B&B / Short stay'],
        ].map(([value, label]) => (
          <Button key={value} variant={type === value ? 'primary' : 'secondary'} onClick={() => setType(value)}>
            {label}
          </Button>
        ))}
        <Button variant={sortBy === 'recent' ? 'secondary' : 'primary'} onClick={() => setSortBy('popular')}>Popular in your area</Button>
        <Button variant={sortBy === 'recent' ? 'primary' : 'secondary'} onClick={() => setSortBy('recent')}>Recently added</Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <QueryState isLoading={accommodationsQuery.isLoading} error={accommodationsQuery.error} empty={items.length === 0}>
          {items.length === 0 ? (
            <EmptyState title="No accommodation found nearby" body="Try changing area or price range." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <SectionCard key={item.id} className="overflow-hidden bg-white">
                  <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-slate-100">
                    {item.image_url ? <img src={resolveMediaUrl(item.image_url) ?? item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Accommodation image</div>}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-lokals-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{item.type.replace(/_/g, ' ')}</p>
                    </div>
                    <StatusBadge value={item.price_period ?? 'month'} tone="accent" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-lokals-charcoal">{getDisplayPrice(item.price)}</p>
                  <p className="mt-1 text-sm text-lokals-muted">per {item.price_period ?? 'month'}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-lokals-muted">
                    {item.bedrooms ? <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />{item.bedrooms} bed</span> : null}
                    {item.bathrooms ? <span className="inline-flex items-center gap-1"><ShowerHead className="h-4 w-4" />{item.bathrooms} bath</span> : null}
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{item.area ?? item.town ?? item.location ?? 'Windhoek'}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{item.description ?? 'Local accommodation listing.'}</p>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/accommodation/${item.id}`} className="flex-1"><Button className="w-full">View details</Button></Link>
                    <Button variant="secondary" className="flex-1">Save</Button>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </QueryState>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-purple/10 text-lokals-purple"><SlidersHorizontal className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Quick post</h2>
              <p className="text-sm text-lokals-muted">Keep property posting short and visual.</p>
            </div>
          </div>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" required />
            <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" required />
            <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Area" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={form.bedrooms} onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))} placeholder="Bedrooms" />
              <Input value={form.bathrooms} onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))} placeholder="Bathrooms" />
            </div>
            <TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={3} />
            <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="block w-full text-sm text-lokals-muted" />
            <Button disabled={createAccommodation.isPending}>{createAccommodation.isPending ? 'Publishing...' : isDemoMode ? 'Simulate accommodation post' : 'Add accommodation'}</Button>
          </form>
        </SectionCard>
      </section>
    </div>
  )
}
