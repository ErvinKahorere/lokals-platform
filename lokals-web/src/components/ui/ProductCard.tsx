import { MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { getDisplayPrice, resolveMediaUrl } from '../../lib/display'
import { SaveButton } from '../experience/SaveButton'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card } from './Card'

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const sellerName = product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller'
  const locationLabel = [product.area, product.town].filter(Boolean).join(', ') || 'Windhoek'
  const image = resolveMediaUrl(product.image_url) ?? product.image_url

  return (
    <Card className="overflow-hidden bg-white p-0">
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
        {image ? (
          <img src={image} alt={product.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-lokals-muted">Product photo</div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {product.sale_price ? <Badge tone="warning">Sale</Badge> : null}
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
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-lokals-muted">
          <MapPin className="h-4 w-4" />
          {locationLabel}
        </p>
        {!compact ? <p className="mt-3 line-clamp-2 text-sm text-lokals-muted">{product.description ?? 'Local product listing.'}</p> : null}
        <div className="mt-4">
          <Link to={`/store/${product.id}`}>
            <Button className="w-full">View details</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
