import { Heart } from 'lucide-react'
import { useState } from 'react'

export function SaveButton({ label }: { label: string }) {
  const [saved, setSaved] = useState(false)

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      onClick={() => setSaved((value) => !value)}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${saved ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-white/80 bg-white/90 text-lokals-charcoal'}`}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
    </button>
  )
}

