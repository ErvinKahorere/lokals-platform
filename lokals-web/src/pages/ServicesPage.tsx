import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  ExternalLink,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShieldPlus,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card, EmptyState, Select } from '../components/Ui'
import { ProviderCard } from '../components/ui/ProviderCard'
import { SearchBar } from '../components/ui/SearchBar'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { useDirectory, usePreferences, useProviders } from '../hooks/queries'
import { getDisplayDistance, getWhatsAppHref } from '../lib/display'
import { OKAHANDJA_AREAS, PILOT_TOWN } from '../lib/pilot'
import { useAuthStore } from '../store/auth'
import type { Organization, Provider } from '../types'

type DirectoryCategory = {
  key: string
  label: string
  icon: LucideIcon
  detail: string
}

const categoryAliases: Record<string, string[]> = {
  all: [],
  health: ['doctor', 'clinic', 'health', 'medical', 'pharmacy', 'wellness'],
  transport: ['transport', 'taxi', 'ride', 'moving', 'delivery', 'courier'],
  repairs: ['mechanic', 'plumber', 'electrician', 'repair', 'maintenance', 'carpenter', 'painting'],
  beauty: ['barber', 'beauty', 'hair', 'salon', 'spa'],
  food: ['food', 'restaurant', 'catering', 'kitchen', 'bakery'],
  government: ['government', 'council', 'municipal', 'public service', 'office'],
  emergency: ['emergency', 'police', 'fire', 'ambulance', 'safety'],
  professional: ['professional', 'legal', 'accounting', 'consulting', 'tutor', 'education'],
}

const serviceCategories: DirectoryCategory[] = [
  { key: 'health', label: 'Health', icon: HeartPulse, detail: 'Clinics, pharmacies, and health support' },
  { key: 'transport', label: 'Transport', icon: Truck, detail: 'Taxis, moving help, and delivery support' },
  { key: 'repairs', label: 'Repairs', icon: Wrench, detail: 'Plumbing, electrical, mechanics, and fixes' },
  { key: 'beauty', label: 'Beauty', icon: Sparkles, detail: 'Barbers, salons, and personal care' },
  { key: 'food', label: 'Food', icon: UtensilsCrossed, detail: 'Caterers, kitchens, and food services' },
  { key: 'government', label: 'Government', icon: Building2, detail: 'Council offices and public service points' },
  { key: 'emergency', label: 'Emergency', icon: ShieldPlus, detail: 'Police, urgent contacts, and safety help' },
  { key: 'professional', label: 'Professional Services', icon: ShieldCheck, detail: 'Tutors, consultants, and practical expertise' },
]

function matchesCategoryText(text: string, category: string) {
  if (category === 'all') return true
  const aliases = categoryAliases[category] ?? [category]
  return aliases.some((alias) => text.includes(alias))
}

function buildProviderHaystack(provider: Provider) {
  return [
    provider.category,
    provider.subcategory,
    provider.description,
    ...(provider.services?.map((service) => service.name) ?? []),
    ...(provider.services?.map((service) => service.description ?? '') ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function buildDirectoryHaystack(item: Organization) {
  return [
    item.name,
    item.category,
    item.subcategory,
    item.description,
    ...(item.services_offered ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

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

  const user = useAuthStore((state) => state.user)
  const preferencesQuery = usePreferences()
  const locationLabel = [user?.default_area ?? preferencesQuery.data?.default_area ?? (area === 'all' ? undefined : area), town]
    .filter(Boolean)
    .join(', ')

  const providerQuery = useProviders({
    ...(search ? { search } : {}),
    town,
    ...(area !== 'all' ? { area } : {}),
    ...(verifiedOnly ? { verified: 1 } : {}),
    ...(bookableOnly ? { bookable: 1 } : {}),
    ...(openOnly ? { open_now: 1 } : {}),
    sort: sortBy,
  })

  const directoryQuery = useDirectory({
    ...(search ? { search } : {}),
    ...(area !== 'all' ? { area } : {}),
    town,
    public_service: 1,
    ...(verifiedOnly ? { verified: 1 } : {}),
  })

  const providers = useMemo(() => {
    const items = [...(providerQuery.data?.data ?? [])].filter((provider) => {
      const haystack = buildProviderHaystack(provider)
      return matchesCategoryText(haystack, category)
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
  }, [category, providerQuery.data?.data, sortBy])

  const featuredProviders = useMemo(
    () => providers.filter((provider) => provider.is_verified || Number(provider.rating ?? 0) >= 4).slice(0, 3),
    [providers],
  )

  const nearbyProviders = useMemo(
    () => providers.filter((provider) => !featuredProviders.some((featured) => featured.id === provider.id)),
    [featuredProviders, providers],
  )

  const publicServices = useMemo(
    () => (directoryQuery.data?.data ?? []).filter((item) => matchesCategoryText(buildDirectoryHaystack(item), category)).slice(0, 6),
    [category, directoryQuery.data?.data],
  )

  const activeFilters = [
    category !== 'all' ? serviceCategories.find((item) => item.key === category)?.label ?? category : null,
    area !== 'all' ? area : null,
    verifiedOnly ? 'Verified only' : null,
    bookableOnly ? 'Bookable' : null,
    openOnly ? 'Open now' : null,
  ]
    .filter(Boolean)
    .join(' | ')

  const resetFilters = () => {
    setCategory('all')
    setSearch('')
    setArea('all')
    setVerifiedOnly(false)
    setBookableOnly(false)
    setOpenOnly(false)
    setSortBy('nearest')
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.20),transparent_24%),radial-gradient(circle_at_top_left,rgba(22,163,74,0.18),transparent_28%),linear-gradient(135deg,#0f172a_0%,#162032_45%,#1d4ed8_100%)] p-6 text-white shadow-card md:p-7">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">Find Local Services</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Trusted local help across {locationLabel || PILOT_TOWN}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
              Discover verified businesses, professionals, public service points, and useful contacts with quicker filters and clearer trust cues.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Verified providers</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Public services</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">Distance-aware</span>
            </div>
          </div>
          <Card variant="dashboard" className="space-y-4 bg-white/95 p-5 text-lokals-charcoal">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Search and filter</p>
              <h2 className="mt-1 text-xl font-semibold">Quick local discovery</h2>
            </div>
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="services"
              suggestions={['Clinic near Nau-Aib', 'Taxi and transport', 'Verified electrician', 'Emergency contact']}
              shortcuts={[
                { label: 'Verified', value: 'verified services' },
                { label: 'Open now', value: 'open now' },
                { label: 'Nearby', value: 'services near me' },
              ]}
              placeholder="Search businesses, professionals, and contacts..."
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={area} onChange={(event) => setArea(event.target.value)}>
                <option value="all">All Okahandja areas</option>
                {OKAHANDJA_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
              <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="nearest">Nearest first</option>
                <option value="price_low">Lowest price</option>
                <option value="top_rated">Top rated</option>
                <option value="popular">Popular in your area</option>
                <option value="recent">Recently added</option>
              </Select>
            </div>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Quick categories</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Start with the service type you need</h2>
          </div>
          <button type="button" onClick={() => setCategory('all')} className="text-sm font-semibold text-lokals-purple">Clear</button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className={`rounded-[24px] border p-4 text-left shadow-card transition hover:-translate-y-0.5 ${
                category === item.key
                  ? 'border-lokals-green/30 bg-lokals-green-soft/50'
                  : 'border-lokals-border bg-white'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold text-lokals-charcoal">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-lokals-muted">{item.detail}</p>
            </button>
          ))}
        </div>
      </section>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setVerifiedOnly((value) => !value)}><Pill active={verifiedOnly} label="Verified" /></button>
          <button type="button" onClick={() => setBookableOnly((value) => !value)}><Pill active={bookableOnly} label="Bookable" /></button>
          <button type="button" onClick={() => setOpenOnly((value) => !value)}><Pill active={openOnly} label="Open now" /></button>
          <div className="inline-flex items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm text-lokals-muted shadow-card">
            <SlidersHorizontal className="h-4 w-4 text-lokals-purple" />
            <span>{activeFilters || 'All services'}</span>
          </div>
          <div className="ml-auto">
            <Button variant="secondary" onClick={resetFilters}>Reset filters</Button>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Featured</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Verified and trusted local picks</h2>
        </div>
        {providerQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <ServiceSkeleton key={index} />)}
          </div>
        ) : providerQuery.error ? (
          <EmptyState title="Services unavailable" body="We could not load featured services right now." action={<Button variant="secondary" onClick={() => void providerQuery.refetch()}>Retry</Button>} />
        ) : featuredProviders.length === 0 ? (
          <EmptyState title="No featured services yet" body="Try another search or area to widen the local service pool." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Nearby services</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Businesses and professionals around you</h2>
        </div>
        {providerQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <ServiceSkeleton key={index} />)}
          </div>
        ) : providerQuery.error ? (
          <EmptyState title="Service list unavailable" body="We could not load nearby providers right now." action={<Button variant="secondary" onClick={() => void providerQuery.refetch()}>Retry</Button>} />
        ) : nearbyProviders.length === 0 ? (
          <EmptyState
            title="No services match this search"
            body="Try another category, switch area, or remove one filter to widen your local search."
            action={<Button variant="secondary" onClick={resetFilters}>Show all services</Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nearbyProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Public services</p>
          <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Municipal and useful public contacts</h2>
        </div>
        {directoryQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => <ServiceSkeleton key={index} />)}
          </div>
        ) : directoryQuery.error ? (
          <EmptyState title="Public services unavailable" body="We could not load directory contacts right now." action={<Button variant="secondary" onClick={() => void directoryQuery.refetch()}>Retry</Button>} />
        ) : publicServices.length === 0 ? (
          <EmptyState title="No public services found" body="Public and municipal contacts will appear here when they match your selected filters." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicServices.map((service) => <PublicServiceCard key={service.id} item={service} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function Pill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold transition ${active ? 'bg-lokals-green-soft text-lokals-green' : 'border border-lokals-border bg-white text-lokals-muted'}`}>
      {label}
    </span>
  )
}

function ServiceSkeleton() {
  return (
    <Card variant="service" className="space-y-4 p-5">
      <div className="flex items-start gap-3">
        <LoadingSkeleton className="h-14 w-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton className="h-4 w-24 rounded-full" />
          <LoadingSkeleton className="h-6 w-2/3 rounded-2xl" />
        </div>
      </div>
      <LoadingSkeleton className="h-4 w-full rounded-2xl" />
      <LoadingSkeleton className="h-4 w-4/5 rounded-2xl" />
      <div className="grid gap-2 sm:grid-cols-2">
        <LoadingSkeleton className="h-11 rounded-2xl" />
        <LoadingSkeleton className="h-11 rounded-2xl" />
        <LoadingSkeleton className="h-11 rounded-2xl" />
        <LoadingSkeleton className="h-11 rounded-2xl" />
      </div>
    </Card>
  )
}

function PublicServiceCard({ item }: { item: Organization }) {
  const whatsappHref = getWhatsAppHref(item.whatsapp ?? item.phone, item.name, `Hello ${item.name}, I found your contact on LOKALS and would like more information.`)
  const directionsHref = item.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`
    : null
  const locationLabel = [item.area, item.town, item.location].filter(Boolean).join(', ') || getDisplayDistance(item.distance_km, item.location ?? undefined)
  const availabilityLabel = item.open_now ? 'Open now' : item.availability_status ?? 'Check hours'

  return (
    <Card variant="dashboard" className="h-full p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-lokals-charcoal">{item.name}</p>
            {item.is_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-lokals-green-soft px-2.5 py-1 text-[11px] font-semibold text-lokals-green">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-lokals-muted">{item.subcategory ?? item.category}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-lokals-muted">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-lokals-green" />{locationLabel}</span>
            <span className="rounded-full bg-lokals-green-soft px-2.5 py-1 text-lokals-green">{availabilityLabel}</span>
            {item.rating ? <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-current text-lokals-gold" />{item.rating.toFixed(1)}</span> : null}
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-lokals-muted">{item.description ?? 'Useful local contact with public-facing service details and direct actions.'}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a href={`tel:${item.phone ?? ''}`}>
          <Button variant="secondary" className="w-full" disabled={!item.phone}>
            <Phone className="h-4 w-4" />
            Call
          </Button>
        </a>
        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        ) : <Button variant="secondary" className="w-full" disabled><MessageCircle className="h-4 w-4" />WhatsApp</Button>}
        {directionsHref ? (
          <a href={directionsHref} target="_blank" rel="noreferrer">
            <Button variant="secondary" className="w-full">
              <MapPin className="h-4 w-4" />
              Directions
            </Button>
          </a>
        ) : <Button variant="secondary" className="w-full" disabled><MapPin className="h-4 w-4" />Directions</Button>}
        <Link to={`/directory/${item.id}`}>
          <Button className="w-full">
            <ExternalLink className="h-4 w-4" />
            View details
          </Button>
        </Link>
      </div>
    </Card>
  )
}
