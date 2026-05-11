import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function RequestSuccessState({
  title,
  body,
  meta,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string
  body: string
  meta?: ReactNode
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel: string
  onSecondary: () => void
}) {
  return (
    <Card className="rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-lokals-charcoal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-lokals-muted">{body}</p>
      {meta ? <div className="mt-4 rounded-2xl bg-white p-4 shadow-card">{meta}</div> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onPrimary}>{primaryLabel}</Button>
        <Button variant="secondary" onClick={onSecondary}>{secondaryLabel}</Button>
      </div>
    </Card>
  )
}
