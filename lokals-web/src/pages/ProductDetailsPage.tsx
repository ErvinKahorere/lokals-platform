import { MapPin, PackageCheck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button, EmptyState, PageHeader, ProductCard, QueryState, SectionCard, StatusBadge } from '../components/Ui'
import { ContactActions } from '../components/experience/ContactActions'
import { SaveButton } from '../components/experience/SaveButton'
import { useCreateFollow, useDeleteFollow, useFollows, useProduct, useProducts, useSaleAlerts } from '../hooks/queries'
import { getDisplayPrice, resolveMediaUrl } from '../lib/display'
import { navigateToLogin } from '../lib/authNavigation'
import { useAuthStore } from '../store/auth'

export function ProductDetailsPage() {
  const { id } = useParams()
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()
  const productQuery = useProduct(id)
  const productsQuery = useProducts()
  const saleAlertsQuery = useSaleAlerts()
  const followsQuery = useFollows(Boolean(token))
  const createFollow = useCreateFollow()
  const deleteFollow = useDeleteFollow()
  const product = productQuery.data
  const related = (productsQuery.data?.data ?? []).filter((item) => item.id !== product?.id && (item.category === product?.category || item.business?.id === product?.business?.id)).slice(0, 4)
  const sellerProducts = (productsQuery.data?.data ?? []).filter((item) => item.id !== product?.id && (item.business?.id === product?.business?.id || item.user?.id === product?.user?.id)).slice(0, 3)
  const sellerAlerts = (saleAlertsQuery.data?.data ?? []).filter((item: any) => product?.business?.id && item.organization_id === product.business.id).slice(0, 2)
  const followId = (followsQuery.data?.data ?? []).find((follow) => follow.followable_type.includes('Organization') && follow.followable_id === product?.business?.id)?.id
  const image = resolveMediaUrl(product?.image_url ?? product?.business?.logo_url ?? product?.user?.avatar ?? null)

  return (
    <QueryState isLoading={productQuery.isLoading || productsQuery.isLoading || saleAlertsQuery.isLoading} error={productQuery.error ?? productsQuery.error ?? saleAlertsQuery.error} empty={!product}>
      {!product ? (
        <EmptyState title="Product not found" body="This product may have sold out or been removed." />
      ) : (
        <div className="space-y-5">
          <PageHeader eyebrow="Store" title={product.title} description={product.description ?? 'Local product listing.'} />
          <SectionCard className="overflow-hidden bg-white p-0">
            <div className="relative aspect-[16/8] bg-[linear-gradient(135deg,#e2e8f0,#f8fafc,#ede9fe)]">
              {image ? <img src={image} alt={product.title} className="h-full w-full object-cover" loading="lazy" /> : null}
              <div className="absolute right-4 top-4">
                <SaveButton label={product.title} itemId={product.id} itemType="product" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={product.category ?? 'Product'} tone="info" />
                    <StatusBadge value={product.stock_status ?? 'in stock'} tone={product.stock_status === 'limited' ? 'warning' : 'success'} />
                    {product.sale_price ? <StatusBadge value="On sale" tone="warning" /> : null}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <p className="text-3xl font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
                    {product.sale_price ? <p className="text-sm text-lokals-muted line-through">{getDisplayPrice(product.price)}</p> : null}
                  </div>
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-lokals-muted">
                    <MapPin className="h-4 w-4 text-lokals-purple" />
                    {[product.area, product.town].filter(Boolean).join(', ') || 'Okahandja'}
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Availability</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-lokals-charcoal">
                    <PackageCheck className="h-4 w-4 text-lokals-green" />
                    {product.stock_status === 'limited' ? 'Limited stock' : product.stock_status === 'out_of_stock' ? 'Out of stock' : 'In stock'}
                  </p>
                  <p className="mt-2 text-sm text-lokals-muted">Condition: Good local listing with direct seller contact.</p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lokals-muted">Description</p>
                <p className="mt-3 text-sm leading-6 text-lokals-muted">{product.description ?? 'This seller has not added extra details yet. Contact them directly for size, condition, and pickup or delivery options.'}</p>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-lokals-border p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Seller'} src={resolveMediaUrl(product.business?.logo_url ?? product.user?.avatar ?? null)} className="h-16 w-16 border border-lokals-border" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-lokals-charcoal">{product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'}</p>
                        {product.business?.is_verified ? <StatusBadge value="Verified" tone="success" /> : null}
                      </div>
                      <p className="mt-2 text-sm text-lokals-muted">{[product.business?.area ?? product.user?.default_area, product.business?.town ?? product.user?.default_town ?? product.user?.location].filter(Boolean).join(', ') || 'Okahandja'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">
                        {product.user?.id ? 'Message, call, or WhatsApp this seller directly.' : 'Replies by call or WhatsApp for now.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.business?.id ? (
                      <Link to={`/directory/${product.business.id}`}>
                        <Button variant="secondary">View Seller Store</Button>
                      </Link>
                    ) : null}
                    {product.business?.id ? (
                      <Button
                        variant={followId ? 'primary' : 'secondary'}
                        disabled={createFollow.isPending || deleteFollow.isPending}
                        onClick={() => {
                          if (!token) {
                            navigateToLogin(navigate)
                            return
                          }
                          followId ? deleteFollow.mutate(followId) : createFollow.mutate({ type: 'organization', id: product.business!.id })
                        }}
                      >
                        {!token ? 'Login to follow' : followId ? 'Following' : 'Follow'}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <ContactActions
                    name={product.business?.name ?? product.user?.business_name ?? product.user?.name ?? product.title}
                    phone={product.business?.phone ?? product.user?.phone ?? undefined}
                    whatsapp={product.business?.whatsapp ?? product.user?.whatsapp ?? product.user?.phone ?? undefined}
                    conversationUserId={product.user?.id}
                    conversationSubject={product.title}
                    conversationContext="marketplace"
                    className="grid gap-2 sm:grid-cols-3"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {sellerProducts.length ? (
            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Recent from this seller</h2>
                {product.business?.id ? <Link to={`/directory/${product.business.id}`} className="text-sm font-semibold text-lokals-purple">View seller</Link> : null}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {sellerProducts.map((item) => <ProductCard key={item.id} product={item} compact />)}
              </div>
            </SectionCard>
          ) : null}

          {sellerAlerts.length ? (
            <SectionCard className="bg-white">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-lokals-charcoal">Active sale alerts</h2>
                <Link to="/store" className="text-sm font-semibold text-lokals-purple">Open store</Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sellerAlerts.map((alert: any) => (
                  <div key={alert.id} className="rounded-[22px] border border-lokals-border bg-gradient-to-br from-amber-50 via-white to-violet-50 p-4">
                    <StatusBadge value="Promotion" tone="warning" />
                    <p className="mt-3 font-semibold text-lokals-charcoal">{alert.title}</p>
                    <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-lokals-charcoal">Related products</h2>
              <Link to="/store" className="text-sm font-semibold text-lokals-purple">Back to store</Link>
            </div>
            {related.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No related products yet." body="More similar listings will appear here soon." />
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {related.map((item) => <ProductCard key={item.id} product={item} compact />)}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </QueryState>
  )
}
