import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export function ActionTile({
  to,
  label,
  subtitle,
  icon: Icon,
  className,
}: {
  to: string
  label: string
  subtitle?: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
      <Link to={to} className={clsx('flex min-h-[112px] flex-col rounded-lokals-xl border border-lokals-border bg-white p-4 shadow-card', className)}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-current">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-lokals-charcoal">{label}</h3>
        {subtitle ? <p className="mt-1 text-xs text-lokals-muted">{subtitle}</p> : null}
      </Link>
    </motion.div>
  )
}
