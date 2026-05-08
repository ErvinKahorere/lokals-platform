import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'accent' | 'dark' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-lokals-green text-white shadow-[0_14px_28px_rgba(22,163,74,0.24)] hover:shadow-[0_18px_34px_rgba(22,163,74,0.28)]',
  secondary: 'border border-lokals-border bg-lokals-surface text-lokals-charcoal shadow-card hover:border-lokals-green/25 hover:bg-emerald-50/40',
  accent: 'bg-lokals-gold text-lokals-charcoal shadow-gold',
  dark: 'bg-lokals-purple text-white shadow-[0_14px_28px_rgba(124,58,237,0.24)]',
  danger: 'bg-lokals-danger text-white shadow-soft-lg hover:shadow-[0_18px_36px_rgba(239,68,68,0.22)]',
  ghost: 'bg-transparent text-lokals-charcoal hover:bg-lokals-purple/5',
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: PropsWithChildren<HTMLMotionProps<'button'> & { variant?: Variant }>) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lokals-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lokals-purple/15 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
