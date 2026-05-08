import { Lock, MapPin } from 'lucide-react'
import { PILOT_TOWN } from '../../lib/pilot'

export function LocationSwitcher({ town, area, onClick }: { town?: string | null; area?: string | null; onClick?: () => void }) {
  const label = [area, town ?? PILOT_TOWN].filter(Boolean).join(', ') || PILOT_TOWN

  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border bg-white px-3 py-2 text-sm font-semibold text-lokals-charcoal shadow-card">
      <MapPin className="h-4 w-4 text-lokals-green" />
      <span>{label}</span>
      <Lock className="h-4 w-4 text-lokals-muted" />
    </button>
  )
}
