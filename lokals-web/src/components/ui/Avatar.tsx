import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '../../lib/display'

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const normalized = resolveMediaUrl(src ?? null) ?? src
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [normalized])

  if (normalized && !failed) {
    return <img src={normalized} alt={name} className={clsx('h-12 w-12 rounded-full object-cover', className)} onError={() => setFailed(true)} />
  }

  return (
    <div className={clsx('flex h-12 w-12 items-center justify-center rounded-full bg-lokals-charcoal text-sm font-semibold text-white', className)}>
      {initials}
    </div>
  )
}
