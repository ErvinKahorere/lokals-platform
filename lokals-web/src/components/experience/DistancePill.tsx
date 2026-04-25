import { MapPin } from 'lucide-react'

export function DistancePill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
      <MapPin className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

