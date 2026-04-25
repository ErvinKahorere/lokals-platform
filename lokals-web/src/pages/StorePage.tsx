import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { BadgeDollarSign, MapPin, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SearchBar, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { isDemoMode } from '../config/appMode'
import { useCreateProduct, useProducts, useSaleAlerts } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'

export function StorePage() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [form, setForm] = useState({ title: '', description: '', category: 'general', town: 'Windhoek', area: 'Katutura', price: '' })
  const [image, setImage] = useState<File | null>(null)
  const productsQuery = useProducts({ ...(search ? { search } : {}), sort: sortBy })
  const saleAlertsQuery = useSaleAlerts()
  const createProduct = useCreateProduct()
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (isDemoMode) {
      setForm({ title: '', description: '', category: 'general', town: 'Windhoek', area: 'Katutura', price: '' })
      setImage(null)
      return
    }
    const payload = new FormData()
    Object.entries(form).forEach(([key, value]) => payload.append(key, value))
    if (image) payload.append('image', image)
    await createProduct.mutateAsync(payload)
    setForm({ title: '', description: '', category: 'general', town: 'Windhoek', area: 'Katutura', price: '' })
    setImage(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Store" title="Products from local sellers and businesses" description="Search by area, browse sale alerts, and make quick enquiries without a full checkout flow." actions={<SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onValueSelect={setSearch} recentKey="store" suggestions={['Sale alerts', 'Groceries near me', 'Health products', 'Home essentials']} shortcuts={[{ label: 'Affordable', value: 'affordable' }, { label: 'Nearby', value: 'nearby' }, { label: 'In stock', value: 'in stock' }]} placeholder="Search products..." className="w-full md:w-80" />} />
      <div className="flex flex-wrap gap-2">
        <Button variant={sortBy === 'recent' ? 'primary' : 'secondary'} onClick={() => setSortBy('recent')}>Recently added</Button>
        <Button variant={sortBy === 'popular' ? 'primary' : 'secondary'} onClick={() => setSortBy('popular')}>Popular in your area</Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-gold/20 text-lokals-charcoal"><Tag className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-lokals-charcoal">Sale alerts</h2>
              <p className="text-sm text-lokals-muted">Promotions and local seller highlights near you.</p>
            </div>
          </div>
          <QueryState isLoading={saleAlertsQuery.isLoading} error={saleAlertsQuery.error} empty={(saleAlertsQuery.data?.data ?? []).length === 0}>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(saleAlertsQuery.data?.data ?? []).slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-[20px] border border-lokals-border bg-white/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Promotion</p>
                  <p className="mt-2 text-lg font-semibold text-lokals-charcoal">{alert.title}</p>
                  <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
                  <p className="mt-3 text-sm font-medium text-lokals-charcoal">{alert.location ?? 'Windhoek'}</p>
                </div>
              ))}
            </div>
          </QueryState>
        </SectionCard>

        <SectionCard className="bg-white">
          <h2 className="text-lg font-semibold text-lokals-charcoal">Quick product post</h2>
          <p className="mt-1 text-sm text-lokals-muted">Keep it short. Upload a photo, confirm the basics, and publish.</p>
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Product title" required />
            <Input value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" required />
            <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" />
            <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Area" />
            <TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={3} />
            <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="block w-full text-sm text-lokals-muted" />
            <Button disabled={createProduct.isPending}>{createProduct.isPending ? 'Publishing product...' : isDemoMode ? 'Simulate product post' : 'Sell product'}</Button>
          </form>
        </SectionCard>
      </section>

      <QueryState isLoading={productsQuery.isLoading} error={productsQuery.error} empty={products.length === 0}>
        {products.length === 0 ? (
          <EmptyState title="No products found nearby" body="Try changing category or location." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <SectionCard key={product.id} className="overflow-hidden bg-white">
                <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-slate-100">
                  {product.image_url ? <img src={resolveMediaUrl(product.image_url) ?? product.image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Product photo</div>}
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-lokals-charcoal">{product.title}</p>
                    <p className="mt-1 text-sm text-lokals-muted">{product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'}</p>
                  </div>
                  <StatusBadge value={product.stock_status ?? 'in stock'} tone="success" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-2xl font-semibold text-lokals-charcoal">
                  <BadgeDollarSign className="h-5 w-5 text-lokals-gold" />
                  <span>{getDisplayPrice(product.sale_price ?? product.price)}</span>
                </div>
                {product.sale_price ? <p className="mt-1 text-sm text-lokals-muted line-through">{getDisplayPrice(product.price)}</p> : null}
                <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{product.description ?? 'Local product listing.'}</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-lokals-muted"><MapPin className="h-4 w-4" />{product.area ?? product.town ?? 'Windhoek'}</div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/store/${product.id}`} className="flex-1"><Button className="w-full">View details</Button></Link>
                  <Button variant="secondary" className="flex-1">Save</Button>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  )
}
