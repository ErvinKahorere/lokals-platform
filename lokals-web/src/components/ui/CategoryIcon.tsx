import clsx from 'clsx'
import { categoryMeta } from '../../styles/theme'

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const key = category.toLowerCase() as keyof typeof categoryMeta
  const meta = categoryMeta[key] ?? categoryMeta.default
  const Icon = meta.icon

  return (
    <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl', meta.color, className)}>
      <Icon className="h-5 w-5" strokeWidth={2} />
    </div>
  )
}
