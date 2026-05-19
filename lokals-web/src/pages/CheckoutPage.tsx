import { useMemo, useState } from 'react'
import { ChevronRight, MapPin, ReceiptText, ShoppingBag, TicketPercent, Wallet } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, SectionCard, TextArea } from '../components/Ui'
import { useCreateOrder } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { clearOrderCart, useOrderCart } from '../lib/orderCart'
import { getDisplayPrice } from '../lib/display'
import { useAuthStore } from '../store/auth'

type CheckoutStep = 'cart' | 'address' | 'delivery' | 'payment' | 'review'

type CheckoutForm = {
  delivery_address: string
  delivery_instructions: string
  notes: string
  payment_method: string
  delivery_method: 'courier' | 'pickup'
  coupon_code: string
}

const checkoutSteps: { key: CheckoutStep; label: string }[] = [
  { key: 'cart', label: 'Cart' },
  { key: 'address', label: 'Address' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

export function CheckoutPage() {
  const navigate = useNavigate()
  const cart = useOrderCart()
  const cartItems = cart.items
  const user = useAuthStore((state) => state.user)
  const createOrder = useCreateOrder()
  const [step, setStep] = useState<CheckoutStep>('cart')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    delivery_address: [user?.default_area, user?.default_town].filter(Boolean).join(', ') || '',
    delivery_instructions: '',
    notes: '',
    payment_method: 'cash',
    delivery_method: 'courier',
    coupon_code: '',
  })

  const groupedCart = useMemo(() => {
    const groups = new Map<string, typeof cartItems>()
    for (const item of cartItems) {
      const key = String(item.sellerId ?? `seller:${item.sellerName}`)
      const current = groups.get(key) ?? []
      groups.set(key, [...current, item])
    }
    return Array.from(groups.entries()).map(([key, items]) => {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const deliveryFee = form.delivery_method === 'pickup' ? 0 : Math.max(18, Math.round(subtotal * 0.08))
      const serviceFee = Math.max(6, Math.round(subtotal * 0.04))
      return {
        key,
        sellerId: items[0]?.sellerId ?? null,
        sellerName: items[0]?.sellerName ?? 'Local seller',
        items,
        subtotal,
        deliveryFee,
        serviceFee,
        total: subtotal + deliveryFee + serviceFee,
      }
    })
  }, [cartItems, form.delivery_method])

  const totals = useMemo(() => {
    const subtotal = groupedCart.reduce((sum, group) => sum + group.subtotal, 0)
    const deliveryFee = groupedCart.reduce((sum, group) => sum + group.deliveryFee, 0)
    const serviceFee = groupedCart.reduce((sum, group) => sum + group.serviceFee, 0)
    return {
      subtotal,
      deliveryFee,
      serviceFee,
      total: subtotal + deliveryFee + serviceFee,
      eta: form.delivery_method === 'pickup' ? 'Ready in 15-25 min' : 'Delivery in 25-40 min',
    }
  }, [form.delivery_method, groupedCart])

  const stepIndex = checkoutSteps.findIndex((item) => item.key === step)

  const goNext = () => {
    const next = checkoutSteps[stepIndex + 1]
    if (next) setStep(next.key)
  }

  const goBack = () => {
    const previous = checkoutSteps[stepIndex - 1]
    if (previous) setStep(previous.key)
  }

  const canProceed = (() => {
    if (step === 'cart') return groupedCart.length > 0
    if (step === 'address') return form.delivery_method === 'pickup' || Boolean(form.delivery_address.trim())
    if (step === 'payment') return Boolean(form.payment_method.trim())
    return true
  })()

  const placeOrders = async () => {
    if (!groupedCart.length) return

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
          delivery_address: form.delivery_method === 'pickup' ? `${group.sellerName} pickup` : form.delivery_address,
          notes: [form.delivery_instructions.trim(), form.notes.trim()].filter(Boolean).join(' | ') || undefined,
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
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="Orders"
        title="Checkout"
        description="A guided flow that keeps one order per seller, while making the whole cart feel like one clear local-commerce journey."
        actions={<Link to="/store"><Button variant="secondary">Back to store</Button></Link>}
      />

      {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
      {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

      {!groupedCart.length ? (
        <EmptyState title="Your cart is empty" body="Add local products first, then come back to place the order." action={<Link to="/store"><Button>Browse products</Button></Link>} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <SectionCard className="bg-white">
              <div className="flex flex-wrap gap-2">
                {checkoutSteps.map((item, index) => {
                  const active = item.key === step
                  const complete = index < stepIndex
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setStep(item.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active ? 'bg-lokals-green text-white' : complete ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-lokals-charcoal'
                      }`}
                    >
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </SectionCard>

            {step === 'cart' ? (
              <SectionCard className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-lokals-purple"><ShoppingBag className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-lokals-charcoal">Grouped by seller</h2>
                    <p className="text-sm text-lokals-muted">If your cart spans multiple businesses, LOKALS creates one order per seller and keeps them all trackable from one place.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {groupedCart.map((group) => (
                    <div key={group.key} className="rounded-[28px] border border-lokals-border bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-lokals-charcoal">{group.sellerName}</p>
                          <p className="mt-1 text-sm text-lokals-muted">{group.items.length} item{group.items.length === 1 ? '' : 's'} | Estimated {form.delivery_method === 'pickup' ? 'pickup' : 'delivery'} 25-40 min</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-lokals-charcoal shadow-sm">{getDisplayPrice(group.total, 'N$')}</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {group.items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
                            <div>
                              <p className="font-medium text-lokals-charcoal">{item.title}</p>
                              <p className="mt-1 text-sm text-lokals-muted">Qty {item.quantity} | {getDisplayPrice(item.price, 'N$')} each</p>
                            </div>
                            <span className="font-semibold text-lokals-charcoal">{getDisplayPrice(item.price * item.quantity, 'N$')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            {step === 'address' ? (
              <SectionCard className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-lokals-charcoal">Delivery address</h2>
                    <p className="text-sm text-lokals-muted">Keep it compact and specific so the courier can find you quickly in Okahandja.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  <Input
                    value={form.delivery_address}
                    onChange={(event) => setForm((current) => ({ ...current, delivery_address: event.target.value }))}
                    placeholder="House number, street, area, and town"
                  />
                  <TextArea
                    value={form.delivery_instructions}
                    onChange={(event) => setForm((current) => ({ ...current, delivery_instructions: event.target.value }))}
                    rows={4}
                    placeholder="Gate code, landmark, or easiest drop-off instructions"
                  />
                </div>
              </SectionCard>
            ) : null}

            {step === 'delivery' ? (
              <SectionCard className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><ReceiptText className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-lokals-charcoal">Delivery method</h2>
                    <p className="text-sm text-lokals-muted">Choose fast courier drop-off or seller pickup. Keep parcel delivery separate from orders.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    { key: 'courier', label: 'Courier delivery', body: 'A courier picks up from the seller and brings it to you.' },
                    { key: 'pickup', label: 'Pickup from seller', body: 'Skip the delivery fee and collect when the order is ready.' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, delivery_method: option.key as CheckoutForm['delivery_method'] }))}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        form.delivery_method === option.key ? 'border-lokals-green bg-emerald-50 shadow-sm' : 'border-lokals-border bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold text-lokals-charcoal">{option.label}</p>
                      <p className="mt-2 text-sm leading-6 text-lokals-muted">{option.body}</p>
                    </button>
                  ))}
                </div>
                <TextArea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={4}
                  placeholder="Optional order notes for the seller, like packing or substitution preferences"
                  className="mt-4"
                />
              </SectionCard>
            ) : null}

            {step === 'payment' ? (
              <SectionCard className="bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Wallet className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold text-lokals-charcoal">Payment</h2>
                    <p className="text-sm text-lokals-muted">Keep this first pass practical. We are cash-first now, with cleaner provider integration prepared for later.</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {['cash', 'wallet', 'card-on-delivery'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, payment_method: method }))}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        form.payment_method === method ? 'border-lokals-purple bg-violet-50 shadow-sm' : 'border-lokals-border bg-slate-50'
                      }`}
                    >
                      <p className="font-semibold capitalize text-lokals-charcoal">{method.replaceAll('-', ' ')}</p>
                      <p className="mt-2 text-sm text-lokals-muted">Visible now as a realistic placeholder for the payment provider phase.</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-[24px] border border-dashed border-lokals-border bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <TicketPercent className="h-5 w-5 text-lokals-green" />
                    <div className="flex-1">
                      <p className="font-semibold text-lokals-charcoal">Coupon placeholder</p>
                      <p className="text-sm text-lokals-muted">We are preparing promo and reward hooks without blocking the live checkout flow.</p>
                    </div>
                  </div>
                  <Input
                    value={form.coupon_code}
                    onChange={(event) => setForm((current) => ({ ...current, coupon_code: event.target.value }))}
                    placeholder="Add coupon code later"
                    className="mt-3"
                  />
                </div>
              </SectionCard>
            ) : null}

            {step === 'review' ? (
              <SectionCard className="bg-white">
                <h2 className="text-xl font-semibold text-lokals-charcoal">Review and place order</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ['Delivery address', form.delivery_method === 'pickup' ? 'Pickup from seller' : form.delivery_address || 'Not provided'],
                    ['Delivery method', form.delivery_method === 'pickup' ? 'Pickup from seller' : 'Courier delivery'],
                    ['Payment', form.payment_method.replaceAll('-', ' ')],
                    ['Delivery instructions', form.delivery_instructions || 'No extra instructions'],
                    ['Seller notes', form.notes || 'No order notes'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-3 rounded-[20px] border border-lokals-border bg-slate-50 px-4 py-3">
                      <p className="font-medium text-lokals-charcoal">{label}</p>
                      <span className="max-w-[55%] text-right text-sm text-lokals-muted">{value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {stepIndex > 0 ? <Button variant="secondary" onClick={goBack}>Back</Button> : null}
              {step !== 'review' ? (
                <Button disabled={!canProceed} onClick={goNext}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button disabled={submitting || createOrder.isPending || !canProceed} onClick={placeOrders}>
                  {submitting ? 'Placing order...' : 'Place order'}
                </Button>
              )}
              <Button variant="secondary" onClick={() => clearOrderCart()}>Clear cart</Button>
            </div>
          </div>

          <div className="space-y-5">
            <SectionCard className="sticky top-[92px] bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-lokals-muted">Order summary</p>
                  <h2 className="text-xl font-semibold text-lokals-charcoal">{totals.eta}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{groupedCart.length} seller{groupedCart.length === 1 ? '' : 's'}</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ['Subtotal', getDisplayPrice(totals.subtotal, 'N$')],
                  ['Delivery fee', getDisplayPrice(totals.deliveryFee, 'N$')],
                  ['Service fee', getDisplayPrice(totals.serviceFee, 'N$')],
                  ['Total', getDisplayPrice(totals.total, 'N$')],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-[18px] border border-lokals-border bg-slate-50 px-4 py-3">
                    <p className="font-medium text-lokals-charcoal">{label}</p>
                    <span className="font-semibold text-lokals-charcoal">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[24px] bg-lokals-charcoal px-4 py-4 text-white">
                <p className="text-sm text-white/70">What happens next</p>
                <p className="mt-2 text-sm leading-6 text-white/90">Sellers accept and prepare per order. Couriers only see ready orders, so food and shop deliveries stay clear and realistic.</p>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  )
}
