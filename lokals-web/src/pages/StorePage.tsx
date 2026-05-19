import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Megaphone, ShoppingBag, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, ProductCard, QueryState, SearchBar, SectionCard, Select, StatusBadge, TextArea } from '../components/Ui'
import { isDemoMode } from '../config/appMode'
import { useCreateProduct, useProducts, useSaleAlerts } from '../hooks/queries'
import { getDisplayPrice } from '../lib/display'
import { useOrderCart } from '../lib/orderCart'
import type { Product } from '../types'

const categories = ['all', 'electronics', 'home', 'vehicles', 'clothing', 'food', 'services', 'more'] as const
type SaleAlertCard = {
  id: number | string
  title?: string | null
  body?: string | null
  location?: string | null
}

export function StorePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('all')
  const [town, setTown] = useState('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_low_high' | 'price_high_low'>('newest')
  const [saleOnly, setSaleOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', category: 'electronics', town: 'Okahandja', area: 'Central Okahandja', price: '' })
  const [image, setImage] = useState<File | null>(null)
  const [successProduct, setSuccessProduct] = useState<Product | null>(null)

  const productsQuery = useProducts({
    ...(search ? { search } : {}),
    ...(category !== 'all' && category !== 'more' ? { category } : {}),
    ...(town !== 'all' ? { town } : {}),
    ...(saleOnly ? { sale_items: 1 } : {}),
    ...(verifiedOnly ? { verified_sellers: 1 } : {}),
    sort: sortBy,
  })
  const saleAlertsQuery = useSaleAlerts()
  const createProduct = useCreateProduct()
  const cart = useOrderCart()
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data])
  const featured = useMemo(() => products.filter((item) => item.sale_price || item.business?.is_verified).slice(0, 4), [products])
  const recent = useMemo(() => [...products].sort((a, b) => b.id - a.id).slice(0, 6), [products])
  const localSellers = useMemo(() => {
    const sellers = new Map<string, { id?: number; name: string; location: string; count: number; verified: boolean }>()
    for (const product of products) {
      const name = product.business?.name ?? product.user?.business_name ?? product.user?.name
      if (!name) continue
      const key = `${product.business?.id ?? product.user?.id ?? name}:${name}`
      const current = sellers.get(key)
      sellers.set(key, {
        id: product.business?.id,
        name,
        location: [product.area, product.town].filter(Boolean).join(', ') || 'Okahandja',
        count: (current?.count ?? 0) + 1,
        verified: Boolean(product.business?.is_verified),
      })
    }
    return Array.from(sellers.values()).sort((a, b) => b.count - a.count).slice(0, 4)
  }, [products])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (step < 2) {
      setStep((current) => current + 1)
      return
    }

    if (isDemoMode) {
      setSuccessProduct({
        id: -1,
        title: form.title || 'Draft product',
        price: form.price || '0',
        description: form.description,
        category: form.category,
        town: form.town,
        area: form.area,
      } as Product)
      return
    }

    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    const response = await createProduct.mutateAsync(payload)
    const product = (response.data ?? response) as Product
    setSuccessProduct(product)
  }

  const resetPost = () => {
    setForm({ title: '', description: '', category: 'electronics', town: 'Okahandja', area: 'Central Okahandja', price: '' })
    setImage(null)
    setStep(0)
    setSuccessProduct(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Store"
        title="Marketplace"
        description="Browse local products, promotions, and trusted sellers nearby."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onValueSelect={setSearch}
              recentKey="store"
              suggestions={['Samsung phone', 'Food voucher', 'Home deals', 'Toyota Hilux']}
              shortcuts={[{ label: 'Electronics', value: 'electronics' }, { label: 'Sale items', value: 'sale' }, { label: 'Home', value: 'home' }]}
              placeholder="Search products..."
              className="w-full md:w-80"
            />
            <Link to="/orders/checkout"><Button>Cart {cart.totalItems ? `(${cart.totalItems})` : ''}</Button></Link>
          </div>
        }
      />

      <SectionCard className="bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">Browse smarter</p>
            <h2 className="mt-1 text-lg font-semibold text-lokals-charcoal">Filter products, sellers, and local deals without losing context</h2>
          </div>
          <span className="rounded-full bg-lokals-purple/10 px-3 py-1.5 text-xs font-semibold text-lokals-purple">{products.length} listings</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-[18px] border px-4 py-2 text-sm font-semibold transition ${
                category === item
                  ? 'border-lokals-purple bg-lokals-purple text-white shadow-card'
                  : 'border-lokals-border bg-lokals-bg text-lokals-charcoal hover:border-lokals-purple/30 hover:bg-white'
              }`}
            >
              {item === 'all' ? 'All' : item === 'more' ? 'More' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Select value={town} onChange={(event) => setTown(event.target.value)}>
            <option value="all">All towns</option>
            <option value="Okahandja">Okahandja</option>
            <option value="Swakopmund">Swakopmund</option>
          </Select>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="newest">Newest</option>
            <option value="price_low_high">Price low-high</option>
            <option value="price_high_low">Price high-low</option>
          </Select>
          <Button variant={saleOnly ? 'primary' : 'secondary'} onClick={() => setSaleOnly((value) => !value)}>Sale items</Button>
          <Button variant={verifiedOnly ? 'primary' : 'secondary'} onClick={() => setVerifiedOnly((value) => !value)}>Verified sellers</Button>
        </div>
      </SectionCard>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Sale Alerts / Promotions</h2>
              <p className="text-sm text-lokals-muted">Fresh discounts and local offers worth checking today.</p>
            </div>
          </div>
          <QueryState isLoading={saleAlertsQuery.isLoading} error={saleAlertsQuery.error} empty={(saleAlertsQuery.data?.data ?? []).length === 0}>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(saleAlertsQuery.data?.data ?? []).slice(0, 4).map((alert: SaleAlertCard) => (
                <div key={alert.id} className="rounded-[22px] border border-lokals-border bg-gradient-to-br from-amber-50 via-white to-violet-50 p-4">
                  <StatusBadge value="Promotion" tone="warning" />
                  <p className="mt-3 text-lg font-semibold text-lokals-charcoal">{alert.title}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-lokals-charcoal">{alert.location ?? 'Okahandja'}</p>
                    <Button variant="secondary" onClick={() => setSaleOnly(true)}>View products</Button>
                  </div>
                </div>
              ))}
            </div>
          </QueryState>
        </SectionCard>

        <SectionCard className="bg-white">
          {successProduct ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-lokals-charcoal">Product published</p>
              <p className="text-sm text-lokals-muted">Your listing is now live in the store.</p>
              <div className="flex gap-2">
                <Link to={successProduct.id > 0 ? `/store/${successProduct.id}` : '/store'} className="flex-1">
                  <Button className="w-full">View Product</Button>
                </Link>
                <Button variant="secondary" className="flex-1" onClick={resetPost}>Back to Store</Button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Post a product</h2>
                  <p className="text-sm text-lokals-muted">Photo first, short details, quick preview, then publish.</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted">
                <span className={step === 0 ? 'text-lokals-purple' : ''}>1. Photo</span>
                <span className={step === 1 ? 'text-lokals-purple' : ''}>2. Details</span>
                <span className={step === 2 ? 'text-lokals-purple' : ''}>3. Preview</span>
              </div>
              {step === 0 ? (
                <div className="rounded-[22px] border border-dashed border-lokals-border bg-slate-50 p-4">
                  <input type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(event.target.files?.[0] ?? null)} className="block w-full text-sm text-lokals-muted" />
                  <p className="mt-3 text-sm text-lokals-muted">{image ? image.name : 'Add a product image or skip for now.'}</p>
                </div>
              ) : null}
              {step === 1 ? (
                <>
                  <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Product title" required />
                  <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price (optional)" />
                  <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={form.town} onChange={(event) => setForm((current) => ({ ...current, town: event.target.value }))} placeholder="Town" />
                    <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Area" />
                  </div>
                  <TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={3} />
                </>
              ) : null}
              {step === 2 ? (
                <div className="rounded-[22px] border border-lokals-border bg-slate-50 p-4">
                  <p className="text-lg font-semibold text-lokals-charcoal">{form.title || 'Untitled product'}</p>
                  <p className="mt-2 text-xl font-bold text-lokals-purple">{form.price ? getDisplayPrice(form.price) : 'Price on request'}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{form.category || 'General'} • {[form.area, form.town].filter(Boolean).join(', ')}</p>
                  <p className="mt-3 text-sm text-lokals-muted">{form.description || 'Add a short description before you publish.'}</p>
                </div>
              ) : null}
              <div className="flex gap-2">
                {step > 0 ? <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep((current) => current - 1)}>Back</Button> : null}
                <Button className="flex-1" disabled={createProduct.isPending || (step === 1 && !form.title.trim())}>
                  {step < 2 ? (step === 0 ? 'Continue' : 'Preview') : createProduct.isPending ? 'Publishing...' : isDemoMode ? 'Preview publish' : 'Publish'}
                </Button>
              </div>
            </form>
          )}
        </SectionCard>
      </section>

      <QueryState isLoading={productsQuery.isLoading} error={productsQuery.error} empty={products.length === 0}>
        {products.length === 0 ? (
          <EmptyState title="No products found in your area." body="Try another category." />
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Featured Listings</h2>
                  <p className="text-sm text-lokals-muted">Highlighted products from trusted local sellers.</p>
                </div>
                <Link to="/store" className="text-sm font-semibold text-lokals-purple">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(featured.length ? featured : products.slice(0, 4)).map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Recent Listings</h2>
                  <p className="text-sm text-lokals-muted">Fresh items from local businesses and sellers.</p>
                </div>
                <Link to="/store" className="text-sm font-semibold text-lokals-purple">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {recent.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-lokals-charcoal">Local Sellers</h2>
                  <p className="text-sm text-lokals-muted">Seller discovery with quick paths into products and business profiles.</p>
                </div>
                <Link to="/directory" className="text-sm font-semibold text-lokals-purple">View all</Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {localSellers.map((seller) => (
                  <SectionCard key={`${seller.name}-${seller.location}`} className="bg-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple">
                      <Store className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-lokals-charcoal">{seller.name}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{seller.location}</p>
                    <p className="mt-2 text-sm font-medium text-lokals-charcoal">{seller.count} live listings</p>
                    <div className="mt-4 flex gap-2">
                      {seller.id ? <Link to={`/directory/${seller.id}`} className="flex-1"><Button variant="secondary" className="w-full">Profile</Button></Link> : null}
                      <Button className="flex-1" onClick={() => setSearch(seller.name)}>View products</Button>
                    </div>
                  </SectionCard>
                ))}
              </div>
            </section>
          </>
        )}
      </QueryState>
    </div>
  )
}
