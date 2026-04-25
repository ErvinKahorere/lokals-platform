import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'min-h-11 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition placeholder:text-lokals-muted focus:border-lokals-green focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)]',
        className,
      )}
      {...props}
    />
  )
}

export function TextArea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-24 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition placeholder:text-lokals-muted focus:border-lokals-green focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)]',
        className,
      )}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'min-h-11 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition focus:border-lokals-green focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
