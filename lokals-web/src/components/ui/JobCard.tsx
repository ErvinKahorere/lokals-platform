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
  const skill = job.skills?.[0] ?? 'General help'
  const urgencyLabel = (job.applications_count ?? 0) === 0 ? 'Urgent' : 'Active'

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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="info">{skill}</Badge>
              <Badge tone={(job.applications_count ?? 0) === 0 ? 'warning' : 'neutral'}>{urgencyLabel}</Badge>
            </div>
          </div>
        </div>
        <Badge tone={job.status === 'open' ? 'success' : 'warn'}>{job.status === 'open' ? 'New' : job.status.replaceAll('_', ' ')}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-lokals-muted">
        <span>{getDisplayDistance(job.distance_km, job.location)}</span>
        <span>{job.compensation ? getDisplayPrice(job.compensation) : 'Budget TBC'}</span>
        <span>Posted today</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-lokals-muted">{job.employment_type.replaceAll('_', ' ')}</p>
          <p className="text-base font-semibold text-lokals-charcoal">{job.compensation ? getDisplayPrice(job.compensation) : 'Negotiable'}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/jobs/${job.id}`} className="self-center text-sm font-semibold text-lokals-purple">View</Link>
          {canApply ? <Button onClick={onApply}>Apply</Button> : null}
        </div>
      </div>
    </Card>
  )
}
