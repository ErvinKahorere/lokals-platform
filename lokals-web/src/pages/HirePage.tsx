import { Clock3, PackageOpen, ShieldCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, PageHeader, QueryState, SearchBar, SectionCard, StatusBadge } from '../components/Ui'
import { useHireItems } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'
import type { HireItemRecord } from '../types'

const hireCategories = ['all', 'events', 'tools', 'equipment', 'household', 'cameras', 'trailers']

function getPricingLabel(item: HireItemRecord) {
  if (item.prices?.price_per_day) {
    return `${getDisplayPrice(item.prices.price_per_day, 'N$')} / day`
  }

  if (item.prices?.price_per_hour) {
    return `${getDisplayPrice(item.prices.price_per_hour, 'N$')} / hour`
  }

  return 'Price on request'
}

export function HirePage() {
  const user = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [deliveryOnly, setDeliveryOnly] = useState(false)
  const itemsQuery = useHireItems({
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(activeCategory !== 'all' ? { category: activeCategory } : {}),
    ...(deliveryOnly ? { delivery_available: 1 } : {}),
  })

  const items = itemsQuery.data?.data ?? []
  const availableCount = items.filter((item) => item.availability_summary?.available !== false).length
  const deliveryCount = items.filter((item) => item.delivery_available).length
  const highlighted = items.slice(0, 3)

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="Hire"
        title="Hire & rentals"
        description="Browse local event gear, tools, generators, and practical rentals without mixing them into parcel delivery or store orders."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/hire/bookings"><Button variant="secondary">My bookings</Button></Link>
            {user ? <Link to="/hire/my-items"><Button>List an item</Button></Link> : null}
          </div>
        }
      />

      <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.16),_transparent_30%),linear-gradient(135deg,#ffffff,#f8fafc,#eff6ff)] p-6 shadow-card">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Local rentals</p>
            <h2 className="mt-2 text-3xl font-semibold text-lokals-charcoal">Reserve the things people only need sometimes</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-lokals-muted">Chairs, sound systems, trailers, tools, and event equipment can now be listed as hire items with simple availability checks and owner approval.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {hireCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === category ? 'bg-lokals-charcoal text-white' : 'bg-white text-lokals-charcoal ring-1 ring-black/5'
                  }`}
                >
                  {category === 'all' ? 'All' : category.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDeliveryOnly((current) => !current)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  deliveryOnly ? 'bg-lokals-green text-white' : 'bg-white text-lokals-charcoal ring-1 ring-black/5'
                }`}
              >
                Delivery available
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="hire-market"
              suggestions={['Generator', 'Chairs', 'Tent', 'Sound system']}
              shortcuts={[{ label: 'Events', value: 'events' }, { label: 'Tools', value: 'tools' }]}
              placeholder="Search hire items, categories, or equipment..."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <SectionCard className="bg-white/90 p-4">
                <p className="text-sm text-lokals-muted">Live items</p>
                <p className="mt-1 text-2xl font-semibold text-lokals-charcoal">{items.length}</p>
              </SectionCard>
              <SectionCard className="bg-white/90 p-4">
                <p className="text-sm text-lokals-muted">Available now</p>
                <p className="mt-1 text-2xl font-semibold text-lokals-charcoal">{availableCount}</p>
              </SectionCard>
              <SectionCard className="bg-white/90 p-4">
                <p className="text-sm text-lokals-muted">With delivery</p>
                <p className="mt-1 text-2xl font-semibold text-lokals-charcoal">{deliveryCount}</p>
              </SectionCard>
            </div>
          </div>
        </div>
      </section>

      {highlighted.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {highlighted.map((item) => (
            <Link key={item.id} to={`/hire/${item.id}`} className="block overflow-hidden rounded-[28px] border border-lokals-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-lokals-green/25">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">{item.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-lokals-charcoal">{item.title}</h3>
                </div>
                <StatusBadge value={item.verification_status ?? 'pending'} tone={item.verification_status === 'approved' ? 'success' : 'warning'} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-lokals-muted">{item.description ?? 'Ready for local rental bookings.'}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-lokals-muted">
                <span>{getPricingLabel(item)}</span>
                <span>{item.town ?? 'Okahandja'}</span>
                {item.availability_summary?.next_available_at ? <span>Next free {new Date(item.availability_summary.next_available_at).toLocaleDateString()}</span> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      <QueryState isLoading={itemsQuery.isLoading} error={itemsQuery.error} empty={items.length === 0}>
        {items.length === 0 ? (
          <EmptyState
            title="No hire items yet"
            body="Once owners list chairs, tools, equipment, and event gear, they will show up here with availability and pricing."
            action={user ? <Link to="/hire/my-items"><Button>List the first item</Button></Link> : undefined}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} to={`/hire/${item.id}`} className="group block rounded-[28px] border border-lokals-border bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-lokals-green/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-green">{item.category}</p>
                    <h3 className="mt-2 text-xl font-semibold text-lokals-charcoal">{item.title}</h3>
                    <p className="mt-1 text-sm text-lokals-muted">{item.business?.name ?? item.owner?.name ?? 'Local owner'} | {item.area ?? item.town ?? 'Okahandja'}</p>
                  </div>
                  <StatusBadge
                    value={item.availability_summary?.requested_window_available === false ? 'Booked' : item.availability_summary?.available === false ? 'Unavailable' : 'Available'}
                    tone={item.availability_summary?.available === false ? 'warning' : 'success'}
                  />
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-lokals-muted">{item.description ?? 'Ready for local rentals.'}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <p className="text-sm text-lokals-muted">Rental price</p>
                    <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{getPricingLabel(item)}</p>
                  </div>
                  <div className="rounded-[22px] bg-slate-50 p-4">
                    <p className="text-sm text-lokals-muted">Deposit</p>
                    <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{getDisplayPrice(item.deposit ?? 0, 'N$')}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-lokals-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2"><Clock3 className="h-4 w-4" /> {item.bookings_count ?? 0} bookings</span>
                  {item.delivery_available ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700"><Truck className="h-4 w-4" /> Delivery available</span> : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-2 text-lokals-purple"><ShieldCheck className="h-4 w-4" /> {item.verification_status ?? 'pending'}</span>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-lokals-green group-hover:text-lokals-charcoal">View item details</span>
                  <PackageOpen className="h-5 w-5 text-lokals-green" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
