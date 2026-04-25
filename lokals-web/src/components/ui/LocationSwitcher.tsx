import { ChevronDown, MapPin } from 'lucide-react'

export function LocationSwitcher({ town, area, onClick }: { town?: string | null; area?: string | null; onClick?: () => void }) {
  const label = [area, town].filter(Boolean).join(', ') || 'Windhoek'

  return (
    <button type="button" onClick={onClick} className="glass-surface inline-flex min-h-11 items-center gap-2 rounded-full border border-lokals-border px-3 py-2 text-sm font-semibold text-lokals-charcoal">
      <MapPin className="h-4 w-4 text-lokals-purple" />
      <span>{label}</span>
      <ChevronDown className="h-4 w-4 text-lokals-muted" />
    </button>
  )
}
