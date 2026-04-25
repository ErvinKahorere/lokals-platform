import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('glass-surface rounded-[24px] p-5', className)}>{children}</div>
}
