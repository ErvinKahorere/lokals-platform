import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

type CardVariant = 'default' | 'service' | 'marketplace' | 'job' | 'dashboard' | 'emergency'

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-lokals-border bg-lokals-surface shadow-[0_14px_34px_rgba(15,23,42,0.08)]',
  service: 'border border-violet-100 bg-lokals-surface shadow-[0_16px_36px_rgba(15,23,42,0.08)]',
  marketplace: 'border border-slate-200 bg-lokals-surface shadow-[0_16px_36px_rgba(15,23,42,0.08)]',
  job: 'border border-indigo-100 bg-lokals-surface shadow-[0_16px_36px_rgba(15,23,42,0.08)]',
  dashboard: 'border border-slate-200 bg-lokals-surface shadow-[0_12px_28px_rgba(15,23,42,0.07)]',
  emergency: 'border border-rose-200 bg-[linear-gradient(180deg,#fff5f5,#ffffff)] shadow-[0_18px_40px_rgba(239,68,68,0.12)]',
}

export function Card({
  children,
  className,
  interactive = false,
  variant = 'default',
  ...props
}: PropsWithChildren<HTMLMotionProps<'div'> & { interactive?: boolean; variant?: CardVariant }>) {
  return (
    <motion.div
      whileHover={interactive ? { y: -3, scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={clsx(
        'rounded-lokals-xl p-5 transition duration-200',
        variantClasses[variant],
        interactive && 'cursor-pointer hover:border-lokals-purple/15 hover:shadow-soft-lg',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
