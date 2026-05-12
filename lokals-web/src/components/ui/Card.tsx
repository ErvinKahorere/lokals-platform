import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

type CardVariant = 'default' | 'service' | 'marketplace' | 'job' | 'dashboard' | 'emergency'

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-white/70 bg-[linear-gradient(180deg,#ffffff,#fbfdff)] shadow-card',
  service: 'border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#fafbff)] shadow-soft',
  marketplace: 'border border-lokals-gold/20 bg-[linear-gradient(180deg,#ffffff,#fffef7)] shadow-soft',
  job: 'border border-indigo-100 bg-[linear-gradient(180deg,#ffffff,#fbfcff)] shadow-soft',
  dashboard: 'border border-lokals-purple/10 bg-[linear-gradient(180deg,#ffffff,#f9faff)] shadow-card',
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
