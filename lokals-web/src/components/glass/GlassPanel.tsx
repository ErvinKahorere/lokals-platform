import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassPanel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx('rounded-[28px] border border-lokals-border bg-white p-6 shadow-card', className)}>{children}</section>
}
