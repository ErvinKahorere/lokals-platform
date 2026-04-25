import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'accent' | 'dark' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-lokals-green text-white shadow-[0_12px_24px_rgba(22,163,74,0.24)]',
  secondary: 'border border-lokals-border bg-lokals-surface text-lokals-charcoal shadow-card',
  accent: 'bg-lokals-gold text-lokals-charcoal shadow-gold',
  dark: 'bg-lokals-charcoal text-white shadow-soft-lg',
  danger: 'bg-lokals-danger text-white shadow-soft-lg',
  ghost: 'bg-transparent text-lokals-charcoal',
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lokals-xl px-4 py-3 text-sm font-semibold transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
