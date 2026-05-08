import type { ReactNode } from 'react'
import { SectionCard } from '../Ui'

export function DashboardSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <SectionCard className="bg-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-lokals-charcoal">{title}</h3>
          {description ? <p className="mt-1 text-sm text-lokals-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </SectionCard>
  )
}
