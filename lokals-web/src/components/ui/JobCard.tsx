import { BriefcaseBusiness } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { Card } from './Card'
import { Badge } from './Badge'
import type { Job } from '../../types'
import { getDisplayDistance, getDisplayPrice } from '../../lib/display'

export function JobCard({
  job,
  onApply,
  canApply,
}: {
  job: Job
  onApply?: () => void
  canApply?: boolean
}) {
  return (
    <Card interactive variant="job">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-lokals-charcoal">{job.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-lokals-muted">{job.description}</p>
          </div>
        </div>
        <Badge tone="info">{job.employment_type}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-lokals-muted">
        <span>{getDisplayDistance(job.distance_km, job.location)}</span>
        <span>{job.compensation ? getDisplayPrice(job.compensation) : 'Budget TBC'}</span>
        <span>Posted today</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">Budget</p>
          <p className="text-base font-semibold text-lokals-charcoal">{job.compensation ? getDisplayPrice(job.compensation) : 'Negotiable'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/jobs/${job.id}`} className="self-center text-sm font-semibold text-lokals-green">Details</Link>
          {canApply ? <Button onClick={onApply}>Apply</Button> : null}
        </div>
      </div>
    </Card>
  )
}
