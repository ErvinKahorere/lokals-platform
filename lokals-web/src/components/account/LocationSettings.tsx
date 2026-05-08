import { MapPin, Navigation } from 'lucide-react'
import { OKAHANDJA_AREAS, PILOT_LOCATION_MESSAGE, PILOT_TOWN } from '../../lib/pilot'
import { Button, Input, Select } from '../Ui'

export function LocationSettings({
  town,
  area,
  radius,
  onAreaChange,
  onRadiusChange,
  onSubmit,
  isSaving,
}: {
  town: string
  area: string
  radius: string
  onAreaChange: (value: string) => void
  onRadiusChange: (value: string) => void
  onSubmit: () => void
  isSaving?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
          <span>Town</span>
          <Input value={town || PILOT_TOWN} readOnly />
        </label>
        <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
          <span>Area</span>
          <Select value={area} onChange={(event) => onAreaChange(event.target.value)}>
            <option value="">Select your area</option>
            {OKAHANDJA_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium text-lokals-charcoal">
        <span>Service radius (km)</span>
        <Input value={radius} onChange={(event) => onRadiusChange(event.target.value)} placeholder="10" />
      </label>
      <div className="rounded-[22px] border border-dashed border-lokals-purple/25 bg-lokals-purple/5 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lokals-purple shadow-card">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-lokals-charcoal">Pilot location</p>
            <p className="mt-1 text-sm text-lokals-muted">{PILOT_LOCATION_MESSAGE} Town is locked for the pilot, and you can choose your area inside Okahandja.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[20px] bg-lokals-bg px-4 py-3 text-sm text-lokals-muted">
        <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />This affects what is shown near you first.</span>
        <Button onClick={onSubmit} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save location'}</Button>
      </div>
    </div>
  )
}
