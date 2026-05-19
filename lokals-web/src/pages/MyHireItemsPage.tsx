import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, EmptyState, Input, PageHeader, QueryState, SectionCard, StatusBadge, TextArea } from '../components/Ui'
import { useCreateHireItem, useDeleteHireItem, useMyHireItems, useUpdateHireItem } from '../hooks/queries'
import { getApiErrorMessage } from '../lib/api'
import { getDisplayPrice } from '../lib/display'
import type { HireItemRecord } from '../types'

type HireItemFormState = {
  title: string
  description: string
  category: string
  town: string
  area: string
  price_per_day: string
  price_per_hour: string
  deposit_amount: string
  replacement_value: string
  condition: string
  delivery_available: boolean
  pickup_available: boolean
}

const emptyForm: HireItemFormState = {
  title: '',
  description: '',
  category: 'equipment',
  town: 'Okahandja',
  area: '',
  price_per_day: '',
  price_per_hour: '',
  deposit_amount: '',
  replacement_value: '',
  condition: 'good',
  delivery_available: false,
  pickup_available: true,
}

function mapItemToForm(item: HireItemRecord): HireItemFormState {
  return {
    title: item.title,
    description: item.description ?? '',
    category: item.category,
    town: item.town ?? 'Okahandja',
    area: item.area ?? '',
    price_per_day: item.prices?.price_per_day ? String(item.prices.price_per_day) : '',
    price_per_hour: item.prices?.price_per_hour ? String(item.prices.price_per_hour) : '',
    deposit_amount: item.deposit ? String(item.deposit) : '',
    replacement_value: item.replacement_value ? String(item.replacement_value) : '',
    condition: item.condition ?? 'good',
    delivery_available: Boolean(item.delivery_available),
    pickup_available: item.pickup_available !== false,
  }
}

export function MyHireItemsPage() {
  const itemsQuery = useMyHireItems()
  const createItem = useCreateHireItem()
  const updateItem = useUpdateHireItem()
  const deleteItem = useDeleteHireItem()
  const [form, setForm] = useState<HireItemFormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const items = itemsQuery.data?.data ?? []

  const submit = async () => {
    setFeedback(null)
    setErrorMessage(null)

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      town: form.town,
      area: form.area,
      price_per_day: form.price_per_day ? Number(form.price_per_day) : undefined,
      price_per_hour: form.price_per_hour ? Number(form.price_per_hour) : undefined,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : undefined,
      replacement_value: form.replacement_value ? Number(form.replacement_value) : undefined,
      condition: form.condition,
      delivery_available: form.delivery_available,
      pickup_available: form.pickup_available,
    }

    try {
      if (editingId) {
        await updateItem.mutateAsync({ itemId: editingId, payload })
        setFeedback('Hire item updated.')
      } else {
        await createItem.mutateAsync(payload)
        setFeedback('Hire item created.')
      }

      setForm(emptyForm)
      setEditingId(null)
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save this hire item right now.'))
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        eyebrow="Hire owner"
        title="My hire items"
        description="List rentable items, keep pricing practical, and manage what should go live for local bookings."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/hire/owner/bookings"><Button variant="secondary">Owner bookings</Button></Link>
            <Link to="/hire"><Button>Browse public hire</Button></Link>
          </div>
        }
      />

      {feedback ? <SectionCard className="border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">{feedback}</SectionCard> : null}
      {errorMessage ? <SectionCard className="border border-red-200 bg-red-50 text-sm font-medium text-red-700">{errorMessage}</SectionCard> : null}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard className="bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-lokals-green"><Plus className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-semibold text-lokals-charcoal">{editingId ? 'Edit hire item' : 'Create hire item'}</h2>
              <p className="text-sm text-lokals-muted">Keep this first pass compact: title, category, pricing, deposit, and whether pickup or delivery is supported.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Title</span>
              <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Generator 5kVA" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Category</span>
              <Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="equipment" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Town</span>
              <Input value={form.town} onChange={(event) => setForm((current) => ({ ...current, town: event.target.value }))} placeholder="Okahandja" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Area</span>
              <Input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Nau-Aib" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Price per day</span>
              <Input value={form.price_per_day} onChange={(event) => setForm((current) => ({ ...current, price_per_day: event.target.value }))} placeholder="450" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Price per hour</span>
              <Input value={form.price_per_hour} onChange={(event) => setForm((current) => ({ ...current, price_per_hour: event.target.value }))} placeholder="80" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Deposit amount</span>
              <Input value={form.deposit_amount} onChange={(event) => setForm((current) => ({ ...current, deposit_amount: event.target.value }))} placeholder="800" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Replacement value</span>
              <Input value={form.replacement_value} onChange={(event) => setForm((current) => ({ ...current, replacement_value: event.target.value }))} placeholder="3500" />
            </label>
            <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
              <span>Condition</span>
              <Input value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))} placeholder="good" />
            </label>
            <div className="flex flex-col gap-3 rounded-[24px] border border-lokals-border bg-slate-50 px-4 py-4">
              <label className="flex items-center gap-3 text-sm font-medium text-lokals-charcoal">
                <input type="checkbox" checked={form.pickup_available} onChange={(event) => setForm((current) => ({ ...current, pickup_available: event.target.checked }))} />
                Pickup available
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-lokals-charcoal">
                <input type="checkbox" checked={form.delivery_available} onChange={(event) => setForm((current) => ({ ...current, delivery_available: event.target.checked }))} />
                Delivery available
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
                <span>Description</span>
                <TextArea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="What is included, what it is best for, and what the renter should know." />
              </label>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button disabled={createItem.isPending || updateItem.isPending} onClick={submit}>{editingId ? 'Save changes' : 'Create hire item'}</Button>
            {editingId ? <Button variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel edit</Button> : null}
          </div>
        </SectionCard>

        <QueryState isLoading={itemsQuery.isLoading} error={itemsQuery.error}>
          {items.length === 0 ? (
            <EmptyState title="No hire items yet" body="Create your first rental listing and it will appear here for management and public approval." />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <SectionCard key={item.id} className="bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-lokals-charcoal">{item.title}</p>
                        <StatusBadge value={item.verification_status ?? 'pending'} tone={item.verification_status === 'approved' ? 'success' : item.verification_status === 'rejected' ? 'danger' : 'warning'} />
                      </div>
                      <p className="mt-2 text-sm text-lokals-muted">{item.category} | {item.area ?? item.town ?? 'Okahandja'} | {item.delivery_available ? 'Delivery available' : 'Pickup focused'}</p>
                      <p className="mt-1 text-sm text-lokals-muted">{getDisplayPrice(item.prices?.price_per_day ?? item.prices?.price_per_hour ?? 0, 'N$')} {item.prices?.price_per_day ? '/ day' : item.prices?.price_per_hour ? '/ hour' : ''} | Deposit {getDisplayPrice(item.deposit ?? 0, 'N$')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/hire/${item.id}`}><Button variant="secondary">View</Button></Link>
                      <Button variant="secondary" onClick={() => { setEditingId(item.id); setForm(mapItemToForm(item)) }}><Edit3 className="h-4 w-4" /> Edit</Button>
                      <Button
                        variant="secondary"
                        disabled={deleteItem.isPending}
                        onClick={() => {
                          setFeedback(null)
                          setErrorMessage(null)
                          deleteItem.mutate(
                            { itemId: item.id },
                            {
                              onSuccess: () => setFeedback('Hire item deleted.'),
                              onError: (error) => setErrorMessage(getApiErrorMessage(error, 'Unable to delete this hire item right now.')),
                            },
                          )
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  )
}
