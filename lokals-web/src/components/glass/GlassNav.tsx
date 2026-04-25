import clsx from 'clsx'
import type { PropsWithChildren } from 'react'

export function GlassNav({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <nav className={clsx('glass-surface rounded-full px-2 py-2', className)}>{children}</nav>
}
