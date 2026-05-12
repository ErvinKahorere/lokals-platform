import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export function Header({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={clsx('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lokals-purple">{eyebrow}</p> : null}
        <h1 className="mt-2 text-[clamp(1.9rem,3vw,3.1rem)] font-bold leading-tight text-lokals-charcoal">{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-lokals-muted md:text-[15px]">{description}</p> : null}
      </div>
      {actions}
    </motion.div>
  )
}
