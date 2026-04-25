import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function SuccessState({
  title,
  body,
  actions,
}: {
  title: string
  body: string
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-emerald-100 bg-emerald-50 p-6 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600 shadow-card">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-lokals-charcoal">{title}</h2>
      <p className="mt-2 text-sm text-lokals-muted">{body}</p>
      {actions ? <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div> : null}
    </div>
  )
}
