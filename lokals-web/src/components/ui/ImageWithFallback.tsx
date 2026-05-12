import { type ReactNode, useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Image as ImageIcon } from 'lucide-react'
import { resolveMediaUrl } from '../../lib/display'

type ImageWithFallbackProps = {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  fallback?: ReactNode
}

export function ImageWithFallback({
  src,
  alt,
  className,
  imgClassName,
  fallback,
}: ImageWithFallbackProps) {
  const normalized = useMemo(() => resolveMediaUrl(src ?? null) ?? src ?? null, [src])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [normalized])

  if (!normalized || failed) {
    return (
      <div className={clsx('flex items-center justify-center bg-[linear-gradient(135deg,#ede9fe,#eff6ff)] text-lokals-purple', className)}>
        {fallback ?? <ImageIcon className="h-10 w-10" />}
      </div>
    )
  }

  return (
    <div className={clsx('overflow-hidden bg-[linear-gradient(135deg,#ede9fe,#eff6ff)]', className)}>
      <img
        src={normalized}
        alt={alt}
        className={clsx('h-full w-full object-cover', imgClassName)}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
