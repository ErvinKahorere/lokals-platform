import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassNav({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <nav className={clsx('rounded-full border border-lokals-border bg-white px-2 py-2 shadow-card', className)}>{children}</nav>
}
