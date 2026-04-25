import { Zap } from 'lucide-react'
import { DistancePill } from './DistancePill'
import { RatingPill } from './RatingPill'
import { VerifiedBadge } from './VerifiedBadge'

export function TrustRow({
  verified,
  ratingLabel,
  distanceLabel,
  completedLabel,
  responseLabel,
}: {
  verified?: boolean
  ratingLabel: string
  distanceLabel: string
  completedLabel?: string
  responseLabel?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <VerifiedBadge verified={verified} />
      <RatingPill label={ratingLabel} />
      <DistancePill label={distanceLabel} />
      {completedLabel ? <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">{completedLabel}</span> : null}
      {responseLabel ? <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700"><Zap className="h-3.5 w-3.5" />{responseLabel}</span> : null}
    </div>
  )
}
