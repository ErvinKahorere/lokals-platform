import type { ReactNode } from 'react'
import { CalendarDays, HeartHandshake, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CommunityProject } from '../../types'
import { Badge, Button, Card } from '../Ui'
import { ImageWithFallback } from '../ui/ImageWithFallback'

function statusTone(status?: string | null): 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' {
  switch (status) {
    case 'completed':
    case 'fully_funded':
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'pending':
    case 'submitted':
    case 'changes_requested':
      return 'warning'
    case 'active':
    case 'in_progress':
      return 'info'
    case 'archived':
      return 'neutral'
    default:
      return 'accent'
  }
}

const labelize = (value?: string | null) =>
  (value ?? 'project')
    .split('_')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ')

export function CommunityProjectCard({
  project,
  compact = false,
  action,
}: {
  project: CommunityProject
  compact?: boolean
  action?: ReactNode
}) {
  const image = project.attachments?.find((item) => item.file_type === 'image')?.file_url ?? null

  return (
    <Card className={compact ? 'p-4' : 'overflow-hidden p-0'}>
      {!compact ? (
        <ImageWithFallback
          src={image}
          alt={project.title}
          className="h-44 w-full bg-lokals-purple-soft text-lokals-purple"
        />
      ) : null}
      <div className={compact ? 'space-y-3 p-4' : 'space-y-4 p-5'}>
        <div className="flex flex-wrap gap-2">
          {project.category?.name ? <Badge tone="accent">{project.category.name}</Badge> : null}
          <Badge tone={statusTone(project.status)}>{labelize(project.status)}</Badge>
          {project.is_verified ? <Badge tone="success">Verified</Badge> : null}
          {project.is_featured ? <Badge tone="accent">Featured</Badge> : null}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-lokals-charcoal">{project.title}</h3>
          <p className="mt-2 text-sm leading-6 text-lokals-muted">{project.summary}</p>
        </div>
        <div className="grid gap-2 text-sm text-lokals-muted sm:grid-cols-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <MapPin className="h-4 w-4 text-lokals-purple" />
            {[project.area, project.town].filter(Boolean).join(', ') || project.location_text || 'Okahandja'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <CalendarDays className="h-4 w-4 text-lokals-purple" />
            {project.starts_at ? new Date(project.starts_at).toLocaleDateString() : 'Flexible timing'}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
            <HeartHandshake className="h-4 w-4 text-lokals-purple" />
            {project.followers_count ?? 0} following
          </span>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-lokals-muted">Progress</span>
            <span className="font-semibold text-lokals-purple">{project.progress_percent ?? 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-lokals-green" style={{ width: `${Math.min(100, Math.max(0, project.progress_percent ?? 0))}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(project.support_needed ?? []).slice(0, 4).map((item) => (
            <Badge key={item} tone="neutral">{item}</Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to={`/get-involved/${project.slug}`}>
            <Button>Open project</Button>
          </Link>
          {project.is_verified ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-lokals-muted">
              <ShieldCheck className="h-4 w-4 text-lokals-green" />
              Town Manager approved
            </span>
          ) : null}
          {action}
        </div>
      </div>
    </Card>
  )
}
