import { useMemo, useState } from 'react'
import { Clock3, MapPin, Star, Truck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, ProductCard, QueryState, SearchBar, SectionCard, StatusBadge } from '../components/Ui'
import { useProducts } from '../hooks/queries'
import { buildSellerSummaries, normalizeCommerceCategory } from '../lib/commerce'
import { getDisplayPrice } from '../lib/display'
import { addProductToOrderCart, useOrderCart } from '../lib/orderCart'

const storeTabs = [
  { key: 'products', label: 'Menu / Products' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'about', label: 'About' },
  { key: 'delivery', label: 'Delivery info' },
] as const

export function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<(typeof storeTabs)[number]['key']>('products')
  const productsQuery = useProducts({ per_page: 48 })
  const cart = useOrderCart()
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data?.data])
  const sellers = useMemo(() => buildSellerSummaries(products), [products])
  const selectedSellerId = Number(searchParams.get('seller') ?? 0) || null
  const selectedSeller = sellers.find((seller) => seller.sellerId === selectedSellerId) ?? sellers[0] ?? null
  const sellerProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (selectedSeller?.sellerId) {
        return product.business?.id === selectedSeller.sellerId
      }
      return true
    })
    if (!search.trim()) return filtered
    const query = search.trim().toLowerCase()
    return filtered.filter((product) => [product.title, product.description, product.category].some((value) => String(value ?? '').toLowerCase().includes(query)))
  }, [products, selectedSeller, search])
  const categories = Array.from(new Set(sellerProducts.map((product) => product.category).filter(Boolean) as string[]))
  const featuredItems = sellerProducts.filter((product) => product.is_featured || product.sale_price).slice(0, 4)
  const popularItems = sellerProducts.filter((product) => product.is_popular || product.fast_delivery).slice(0, 6)
  const menuSections = categories.length ? categories : ['All products']

  return (
    <div className="space-y-6 pb-28">
      <PageHeader
        eyebrow="Storefront"
        title={selectedSeller?.sellerName ?? 'Local Storefront'}
        description="A cleaner commerce flow for local food, groceries, and shop orders."
        actions={
          <div className="w-full md:w-[320px]">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="commerce-store"
              suggestions={['Popular items', 'Family meal', 'Fresh produce', 'Home goods']}
              shortcuts={[{ label: 'Featured', value: 'featured' }, { label: 'Fast delivery', value: 'fast' }]}
              placeholder="Search this store..."
            />
          </div>
        }
      />

      <QueryState isLoading={productsQuery.isLoading} error={productsQuery.error} empty={!products.length}>
        {!selectedSeller ? (
          <EmptyState title="No storefronts yet" body="As local sellers connect products to their businesses, storefronts will appear here." />
        ) : (
          <>
            <section className="overflow-hidden rounded-[32px] border border-lokals-border bg-white shadow-card">
              <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.22),_transparent_35%),linear-gradient(135deg,#0f172a,#1e293b,#16a34a)]">
                {selectedSeller.heroImageUrl ? <img src={selectedSeller.heroImageUrl} alt={selectedSeller.sellerName} className="absolute inset-0 h-full w-full object-cover opacity-35" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <StatusBadge value={selectedSeller.availabilityStatus} tone={selectedSeller.openNow ? 'success' : 'neutral'} className="bg-white/15 text-white ring-0" />
                      <h1 className="mt-3 text-3xl font-semibold">{selectedSeller.sellerName}</h1>
                      <p className="mt-2 max-w-2xl text-sm text-white/80">{selectedSeller.subtitle} in {[selectedSeller.area, selectedSeller.town].filter(Boolean).join(', ') || 'Okahandja'}.</p>
                    </div>
                    <div className="grid gap-2 rounded-[24px] bg-white/12 p-4 backdrop-blur">
                      <div className="flex items-center gap-2 text-sm"><Star className="h-4 w-4" /> {selectedSeller.rating.toFixed(1)} rating</div>
                      <div className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4" /> {getDisplayPrice(selectedSeller.deliveryFee, 'N$')} delivery</div>
                      <div className="flex items-center gap-2 text-sm"><Clock3 className="h-4 w-4" /> {selectedSeller.etaMinutes} min estimate</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {sellers.map((seller) => (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => setSearchParams((current) => {
                    const next = new URLSearchParams(current)
                    if (seller.sellerId) next.set('seller', String(seller.sellerId))
                    return next
                  })}
                  className={`min-w-[220px] rounded-[24px] border px-4 py-4 text-left transition ${selectedSeller.id === seller.id ? 'border-lokals-green bg-emerald-50' : 'border-lokals-border bg-white hover:border-lokals-purple/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{seller.sellerName}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{seller.productCount} items</p>
                    </div>
                    {seller.fastDelivery ? <StatusBadge value="Fast" tone="success" /> : null}
                  </div>
                </button>
              ))}
            </div>

            <div className="sticky top-[72px] z-10 flex flex-wrap gap-2 rounded-[24px] border border-lokals-border bg-white/90 p-3 shadow-card backdrop-blur">
              {storeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-lokals-green text-white' : 'bg-slate-100 text-lokals-charcoal'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'products' ? (
              <div className="space-y-6">
                <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                  <SectionCard className="bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Featured Items</p>
                        <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Best conversions first</h2>
                      </div>
                      <StatusBadge value={`${sellerProducts.length} products`} tone="accent" />
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {(featuredItems.length ? featuredItems : sellerProducts.slice(0, 4)).map((product) => (
                        <div key={product.id} className="rounded-[24px] border border-lokals-border bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                              <p className="mt-1 text-sm text-lokals-muted">{getDisplayPrice(product.sale_price ?? product.price, 'N$')}</p>
                            </div>
                            {product.fast_delivery ? <StatusBadge value="Fast" tone="success" /> : null}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button className="flex-1" onClick={() => addProductToOrderCart(product, 1)}>Quick add</Button>
                            <Link to={`/store/${product.id}`} className="flex-1"><Button variant="secondary" className="w-full">Open</Button></Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard className="bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-green">Popular Items</p>
                        <h2 className="mt-1 text-xl font-semibold text-lokals-charcoal">Quick add momentum</h2>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {(popularItems.length ? popularItems : sellerProducts.slice(0, 5)).map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-[20px] border border-lokals-border bg-slate-50 px-4 py-4">
                          <div>
                            <p className="font-semibold text-lokals-charcoal">{product.title}</p>
                            <p className="mt-1 text-sm text-lokals-muted">{normalizeCommerceCategory(product.commerce_category ?? product.category)} | {getDisplayPrice(product.sale_price ?? product.price, 'N$')}</p>
                          </div>
                          <Button variant="secondary" onClick={() => addProductToOrderCart(product, 1)}>Add</Button>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {menuSections.map((section) => {
                  const sectionItems = section === 'All products'
                    ? sellerProducts
                    : sellerProducts.filter((product) => product.category === section)

                  if (!sectionItems.length) return null

                  return (
                    <SectionCard key={section} className="bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-lokals-charcoal">{section}</h2>
                          <p className="text-sm text-lokals-muted">Sticky quick-add interactions keep the flow moving.</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {sectionItems.map((product) => <ProductCard key={product.id} product={product} />)}
                      </div>
                    </SectionCard>
                  )
                })}
              </div>
            ) : null}

            {activeTab === 'reviews' ? (
              <SectionCard className="bg-white">
                <div className="grid gap-4 lg:grid-cols-[0.65fr_1.35fr]">
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-sm text-lokals-muted">Average rating</p>
                    <p className="mt-2 text-4xl font-semibold text-lokals-charcoal">{selectedSeller.rating.toFixed(1)}</p>
                    <p className="mt-2 text-sm text-lokals-muted">{selectedSeller.reviewCount} local ratings and trust signals</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {['Fast handoff and reliable delivery.', 'Popular for repeat neighborhood orders.', 'Verified local seller with clear response flow.', 'Strong product mix for everyday city commerce.'].map((line) => (
                      <div key={line} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                        <p className="font-medium text-lokals-charcoal">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {activeTab === 'about' ? (
              <SectionCard className="bg-white">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Store summary</p>
                    <p className="mt-3 text-base leading-7 text-lokals-muted">{selectedSeller.sellerName} serves {selectedSeller.town ?? 'Okahandja'} with a modern local-commerce flow built around compact cards, quick add, and order delivery.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Category</p>
                      <p className="mt-2 font-semibold text-lokals-charcoal">{selectedSeller.subtitle}</p>
                    </div>
                    <div className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">Location</p>
                      <p className="mt-2 inline-flex items-center gap-2 font-semibold text-lokals-charcoal"><MapPin className="h-4 w-4" /> {[selectedSeller.area, selectedSeller.town].filter(Boolean).join(', ') || 'Okahandja'}</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {activeTab === 'delivery' ? (
              <SectionCard className="bg-white">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-sm text-lokals-muted">Estimated delivery</p>
                    <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{selectedSeller.etaMinutes} min</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-sm text-lokals-muted">Delivery fee</p>
                    <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{getDisplayPrice(selectedSeller.deliveryFee, 'N$')}</p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-5">
                    <p className="text-sm text-lokals-muted">Availability</p>
                    <p className="mt-2 text-2xl font-semibold text-lokals-charcoal">{selectedSeller.availabilityStatus}</p>
                  </div>
                </div>
              </SectionCard>
            ) : null}

            {cart.totalItems ? (
              <div className="fixed bottom-6 left-1/2 z-20 w-[min(680px,calc(100%-24px))] -translate-x-1/2 rounded-[24px] bg-lokals-charcoal px-5 py-4 text-white shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/70">{cart.totalItems} item{cart.totalItems === 1 ? '' : 's'} in cart</p>
                    <p className="text-lg font-semibold">{getDisplayPrice(cart.subtotal, 'N$')} subtotal</p>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/orders"><Button variant="secondary">Track orders</Button></Link>
                    <Link to="/orders/checkout"><Button>Open cart</Button></Link>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </QueryState>
    </div>
  )
}
