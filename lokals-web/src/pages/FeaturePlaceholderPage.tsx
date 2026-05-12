import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader } from '../components/Ui'

export function FeaturePlaceholderPage({
  eyebrow = 'Feature in progress',
  title,
  description,
  ctaLabel,
  ctaTo,
  icon: Icon,
}: {
  eyebrow?: string
  title: string
  description: string
  ctaLabel: string
  ctaTo: string
  icon: LucideIcon
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="p-6">
        <div className="flex flex-col gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-lokals-purple">
            <Icon className="h-6 w-6" />
          </div>
          <p className="max-w-2xl text-sm leading-6 text-lokals-muted">
            This destination is being polished so it feels as complete as the rest of LOKALS. The route stays active, and you can use the shortcut below in the meantime.
          </p>
          <div>
            <Link to={ctaTo}>
              <Button>{ctaLabel} <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
