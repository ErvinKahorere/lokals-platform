import { MapPin, PackageCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, PageHeader, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { SaveButton } from '../components/experience/SaveButton'
import { useProduct, useProducts } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'

export function ProductDetailsPage() {
  const { id } = useParams()
  const productQuery = useProduct(id)
  const productsQuery = useProducts()
  const product = productQuery.data
  const related = (productsQuery.data?.data ?? []).filter((item) => item.id !== product?.id).slice(0, 3)

  return (
    <QueryState isLoading={productQuery.isLoading || productsQuery.isLoading} error={productQuery.error ?? productsQuery.error} empty={!product}>
      {!product ? (
        <EmptyState title="Product not found" body="This product may have sold out or been removed." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Store" title={product.title} description={product.description ?? 'Local product listing.'} />
          <SectionCard className="overflow-hidden bg-white p-0">
            <div className="relative aspect-[16/8] bg-[linear-gradient(135deg,#e2e8f0,#cbd5e1,#f8fafc)]">
              {product.image_url ? <img src={resolveMediaUrl(product.image_url) ?? product.image_url} alt={product.title} className="h-full w-full object-cover" loading="lazy" /> : null}
              <div className="absolute right-4 top-4">
                <SaveButton label={product.title} />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <StatusBadge value={product.category ?? 'Product'} tone="accent" />
                  <p className="mt-3 text-2xl font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
                  {product.sale_price ? <p className="mt-1 text-sm text-lokals-muted line-through">{getDisplayPrice(product.price)}</p> : null}
                </div>
                <StatusBadge value={product.stock_status ?? 'in stock'} tone="success" />
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Seller</p>
                  <p className="mt-2 font-semibold text-lokals-charcoal">{product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{product.category ?? 'Local goods'}</p>
                  <Link to="/store" className="mt-3 inline-flex text-sm font-semibold text-lokals-green">View seller</Link>
                </div>
                <div className="rounded-[20px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Location</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal"><MapPin className="h-4 w-4 text-lokals-purple" />{product.area ?? product.town ?? 'Windhoek'}</p>
                  <p className="mt-1 inline-flex items-center gap-2 text-sm text-lokals-muted"><PackageCheck className="h-4 w-4 text-lokals-green" />{product.stock_status ?? 'In stock'}</p>
                </div>
              </div>
              <div className="mt-5">
                <ContactActions name={product.title} phone={product.business?.phone ?? product.user?.phone ?? undefined} className="grid gap-2 sm:grid-cols-3" />
              </div>
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Related products</h2>
              <Link to="/store" className="text-sm font-semibold text-lokals-green">Back to store</Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} to={`/store/${item.id}`} className="rounded-[20px] border border-lokals-border p-4 transition hover:-translate-y-0.5">
                  <p className="font-semibold text-lokals-charcoal">{item.title}</p>
                  <p className="mt-1 text-sm text-lokals-muted">{getDisplayPrice(item.sale_price ?? item.price)}</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
