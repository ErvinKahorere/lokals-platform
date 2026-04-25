import { useMemo, useState } from 'react'
import { MapPin, Sparkles } from 'lucide-react'
import { Badge, Button, PageHeader, QueryState, Select } from '../components/Ui'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { ProviderCard } from '../components/ui/ProviderCard'
import { SearchBar } from '../components/ui/SearchBar'
import { useProviders } from '../hooks/queries'

const categories = ['all', 'doctor', 'barber', 'mechanic', 'tutor']

export function ServicesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('nearest')
  const providerQuery = useProviders({
    ...(search ? { search } : {}),
    ...(category !== 'all' ? { category } : {}),
    sort: sortBy,
  })
  const providers = useMemo(() => {
    const items = [...(providerQuery.data?.data ?? [])]
    if (sortBy === 'price') {
      return items.sort((a, b) => Number(a.services?.[0]?.price ?? 999999) - Number(b.services?.[0]?.price ?? 999999))
    }
    if (sortBy === 'rating') {
      return items.sort((a, b) => Number(b.is_verified) - Number(a.is_verified))
    }
    return items
  }, [providerQuery.data, sortBy])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Services"
        title="Book trusted local services with fewer steps"
        description="Doctors, barbers, mechanics, tutors, and more can now be filtered by category and booked through a cleaner appointment flow."
        actions={
          <div className="grid w-full gap-3 md:w-auto md:grid-cols-2">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="services"
              suggestions={['Barber nearby', 'Electrician available now', 'Affordable plumber', 'Best rated doctor']}
              shortcuts={[
                { label: 'Popular near you', value: 'popular near you' },
                { label: 'Available now', value: 'available now' },
                { label: 'Best rated', value: 'best rated' },
              ]}
              placeholder="Find a barber, job, product..."
            />
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-muted">Next 3 seconds</p>
          <p className="mt-2 font-semibold text-lokals-charcoal">Tap a provider and book instantly.</p>
        </div>
        <div className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-lokals-charcoal"><MapPin className="h-4 w-4 text-lokals-green" />Nearby first</p>
          <p className="mt-2 text-sm text-lokals-muted">Distance-aware cards keep Windhoek options visible before long commutes.</p>
        </div>
        <div className="rounded-[24px] border border-lokals-border bg-white p-4 shadow-card">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-lokals-charcoal"><Sparkles className="h-4 w-4 text-lokals-green" />Trust up front</p>
          <p className="mt-2 text-sm text-lokals-muted">Verified, response, distance, and pricing show before booking.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setSortBy('popular')}><Badge tone={sortBy === 'popular' ? 'success' : 'neutral'}>Popular in your area</Badge></button>
        <button type="button" onClick={() => setSortBy('open')}><Badge tone={sortBy === 'open' ? 'info' : 'neutral'}>Open now</Badge></button>
        <button type="button" onClick={() => setSortBy('rating')}><Badge tone={sortBy === 'rating' ? 'accent' : 'neutral'}>Best rated</Badge></button>
        <button type="button" onClick={() => setSortBy('price')}><Badge tone={sortBy === 'price' ? 'warning' : 'neutral'}>Affordable</Badge></button>
        <div className="ml-auto w-full sm:w-56">
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="nearest">Nearest first</option>
            <option value="open">Open now</option>
            <option value="popular">Popular in your area</option>
            <option value="recent">Recently added</option>
            <option value="price">Sort by price</option>
            <option value="rating">Sort by rating</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {categories.filter((item) => item !== 'all').map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`flex items-center gap-3 rounded-lokals-xl border p-4 text-left shadow-card transition ${category === item ? 'border-lokals-green bg-lokals-green-soft' : 'border-lokals-border bg-white'}`}
          >
            <CategoryIcon category={item} />
            <div>
              <p className="text-sm font-semibold capitalize text-lokals-charcoal">{item}</p>
              <p className="text-xs text-lokals-muted">Available now</p>
            </div>
          </button>
        ))}
      </div>

      <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={providers.length === 0}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
        </div>
      </QueryState>

      {providers.length === 0 && !providerQuery.isLoading && !providerQuery.error ? (
        <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center shadow-card">
          <h3 className="text-lg font-semibold text-lokals-charcoal">No {category === 'all' ? 'services' : `${category}s`} found nearby</h3>
          <p className="mt-2 text-sm text-lokals-muted">Try expanding your search or switching to another category.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => { setCategory('all'); setSearch('') }}>Show all services</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
