import { useMemo, useState } from 'react'
import { ChevronRight, MapPin, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, PageHeader, QueryState, Select } from '../components/Ui'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { ProviderCard } from '../components/ui/ProviderCard'
import { SearchBar } from '../components/ui/SearchBar'
import { useProviders } from '../hooks/queries'
import { OKAHANDJA_AREAS, PILOT_TOWN } from '../lib/pilot'

const categories = ['all', 'doctor', 'barber', 'mechanic', 'electrician', 'plumber', 'cleaner', 'tutor']
const categoryAliases: Record<string, string[]> = {
  all: [],
  cleaner: ['cleaner', 'cleaning', 'house cleaner', 'laundry'],
  plumber: ['plumber', 'plumbing', 'pipe', 'leak'],
  electrician: ['electrician', 'electrical', 'wiring', 'power'],
  carpenter: ['carpenter', 'carpentry', 'woodwork', 'furniture'],
  painting: ['painting', 'painter', 'paint'],
  garden: ['garden', 'gardener', 'landscaping', 'yard'],
  repair: ['repair', 'appliance repair', 'maintenance', 'fix'],
  moving: ['moving', 'mover', 'delivery', 'transport'],
  doctor: ['doctor', 'clinic', 'health', 'medical'],
  barber: ['barber', 'haircut', 'beard', 'salon'],
  mechanic: ['mechanic', 'automotive', 'garage', 'vehicle'],
  tutor: ['tutor', 'teaching', 'education', 'lesson'],
}
const popularServices = [
  { key: 'cleaner', label: 'Cleaning', icon: 'cleaning' },
  { key: 'plumber', label: 'Plumbing', icon: 'plumbing' },
  { key: 'electrician', label: 'Electrical', icon: 'electrical' },
  { key: 'carpenter', label: 'Carpentry', icon: 'carpentry' },
  { key: 'painting', label: 'Painting', icon: 'painting' },
  { key: 'garden', label: 'Garden', icon: 'garden' },
  { key: 'repair', label: 'Appliance Repair', icon: 'repair' },
  { key: 'moving', label: 'Moving', icon: 'moving' },
  { key: 'all', label: 'More', icon: 'services' },
] as const
const categoryRows = [
  { key: 'all', icon: 'home_maintenance', label: 'Home & Maintenance', hint: 'Cleaning, plumbing, electrical, and repairs' },
  { key: 'all', icon: 'entertainment', label: 'Events & Entertainment', hint: 'Decor, MCs, catering, and equipment' },
  { key: 'doctor', icon: 'beauty', label: 'Health & Beauty', hint: 'Clinics, barbers, and personal care' },
  { key: 'mechanic', icon: 'automotive', label: 'Automotive', hint: 'Mechanics, diagnostics, and call-outs' },
  { key: 'tutor', icon: 'education', label: 'Education', hint: 'Tutors, coaching, and practical learning' },
  { key: 'all', icon: 'public_services', label: 'Public Services', hint: 'Directory-linked local service points' },
] as const

export function ServicesPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState('all')
  const [town] = useState(PILOT_TOWN)
  const [area, setArea] = useState('all')
  const [sortBy, setSortBy] = useState('nearest')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [bookableOnly, setBookableOnly] = useState(false)
  const [openOnly, setOpenOnly] = useState(false)

  const providerQuery = useProviders({
    ...(search ? { search } : {}),
    town,
    ...(area !== 'all' ? { area } : {}),
    ...(verifiedOnly ? { verified: 1 } : {}),
    ...(bookableOnly ? { bookable: 1 } : {}),
    ...(openOnly ? { open_now: 1 } : {}),
    sort: sortBy,
  })

  const providers = useMemo(() => {
    const items = [...(providerQuery.data?.data ?? [])].filter((provider) => {
      if (category === 'all') {
        return true
      }

      const aliases = categoryAliases[category] ?? [category]
      const haystack = [
        provider.category,
        provider.subcategory,
        ...(provider.services?.map((service) => service.name) ?? []),
        ...(provider.services?.map((service) => service.description ?? '') ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return aliases.some((alias) => haystack.includes(alias))
    })

    if (sortBy === 'price_low') {
      return items.sort((a, b) => {
        const aMin = Math.min(...(a.services?.filter((service) => service.is_active).map((service) => Number(service.price ?? 999999)) ?? [999999]))
        const bMin = Math.min(...(b.services?.filter((service) => service.is_active).map((service) => Number(service.price ?? 999999)) ?? [999999]))
        return aMin - bMin
      })
    }
    if (sortBy === 'top_rated') {
      return items.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
    }
    return items
  }, [category, providerQuery.data, sortBy])

  const activeFilters = [category !== 'all' ? category : null, area !== 'all' ? area : null, verifiedOnly ? 'verified' : null, bookableOnly ? 'bookable' : null, openOnly ? 'open now' : null]
    .filter(Boolean)
    .join(' | ')

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#2B1E8C] via-[#3F2BCB] to-[#5B46E8] p-6 text-white shadow-card">
        <PageHeader eyebrow="Services" title="Services" description="Find trusted local help for home, business, and everyday life." actions={null} />
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr,220px]">
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
            placeholder="Search for a service..."
          />
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Popular services</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Start with a trusted category</h2>
          </div>
          <button type="button" onClick={() => setCategory('all')} className="text-sm font-semibold text-lokals-purple">View all</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {popularServices.map((item) => (
            <button
              key={item.label}
              onClick={() => setCategory(item.key)}
              className={`rounded-lokals-xl border p-4 text-left shadow-card transition ${category === item.key ? 'border-lokals-purple bg-violet-50' : 'border-lokals-border bg-white hover:border-lokals-purple/20 hover:bg-violet-50/30'}`}
            >
              <CategoryIcon category={item.icon} />
              <p className="mt-4 text-sm font-semibold text-lokals-charcoal">{item.label}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">All categories</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Browse service groups</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {categoryRows.map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => setCategory(row.key)}
              className="flex items-center gap-3 rounded-[20px] border border-lokals-border bg-white p-4 text-left shadow-card transition hover:border-lokals-purple/20 hover:bg-violet-50/30"
            >
              <CategoryIcon category={row.icon} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-lokals-charcoal">{row.label}</p>
                <p className="mt-1 text-sm text-lokals-muted">{row.hint}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-lokals-muted" />
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setVerifiedOnly((value) => !value)}><Badge tone={verifiedOnly ? 'success' : 'neutral'}>Verified</Badge></button>
        <button type="button" onClick={() => setBookableOnly((value) => !value)}><Badge tone={bookableOnly ? 'success' : 'neutral'}>Bookable</Badge></button>
        <button type="button" onClick={() => setOpenOnly((value) => !value)}><Badge tone={openOnly ? 'info' : 'neutral'}>Open now</Badge></button>
        <button type="button" onClick={() => setSortBy('nearest')}><Badge tone={sortBy === 'nearest' ? 'info' : 'neutral'}>Near me</Badge></button>
        <div className="inline-flex items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm text-lokals-muted shadow-sm">
          <SlidersHorizontal className="h-4 w-4 text-lokals-purple" />
          <span>{activeFilters || 'All services'}</span>
        </div>
        <div className="ml-auto w-full sm:w-56">
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="nearest">Nearest first</option>
            <option value="open">Open now</option>
            <option value="popular">Popular in your area</option>
            <option value="recent">Recently added</option>
            <option value="price_low">Sort by price</option>
            <option value="top_rated">Sort by rating</option>
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="all">All Okahandja areas</option>
            {OKAHANDJA_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Top providers near you</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Trusted providers with clear rates</h2>
          </div>
          <button type="button" onClick={() => setSortBy('nearest')} className="inline-flex items-center gap-2 text-sm font-semibold text-lokals-purple">
            <MapPin className="h-4 w-4" />
            View all
          </button>
        </div>

        <QueryState isLoading={providerQuery.isLoading} error={providerQuery.error} empty={providers.length === 0}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        </QueryState>
      </section>

      {providers.length === 0 && !providerQuery.isLoading && !providerQuery.error ? (
        <div className="rounded-[24px] border border-lokals-border bg-white p-6 text-center shadow-card">
          <h3 className="text-lg font-semibold text-lokals-charcoal">No services found nearby</h3>
          <p className="mt-2 text-sm text-lokals-muted">Try another Okahandja area, remove one filter, or switch to a broader category.</p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => { setCategory('all'); setSearch(''); setArea('all'); setVerifiedOnly(false); setBookableOnly(false); setOpenOnly(false) }}>Show all services</Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
