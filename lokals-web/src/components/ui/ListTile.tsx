import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

export function ListTile({
  title,
  subtitle,
  leading,
  trailing,
  to,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  to?: string
  className?: string
}) {
  const content = (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-[20px] border border-lokals-border bg-[linear-gradient(180deg,#ffffff,#fbfcff)] px-4 py-3 shadow-card transition',
        to && 'hover:-translate-y-0.5 hover:border-lokals-purple/16 hover:shadow-soft',
        className,
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-lokals-charcoal">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-lokals-muted">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )

  if (!to) {
    return content
  }

  return <Link to={to}>{content}</Link>
}
