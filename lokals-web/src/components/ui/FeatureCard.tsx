import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from './Card'

export function FeatureCard({
  to,
  title,
  description,
  icon: Icon,
  eyebrow,
}: {
  to: string
  title: string
  description: string
  icon: LucideIcon
  eyebrow?: string
}) {
  return (
    <Link to={to}>
      <Card interactive variant="dashboard" className="h-full p-5">
        <div className="flex h-full flex-col gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lokals-purple-soft text-lokals-purple">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lokals-green">{eyebrow}</p> : null}
            <h3 className="mt-1 text-lg font-semibold text-lokals-charcoal">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-lokals-muted">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
