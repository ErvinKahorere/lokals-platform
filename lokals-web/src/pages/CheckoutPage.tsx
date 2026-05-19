import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, SectionCard, TextArea } from '../components/Ui'
import { useCreateOrder } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { clearOrderCart, useOrderCart } from '../lib/orderCart'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'

type CheckoutForm = {
  delivery_address: string
  notes: string
  payment_method: string
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const cart = useOrderCart()
  const cartItems = cart.items
  const user = useAuthStore((state) => state.user)
  const createOrder = useCreateOrder()
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    delivery_address: [user?.default_area, user?.default_town].filter(Boolean).join(', ') || '',
    notes: '',
    payment_method: 'cash',
  })

  const groupedCart = useMemo(() => {
    const groups = new Map<string, typeof cartItems>()
    for (const item of cartItems) {
      const key = String(item.sellerId ?? `seller:${item.sellerName}`)
      const current = groups.get(key) ?? []
      groups.set(key, [...current, item])
    }
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      sellerId: items[0]?.sellerId ?? null,
      sellerName: items[0]?.sellerName ?? 'Local seller',
      items,
      subtotal: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    }))
  }, [cartItems])

  const placeOrders = async () => {
    if (!groupedCart.length) {
      return
    }

    setFeedback(null)
    setErrorMessage(null)
    setSubmitting(true)

    try {
      const createdOrders: number[] = []

      for (const group of groupedCart) {
        if (!group.sellerId) {
          throw new Error(`"${group.sellerName}" cannot be ordered yet because it is missing a seller profile.`)
        }

        const response = await createOrder.mutateAsync({
          business_id: group.sellerId,
          payment_method: form.payment_method,
          delivery_address: form.delivery_address,
          notes: form.notes.trim() || undefined,
          items: group.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        })

        createdOrders.push(Number(response.data?.id ?? response.id))
      }

      clearOrderCart()
      setFeedback(`Placed ${createdOrders.length} order${createdOrders.length === 1 ? '' : 's'} successfully.`)
      navigate(createdOrders.length === 1 ? `/orders/${createdOrders[0]}` : '/orders')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : getApiErrorMessage(error, 'Unable to place the order right now.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Orders"
        title="Checkout"
        description="LOKALS will create one order per seller so each shop can accept and prepare independently."
        actions={<Link to="/store"><Button variant="secondary">Back to store</Button></Link>}
      />

      {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
      {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

      {!groupedCart.length ? (
        <EmptyState title="Your cart is empty" body="Add local products first, then come back to place the order." action={<Link to="/store"><Button>Browse products</Button></Link>} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard className="bg-white">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Seller groups</h2>
            <div className="mt-4 space-y-4">
              {groupedCart.map((group) => (
                <div key={group.key} className="rounded-[24px] border border-lokals-border bg-lokals-bg px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lokals-charcoal">{group.sellerName}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{group.items.length} item{group.items.length === 1 ? '' : 's'}</p>
                    </div>
                    <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(group.subtotal, 'N$')}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between rounded-[18px] border border-white bg-white px-3 py-3">
                        <div>
                          <p className="font-medium text-lokals-charcoal">{item.title}</p>
                          <p className="mt-1 text-sm text-lokals-muted">Qty {item.quantity} • {getDisplayPrice(item.price, 'N$')}</p>
                        </div>
                        <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.price * item.quantity, 'N$')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard className="bg-white">
            <h2 className="text-lg font-semibold text-lokals-charcoal">Delivery details</h2>
            <div className="mt-4 space-y-4">
              <Input
                value={form.delivery_address}
                onChange={(event) => setForm((current) => ({ ...current, delivery_address: event.target.value }))}
                placeholder="House number, area, and town"
              />
              <Input
                value={form.payment_method}
                onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}
                placeholder="cash"
              />
              <TextArea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                placeholder="Gate code, landmark, or seller notes"
              />
            </div>
            <div className="mt-5 rounded-[20px] border border-lokals-border bg-lokals-bg px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-lokals-charcoal">Cart subtotal</p>
                <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(cart.subtotal, 'N$')}</span>
              </div>
              <p className="mt-2 text-sm text-lokals-muted">Delivery and service fees are calculated per seller order at checkout.</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button disabled={submitting || createOrder.isPending || !form.delivery_address.trim()} onClick={placeOrders}>
                {submitting ? 'Placing order...' : 'Place order'}
              </Button>
              <Button variant="secondary" onClick={() => clearOrderCart()}>Clear cart</Button>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}
