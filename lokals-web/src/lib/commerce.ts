import type { OrderRecord, Product } from '../types'

export const commerceTabs = [
  { key: 'food', label: 'Food' },
  { key: 'groceries', label: 'Groceries' },
  { key: 'shops', label: 'Shops' },
  { key: 'services', label: 'Services' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'popular', label: 'Popular' },
] as const

export const commerceQuickFilters = [
  { key: 'open_now', label: 'Open now' },
  { key: 'fast_delivery', label: 'Fast delivery' },
  { key: 'top_rated', label: 'Top rated' },
  { key: 'featured_only', label: 'Featured' },
] as const

export type CommerceTabKey = (typeof commerceTabs)[number]['key']
export type CommerceQuickFilterKey = (typeof commerceQuickFilters)[number]['key']

export type CommerceSellerSummary = {
  id: string
  sellerId?: number | null
  sellerName: string
  subtitle: string
  deliveryFee: number
  etaMinutes: number
  rating: number
  reviewCount: number
  openNow: boolean
  availabilityStatus: string
  availabilityCode?: string | null
  fastDelivery: boolean
  isFeatured: boolean
  isPopular: boolean
  productCount: number
  heroImageUrl?: string | null
  logoUrl?: string | null
  town?: string | null
  area?: string | null
  commerceCategory: string
}

export function normalizeCommerceCategory(value?: string | null) {
  const lowered = String(value ?? '').toLowerCase()
  if (lowered.includes('food') || lowered.includes('restaurant') || lowered.includes('bakery') || lowered.includes('takeaway')) return 'food'
  if (lowered.includes('grocery') || lowered.includes('produce') || lowered.includes('supermarket') || lowered.includes('pharmacy')) return 'groceries'
  if (lowered.includes('service') || lowered.includes('repair') || lowered.includes('salon') || lowered.includes('clean')) return 'services'
  return 'shops'
}

export function buildSellerSummaries(products: Product[]): CommerceSellerSummary[] {
  const grouped = new Map<string, Product[]>()

  for (const product of products) {
    const sellerName = product.business?.name ?? product.user?.business_name ?? product.user?.name
    if (!sellerName) continue
    const sellerKey = `${product.business?.id ?? product.user?.id ?? sellerName}:${sellerName}`
    const rows = grouped.get(sellerKey) ?? []
    rows.push(product)
    grouped.set(sellerKey, rows)
  }

  return Array.from(grouped.entries()).map(([id, rows]) => {
    const first = rows[0]!
    const sellerName = first.business?.name ?? first.user?.business_name ?? first.user?.name ?? 'Local seller'
    const deliveryFee = Number(first.business?.delivery_fee ?? first.delivery_fee ?? 0)
    const etaMinutes = Number(first.business?.delivery_eta_minutes ?? first.delivery_eta_minutes ?? 0)
    const rating = Number(first.business?.rating ?? first.rating ?? 4.5)
    const reviewCount = Number(first.business?.review_count ?? first.review_count ?? 24)
    const availabilityStatus = first.business?.availability_status ?? first.availability_status ?? 'Open now'
    const openNow = Boolean(first.business?.open_now ?? first.open_now)
    const availabilityCode = first.business?.availability_code ?? first.availability_code ?? null
    const commerceCategory = normalizeCommerceCategory(first.business?.commerce_category ?? first.commerce_category ?? first.category)
    return {
      id,
      sellerId: first.business?.id ?? null,
      sellerName,
      subtitle: first.business?.category ?? first.category ?? 'Local store',
      deliveryFee,
      etaMinutes,
      rating,
      reviewCount,
      openNow,
      availabilityStatus,
      availabilityCode,
      fastDelivery: Boolean(first.business?.fast_delivery ?? first.fast_delivery),
      isFeatured: Boolean(first.is_featured ?? first.business?.is_verified),
      isPopular: Boolean(first.is_popular ?? rows.length >= 3),
      productCount: rows.length,
      heroImageUrl: first.hero_image_url ?? first.image_url ?? first.business?.logo_url ?? null,
      logoUrl: first.business?.logo_url ?? first.user?.avatar ?? null,
      town: first.business?.town ?? first.town ?? null,
      area: first.business?.area ?? first.area ?? null,
      commerceCategory,
    }
  }).sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1
    return b.rating - a.rating
  })
}

export function filterProductsForCommerce(products: Product[], tab: CommerceTabKey, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  return products.filter((product) => {
    const matchesText = !normalizedQuery || [
      product.title,
      product.description,
      product.business?.name,
      product.category,
      product.area,
      product.town,
    ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))

    if (!matchesText) return false

    const category = normalizeCommerceCategory(product.commerce_category ?? product.business?.commerce_category ?? product.category)

    if (tab === 'nearby') return true
    if (tab === 'popular') return Boolean(product.is_popular ?? product.is_featured ?? product.business?.is_verified)
    return category === tab
  })
}

export function orderStatusTone(order: OrderRecord) {
  if (order.status === 'delivered') return 'success' as const
  if (order.status === 'cancelled' || order.status === 'rejected') return 'danger' as const
  if (order.status === 'picked_up' || order.status === 'courier_assigned') return 'info' as const
  return 'accent' as const
}
