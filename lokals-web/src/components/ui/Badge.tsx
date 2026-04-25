import clsx from 'clsx'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: 'success' | 'warning' | 'warn' | 'danger' | 'info' | 'neutral' | 'accent'
  className?: string
}) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    warn: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-sky-50 text-sky-700 border-sky-100',
    accent: 'bg-lokals-gold-soft text-lokals-charcoal border-yellow-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  }

  return (
    <span className={clsx('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', styles[tone], className)}>
      {children}
    </span>
  )
}
