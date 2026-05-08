import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'min-h-11 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition duration-200 placeholder:text-lokals-muted focus:border-lokals-purple focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]',
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
        'min-h-24 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition duration-200 placeholder:text-lokals-muted focus:border-lokals-purple focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]',
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
        'min-h-11 w-full rounded-lokals-lg border border-lokals-border bg-lokals-surface px-4 py-3 text-sm text-lokals-charcoal outline-none ring-0 transition duration-200 focus:border-lokals-purple focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
