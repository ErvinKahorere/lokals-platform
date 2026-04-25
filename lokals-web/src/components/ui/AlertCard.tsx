import { BellRing, MapPin } from 'lucide-react'
import { Badge } from './Badge'
import { Card } from './Card'
import type { AlertItem } from '../../types'

export function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lokals-charcoal text-white">
          <BellRing className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-lokals-charcoal">{alert.title}</h3>
            <Badge tone={alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'info'}>{alert.priority}</Badge>
          </div>
          <p className="mt-2 text-sm text-lokals-muted">{alert.body}</p>
          {alert.location ? <p className="mt-3 inline-flex items-center gap-1 text-xs text-lokals-muted"><MapPin className="h-3.5 w-3.5" />{alert.location}</p> : null}
        </div>
      </div>
    </Card>
  )
}
