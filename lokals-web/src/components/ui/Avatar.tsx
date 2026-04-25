import clsx from 'clsx'

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return <img src={src} alt={name} className={clsx('h-12 w-12 rounded-full object-cover', className)} />
  }

  return (
    <div className={clsx('flex h-12 w-12 items-center justify-center rounded-full bg-lokals-charcoal text-sm font-semibold text-white', className)}>
      {initials}
    </div>
  )
}
