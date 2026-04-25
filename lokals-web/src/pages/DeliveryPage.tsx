import type { FormEvent } from 'react'
import { Camera, Package, Route, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionTile, Button, EmptyState, Input, PageHeader, SectionCard, Select, TextArea } from '../components/Ui'
import { GlassPanel } from '../components/glass/GlassPanel'
import { isDemoMode } from '../config/appMode'
import { useCreateDelivery } from '../hooks/queries'
import { useAuthStore } from '../store/auth'

const parcelSizes = [
  { value: 'small', label: 'Small envelope', estimate: 45 },
  { value: 'medium', label: 'Medium parcel', estimate: 75 },
  { value: 'large', label: 'Large box', estimate: 120 },
]

export function DeliveryPage() {
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState('')
  const [parcelSize, setParcelSize] = useState('medium')
  const createDelivery = useCreateDelivery()
  const token = useAuthStore((state) => state.token)
  const estimate = useMemo(() => parcelSizes.find((item) => item.value === parcelSize)?.estimate ?? 75, [parcelSize])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDemoMode) {
      setMessage('Demo Mode: delivery request simulated. Switch to production mode to send a real request.')
      event.currentTarget.reset()
      setPreview('')
      return
    }
    const form = new FormData(event.currentTarget)
    const payload = new FormData()
    payload.append('pickup_location', String(form.get('pickup_location') ?? ''))
    payload.append('dropoff_location', String(form.get('dropoff_location') ?? ''))
    payload.append('parcel_description', String(form.get('parcel_description') ?? ''))
    payload.append('parcel_size', parcelSize)
    payload.append('estimated_price', String(estimate))
    const file = form.get('photo')
    if (file instanceof File && file.size > 0) {
      payload.append('photo', file)
    }
    await createDelivery.mutateAsync(payload)
    setMessage('Delivery request sent. A driver can confirm the next step soon.')
    event.currentTarget.reset()
    setPreview('')
  }

  return (
    <div className="space-y-5">
      <GlassPanel>
        <PageHeader
          eyebrow="Delivery"
          title="Send parcels with fewer steps"
          description="Choose pickup and drop-off, add a parcel size, preview a photo, and request delivery with a clear estimate."
          actions={<Link to="/marketplace"><Button variant="secondary">Browse local sellers</Button></Link>}
        />
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-gold-soft text-lokals-charcoal">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">Parcel-first UX</h3>
              <p className="mt-2 text-sm text-lokals-muted">Add only the essentials and let the estimate stay visible before you confirm.</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-sky-soft text-lokals-info">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">Future-ready tracking</h3>
              <p className="mt-2 text-sm text-lokals-muted">The new payload supports driver assignment and live route states later.</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-green-soft text-lokals-green">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-lokals-charcoal">Clear handoff details</h3>
              <p className="mt-2 text-sm text-lokals-muted">Photos, parcel size, and trusted account details reduce delivery friction.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {token ? (
        <SectionCard className="bg-white">
          <form className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={submit}>
            <div className="space-y-4">
              <Input name="pickup_location" placeholder="Pickup location" required />
              <Input name="dropoff_location" placeholder="Drop-off location" required />
              <TextArea name="parcel_description" placeholder="What are you sending?" rows={4} required />
              <Select value={parcelSize} onChange={(event) => setParcelSize(event.target.value)}>
                {parcelSizes.map((size) => <option key={size.value} value={size.value}>{size.label}</option>)}
              </Select>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-lokals-border bg-slate-50 px-5 py-8 text-center">
                {preview ? <img src={preview} alt="Parcel preview" className="mb-4 h-40 w-full rounded-[20px] object-cover" /> : <Camera className="mb-3 h-8 w-8 text-lokals-purple" />}
                <span className="font-semibold text-lokals-charcoal">Add parcel photo</span>
                <span className="mt-2 text-sm text-lokals-muted">Useful for fragile or important items.</span>
                <input type="file" name="photo" accept="image/*" capture="environment" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0]
                  setPreview(file ? URL.createObjectURL(file) : '')
                }} />
              </label>
            </div>
            <GlassPanel className="self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lokals-purple">Summary</p>
              <h3 className="mt-2 text-xl font-semibold text-lokals-charcoal">Estimated price</h3>
              <p className="mt-2 text-3xl font-semibold text-lokals-charcoal">N$ {estimate}</p>
              <p className="mt-3 text-sm text-lokals-muted">The final amount can adjust when a driver confirms route distance and parcel details.</p>
              {message ? <p className="mt-4 text-sm font-medium text-lokals-green">{message}</p> : null}
              <Button className="mt-5 w-full" disabled={createDelivery.isPending}>{createDelivery.isPending ? 'Requesting delivery...' : isDemoMode ? 'Simulate delivery request' : 'Request delivery'}</Button>
            </GlassPanel>
          </form>
        </SectionCard>
      ) : (
        <EmptyState title="Login to request delivery" body="Delivery requests use your saved contact details so handoff stays quick." action={<Link to="/login"><Button>Login</Button></Link>} />
      )}

      <SectionCard className="bg-white">
        <h3 className="text-lg font-semibold text-lokals-charcoal">Popular delivery paths</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionTile to="/marketplace" label="Groceries" subtitle="Household essentials" icon={Package} />
          <ActionTile to="/marketplace" label="Medicine" subtitle="Clinic and pharmacy runs" icon={ShieldCheck} />
          <ActionTile to="/marketplace" label="Parcels" subtitle="Business and personal drop-offs" icon={Route} />
          <ActionTile to="/report-issue" label="Report a problem" subtitle="Tell the city what needs attention" icon={Package} />
        </div>
      </SectionCard>
    </div>
  )
}
