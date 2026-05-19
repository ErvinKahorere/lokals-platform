import { useEffect, useState } from 'react'
import type { Product } from '../types'

export type OrderCartItem = {
  productId: number
  sellerId?: number | null
  sellerName: string
  title: string
  price: number
  quantity: number
  imageUrl?: string | null
  town?: string | null
  area?: string | null
}

const STORAGE_KEY = 'lokals-order-cart'

function readCart(): OrderCartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as OrderCartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(items: OrderCartItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('lokals-order-cart-changed'))
}

export function getOrderCart() {
  return readCart()
}

export function addProductToOrderCart(product: Product, quantity = 1) {
  const items = readCart()
  const price = Number(product.sale_price ?? product.price ?? 0)
  const existingIndex = items.findIndex((item) => item.productId === product.id)

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + quantity,
    }
  } else {
    items.push({
      productId: product.id,
      sellerId: product.business?.id ?? null,
      sellerName: product.business?.name ?? product.user?.business_name ?? product.user?.name ?? 'Local seller',
      title: product.title,
      price,
      quantity,
      imageUrl: product.image_url ?? null,
      town: product.town ?? null,
      area: product.area ?? null,
    })
  }

  writeCart(items)
}

export function updateOrderCartQuantity(productId: number, quantity: number) {
  const next = readCart()
    .map((item) => item.productId === productId ? { ...item, quantity } : item)
    .filter((item) => item.quantity > 0)

  writeCart(next)
}

export function removeOrderCartItem(productId: number) {
  writeCart(readCart().filter((item) => item.productId !== productId))
}

export function clearOrderCart() {
  writeCart([])
}

export function useOrderCart() {
  const [items, setItems] = useState<OrderCartItem[]>(() => readCart())

  useEffect(() => {
    const sync = () => setItems(readCart())
    window.addEventListener('storage', sync)
    window.addEventListener('lokals-order-cart-changed', sync as EventListener)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('lokals-order-cart-changed', sync as EventListener)
    }
  }, [])

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    addProduct: addProductToOrderCart,
    updateQuantity: updateOrderCartQuantity,
    removeItem: removeOrderCartItem,
    clear: clearOrderCart,
  }
}
