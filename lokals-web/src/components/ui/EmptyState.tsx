import { ArrowRight, Inbox, RefreshCw } from 'lucide-react'
import { Card } from './Card'
import { Button } from './Button'

export function EmptyState({
  title,
  body,
  action,
  retry,
}: {
  title: string
  body: string
  action?: React.ReactNode
  retry?: () => void
}) {
  return (
    <Card className="py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-violet-50 text-lokals-purple">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-lokals-charcoal">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-lokals-muted">{body}</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        {retry ? <Button variant="secondary" onClick={retry}><RefreshCw className="h-4 w-4" />Retry</Button> : null}
        {action}
      </div>
      {!retry && !action ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-lokals-purple">
          Explore a nearby area instead
          <ArrowRight className="h-4 w-4" />
        </p>
      ) : null}
    </Card>
  )
}
