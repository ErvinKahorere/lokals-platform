import { Star } from 'lucide-react'

export function RatingPill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-9 items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
      <Star className="h-3.5 w-3.5 fill-current" />
      {label}
    </span>
  )
}

