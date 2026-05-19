import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { Clock3, Sparkles, Store, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, ListingCard, PageHeader, QueryState, SearchBar, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useCreateListing, useListings, useProducts } from '../hooks/queries'
import { buildSellerSummaries, commerceQuickFilters, commerceTabs, filterProductsForCommerce, type CommerceQuickFilterKey, type CommerceTabKey } from '../lib/commerce'
import { getDisplayPrice } from '../lib/display'
import type { Product } from '../types'

type QuickDraft = {
  title: string
  description: string
  price: string
  location: string
}

export function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<CommerceTabKey>('food')
  const [quickFilters, setQuickFilters] = useState<Record<CommerceQuickFilterKey, boolean>>({
    open_now: false,
    fast_delivery: false,
    top_rated: false,
    featured_only: false,
  })
  const [quickDraft, setQuickDraft] = useState<QuickDraft>({
    title: '',
    description: '',
    price: '',
    location: 'Okahandja',
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const productsQuery = useProducts({
    ...(activeTab !== 'nearby' && activeTab !== 'popular' ? { commerce_category: activeTab } : {}),
    ...(quickFilters.open_now ? { open_now: 1 } : {}),
    ...(quickFilters.fast_delivery ? { fast_delivery: 1 } : {}),
    ...(quickFilters.featured_only ? { featured_only: 1 } : {}),
    ...(quickFilters.top_rated ? { sort: 'top_rated' } : activeTab === 'popular' ? { popular_only: 1, sort: 'popular' } : {}),
  })
  const listingsQuery = useListings(search ? { search } : undefined)
  const createListing = useCreateListing()

  const commerceProducts = useMemo(
    () => filterProductsForCommerce(productsQuery.data?.data ?? [], activeTab, search),
    [productsQuery.data, activeTab, search],
  )
  const sellerSummaries = useMemo(() => buildSellerSummaries(commerceProducts), [commerceProducts])
  const trendingStores = sellerSummaries.filter((seller) => seller.isPopular || seller.fastDelivery).slice(0, 8)
  const featuredBusinesses = sellerSummaries.filter((seller) => seller.isFeatured).slice(0, 5)
  const featuredItems = commerceProducts.filter((product) => product.is_featured || product.sale_price || product.fast_delivery).slice(0, 8)
  const nearbyItems = commerceProducts.slice(0, 8)
  const legacyListings = listingsQuery.data?.data ?? []

  const submitQuickListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccessMessage(null)
    const payload = new FormData()
    payload.append('type', 'product')
    payload.append('title', quickDraft.title)
    payload.append('description', quickDraft.description)
    payload.append('price', quickDraft.price)
    payload.append('currency', 'NAD')
    payload.append('location', quickDraft.location)
    payload.append('status', 'published')
    await createListing.mutateAsync(payload as unknown as Record<string, unknown>)
    setSuccessMessage('Local listing posted. It will appear in the marketplace board shortly.')
    setQuickDraft({ title: '', description: '', price: '', location: 'Okahandja' })
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.14),_transparent_32%),linear-gradient(135deg,#ffffff,#f8fafc,#f5f3ff)] p-6 shadow-card">
        <PageHeader
          eyebrow="Commerce"
          title="Order your city"
          description="Food, groceries, and local shop delivery with compact discovery, faster decisions, and less noise."
          actions={
            <div className="w-full md:w-[360px]">
              <SearchBar
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onValueSelect={setSearch}
                recentKey="commerce-marketplace"
                suggestions={['Burgers', 'Fresh produce', 'Pharmacy', 'Fast delivery']}
                shortcuts={[{ label: 'Fast delivery', value: 'fast delivery' }, { label: 'Popular in Okahandja', value: 'popular okahandja' }]}
                placeholder="Search stores, food, groceries..."
              />
            </div>
          }
        />
        <div className="mt-5 flex flex-wrap gap-2">
          {commerceTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-lokals-charcoal text-white shadow-card' : 'bg-white text-lokals-charcoal ring-1 ring-black/5 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {commerceQuickFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setQuickFilters((current) => ({ ...current, [filter.key]: !current[filter.key] }))}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${quickFilters[filter.key] ? 'bg-lokals-green text-white' : 'bg-white text-lokals-muted ring-1 ring-black/5 hover:bg-slate-50'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Trending Stores</p>
              <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Popular around Okahandja</h2>
            </div>
            <StatusBadge value={`${trendingStores.length} stores`} tone="success" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {trendingStores.map((seller) => (
              <Link key={seller.id} to={seller.sellerId ? `/store?seller=${seller.sellerId}` : '/store'} className="overflow-hidden rounded-[24px] border border-lokals-border bg-[linear-gradient(135deg,#ffffff,#f8fafc,#ecfdf3)] p-4 transition hover:-translate-y-0.5 hover:border-lokals-green/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{seller.sellerName}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{seller.subtitle}</p>
                  </div>
                  <StatusBadge value={seller.availabilityStatus} tone={seller.openNow ? 'success' : 'neutral'} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-lokals-muted">
                  <span>{seller.rating.toFixed(1)} rating</span>
                  <span>{seller.etaMinutes} min</span>
                  <span>{getDisplayPrice(seller.deliveryFee, 'N$')} delivery</span>
                </div>
              </Link>
            ))}
            {!trendingStores.length ? <p className="text-sm text-lokals-muted">Trending stores will appear here as orderable products grow.</p> : null}
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Featured businesses</h2>
              <p className="text-sm text-lokals-muted">Trusted, visible, and ready for quick conversion.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {featuredBusinesses.map((seller) => (
              <Link key={seller.id} to={seller.sellerId ? `/store?seller=${seller.sellerId}` : '/store'} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-slate-50 px-4 py-4 transition hover:border-lokals-purple/20 hover:bg-white">
                <div>
                  <p className="font-semibold text-lokals-charcoal">{seller.sellerName}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{seller.productCount} items | {seller.town ?? 'Okahandja'}</p>
                </div>
                <StatusBadge value={seller.fastDelivery ? 'Fast' : 'Featured'} tone={seller.fastDelivery ? 'success' : 'accent'} />
              </Link>
            ))}
            {!featuredBusinesses.length ? <p className="text-sm text-lokals-muted">Featured businesses will show up here once products are linked to storefronts.</p> : null}
          </div>
        </SectionCard>
      </div>

      <SectionCard className="bg-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Recommended Near You</p>
            <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Compact cards, fast decisions</h2>
          </div>
          <Link to="/store" className="text-sm font-semibold text-lokals-purple">Open storefront</Link>
        </div>
        <QueryState isLoading={productsQuery.isLoading} error={productsQuery.error} empty={nearbyItems.length === 0}>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {(featuredItems.length ? featuredItems : nearbyItems).map((product: Product) => (
              <Link key={product.id} to={`/store/${product.id}`} className="overflow-hidden rounded-[24px] border border-lokals-border bg-white transition hover:-translate-y-0.5 hover:border-lokals-green/30">
                <div className="aspect-[5/4] overflow-hidden bg-slate-100">
                  {product.hero_image_url || product.image_url ? <img src={product.hero_image_url ?? product.image_url ?? ''} alt={product.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'}</p>
                    </div>
                    {product.fast_delivery ? <StatusBadge value="Fast" tone="success" /> : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-lokals-muted">
                    <span>{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                    {product.delivery_eta_minutes ? <span>{product.delivery_eta_minutes} min</span> : null}
                    {product.delivery_fee ? <span>{getDisplayPrice(product.delivery_fee, 'N$')} delivery</span> : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </QueryState>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Fast delivery and popular picks</h2>
              <p className="text-sm text-lokals-muted">A mobile-first row of strong, high-intent options.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {nearbyItems.slice(0, 6).map((product) => (
              <Link key={product.id} to={`/store/${product.id}`} className="rounded-[20px] border border-lokals-border bg-slate-50 p-4 transition hover:border-lokals-green/25 hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{product.business?.name ?? product.user?.business_name ?? 'Local seller'}</p>
                  </div>
                  <StatusBadge value={product.availability_status ?? 'Available'} tone={product.open_now ? 'success' : 'neutral'} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-lokals-muted">
                  <span>{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</span>
                  {product.rating ? <span>{Number(product.rating).toFixed(1)} rating</span> : null}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lokals-charcoal">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Local listings board</h2>
              <p className="text-sm text-lokals-muted">The original marketplace board is still here for non-orderable local supply.</p>
            </div>
          </div>
          <QueryState isLoading={listingsQuery.isLoading} error={listingsQuery.error}>
            <div className="mt-4 space-y-3">
              {legacyListings.slice(0, 3).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
              {!legacyListings.length ? (
                <EmptyState
                  title="No local listings yet"
                  body="As residents and sellers publish non-store listings, they will show up here."
                />
              ) : null}
            </div>
          </QueryState>
        </SectionCard>
      </div>

      <SectionCard className="bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-lokals-charcoal">Quick listing post</h2>
            <p className="text-sm text-lokals-muted">The older marketplace publish flow stays available for non-commerce listings.</p>
          </div>
        </div>
        {successMessage ? <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{successMessage}</div> : null}
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={submitQuickListing}>
          <Input value={quickDraft.title} onChange={(event) => setQuickDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Listing title" required />
          <Input value={quickDraft.price} onChange={(event) => setQuickDraft((current) => ({ ...current, price: event.target.value }))} placeholder="Price in NAD" required />
          <Input value={quickDraft.location} onChange={(event) => setQuickDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Town or suburb" required />
          <div className="md:col-span-2">
            <TextArea value={quickDraft.description} onChange={(event) => setQuickDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Short listing description" rows={3} required />
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button disabled={createListing.isPending}>{createListing.isPending ? 'Posting...' : 'Post listing'}</Button>
            <Link to="/store"><Button variant="secondary">Browse storefront</Button></Link>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
