import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-[24px] border border-lokals-border bg-white p-5 shadow-card', className)}>{children}</div>
}
