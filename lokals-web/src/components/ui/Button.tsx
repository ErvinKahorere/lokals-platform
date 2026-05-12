import type { PropsWithChildren } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import clsx from 'clsx'
import { ButtonLoader } from './LoadingSkeleton'

type Variant = 'primary' | 'secondary' | 'accent' | 'dark' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-lokals-green text-white shadow-[0_16px_34px_rgba(22,163,74,0.24)] hover:shadow-[0_20px_40px_rgba(22,163,74,0.28)]',
  secondary: 'border border-lokals-border bg-lokals-surface text-lokals-charcoal shadow-card hover:border-lokals-purple/15 hover:bg-lokals-purple-soft/60',
  accent: 'bg-lokals-gold text-lokals-charcoal shadow-gold',
  dark: 'bg-lokals-purple text-white shadow-[0_16px_36px_rgba(63,43,203,0.24)]',
  danger: 'bg-lokals-danger text-white shadow-soft-lg hover:shadow-[0_18px_36px_rgba(239,68,68,0.22)]',
  ghost: 'bg-transparent text-lokals-charcoal hover:bg-lokals-purple-soft/70',
}

export function Button({
  children,
  className,
  variant = 'primary',
  isLoading = false,
  loadingLabel,
  disabled,
  ...props
}: PropsWithChildren<HTMLMotionProps<'button'> & {
  variant?: Variant
  isLoading?: boolean
  loadingLabel?: string
}>) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      {...props}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lokals-xl px-4 py-3 text-sm font-semibold transition duration-200 hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lokals-purple/15 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
    >
      {isLoading ? <ButtonLoader label={loadingLabel} /> : children}
    </motion.button>
  )
}
