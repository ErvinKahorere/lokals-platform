import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassPanel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx('glass-surface rounded-[28px] p-6', className)}>{children}</section>
}
