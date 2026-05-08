import { Clock3 } from 'lucide-react'
import type { DashboardActivityItem } from '../../types'

function formatRelativeTimestamp(timestamp?: string | null) {
  if (!timestamp) return 'Recently'

  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return 'Recently'

  const diffMs = Date.now() - parsed.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return parsed.toLocaleDateString()
}

export function RecentActivityList({ items }: { items: DashboardActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-lokals-muted">No recent activity yet.</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.type}-${item.title}-${index}`} className="rounded-[20px] border border-lokals-border bg-white px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-lokals-charcoal">{item.title}</p>
            <span className="rounded-full bg-lokals-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lokals-purple">{item.type.replaceAll('_', ' ')}</span>
          </div>
          <p className="mt-2 text-sm text-lokals-muted">{item.body}</p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-lokals-muted">
            <Clock3 className="h-3.5 w-3.5" />
            {formatRelativeTimestamp(item.timestamp)}
          </p>
        </div>
      ))}
    </div>
  )
}
