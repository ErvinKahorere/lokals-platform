import { AlertTriangle } from 'lucide-react'

export function ErrorState({
  title = 'Something went wrong',
  body = 'We could not load this section right now. Try again in a moment.',
}: {
  title?: string
  body?: string
}) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-red-50/70 p-6 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-lokals-charcoal">{title}</p>
          <p className="mt-1 text-sm text-lokals-muted">{body}</p>
        </div>
      </div>
    </div>
  )
}
