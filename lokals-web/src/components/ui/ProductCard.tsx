import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { getDisplayPrice, resolveMediaUrl } from '../../lib/display'
import { addProductToOrderCart } from '../../lib/orderCart'
import { SaveButton } from '../experience/SaveButton'
import { QuickCallButton } from '../experience/QuickCallButton'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card } from './Card'
import { ImageWithFallback } from './ImageWithFallback'

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const sellerName = product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'
  const locationLabel = [product.area, product.town].filter(Boolean).join(', ') || 'Okahandja'
  const image = resolveMediaUrl(product.image_url) ?? product.image_url
  const sellerPhone = product.business?.phone ?? product.user?.phone ?? undefined
  const deliveryFee = Number(product.business?.delivery_fee ?? product.delivery_fee ?? 0)
  const deliveryEta = Number(product.business?.delivery_eta_minutes ?? product.delivery_eta_minutes ?? 0)
  const rating = Number(product.business?.rating ?? product.rating ?? 4.5)
  const availabilityLabel = product.business?.availability_status ?? product.availability_status

  return (
    <Card className="overflow-hidden bg-white p-0">
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        <ImageWithFallback src={image} alt={product.title} className="h-full w-full" fallback={<div className="text-sm text-lokals-muted">Product photo</div>} />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.sale_price ? <Badge tone="warning">Sale</Badge> : null}
          {product.fast_delivery ? <Badge tone="success">Fast</Badge> : null}
        </div>
        <div className="absolute right-3 top-3">
          <SaveButton label={product.title} itemId={product.id} itemType="product" />
        </div>
      </div>
      <div className="p-4">
        <p className="line-clamp-1 text-base font-semibold text-lokals-charcoal">{product.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-xl font-bold text-lokals-charcoal">{getDisplayPrice(product.sale_price ?? product.price)}</p>
          {product.sale_price ? <p className="text-sm text-lokals-muted line-through">{getDisplayPrice(product.price)}</p> : null}
        </div>
        <p className="mt-2 line-clamp-1 text-sm font-medium text-lokals-charcoal">{sellerName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-lokals-muted">
          {availabilityLabel ? <Badge tone={product.open_now ? 'success' : 'neutral'}>{availabilityLabel}</Badge> : null}
          <span>{rating.toFixed(1)} rating</span>
          {deliveryEta ? <span>{deliveryEta} min</span> : null}
          {deliveryFee ? <span>{getDisplayPrice(deliveryFee, 'N$')} delivery</span> : null}
        </div>
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-lokals-muted">
          <MapPin className="h-4 w-4" />
          {locationLabel}
        </p>
        {!compact ? <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{product.description ?? 'Local product listing.'}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => addProductToOrderCart(product, 1)}>Add</Button>
          <Link to={`/store/${product.id}`} className="flex-1">
            <Button className="w-full">{compact ? 'Open' : 'View'}</Button>
          </Link>
        </div>
        {!compact ? <div className="mt-2"><QuickCallButton phone={sellerPhone} className="w-full" /></div> : null}
      </div>
    </Card>
  )
}
